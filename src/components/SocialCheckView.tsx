import React, {useCallback, useEffect, useState} from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  Unlink,
} from 'lucide-react';
import {
  InfluencerProfile,
  LiveSocialCheckResponse,
  LiveSocialLookupChannel,
  LiveSocialProfileResult,
  OAuthStatusResponse,
  SocialPlatform,
} from '../types/flowchart';

interface SocialCheckViewProps {
  oauthSessionToken: string | null;
  oauthStatus: OAuthStatusResponse | null;
  oauthMessage: {type: 'success' | 'error'; text: string} | null;
  onRefreshOAuthStatus: () => void;
  onDisconnectProvider: (provider: 'instagram' | 'tiktok') => Promise<void>;
  onUseLiveProfileInSimulator: (
    profile: InfluencerProfile,
    platformFocus: SocialPlatform
  ) => void;
}

function AvatarBadge({
  url,
  name,
  bgClass,
}: {
  url?: string;
  name: string;
  bgClass: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name
    .replace(/^@/, '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (url && !imgFailed) {
    return (
      <img
        src={url}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
      />
    );
  }

  return (
    <div
      className={`w-12 h-12 rounded-full ${bgClass} text-white font-bold text-sm flex items-center justify-center shrink-0`}
    >
      {initials || 'GF'}
    </div>
  );
}

function buildInfluencerFromLive(
  username: string,
  ig: LiveSocialProfileResult | undefined,
  tt: LiveSocialProfileResult | undefined
): InfluencerProfile {
  const primary = ig ?? tt;
  const igEr = ig?.engagementRate ?? 0;
  const ttEr = tt?.engagementRate ?? 0;
  const avgEr =
    ig && tt
      ? Number(((igEr + ttEr) / 2).toFixed(2))
      : ig
      ? igEr
      : ttEr;
  const totalFollowers = (ig?.followersCount ?? 0) + (tt?.followersCount ?? 0);
  const followersFormatted =
    totalFollowers >= 1_000_000
      ? `${(totalFollowers / 1_000_000).toFixed(1)}M`
      : totalFollowers >= 1_000
      ? `${(totalFollowers / 1_000).toFixed(1)}K`
      : primary?.followersFormatted ?? '0';

  const isValid = totalFollowers > 0 && avgEr >= 0.8;

  return {
    handle: primary?.username ?? username,
    name: primary?.displayName ?? username.replace(/^@/, ''),
    niche: 'Data Real-Time Sosial Media',
    primaryPlatform:
      ig && tt ? 'Instagram & TikTok' : ig ? 'Instagram' : 'TikTok',
    location: 'Live Account',
    followers: followersFormatted,
    engagementRate: avgEr,
    authenticityScore: isValid ? Math.min(96, Math.round(74 + avgEr * 3)) : 45,
    avgViews: tt?.avgViewsFormatted ?? ig?.avgViewsFormatted ?? '-',
    sentimentPositive: isValid ? 86 : 52,
    estimatedRateIdr: Math.max(5000000, Math.round(totalFollowers * 2.5)),
    isValid,
    validationReason: isValid
      ? 'Terverifikasi dari data real-time Instagram / TikTok.'
      : 'Data interaksi rendah atau statistik detail belum tersedia penuh.',
    instagram: {
      followers: ig?.followersFormatted ?? '0',
      followersCount: ig?.followersCount ?? 0,
      engagementRate: igEr,
      avgViews: ig?.avgViewsFormatted ?? '-',
      avgViewsCount: Math.round((ig?.followersCount ?? 0) * 0.12),
      postsPerWeek: 4,
      topFormat: 'Reels & Post Feed',
    },
    tiktok: {
      followers: tt?.followersFormatted ?? '0',
      followersCount: tt?.followersCount ?? 0,
      engagementRate: ttEr,
      avgViews: tt?.avgViewsFormatted ?? '-',
      avgViewsCount: Math.round((tt?.followersCount ?? 0) * 0.25),
      postsPerWeek: 6,
      topFormat: 'TikTok Short Video',
    },
    demographics: {
      femalePct: 58,
      malePct: 42,
      topAgeRange: '18–34 tahun',
      topCities: ['Jakarta', 'Bandung', 'Surabaya'],
    },
    strengths: ['Profil diambil langsung secara real-time melalui GoFlow'],
  };
}

export function SocialCheckView({
  oauthSessionToken,
  oauthStatus,
  oauthMessage,
  onRefreshOAuthStatus,
  onDisconnectProvider,
  onUseLiveProfileInSimulator,
}: SocialCheckViewProps) {
  const [usernameInput, setUsernameInput] = useState('@cristiano');
  const [platformScope, setPlatformScope] = useState<
    'both' | 'instagram' | 'tiktok'
  >('both');
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<LiveSocialCheckResponse | null>(
    null
  );

  const [connectedData, setConnectedData] = useState<{
    instagram: LiveSocialProfileResult | null;
    tiktok: LiveSocialProfileResult | null;
    errors: Record<string, string>;
  } | null>(null);
  const [loadingConnected, setLoadingConnected] = useState(false);
  const [oauthUiBanner, setOauthUiBanner] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchConnectedAccounts = useCallback(async () => {
    if (!oauthSessionToken) {
      setConnectedData(null);
      return;
    }
    setLoadingConnected(true);
    try {
      const resp = await fetch('/api/social/me', {
        headers: {Authorization: `Bearer ${oauthSessionToken}`},
      });
      if (resp.ok) {
        const data = await resp.json();
        setConnectedData(data);
      }
    } catch {
      // Ignore fetch errors
    } finally {
      setLoadingConnected(false);
    }
  }, [oauthSessionToken]);

  useEffect(() => {
    fetchConnectedAccounts();
  }, [fetchConnectedAccounts]);

  const handleCopyUri = async (key: string, uri: string) => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleConnectOAuth = async (provider: 'instagram' | 'tiktok') => {
    setOauthUiBanner(null);
    try {
      const headers: Record<string, string> = {};
      if (oauthSessionToken) {
        headers.Authorization = `Bearer ${oauthSessionToken}`;
      }
      const resp = await fetch(`/api/oauth/${provider}/url`, {headers});
      const data = await resp.json();
      if (!resp.ok) {
        setOauthUiBanner(
          data.error ||
            `Konfigurasi OAuth ${provider} belum tersedia di Secrets.`
        );
        return;
      }

      const authWin = window.open(
        data.url,
        `goflow_oauth_${provider}`,
        'width=600,height=720'
      );
      if (!authWin) {
        setOauthUiBanner(
          'Browser memblokir popup. Izinkan popup untuk menghubungkan akun Anda.'
        );
      }
    } catch {
      setOauthUiBanner(`Gagal memulai otorisasi ${provider}.`);
    }
  };

  const handleLiveCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = usernameInput.trim();
    if (!cleaned) return;

    setIsChecking(true);
    setCheckError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      if (oauthSessionToken) {
        headers.Authorization = `Bearer ${oauthSessionToken}`;
      }

      const resp = await fetch('/api/social/check', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: cleaned,
          platform: platformScope,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setCheckError(data.error || 'Gagal memeriksa akun.');
        return;
      }
      setCheckResult(data);
    } catch {
      setCheckError('Tidak dapat terhubung ke server pemeriksaan akun.');
    } finally {
      setIsChecking(false);
    }
  };

  const renderChannelCard = (
    title: string,
    accentColor: string,
    channel: LiveSocialLookupChannel | null
  ) => {
    if (!channel) return null;
    const p = channel.profile;
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="text-sm font-bold text-slate-900">{title}</div>
          <span className="text-xs font-mono text-slate-500">
            {channel.source === 'live_oauth'
              ? 'API OAuth Resmi'
              : channel.source === 'live_public'
              ? 'Publik Real-Time'
              : 'Butuh OAuth / Terbatas'}
          </span>
        </div>

        {channel.found && p ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AvatarBadge
                url={p.avatarUrl}
                name={p.displayName}
                bgClass={accentColor}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {p.displayName}
                  </span>
                  {p.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : null}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {p.username}
                </div>
                {p.bio ? (
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {p.bio}
                  </p>
                ) : null}
              </div>
              {p.profileUrl ? (
                <a
                  href={p.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Buka profil ${p.username}`}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center tabular-nums">
              <div className="bg-[#F4F2F6] rounded-xl p-2.5">
                <div className="text-sm font-bold text-slate-900">
                  {p.followersFormatted}
                </div>
                <div className="text-[11px] text-slate-500">Pengikut</div>
              </div>
              <div className="bg-[#F4F2F6] rounded-xl p-2.5">
                <div className="text-sm font-bold text-slate-900">
                  {p.engagementRate > 0 ? `${p.engagementRate}%` : '-'}
                </div>
                <div className="text-[11px] text-slate-500">Est. ER</div>
              </div>
              <div className="bg-[#F4F2F6] rounded-xl p-2.5">
                <div className="text-sm font-bold text-slate-900">
                  {p.likesFormatted ?? p.mediaCount.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {p.likesFormatted ? 'Total Likes' : 'Total Post'}
                </div>
              </div>
            </div>

            {p.recentPosts && p.recentPosts.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700">
                  Postingan Terbaru
                </div>
                <div className="space-y-1.5">
                  {p.recentPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between text-xs bg-[#F4F2F6] rounded-lg px-3 py-2 gap-2"
                    >
                      <span className="text-slate-700 truncate">
                        {post.caption || 'Postingan Media'}
                      </span>
                      <span className="font-mono text-slate-600 shrink-0 tabular-nums">
                        {post.likesCount.toLocaleString('id-ID')} likes
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="bg-[#F4F2F6] rounded-xl p-4 space-y-2 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Data langsung belum terbuka</span>
            </div>
            <p>{channel.reason}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 max-w-2xl">
        <div className="text-xs font-mono text-[#4C2368]">
          Integrasi API Resmi & Pemeriksaan Publik Real-Time
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Koneksi & Cek Sosial Media Instagram & TikTok
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Hubungkan akun Instagram dan TikTok Anda melalui OAuth resmi untuk membaca
          insight langsung, atau cek username publik secara real-time di kedua platform.
        </p>
      </div>

      {/* OAuth Feedback Banners */}
      {oauthMessage ? (
        <div
          className={`rounded-xl px-4 py-3 text-xs font-medium border ${
            oauthMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {oauthMessage.text}
        </div>
      ) : null}

      {oauthUiBanner ? (
        <div className="rounded-xl px-4 py-3 text-xs font-medium border bg-amber-50 border-amber-200 text-amber-900">
          {oauthUiBanner}
        </div>
      ) : null}

      {/* OAuth Connection Cards: Instagram & TikTok */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instagram Connect Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#4C2368]">
                Instagram Graph / Login API
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Koneksi Akun Instagram
              </h2>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                oauthStatus?.instagram.connected
                  ? 'bg-[#44E27B] text-[#3A1952]'
                  : 'bg-[#F4F2F6] text-slate-600'
              }`}
            >
              {oauthStatus?.instagram.connected ? 'Terhubung' : 'Belum Terhubung'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Menarik profil bisnis/kreator, jumlah pengikut, serta metrik suka dan
            komentar dari media Instagram terbaru secara real-time.
          </p>

          {oauthStatus?.instagram.redirectUri ? (
            <div className="bg-[#F4F2F6] rounded-xl p-3 space-y-1">
              <div className="text-[11px] font-medium text-slate-500">
                Redirect URI Instagram (Meta Developer Dashboard)
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-slate-800 truncate">
                  {oauthStatus.instagram.redirectUri}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyUri('ig', oauthStatus.instagram.redirectUri)
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4C2368] shrink-0 cursor-pointer"
                >
                  {copiedKey === 'ig' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {!oauthStatus?.instagram.configured ? (
            <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
              Tambahkan <span className="font-mono text-slate-900">INSTAGRAM_CLIENT_ID</span>{' '}
              dan <span className="font-mono text-slate-900">INSTAGRAM_CLIENT_SECRET</span>{' '}
              di panel Secrets AI Studio untuk mengaktifkan tombol login OAuth Instagram.
            </div>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            {oauthStatus?.instagram.connected ? (
              <>
                <button
                  type="button"
                  onClick={fetchConnectedAccounts}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#3A1952] bg-[#44E27B] rounded-full hover:brightness-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Live Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDisconnectProvider('instagram')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Putuskan</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleConnectOAuth('instagram')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#4C2368] rounded-full hover:opacity-95 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Hubungkan Instagram</span>
              </button>
            )}
          </div>
        </div>

        {/* TikTok Connect Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#4C2368]">
                TikTok Login Kit & Display API v2
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Koneksi Akun TikTok
              </h2>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                oauthStatus?.tiktok.connected
                  ? 'bg-[#44E27B] text-[#3A1952]'
                  : 'bg-[#F4F2F6] text-slate-600'
              }`}
            >
              {oauthStatus?.tiktok.connected ? 'Terhubung' : 'Belum Terhubung'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Mengambil data profil kreator TikTok, jumlah pengikut, total likes,
            serta daftar video dan tayangan (views) langsung melalui TikTok API v2.
          </p>

          {oauthStatus?.tiktok.redirectUri ? (
            <div className="bg-[#F4F2F6] rounded-xl p-3 space-y-1">
              <div className="text-[11px] font-medium text-slate-500">
                Redirect URI TikTok (TikTok for Developers)
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-slate-800 truncate">
                  {oauthStatus.tiktok.redirectUri}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyUri('tt', oauthStatus.tiktok.redirectUri)
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4C2368] shrink-0 cursor-pointer"
                >
                  {copiedKey === 'tt' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {!oauthStatus?.tiktok.configured ? (
            <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
              Tambahkan <span className="font-mono text-slate-900">TIKTOK_CLIENT_KEY</span>{' '}
              dan <span className="font-mono text-slate-900">TIKTOK_CLIENT_SECRET</span>{' '}
              di panel Secrets AI Studio untuk mengaktifkan login OAuth TikTok.
            </div>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            {oauthStatus?.tiktok.connected ? (
              <>
                <button
                  type="button"
                  onClick={fetchConnectedAccounts}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#3A1952] bg-[#44E27B] rounded-full hover:brightness-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Live Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDisconnectProvider('tiktok')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Putuskan</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleConnectOAuth('tiktok')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Hubungkan TikTok</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connected Account Live Dashboard (when OAuth connected) */}
      {(oauthStatus?.instagram.connected || oauthStatus?.tiktok.connected) ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-[#4C2368]">
                Sesi Akun Terhubung
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Data Real-Time Akun Anda
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                onRefreshOAuthStatus();
                fetchConnectedAccounts();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer"
            >
              {loadingConnected ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Segarkan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {connectedData?.instagram
              ? renderChannelCard('Instagram Terhubung', 'bg-[#4C2368]', {
                  found: true,
                  source: 'live_oauth',
                  profile: connectedData.instagram,
                })
              : null}
            {connectedData?.tiktok
              ? renderChannelCard('TikTok Terhubung', 'bg-slate-900', {
                  found: true,
                  source: 'live_oauth',
                  profile: connectedData.tiktok,
                })
              : null}
          </div>
        </div>
      ) : null}

      {/* Real-Time Public Username Checker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-mono text-[#4C2368]">
            Pemeriksaan Langsung Lintas Platform
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Cek Akun Instagram & TikTok Secara Real-Time
          </h2>
          <p className="text-xs text-slate-600">
            Masukkan username publik (contoh: @cristiano, @fujiiian, @tasya.farasya,
            atau akun lain) untuk mengecek profil langsung dari server.
          </p>
        </div>

        <form
          onSubmit={handleLiveCheck}
          className="flex flex-col md:flex-row gap-3 items-stretch md:items-center"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Masukkan username, misal @fujiiian"
              className="w-full h-11 pl-10 pr-4 text-sm bg-[#F4F2F6] rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4C2368]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F4F2F6] rounded-full">
            {(
              [
                {id: 'both', label: 'IG + TikTok'},
                {id: 'instagram', label: 'Instagram'},
                {id: 'tiktok', label: 'TikTok'},
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPlatformScope(opt.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  platformScope === opt.id
                    ? 'bg-[#4C2368] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="h-11 px-6 rounded-full bg-[#44E27B] text-[#3A1952] text-xs font-bold hover:brightness-95 disabled:opacity-50 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengecek...</span>
              </>
            ) : (
              <span>Cek Akun Real-Time</span>
            )}
          </button>
        </form>

        {checkError ? (
          <div className="rounded-xl px-4 py-3 text-xs bg-red-50 border border-red-200 text-red-800">
            {checkError}
          </div>
        ) : null}

        {checkResult ? (
          <div className="space-y-5 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <div className="text-xs text-slate-600">
                Hasil pemeriksaan real-time untuk{' '}
                <span className="font-mono font-bold text-slate-900">
                  {checkResult.username}
                </span>{' '}
                · {new Date(checkResult.checkedAt).toLocaleTimeString('id-ID')}
              </div>

              {(checkResult.instagram?.found || checkResult.tiktok?.found) ? (
                <button
                  type="button"
                  onClick={() => {
                    const built = buildInfluencerFromLive(
                      checkResult.username,
                      checkResult.instagram?.profile,
                      checkResult.tiktok?.profile
                    );
                    onUseLiveProfileInSimulator(
                      built,
                      built.primaryPlatform
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4C2368] text-white text-xs font-bold hover:opacity-95 cursor-pointer self-start sm:self-auto"
                >
                  <span>Lanjut Analisis di Simulasi GoFlow</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChannelCard(
                'Instagram',
                'bg-[#4C2368]',
                checkResult.instagram
              )}
              {renderChannelCard('TikTok', 'bg-slate-900', checkResult.tiktok)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
