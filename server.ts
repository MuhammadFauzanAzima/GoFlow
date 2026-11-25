import crypto from 'node:crypto';
import express, {type NextFunction, type Request, type Response} from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type OAuthProvider = 'instagram' | 'tiktok';

interface ProviderTokenState {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  openId?: string;
  userId?: string;
  connectedAt: string;
}

interface SessionRecord {
  id: string;
  instagram?: ProviderTokenState;
  tiktok?: ProviderTokenState;
}

interface PendingStateRecord {
  provider: OAuthProvider;
  sessionId: string;
  createdAt: number;
  codeVerifier?: string;
}

const SESSION_SIGNING_KEY =
  process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

const sessions = new Map<string, SessionRecord>();
const pendingOAuthStates = new Map<string, PendingStateRecord>();

const USERNAME_REGEX = /^[a-zA-Z0-9._]{1,30}$/;

function getAppBaseUrl(): string {
  const raw = process.env.APP_URL?.trim();
  if (raw && raw !== 'MY_APP_URL') {
    return raw.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}

function signSessionId(sessionId: string): string {
  const sig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(sessionId)
    .digest('hex');
  return `${sessionId}.${sig}`;
}

function verifyBearerToken(authHeader?: string): SessionRecord | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx <= 0) return null;
  const sessionId = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expected = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(sessionId)
    .digest('hex');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  return sessions.get(sessionId) ?? null;
}

function getOrCreateSession(authHeader?: string): {
  session: SessionRecord;
  bearerToken: string;
} {
  const existing = verifyBearerToken(authHeader);
  if (existing) {
    return {session: existing, bearerToken: signSessionId(existing.id)};
  }
  const id = crypto.randomBytes(16).toString('hex');
  const created: SessionRecord = {id};
  sessions.set(id, created);
  return {session: created, bearerToken: signSessionId(id)};
}

function sanitizeUsername(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/^@+/, '');
  if (!USERNAME_REGEX.test(trimmed)) return null;
  return trimmed;
}

function sanitizeHttpUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function cleanupExpiredStates() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of pendingOAuthStates.entries()) {
    if (val.createdAt < cutoff) {
      pendingOAuthStates.delete(key);
    }
  }
}

function renderPopupResultHtml(payload: {
  type: 'OAUTH_AUTH_SUCCESS' | 'OAUTH_AUTH_ERROR';
  provider: OAuthProvider;
  sessionToken?: string;
  message?: string;
}): string {
  const serialized = JSON.stringify(payload).replace(/</g, '\\u003c');
  const statusText =
    payload.type === 'OAUTH_AUTH_SUCCESS'
      ? `Koneksi ${payload.provider} berhasil. Jendela ini akan tertutup otomatis.`
      : `Koneksi ${payload.provider} gagal. Silakan kembali ke aplikasi GoFlow.`;

  return `<!doctype html>
<html lang="id">
  <head><meta charset="utf-8" /><title>GoFlow OAuth</title></head>
  <body style="font-family: system-ui, sans-serif; padding: 24px; color: #0f172a;">
    <p>${statusText}</p>
    <script>
      (function() {
        var data = ${serialized};
        if (window.opener) {
          window.opener.postMessage(data, '*');
          window.close();
        } else {
          window.location.href = '/';
        }
      })();
    </script>
  </body>
</html>`;
}

async function fetchTikTokPublicProfile(username: string) {
  const safeUser = sanitizeUsername(username);
  if (!safeUser) {
    return {found: false, reason: 'Format username TikTok tidak valid.'};
  }

  const profileUrl = `https://www.tiktok.com/@${encodeURIComponent(safeUser)}`;
  try {
    const resp = await fetch(profileUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
      },
      signal: AbortSignal.timeout(8500),
    });

    if (resp.status === 404) {
      return {
        found: false,
        source: 'live_public' as const,
        reason: `Akun TikTok @${safeUser} tidak ditemukan (404).`,
      };
    }

    const html = await resp.text();
    const match = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/
    );
    if (match?.[1]) {
      const parsed = JSON.parse(match[1]);
      const userDetail = parsed?.__DEFAULT_SCOPE__?.['webapp.user-detail'];
      const user = userDetail?.userInfo?.user;
      const stats = userDetail?.userInfo?.stats;
      if (user && stats) {
        const followerCount = Number(stats.followerCount ?? 0);
        const followingCount = Number(stats.followingCount ?? 0);
        const heartCount = Number(stats.heartCount ?? stats.heart ?? 0);
        const videoCount = Number(stats.videoCount ?? 0);
        const avgLikesPerVideo =
          videoCount > 0 ? heartCount / videoCount : 0;
        const estimatedEr =
          followerCount > 0
            ? Number(
                Math.min(25, Math.max(0.1, (avgLikesPerVideo / followerCount) * 100)).toFixed(2)
              )
            : 0;

        return {
          found: true,
          source: 'live_public' as const,
          profile: {
            platform: 'tiktok' as const,
            username: `@${user.uniqueId || safeUser}`,
            displayName: String(user.nickname || safeUser),
            bio: String(user.signature || ''),
            avatarUrl: sanitizeHttpUrl(user.avatarLarger || user.avatarMedium),
            verified: Boolean(user.verified),
            followersCount: followerCount,
            followersFormatted: formatCount(followerCount),
            followingCount,
            likesCount: heartCount,
            likesFormatted: formatCount(heartCount),
            mediaCount: videoCount,
            engagementRate: estimatedEr,
            avgViewsFormatted: formatCount(Math.round(avgLikesPerVideo * 8)),
            profileUrl,
          },
        };
      }
    }

    // Fallback to TikTok official oEmbed endpoint to verify handle existence
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(profileUrl)}`;
    const oembedResp = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (oembedResp.ok) {
      const oembed = await oembedResp.json();
      return {
        found: true,
        source: 'live_public' as const,
        profile: {
          platform: 'tiktok' as const,
          username: `@${safeUser}`,
          displayName: String(oembed.author_name || safeUser),
          bio: 'Terverifikasi melalui endpoint publik TikTok.',
          avatarUrl: sanitizeHttpUrl(oembed.thumbnail_url),
          verified: false,
          followersCount: 0,
          followersFormatted: 'Terhubung via OAuth untuk detail',
          followingCount: 0,
          likesCount: 0,
          likesFormatted: '-',
          mediaCount: 0,
          engagementRate: 0,
          avgViewsFormatted: '-',
          profileUrl,
        },
      };
    }

    return {
      found: false,
      source: 'unavailable' as const,
      reason:
        'TikTok membatasi pembacaan profil publik tanpa sesi OAuth. Hubungkan akun TikTok untuk membaca statistik langsung.',
    };
  } catch {
    return {
      found: false,
      source: 'unavailable' as const,
      reason:
        'Gagal menjangkau server publik TikTok saat ini. Coba hubungkan akun TikTok melalui OAuth.',
    };
  }
}

async function fetchInstagramPublicProfile(username: string) {
  const safeUser = sanitizeUsername(username);
  if (!safeUser) {
    return {found: false, reason: 'Format username Instagram tidak valid.'};
  }

  const profileUrl = `https://www.instagram.com/${encodeURIComponent(safeUser)}/`;
  try {
    const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(safeUser)}`;
    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'x-ig-app-id': '936619743392459',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (resp.status === 404) {
      return {
        found: false,
        source: 'live_public' as const,
        reason: `Akun Instagram @${safeUser} tidak ditemukan (404).`,
      };
    }

    if (resp.ok) {
      const json = await resp.json();
      const user = json?.data?.user;
      if (user) {
        const followerCount = Number(user.edge_followed_by?.count ?? 0);
        const followingCount = Number(user.edge_follow?.count ?? 0);
        const mediaCount = Number(user.edge_owner_to_timeline_media?.count ?? 0);
        const edges = Array.isArray(user.edge_owner_to_timeline_media?.edges)
          ? user.edge_owner_to_timeline_media.edges
          : [];

        const recentPosts = edges.slice(0, 6).map((edge: {node?: Record<string, unknown>}) => {
          const node = edge?.node ?? {};
          const likes = Number(
            (node.edge_liked_by as {count?: number} | undefined)?.count ??
              (node.edge_media_preview_like as {count?: number} | undefined)?.count ??
              0
          );
          const comments = Number(
            (node.edge_media_to_comment as {count?: number} | undefined)?.count ?? 0
          );
          const captionEdges = (
            node.edge_media_to_caption as {edges?: Array<{node?: {text?: string}}>} | undefined
          )?.edges;
          const caption = captionEdges?.[0]?.node?.text ?? '';
          return {
            id: String(node.id ?? ''),
            caption: String(caption).slice(0, 140),
            likesCount: likes,
            commentsCount: comments,
            viewsCount: Number(node.video_view_count ?? 0),
            isVideo: Boolean(node.is_video),
            thumbnailUrl: sanitizeHttpUrl(node.thumbnail_src || node.display_url),
            permalink: node.shortcode
              ? `https://www.instagram.com/p/${String(node.shortcode)}/`
              : profileUrl,
          };
        });

        const avgInteraction =
          recentPosts.length > 0
            ? recentPosts.reduce(
                (acc: number, p: {likesCount: number; commentsCount: number}) =>
                  acc + p.likesCount + p.commentsCount,
                0
              ) / recentPosts.length
            : 0;
        const engagementRate =
          followerCount > 0
            ? Number(
                Math.min(25, Math.max(0.1, (avgInteraction / followerCount) * 100)).toFixed(2)
              )
            : 0;

        return {
          found: true,
          source: 'live_public' as const,
          profile: {
            platform: 'instagram' as const,
            username: `@${user.username || safeUser}`,
            displayName: String(user.full_name || safeUser),
            bio: String(user.biography || ''),
            avatarUrl: sanitizeHttpUrl(user.profile_pic_url_hd || user.profile_pic_url),
            verified: Boolean(user.is_verified),
            followersCount: followerCount,
            followersFormatted: formatCount(followerCount),
            followingCount,
            mediaCount,
            engagementRate,
            avgViewsFormatted:
              recentPosts[0]?.viewsCount > 0
                ? formatCount(recentPosts[0].viewsCount)
                : formatCount(Math.round(avgInteraction * 6)),
            profileUrl,
            recentPosts,
          },
        };
      }
    }

    return {
      found: false,
      source: 'unavailable' as const,
      reason:
        'Instagram membatasi akses publik langsung tanpa koneksi OAuth. Klik Hubungkan Instagram untuk menarik data real-time.',
    };
  } catch {
    return {
      found: false,
      source: 'unavailable' as const,
      reason:
        'Tidak dapat membaca profil publik Instagram saat ini. Gunakan koneksi OAuth Instagram untuk akses API resmi.',
    };
  }
}

async function fetchConnectedInstagramData(accessToken: string) {
  const meUrl = new URL('https://graph.instagram.com/v21.0/me');
  meUrl.searchParams.set(
    'fields',
    'id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count'
  );
  meUrl.searchParams.set('access_token', accessToken);

  const meResp = await fetch(meUrl, {signal: AbortSignal.timeout(8000)});
  if (!meResp.ok) {
    throw new Error(`Instagram API error (${meResp.status})`);
  }
  const me = await meResp.json();

  const mediaUrl = new URL('https://graph.instagram.com/v21.0/me/media');
  mediaUrl.searchParams.set(
    'fields',
    'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
  );
  mediaUrl.searchParams.set('limit', '6');
  mediaUrl.searchParams.set('access_token', accessToken);

  let recentPosts: Array<Record<string, unknown>> = [];
  try {
    const mediaResp = await fetch(mediaUrl, {signal: AbortSignal.timeout(8000)});
    if (mediaResp.ok) {
      const mediaJson = await mediaResp.json();
      recentPosts = Array.isArray(mediaJson?.data) ? mediaJson.data : [];
    }
  } catch {
    recentPosts = [];
  }

  const followersCount = Number(me.followers_count ?? 0);
  const avgEngagement =
    recentPosts.length > 0
      ? recentPosts.reduce(
          (sum, post) =>
            sum + Number(post.like_count ?? 0) + Number(post.comments_count ?? 0),
          0
        ) / recentPosts.length
      : 0;
  const engagementRate =
    followersCount > 0
      ? Number(((avgEngagement / followersCount) * 100).toFixed(2))
      : 0;

  return {
    platform: 'instagram' as const,
    username: `@${String(me.username || 'instagram_user')}`,
    displayName: String(me.name || me.username || 'Akun Instagram'),
    accountType: String(me.account_type || 'CREATOR'),
    avatarUrl: sanitizeHttpUrl(me.profile_picture_url),
    followersCount,
    followersFormatted: formatCount(followersCount),
    followingCount: Number(me.follows_count ?? 0),
    mediaCount: Number(me.media_count ?? 0),
    engagementRate,
    recentPosts: recentPosts.map((p) => ({
      id: String(p.id ?? ''),
      caption: String(p.caption ?? '').slice(0, 140),
      mediaType: String(p.media_type ?? 'IMAGE'),
      likesCount: Number(p.like_count ?? 0),
      commentsCount: Number(p.comments_count ?? 0),
      thumbnailUrl: sanitizeHttpUrl(p.thumbnail_url || p.media_url),
      permalink: sanitizeHttpUrl(p.permalink),
      timestamp: String(p.timestamp ?? ''),
    })),
  };
}

async function fetchConnectedTikTokData(accessToken: string) {
  const userUrl = new URL('https://open.tiktokapis.com/v2/user/info/');
  userUrl.searchParams.set(
    'fields',
    'open_id,union_id,avatar_url,display_name,username,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count'
  );

  const userResp = await fetch(userUrl, {
    headers: {Authorization: `Bearer ${accessToken}`},
    signal: AbortSignal.timeout(8000),
  });
  if (!userResp.ok) {
    throw new Error(`TikTok API error (${userResp.status})`);
  }
  const userJson = await userResp.json();
  const user = userJson?.data?.user ?? {};

  let recentVideos: Array<Record<string, unknown>> = [];
  try {
    const videoResp = await fetch(
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,create_time,cover_image_url,share_url,duration,like_count,comment_count,share_count,view_count',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({max_count: 6}),
        signal: AbortSignal.timeout(8000),
      }
    );
    if (videoResp.ok) {
      const videoJson = await videoResp.json();
      recentVideos = Array.isArray(videoJson?.data?.videos)
        ? videoJson.data.videos
        : [];
    }
  } catch {
    recentVideos = [];
  }

  const followersCount = Number(user.follower_count ?? 0);
  const avgInteractions =
    recentVideos.length > 0
      ? recentVideos.reduce(
          (sum, v) =>
            sum +
            Number(v.like_count ?? 0) +
            Number(v.comment_count ?? 0) +
            Number(v.share_count ?? 0),
          0
        ) / recentVideos.length
      : 0;
  const engagementRate =
    followersCount > 0
      ? Number(((avgInteractions / followersCount) * 100).toFixed(2))
      : 0;

  return {
    platform: 'tiktok' as const,
    username: user.username
      ? `@${String(user.username)}`
      : String(user.display_name || 'TikTok Creator'),
    displayName: String(user.display_name || user.username || 'Akun TikTok'),
    bio: String(user.bio_description || ''),
    avatarUrl: sanitizeHttpUrl(user.avatar_url),
    verified: Boolean(user.is_verified),
    followersCount,
    followersFormatted: formatCount(followersCount),
    followingCount: Number(user.following_count ?? 0),
    likesCount: Number(user.likes_count ?? 0),
    likesFormatted: formatCount(Number(user.likes_count ?? 0)),
    mediaCount: Number(user.video_count ?? 0),
    engagementRate,
    profileUrl: sanitizeHttpUrl(user.profile_deep_link),
    recentVideos: recentVideos.map((v) => ({
      id: String(v.id ?? ''),
      title: String(v.title || v.video_description || 'Video TikTok').slice(0, 120),
      viewCount: Number(v.view_count ?? 0),
      likeCount: Number(v.like_count ?? 0),
      commentCount: Number(v.comment_count ?? 0),
      shareCount: Number(v.share_count ?? 0),
      thumbnailUrl: sanitizeHttpUrl(v.cover_image_url),
      shareUrl: sanitizeHttpUrl(v.share_url),
    })),
  };
}

function validateMutatingOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host && !originHost.includes('localhost')) {
        res.status(403).json({error: 'Origin tidak diizinkan.'});
        return;
      }
    } catch {
      res.status(403).json({error: 'Header Origin tidak valid.'});
      return;
    }
  }
  next();
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({limit: '100kb'}));

  const port = Number(process.env.PORT) || 3000;
  const distDir = path.resolve(__dirname, 'dist');
  const isProduction =
    process.env.NODE_ENV === 'production' || Boolean(process.env.K_SERVICE);

  app.get('/api/health', (_req, res) => {
    res.status(200).json({status: 'ok'});
  });

  // Return OAuth configuration & current session connection status
  app.get('/api/oauth/status', (req, res) => {
    const baseUrl = getAppBaseUrl();
    const session = verifyBearerToken(req.headers.authorization);
    res.json({
      appBaseUrl: baseUrl,
      instagram: {
        configured: Boolean(
          process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET
        ),
        connected: Boolean(session?.instagram?.accessToken),
        connectedAt: session?.instagram?.connectedAt ?? null,
        redirectUri: `${baseUrl}/auth/instagram/callback`,
      },
      tiktok: {
        configured: Boolean(
          process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET
        ),
        connected: Boolean(session?.tiktok?.accessToken),
        connectedAt: session?.tiktok?.connectedAt ?? null,
        redirectUri: `${baseUrl}/auth/tiktok/callback`,
      },
    });
  });

  // Construct Instagram OAuth URL
  app.get('/api/oauth/instagram/url', (req, res) => {
    const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      res.status(400).json({
        error: 'Kredensial Instagram OAuth belum dikonfigurasi di Secrets.',
        requiredVars: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
        redirectUri: `${getAppBaseUrl()}/auth/instagram/callback`,
      });
      return;
    }

    cleanupExpiredStates();
    const {session} = getOrCreateSession(req.headers.authorization);
    const state = crypto.randomBytes(20).toString('hex');
    pendingOAuthStates.set(state, {
      provider: 'instagram',
      sessionId: session.id,
      createdAt: Date.now(),
    });

    const redirectUri = `${getAppBaseUrl()}/auth/instagram/callback`;
    const authUrl = new URL('https://www.instagram.com/oauth/authorize');
    authUrl.searchParams.set('enable_fb_login', '0');
    authUrl.searchParams.set('force_authentication', '1');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set(
      'scope',
      'instagram_business_basic,instagram_business_manage_insights'
    );
    authUrl.searchParams.set('state', state);

    res.json({url: authUrl.toString(), redirectUri});
  });

  // Construct TikTok OAuth URL
  app.get('/api/oauth/tiktok/url', (req, res) => {
    const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
    if (!clientKey || !clientSecret) {
      res.status(400).json({
        error: 'Kredensial TikTok OAuth belum dikonfigurasi di Secrets.',
        requiredVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
        redirectUri: `${getAppBaseUrl()}/auth/tiktok/callback`,
      });
      return;
    }

    cleanupExpiredStates();
    const {session} = getOrCreateSession(req.headers.authorization);
    const state = crypto.randomBytes(20).toString('hex');
    pendingOAuthStates.set(state, {
      provider: 'tiktok',
      sessionId: session.id,
      createdAt: Date.now(),
    });

    const redirectUri = `${getAppBaseUrl()}/auth/tiktok/callback`;
    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', clientKey);
    authUrl.searchParams.set(
      'scope',
      'user.info.basic,user.info.profile,user.info.stats,video.list'
    );
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    res.json({url: authUrl.toString(), redirectUri});
  });

  // Instagram OAuth callback (handle trailing slash variation)
  const instagramCallbackHandler = async (req: Request, res: Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const pending = pendingOAuthStates.get(state);

    if (!code || !pending || pending.provider !== 'instagram') {
      res.status(400).send(
        renderPopupResultHtml({
          type: 'OAUTH_AUTH_ERROR',
          provider: 'instagram',
          message: 'State atau kode otorisasi Instagram tidak valid.',
        })
      );
      return;
    }
    pendingOAuthStates.delete(state);

    const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      res.status(500).send(
        renderPopupResultHtml({
          type: 'OAUTH_AUTH_ERROR',
          provider: 'instagram',
        })
      );
      return;
    }

    try {
      const form = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: `${getAppBaseUrl()}/auth/instagram/callback`,
        code,
      });

      const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: form.toString(),
        signal: AbortSignal.timeout(10000),
      });
      const tokenData = await tokenResp.json();
      if (!tokenResp.ok || !tokenData.access_token) {
        throw new Error('Token exchange failed');
      }

      const session: SessionRecord = sessions.get(pending.sessionId) ?? {
        id: pending.sessionId,
      };
      session.instagram = {
        accessToken: String(tokenData.access_token),
        userId: tokenData.user_id ? String(tokenData.user_id) : undefined,
        connectedAt: new Date().toISOString(),
      };
      sessions.set(session.id, session);

      res.send(
        renderPopupResultHtml({
          type: 'OAUTH_AUTH_SUCCESS',
          provider: 'instagram',
          sessionToken: signSessionId(session.id),
        })
      );
    } catch {
      res.status(500).send(
        renderPopupResultHtml({
          type: 'OAUTH_AUTH_ERROR',
          provider: 'instagram',
        })
      );
    }
  };
  app.get(['/auth/instagram/callback', '/auth/instagram/callback/'], instagramCallbackHandler);

  // TikTok OAuth callback (handle trailing slash variation)
  const tiktokCallbackHandler = async (req: Request, res: Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const pending = pendingOAuthStates.get(state);

    if (!code || !pending || pending.provider !== 'tiktok') {
      res.status(400).send(
        renderPopupResultHtml({
          type: 'OAUTH_AUTH_ERROR',
          provider: 'tiktok',
          message: 'State atau kode otorisasi TikTok tidak valid.',
        })
      );
      return;
    }
    pendingOAuthStates.delete(state);

    const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
    if (!clientKey || !clientSecret) {
      res.status(500).send(
        renderPopupResultHtml({
          type: 'OAUTH_AUTH_ERROR',
          provider: 'tiktok',
        })
      );
      return;
    }

    try {
      const form = new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${getAppBaseUrl()}/auth/tiktok/callback`,
      });

      const tokenResp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: form.toString(),
        signal: AbortSignal.timeout(10000),
      });
      const tokenData = await tokenResp.json();
      if (!tokenResp.ok || !tokenData.access_token) {
        throw new Error('TikTok token exchange failed');
      }

      const session: SessionRecord = sessions.get(pending.sessionId) ?? {
        id: pending.sessionId,
      };
      session.tiktok = {
        accessToken: String(tokenData.access_token),
        refreshToken: tokenData.refresh_token
          ? String(tokenData.refresh_token)
          : undefined,
        openId: tokenData.open_id ? String(tokenData.open_id) : undefined,
        connectedAt: new Date().toISOString(),
      };
      sessions.set(session.id, session);

      res.send(
        renderPopupResultHtml({
          type: 'OAUTH_AUTH_SUCCESS',
          provider: 'tiktok',
          sessionToken: signSessionId(session.id),
        })
      );
    } catch {
      res.status(500).send(
        renderPopupResultHtml({
          type: 'OAUTH_AUTH_ERROR',
          provider: 'tiktok',
        })
      );
    }
  };
  app.get(['/auth/tiktok/callback', '/auth/tiktok/callback/'], tiktokCallbackHandler);

  // Fetch live data for connected OAuth accounts
  app.get('/api/social/me', async (req, res) => {
    const session = verifyBearerToken(req.headers.authorization);
    if (!session) {
      res.status(401).json({error: 'Belum ada sesi OAuth aktif.'});
      return;
    }

    const result: {
      instagram: Record<string, unknown> | null;
      tiktok: Record<string, unknown> | null;
      errors: Record<string, string>;
    } = {instagram: null, tiktok: null, errors: {}};

    if (session.instagram?.accessToken) {
      try {
        result.instagram = await fetchConnectedInstagramData(
          session.instagram.accessToken
        );
      } catch (err) {
        result.errors.instagram =
          err instanceof Error ? err.message : 'Gagal memuat data Instagram.';
      }
    }

    if (session.tiktok?.accessToken) {
      try {
        result.tiktok = await fetchConnectedTikTokData(session.tiktok.accessToken);
      } catch (err) {
        result.errors.tiktok =
          err instanceof Error ? err.message : 'Gagal memuat data TikTok.';
      }
    }

    res.json(result);
  });

  // Disconnect provider cleanly
  app.post('/api/oauth/disconnect', validateMutatingOrigin, (req, res) => {
    const session = verifyBearerToken(req.headers.authorization);
    const provider = req.body?.provider;
    if (session) {
      if (provider === 'instagram') {
        delete session.instagram;
      } else if (provider === 'tiktok') {
        delete session.tiktok;
      }
    }
    res.json({ok: true});
  });

  // Real-time public + connected check for any @username across Instagram & TikTok
  app.post('/api/social/check', validateMutatingOrigin, async (req, res) => {
    const safeUsername = sanitizeUsername(req.body?.username);
    if (!safeUsername) {
      res.status(400).json({
        error:
          'Username tidak valid. Gunakan huruf, angka, titik, atau garis bawah (maks. 30 karakter).',
      });
      return;
    }

    const platformRaw = req.body?.platform;
    const platform: 'both' | 'instagram' | 'tiktok' =
      platformRaw === 'instagram' || platformRaw === 'tiktok'
        ? platformRaw
        : 'both';

    const session = verifyBearerToken(req.headers.authorization);

    const [igResult, ttResult] = await Promise.all([
      platform === 'both' || platform === 'instagram'
        ? (async () => {
            if (session?.instagram?.accessToken) {
              try {
                const me = await fetchConnectedInstagramData(
                  session.instagram.accessToken
                );
                if (
                  me.username.replace(/^@/, '').toLowerCase() ===
                  safeUsername.toLowerCase()
                ) {
                  return {found: true, source: 'live_oauth' as const, profile: me};
                }
              } catch {
                // Fall through to public lookup
              }
            }
            return fetchInstagramPublicProfile(safeUsername);
          })()
        : Promise.resolve(null),
      platform === 'both' || platform === 'tiktok'
        ? (async () => {
            if (session?.tiktok?.accessToken) {
              try {
                const me = await fetchConnectedTikTokData(
                  session.tiktok.accessToken
                );
                if (
                  me.username.replace(/^@/, '').toLowerCase() ===
                  safeUsername.toLowerCase()
                ) {
                  return {found: true, source: 'live_oauth' as const, profile: me};
                }
              } catch {
                // Fall through to public lookup
              }
            }
            return fetchTikTokPublicProfile(safeUsername);
          })()
        : Promise.resolve(null),
    ]);

    res.json({
      checkedAt: new Date().toISOString(),
      username: `@${safeUsername}`,
      instagram: igResult,
      tiktok: ttResult,
    });
  });

  if (isProduction && fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`GoFlow server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start GoFlow server:', err);
  process.exit(1);
});
