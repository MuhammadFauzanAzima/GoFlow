export type AppView =
  | 'wireframe'
  | 'simulator'
  | 'socialCheck'
  | 'explorer'
  | 'saved';

export interface LivePlatformPost {
  id: string;
  caption?: string;
  title?: string;
  mediaType?: string;
  likesCount: number;
  commentsCount: number;
  shareCount?: number;
  viewCount?: number;
  viewsCount?: number;
  isVideo?: boolean;
  thumbnailUrl?: string;
  permalink?: string;
  shareUrl?: string;
  timestamp?: string;
}

export interface LiveSocialProfileResult {
  platform: 'instagram' | 'tiktok';
  username: string;
  displayName: string;
  bio?: string;
  accountType?: string;
  avatarUrl?: string;
  verified?: boolean;
  followersCount: number;
  followersFormatted: string;
  followingCount: number;
  likesCount?: number;
  likesFormatted?: string;
  mediaCount: number;
  engagementRate: number;
  avgViewsFormatted?: string;
  profileUrl?: string;
  recentPosts?: LivePlatformPost[];
  recentVideos?: LivePlatformPost[];
}

export interface LiveSocialLookupChannel {
  found: boolean;
  source?: 'live_oauth' | 'live_public' | 'unavailable';
  reason?: string;
  profile?: LiveSocialProfileResult;
}

export interface LiveSocialCheckResponse {
  checkedAt: string;
  username: string;
  instagram: LiveSocialLookupChannel | null;
  tiktok: LiveSocialLookupChannel | null;
}

export interface OAuthStatusResponse {
  appBaseUrl: string;
  instagram: {
    configured: boolean;
    connected: boolean;
    connectedAt: string | null;
    redirectUri: string;
  };
  tiktok: {
    configured: boolean;
    connected: boolean;
    connectedAt: string | null;
    redirectUri: string;
  };
}

export type SocialPlatform = 'Instagram' | 'TikTok' | 'Instagram & TikTok';

export type FlowchartSymbol =
  | 'Terminator'
  | 'Input / Output'
  | 'Proses'
  | 'Decision'
  | 'Preparation'
  | 'Database / Penyimpanan'
  | 'Dokumen'
  | 'Subroutine / Arsip';

export interface FlowchartNodeSpec {
  id: string;
  order: number;
  label: string;
  symbol: FlowchartSymbol;
  screenId: string;
  screenTitle: string;
  uiElement: string;
  description: string;
  lecturerNote?: string;
}

export interface WireframeScreenSpec {
  id: string;
  stepRange: string;
  title: string;
  subtitle: string;
  flowchartNodes: string[];
  branchType: 'all' | 'valid' | 'invalid';
  components: string[];
  userAction: string;
  nextScreenId?: string;
}

export interface PlatformMetrics {
  followers: string;
  followersCount: number;
  engagementRate: number;
  avgViews: string;
  avgViewsCount: number;
  postsPerWeek: number;
  topFormat: string;
}

export interface InfluencerProfile {
  handle: string;
  name: string;
  niche: string;
  primaryPlatform: SocialPlatform;
  location: string;
  followers: string;
  engagementRate: number;
  authenticityScore: number;
  avgViews: string;
  sentimentPositive: number;
  estimatedRateIdr: number;
  isValid: boolean;
  validationReason: string;
  instagram: PlatformMetrics;
  tiktok: PlatformMetrics;
  demographics: {
    femalePct: number;
    malePct: number;
    topAgeRange: string;
    topCities: string[];
  };
  strengths: string[];
}

export type AnalysisOptionId =
  | 'engagement'
  | 'authenticity'
  | 'sentiment'
  | 'conversion'
  | 'niche_fit'
  | 'viral_velocity';

export type InfluenceGoalId =
  | 'brand_awareness'
  | 'product_sales'
  | 'trust_credibility'
  | 'viral_reach'
  | 'community_growth'
  | 'website_traffic'
  | 'brand_sentiment'
  | 'customer_loyalty';

export interface SavedAnalysisRecord {
  id: string;
  status: 'draft' | 'final';
  savedAt: string;
  influencerInput: string;
  platformFocus: SocialPlatform;
  budgetIdr: number;
  isValid: boolean;
  manualOverrideNote?: string;
  selectedAnalyses: AnalysisOptionId[];
  selectedGoals: InfluenceGoalId[];
  targetCampaign: string;
  documentTitle: string;
  executiveSummary: string;
  recommendation: string;
  metrics: {
    influenceIndex: number;
    estimatedReach: string;
    projectedCtr: string;
    estimatedConversions: string;
    costPerViewIdr: string;
    riskLevel: 'Rendah' | 'Sedang' | 'Tinggi';
  };
}
