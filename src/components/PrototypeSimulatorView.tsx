import React, {useMemo, useState} from 'react';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  BookmarkCheck,
  Check,
  FileText,
  Home,
  Loader2,
  PieChart,
  RotateCcw,
  Save,
  Search,
} from 'lucide-react';
import {
  ANALYSIS_OPTIONS,
  FLOWCHART_NODES,
  INFLUENCE_GOALS,
  PRESET_INFLUENCERS,
} from '../data/flowchartData';
import {
  AnalysisOptionId,
  InfluenceGoalId,
  InfluencerProfile,
  SavedAnalysisRecord,
  SocialPlatform,
} from '../types/flowchart';
import {GoFlowLogo, GoFlowWelcomeIllustration} from './GoFlowBrand';

interface PrototypeSimulatorViewProps {
  initialStep: number;
  initialInfluencerHandle?: string;
  initialPlatformFocus?: SocialPlatform;
  initialLiveProfile?: InfluencerProfile | null;
  oauthSessionToken?: string | null;
  initialDraft?: SavedAnalysisRecord | null;
  onSaveRecord: (record: SavedAnalysisRecord) => void;
  onOpenSavedTab: () => void;
}

const SCREEN_LABELS = [
  '01. Welcome',
  '02. Cari & Validasi',
  '03. Pilih Analisis',
  '04. Pengaruh & ROI',
  '05. Hasil & Progres',
  '06. Susun Dokumen',
  '07. Simpan',
];

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${Math.round(num / 1_000)}K`;
  return String(num);
}

export function PrototypeSimulatorView({
  initialStep,
  initialInfluencerHandle,
  initialPlatformFocus,
  initialLiveProfile,
  oauthSessionToken,
  initialDraft,
  onSaveRecord,
  onOpenSavedTab,
}: PrototypeSimulatorViewProps) {
  const startingHandle =
    initialDraft?.influencerInput ??
    initialLiveProfile?.handle ??
    initialInfluencerHandle ??
    '@tasya.farasya';

  const [step, setStep] = useState<number>(initialStep);
  const [influencerInput, setInfluencerInput] = useState<string>(startingHandle);
  const [platformFocus, setPlatformFocus] = useState<SocialPlatform>(
    initialDraft?.platformFocus ??
      initialLiveProfile?.primaryPlatform ??
      initialPlatformFocus ??
      'Instagram & TikTok'
  );
  const [budgetIdr, setBudgetIdr] = useState<number>(
    initialDraft?.budgetIdr ?? 25000000
  );

  const [matchedProfile, setMatchedProfile] = useState<InfluencerProfile | null>(
    () =>
      initialLiveProfile ??
      PRESET_INFLUENCERS.find(
        (p) => p.handle.toLowerCase() === startingHandle.toLowerCase()
      ) ??
      PRESET_INFLUENCERS[0]
  );
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [liveLookupNote, setLiveLookupNote] = useState<string | null>(
    initialLiveProfile ? 'Dimuat dari data real-time Instagram / TikTok.' : null
  );
  const [manualOverride, setManualOverride] = useState<boolean>(
    Boolean(initialDraft?.manualOverrideNote)
  );
  const [manualOverrideNote, setManualOverrideNote] = useState<string>(
    initialDraft?.manualOverrideNote ?? ''
  );

  const [selectedAnalyses, setSelectedAnalyses] = useState<AnalysisOptionId[]>(
    initialDraft?.selectedAnalyses ?? [
      'engagement',
      'authenticity',
      'sentiment',
      'viral_velocity',
    ]
  );

  const [selectedGoals, setSelectedGoals] = useState<InfluenceGoalId[]>(
    initialDraft?.selectedGoals ?? [
      'brand_awareness',
      'product_sales',
      'trust_credibility',
    ]
  );
  const [targetCampaign, setTargetCampaign] = useState<string>(
    initialDraft?.targetCampaign ?? 'Kampanye Omnichannel IG Reels & TikTok'
  );
  const [isProcessingAnalysis, setIsProcessingAnalysis] = useState(false);

  const [progressSavedToast, setProgressSavedToast] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>(
    initialDraft?.documentTitle ??
      `Laporan Pengaruh — ${
        PRESET_INFLUENCERS.find(
          (p) => p.handle.toLowerCase() === startingHandle.toLowerCase()
        )?.name ?? startingHandle
      }`
  );
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    initialDraft?.executiveSummary ??
      'Berdasarkan audit profil lintas Instagram & TikTok, kreator memiliki kualitas audiens organik yang baik dengan potensi konversi serta jangkauan viral yang selaras dengan target kampanye.'
  );
  const [recommendation, setRecommendation] = useState<string>(
    initialDraft?.recommendation ??
      'Kombinasikan 1 video TikTok FYP dengan keranjang tautan + 1 Instagram Reels dan 3 set Story pengingat untuk memaksimalkan awareness sekaligus konversi.'
  );
  const [finalSavedMessage, setFinalSavedMessage] = useState<string | null>(null);

  const resolvedProfile: InfluencerProfile = useMemo(() => {
    if (matchedProfile) return matchedProfile;
    const cleanHandle = influencerInput.trim() || '@kreator_baru';
    const looksInvalid =
      cleanHandle.toLowerCase().includes('fake') ||
      cleanHandle.toLowerCase().includes('bot') ||
      cleanHandle.toLowerCase().includes('invalid') ||
      cleanHandle.toLowerCase().includes('promo_murah') ||
      cleanHandle.length < 4;

    return {
      handle: cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`,
      name: cleanHandle.replace(/^@/, ''),
      niche: looksInvalid ? 'Tidak Teridentifikasi' : 'Kreator Lintas Platform',
      primaryPlatform: platformFocus,
      location: 'Indonesia',
      followers: looksInvalid ? '12.4K' : '620K',
      engagementRate: looksInvalid ? 0.4 : 4.6,
      authenticityScore: looksInvalid ? 31 : 88,
      avgViews: looksInvalid ? '240' : '92K',
      sentimentPositive: looksInvalid ? 38 : 86,
      estimatedRateIdr: looksInvalid ? 1500000 : 12000000,
      isValid: !looksInvalid,
      validationReason: looksInvalid
        ? 'Rasio interaksi di bawah ambang batas valid (1%) dan data audiens tidak konsisten.'
        : 'Akun aktif ditemukan di Instagram & TikTok dengan interaksi audiens organik.',
      instagram: {
        followers: looksInvalid ? '4.2K' : '280K',
        followersCount: looksInvalid ? 4200 : 280000,
        engagementRate: looksInvalid ? 0.3 : 4.2,
        avgViews: looksInvalid ? '90' : '45K',
        avgViewsCount: looksInvalid ? 90 : 45000,
        postsPerWeek: 4,
        topFormat: 'Reels & Carousel',
      },
      tiktok: {
        followers: looksInvalid ? '8.2K' : '340K',
        followersCount: looksInvalid ? 8200 : 340000,
        engagementRate: looksInvalid ? 0.5 : 5.1,
        avgViews: looksInvalid ? '150' : '110K',
        avgViewsCount: looksInvalid ? 150 : 110000,
        postsPerWeek: 6,
        topFormat: 'Video Pendek FYP',
      },
      demographics: {
        femalePct: 62,
        malePct: 38,
        topAgeRange: '18–34 tahun (74%)',
        topCities: ['Jakarta', 'Bandung', 'Surabaya'],
      },
      strengths: ['Cocok untuk kampanye media sosial terukur'],
    };
  }, [influencerInput, matchedProfile, platformFocus]);

  const computedMetrics = useMemo(() => {
    const activeEr =
      platformFocus === 'Instagram'
        ? resolvedProfile.instagram.engagementRate
        : platformFocus === 'TikTok'
        ? resolvedProfile.tiktok.engagementRate
        : (resolvedProfile.instagram.engagementRate +
            resolvedProfile.tiktok.engagementRate) /
          2;

    const baseScore = resolvedProfile.isValid
      ? Math.round(
          resolvedProfile.authenticityScore * 0.42 +
            resolvedProfile.sentimentPositive * 0.34 +
            Math.min(activeEr * 4, 24)
        )
      : manualOverride
      ? 58
      : 32;

    const influenceIndex = Math.min(98, baseScore + Math.min(selectedGoals.length, 4) * 2);

    const activeViews =
      platformFocus === 'Instagram'
        ? resolvedProfile.instagram.avgViewsCount
        : platformFocus === 'TikTok'
        ? resolvedProfile.tiktok.avgViewsCount
        : resolvedProfile.instagram.avgViewsCount +
          resolvedProfile.tiktok.avgViewsCount;

    const budgetMultiplier = Math.max(0.5, budgetIdr / Math.max(1000000, resolvedProfile.estimatedRateIdr));
    const projectedViewsNum = Math.round(activeViews * Math.min(3, budgetMultiplier));
    const ctrNum = resolvedProfile.isValid
      ? Number((activeEr * 0.52 + selectedAnalyses.length * 0.1).toFixed(2))
      : 0.45;
    const estConversionsNum = Math.max(12, Math.round((projectedViewsNum * (ctrNum / 100)) * 0.18));
    const costPerView = projectedViewsNum > 0 ? Math.round(budgetIdr / projectedViewsNum) : 0;

    const riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' =
      influenceIndex >= 80 ? 'Rendah' : influenceIndex >= 55 ? 'Sedang' : 'Tinggi';

    return {
      influenceIndex,
      estimatedReach: formatCompactNumber(projectedViewsNum),
      projectedCtr: `${ctrNum}%`,
      estimatedConversions: estConversionsNum.toLocaleString('id-ID'),
      costPerViewIdr: `Rp ${costPerView.toLocaleString('id-ID')}`,
      riskLevel,
    };
  }, [
    resolvedProfile,
    platformFocus,
    manualOverride,
    selectedGoals.length,
    selectedAnalyses.length,
    budgetIdr,
  ]);

  const activeFlowchartNodes = useMemo(() => {
    const mapByStep: Record<number, string[]> = {
      0: ['mulai'],
      1: ['masukan-nama', 'proses-data', 'valid-atau-tidak', 'cabang-valid-tidak', 'lanjut'],
      2: ['masukan-analisis', 'memulai'],
      3: ['masukan-pengaruh', 'memproses'],
      4: ['analisis', 'save-progress'],
      5: ['susun-dokumen', 'next'],
      6: ['save'],
    };
    const ids = mapByStep[step] ?? [];
    return FLOWCHART_NODES.filter((node) => ids.includes(node.id));
  }, [step]);

  const handleSelectInfluencer = (preset: InfluencerProfile) => {
    setInfluencerInput(preset.handle);
    setMatchedProfile(preset);
    setManualOverride(false);
    setDocumentTitle(`Laporan Pengaruh ${platformFocus} — ${preset.name}`);
  };

  const toggleAnalysis = (id: AnalysisOptionId) => {
    setSelectedAnalyses((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: InfluenceGoalId) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const buildRecord = (status: 'draft' | 'final'): SavedAnalysisRecord => ({
    id: `${status}-${Date.now()}`,
    status,
    savedAt: new Date().toLocaleString('id-ID'),
    influencerInput: resolvedProfile.handle,
    platformFocus,
    budgetIdr,
    isValid: resolvedProfile.isValid,
    manualOverrideNote: manualOverride
      ? manualOverrideNote || 'Dilanjutkan dengan input manual'
      : undefined,
    selectedAnalyses,
    selectedGoals,
    targetCampaign,
    documentTitle:
      documentTitle.trim() || `Laporan GoFlow — ${resolvedProfile.handle}`,
    executiveSummary,
    recommendation,
    metrics: computedMetrics,
  });

  const handleRunAnalysis = () => {
    setIsProcessingAnalysis(true);
    setProgressSavedToast(null);
    setTimeout(() => {
      setIsProcessingAnalysis(false);
      setDocumentTitle(`Laporan Pengaruh ${platformFocus} — ${resolvedProfile.name}`);
      setStep(4);
    }, 550);
  };

  const handleSaveProgress = () => {
    onSaveRecord(buildRecord('draft'));
    setProgressSavedToast('Progres analisis tersimpan ke Arsip.');
  };

  const handleSaveFinal = () => {
    onSaveRecord(buildRecord('final'));
    setFinalSavedMessage('Dokumen PDF berhasil disimpan ke Arsip.');
  };

  const handleCheckLiveAccount = async () => {
    const cleaned = influencerInput.trim();
    if (!cleaned) return;
    setIsCheckingLive(true);
    setLiveLookupNote(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      if (oauthSessionToken) {
        headers.Authorization = `Bearer ${oauthSessionToken}`;
      }
      const platform =
        platformFocus === 'Instagram'
          ? 'instagram'
          : platformFocus === 'TikTok'
          ? 'tiktok'
          : 'both';

      const resp = await fetch('/api/social/check', {
        method: 'POST',
        headers,
        body: JSON.stringify({username: cleaned, platform}),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setLiveLookupNote(data.error || 'Format username tidak valid.');
        return;
      }

      const ig = data.instagram?.found ? data.instagram.profile : undefined;
      const tt = data.tiktok?.found ? data.tiktok.profile : undefined;

      if (!ig && !tt) {
        setMatchedProfile(null);
        setLiveLookupNote(
          data.tiktok?.reason ||
            data.instagram?.reason ||
            'Akun tidak ditemukan secara publik. Hubungkan OAuth atau lanjutkan manual.'
        );
        return;
      }

      const totalFollowers =
        (ig?.followersCount ?? 0) + (tt?.followersCount ?? 0);
      const avgEr =
        ig && tt
          ? Number(((ig.engagementRate + tt.engagementRate) / 2).toFixed(2))
          : ig
          ? ig.engagementRate
          : tt.engagementRate;
      const isValid = totalFollowers > 0 && avgEr >= 0.8;

      const liveBuilt: InfluencerProfile = {
        handle: ig?.username ?? tt?.username ?? data.username,
        name: ig?.displayName ?? tt?.displayName ?? data.username,
        niche: 'Hasil Cek Real-Time',
        primaryPlatform:
          ig && tt ? 'Instagram & TikTok' : ig ? 'Instagram' : 'TikTok',
        location: 'Live Account',
        followers: formatCompactNumber(totalFollowers),
        engagementRate: avgEr,
        authenticityScore: isValid ? Math.min(96, Math.round(74 + avgEr * 3)) : 45,
        avgViews: tt?.avgViewsFormatted ?? ig?.avgViewsFormatted ?? '-',
        sentimentPositive: isValid ? 86 : 52,
        estimatedRateIdr: Math.max(5000000, Math.round(totalFollowers * 2.5)),
        isValid,
        validationReason: isValid
          ? 'Terverifikasi real-time dari Instagram / TikTok.'
          : 'Interaksi rendah atau data statistik belum lengkap.',
        instagram: {
          followers: ig?.followersFormatted ?? '0',
          followersCount: ig?.followersCount ?? 0,
          engagementRate: ig?.engagementRate ?? 0,
          avgViews: ig?.avgViewsFormatted ?? '-',
          avgViewsCount: Math.round((ig?.followersCount ?? 0) * 0.12),
          postsPerWeek: 4,
          topFormat: 'Reels & Post Feed',
        },
        tiktok: {
          followers: tt?.followersFormatted ?? '0',
          followersCount: tt?.followersCount ?? 0,
          engagementRate: tt?.engagementRate ?? 0,
          avgViews: tt?.avgViewsFormatted ?? '-',
          avgViewsCount: Math.round((tt?.followersCount ?? 0) * 0.25),
          postsPerWeek: 6,
          topFormat: 'TikTok Video',
        },
        demographics: {
          femalePct: 58,
          malePct: 42,
          topAgeRange: '18–34 tahun',
          topCities: ['Jakarta', 'Bandung', 'Surabaya'],
        },
        strengths: ['Profil diambil langsung secara real-time'],
      };
      setMatchedProfile(liveBuilt);
      setDocumentTitle(`Laporan Pengaruh ${platformFocus} — ${liveBuilt.name}`);
      setLiveLookupNote('Data berhasil diambil real-time dari server.');
    } catch {
      setLiveLookupNote('Gagal menghubungi server cek akun.');
    } finally {
      setIsCheckingLive(false);
    }
  };

  const monthlyBars = useMemo(() => {
    const base = Math.max(40, computedMetrics.influenceIndex - 18);
    return [
      {label: 'Jan', val: Math.min(98, base - 10), color: '#4C2368'},
      {label: 'Feb', val: Math.min(98, base + 4), color: '#F59E0B'},
      {label: 'Mar', val: Math.min(98, base + 12), color: '#44E27B'},
      {label: 'Apr', val: Math.min(98, base - 4), color: '#38BDF8'},
      {label: 'Mei', val: Math.min(98, base + 15), color: '#FB7185'},
      {label: 'Jun', val: computedMetrics.influenceIndex, color: '#7E22CE'},
    ];
  }, [computedMetrics.influenceIndex]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#4C2368]">
            Simulasi Lintas Platform · Instagram & TikTok
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Prototipe Aplikasi GoFlow
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setStep(0);
            setProgressSavedToast(null);
            setFinalSavedMessage(null);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ulangi dari Mulai</span>
        </button>
      </div>

      {/* Compact 7-Step Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {SCREEN_LABELS.map((label, idx) => {
          const isActive = step === idx;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStep(idx)}
              className={`px-3 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#4C2368] text-white border-[#4C2368]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-semibold truncate">{label}</div>
            </button>
          );
        })}
      </div>

      {/* 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: GoFlow Mobile Device */}
        <div className="lg:col-span-6 flex justify-center bg-slate-100 border border-slate-200 rounded-2xl p-4 sm:p-6">
          <div className="w-full max-w-[385px] h-[660px] bg-[#4C2368] border-[3px] border-slate-900 rounded-[36px] shadow-md overflow-hidden flex flex-col">
            {/* SCREEN 01: MULAI */}
            {step === 0 ? (
              <div className="flex-1 p-6 flex flex-col justify-between text-white">
                <div className="pt-4 flex justify-center">
                  <GoFlowLogo variant="light" size="lg" />
                </div>

                <div className="space-y-4 text-center">
                  <GoFlowWelcomeIllustration />
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold tracking-tight">
                      Selamat Datang di GoFlow!
                    </h2>
                    <p className="text-xs text-purple-100">
                      Analisis Influencer Instagram & TikTok Terbaik
                    </p>
                  </div>
                </div>

                <div className="pb-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full h-12 rounded-full bg-[#44E27B] text-[#3A1952] font-bold text-sm hover:brightness-95 transition-all cursor-pointer"
                  >
                    MULAI
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-5 pt-4 pb-3 flex items-center justify-between text-white shrink-0">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    aria-label="Kembali"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <GoFlowLogo variant="light" size="sm" />
                  <span className="text-[11px] font-mono text-purple-200 tabular-nums w-8 text-right">
                    {step + 1}/7
                  </span>
                </div>

                <div className="flex-1 bg-white rounded-t-[28px] p-5 flex flex-col justify-between overflow-y-auto">
                  {/* SCREEN 02: MASUKAN NAMA -> VALID/TIDAK -> LANJUT */}
                  {step === 1 ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={influencerInput}
                              onChange={(e) => {
                                setInfluencerInput(e.target.value);
                                setLiveLookupNote(null);
                                const found =
                                  PRESET_INFLUENCERS.find(
                                    (p) =>
                                      p.handle.toLowerCase() ===
                                      e.target.value.trim().toLowerCase()
                                  ) ?? null;
                                setMatchedProfile(found);
                                setManualOverride(false);
                              }}
                              placeholder="Masukan Nama Influencer"
                              className="w-full h-11 pl-10 pr-3 text-sm bg-[#F4F2F6] rounded-full text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4C2368]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleCheckLiveAccount}
                            disabled={isCheckingLive}
                            className="h-11 px-3.5 rounded-full bg-[#4C2368] text-white text-[11px] font-bold hover:opacity-95 disabled:opacity-50 shrink-0 cursor-pointer"
                          >
                            {isCheckingLive ? 'Cek...' : 'Cek Live'}
                          </button>
                        </div>

                        {liveLookupNote ? (
                          <div className="text-[11px] text-[#4C2368] bg-purple-50 border border-purple-200 rounded-xl px-3 py-1.5">
                            {liveLookupNote}
                          </div>
                        ) : null}

                        {/* Platform Focus Filter */}
                        <div className="grid grid-cols-3 gap-1 p-1 bg-[#F4F2F6] rounded-xl">
                          {(['Instagram & TikTok', 'Instagram', 'TikTok'] as const).map(
                            (plat) => (
                              <button
                                key={plat}
                                type="button"
                                onClick={() => setPlatformFocus(plat)}
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer truncate ${
                                  platformFocus === plat
                                    ? 'bg-[#4C2368] text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {plat === 'Instagram & TikTok' ? 'IG + TikTok' : plat}
                              </button>
                            )
                          )}
                        </div>

                        {/* Validation Profile Card */}
                        <div className="bg-[#F4F2F6] rounded-2xl p-3.5 space-y-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#4C2368] text-white font-bold text-sm flex items-center justify-center shrink-0">
                              {resolvedProfile.name
                                .split(' ')
                                .map((w) => w[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-slate-900 truncate">
                                {resolvedProfile.name}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {resolvedProfile.handle} · {resolvedProfile.niche}
                              </div>
                              <span
                                className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                                  resolvedProfile.isValid
                                    ? 'bg-[#44E27B] text-[#3A1952]'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {resolvedProfile.isValid ? 'VALID' : 'TIDAK VALID'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/80 tabular-nums">
                            <div>
                              <span className="text-slate-500">IG:</span>{' '}
                              <span className="font-semibold text-slate-900">
                                {resolvedProfile.instagram.followers} (ER{' '}
                                {resolvedProfile.instagram.engagementRate}%)
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">TikTok:</span>{' '}
                              <span className="font-semibold text-slate-900">
                                {resolvedProfile.tiktok.followers} (ER{' '}
                                {resolvedProfile.tiktok.engagementRate}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {!resolvedProfile.isValid ? (
                          <div className="border border-red-200 bg-red-50/70 rounded-2xl p-3 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-800">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Cabang Tidak Valid</span>
                            </div>
                            <label className="flex items-start gap-2 text-[11px] text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={manualOverride}
                                onChange={(e) => setManualOverride(e.target.checked)}
                                className="mt-0.5 w-3.5 h-3.5 accent-[#4C2368]"
                              />
                              <span>
                                Lanjutkan tetap dengan data manual (cabang TIDAK →
                                LANJUT).
                              </span>
                            </label>
                            {manualOverride ? (
                              <input
                                type="text"
                                value={manualOverrideNote}
                                onChange={(e) => setManualOverrideNote(e.target.value)}
                                placeholder="Catatan data manual..."
                                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-lg"
                              />
                            ) : null}
                          </div>
                        ) : null}

                        {/* Quick Influencer List */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-medium text-slate-500 px-1">
                            Pilih Kreator (IG & TikTok)
                          </div>
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {PRESET_INFLUENCERS.map((preset) => (
                              <button
                                key={preset.handle}
                                type="button"
                                onClick={() => handleSelectInfluencer(preset)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F4F2F6] hover:bg-purple-50 transition-colors text-left cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-slate-900 truncate">
                                    {preset.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {preset.primaryPlatform} · {preset.followers}
                                  </div>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                    preset.isValid
                                      ? 'bg-[#44E27B] text-[#3A1952]'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {preset.isValid ? 'VALID' : 'TIDAK'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!resolvedProfile.isValid && !manualOverride}
                        className="w-full h-11 rounded-full bg-[#44E27B] text-[#3A1952] font-bold text-sm hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer mt-3 shrink-0"
                      >
                        LANJUT
                      </button>
                    </>
                  ) : null}

                  {/* SCREEN 03: ANALISIS YANG DIBUTUHKAN -> MEMULAI */}
                  {step === 2 ? (
                    <>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 leading-snug">
                            Analisis yang Dibutuhkan
                          </h2>
                          <p className="text-xs text-slate-500">
                            Fokus platform: {platformFocus}
                          </p>
                        </div>
                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                          {ANALYSIS_OPTIONS.map((opt) => {
                            const checked = selectedAnalyses.includes(opt.id);
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-start gap-3 px-3.5 py-2.5 rounded-2xl cursor-pointer transition-colors ${
                                  checked
                                    ? 'bg-purple-50 ring-1 ring-[#4C2368]'
                                    : 'bg-[#F4F2F6] hover:bg-slate-200/70'
                                }`}
                              >
                                <div
                                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                    checked
                                      ? 'bg-[#4C2368] text-white'
                                      : 'bg-white border border-slate-400'
                                  }`}
                                >
                                  {checked ? <Check className="w-3.5 h-3.5" /> : null}
                                </div>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleAnalysis(opt.id)}
                                  className="sr-only"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-slate-900">
                                    {opt.label}
                                  </div>
                                  <div className="text-[11px] text-slate-500 leading-snug">
                                    {opt.description}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={selectedAnalyses.length === 0}
                        className="w-full h-11 rounded-full bg-[#44E27B] text-[#3A1952] font-bold text-sm hover:brightness-95 disabled:opacity-40 transition-all cursor-pointer mt-3 shrink-0"
                      >
                        MEMULAI
                      </button>
                    </>
                  ) : null}

                  {/* SCREEN 04: MASUKAN PENGARUH -> MEMPROSES -> ANALISIS */}
                  {step === 3 ? (
                    <>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">
                            Pengaruh yang Dibutuhkan
                          </h2>
                          <p className="text-xs text-slate-500">
                            Pilih dampak media sosial & anggaran untuk proyeksi ROI
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                          {INFLUENCE_GOALS.map((goal) => {
                            const checked = selectedGoals.includes(goal.id);
                            return (
                              <button
                                key={goal.id}
                                type="button"
                                onClick={() => toggleGoal(goal.id)}
                                className={`p-2.5 rounded-xl text-left text-[11px] transition-colors cursor-pointer ${
                                  checked
                                    ? 'bg-[#4C2368] text-white font-semibold'
                                    : 'bg-[#F4F2F6] text-slate-700 hover:bg-purple-50'
                                }`}
                              >
                                {goal.label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-500">
                              Estimasi Anggaran
                            </span>
                            <span className="font-mono font-bold text-[#4C2368] tabular-nums">
                              Rp {budgetIdr.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={5000000}
                            max={100000000}
                            step={5000000}
                            value={budgetIdr}
                            onChange={(e) => setBudgetIdr(Number(e.target.value))}
                            className="w-full accent-[#4C2368]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Nama Kampanye
                          </label>
                          <input
                            type="text"
                            value={targetCampaign}
                            onChange={(e) => setTargetCampaign(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-[#F4F2F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4C2368]"
                          />
                        </div>

                        {isProcessingAnalysis ? (
                          <div className="py-2 text-center space-y-1.5">
                            <Loader2 className="w-5 h-5 text-[#4C2368] animate-spin mx-auto" />
                            <div className="text-xs font-bold text-[#4C2368]">
                              MEMPROSES DATA IG & TIKTOK...
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={handleRunAnalysis}
                        disabled={selectedGoals.length === 0 || isProcessingAnalysis}
                        className="w-full h-11 rounded-full bg-[#44E27B] text-[#3A1952] font-bold text-sm hover:brightness-95 disabled:opacity-40 transition-all cursor-pointer mt-3 shrink-0"
                      >
                        ANALISIS
                      </button>
                    </>
                  ) : null}

                  {/* SCREEN 05: HASIL ANALISIS -> SAVE PROGRESS -> SUSUN DOKUMEN */}
                  {step === 4 ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <h2 className="text-sm font-bold text-slate-900 truncate">
                              Hasil Analisis {resolvedProfile.name}
                            </h2>
                            <div className="text-[11px] text-slate-500">
                              Fokus: {platformFocus}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-emerald-700 tabular-nums shrink-0">
                            {computedMetrics.influenceIndex}%
                          </span>
                        </div>

                        {/* Monthly Bar Chart */}
                        <div className="bg-[#F4F2F6] rounded-2xl p-3">
                          <div className="h-20 flex items-end justify-between gap-2 px-1">
                            {monthlyBars.map((bar) => (
                              <div
                                key={bar.label}
                                className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                              >
                                <div
                                  className="w-full rounded-t-md transition-all"
                                  style={{
                                    height: `${bar.val}%`,
                                    backgroundColor: bar.color,
                                  }}
                                />
                                <span className="text-[9px] text-slate-500">
                                  {bar.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* IG vs TikTok Comparison Bars */}
                        <div className="bg-[#F4F2F6] rounded-2xl p-3 space-y-2 text-[11px]">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-slate-700">
                                Instagram ER ({resolvedProfile.instagram.engagementRate}%)
                              </span>
                              <span className="text-slate-500 tabular-nums">
                                {resolvedProfile.instagram.avgViews} views
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#4C2368] rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    resolvedProfile.instagram.engagementRate * 12
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-slate-700">
                                TikTok ER ({resolvedProfile.tiktok.engagementRate}%)
                              </span>
                              <span className="text-slate-500 tabular-nums">
                                {resolvedProfile.tiktok.avgViews} views
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#44E27B] rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    resolvedProfile.tiktok.engagementRate * 12
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ROI Projections */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-[#F4F2F6] rounded-xl p-2">
                            <div className="text-xs font-bold text-slate-900 tabular-nums">
                              {computedMetrics.estimatedReach}
                            </div>
                            <div className="text-[10px] text-slate-500">Est. Views</div>
                          </div>
                          <div className="bg-[#F4F2F6] rounded-xl p-2">
                            <div className="text-xs font-bold text-slate-900 tabular-nums">
                              {computedMetrics.estimatedConversions}
                            </div>
                            <div className="text-[10px] text-slate-500">Est. Konversi</div>
                          </div>
                          <div className="bg-[#F4F2F6] rounded-xl p-2">
                            <div className="text-xs font-bold text-slate-900 tabular-nums">
                              {computedMetrics.projectedCtr}
                            </div>
                            <div className="text-[10px] text-slate-500">Proyeksi CTR</div>
                          </div>
                        </div>

                        {progressSavedToast ? (
                          <div className="text-[11px] text-center text-[#4C2368] bg-purple-50 border border-purple-200 rounded-xl py-1.5 px-2">
                            {progressSavedToast}
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-2 mt-3 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveProgress}
                          className="w-full h-10 rounded-full border-2 border-[#4C2368] text-[#4C2368] font-bold text-xs hover:bg-purple-50 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>SAVE PROGRESS</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(5)}
                          className="w-full h-11 rounded-full bg-[#44E27B] text-[#3A1952] font-bold text-sm hover:brightness-95 transition-all cursor-pointer"
                        >
                          SUSUN DOKUMEN
                        </button>
                      </div>
                    </>
                  ) : null}

                  {/* SCREEN 06: SUSUN DOKUMEN -> NEXT */}
                  {step === 5 ? (
                    <>
                      <div className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">
                          Susun Dokumen
                        </h2>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Judul Laporan
                          </label>
                          <input
                            type="text"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-[#F4F2F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4C2368]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Ringkasan Analisis
                          </label>
                          <textarea
                            rows={3}
                            value={executiveSummary}
                            onChange={(e) => setExecutiveSummary(e.target.value)}
                            className="w-full p-2.5 text-xs bg-[#F4F2F6] rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#4C2368]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Rekomendasi Strategi IG & TikTok
                          </label>
                          <textarea
                            rows={3}
                            value={recommendation}
                            onChange={(e) => setRecommendation(e.target.value)}
                            className="w-full p-2.5 text-xs bg-[#F4F2F6] rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#4C2368]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(6)}
                        className="w-full h-11 rounded-full bg-[#44E27B] text-[#3A1952] font-bold text-sm hover:brightness-95 transition-all cursor-pointer mt-3 shrink-0"
                      >
                        NEXT
                      </button>
                    </>
                  ) : null}

                  {/* SCREEN 07: SAVE */}
                  {step === 6 ? (
                    <>
                      <div className="space-y-4 my-auto">
                        <div className="bg-[#F4F2F6] rounded-2xl p-5 flex flex-col items-center text-center space-y-2.5">
                          <div className="w-16 h-20 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center shadow-xs">
                            <FileText className="w-7 h-7 text-[#4C2368]" />
                            <span className="mt-1 px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                              PDF
                            </span>
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {documentTitle}
                          </div>
                          <div className="text-xs text-slate-500">
                            {resolvedProfile.handle} · {platformFocus} · Skor{' '}
                            {computedMetrics.influenceIndex}%
                          </div>
                        </div>

                        {finalSavedMessage ? (
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                              <BookmarkCheck className="w-4 h-4" />
                              <span>{finalSavedMessage}</span>
                            </div>
                            <button
                              type="button"
                              onClick={onOpenSavedTab}
                              className="text-xs font-semibold text-[#4C2368] underline cursor-pointer"
                            >
                              Buka Arsip Dokumen
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-2 mt-3 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveFinal}
                          className="w-full h-11 rounded-full bg-[#44E27B] text-[#3A1952] font-bold text-sm hover:brightness-95 transition-all cursor-pointer"
                        >
                          SAVE
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(0)}
                          className="w-full h-9 rounded-full bg-[#F4F2F6] text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Selesai & Mulai Baru
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Mobile Bottom Nav Bar */}
                <div className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-between text-slate-500 shrink-0">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    aria-label="Beranda"
                    className={`p-1.5 cursor-pointer ${
                      step === 1 ? 'text-[#4C2368]' : 'hover:text-slate-900'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    aria-label="Analisis"
                    className={`p-1.5 cursor-pointer ${
                      step === 4 ? 'text-[#4C2368]' : 'hover:text-slate-900'
                    }`}
                  >
                    <PieChart className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    aria-label="Dokumen"
                    className={`p-1.5 cursor-pointer ${
                      step === 5 || step === 6 ? 'text-[#4C2368]' : 'hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenSavedTab}
                    aria-label="Arsip"
                    className="p-1.5 hover:text-slate-900 cursor-pointer"
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Flowchart Inspector + Live Cross-Platform Analytics Panel */}
        <div className="lg:col-span-6 space-y-5">
          {/* Active Flowchart Nodes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="text-xs font-mono text-[#4C2368]">
              Node Flowchart Aktif · Layar 0{step + 1}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Pemetaan Langkah Saat Ini
            </h3>
            <div className="divide-y divide-slate-200">
              {activeFlowchartNodes.map((node) => (
                <div key={node.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-900">
                      {node.order}. {node.label}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">
                      {node.symbol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {node.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Platform & Demographic Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-slate-500">
                Ringkasan Audiens & Proyeksi Kampanye
              </div>
              <span className="text-xs font-semibold text-[#4C2368]">
                {platformFocus}
              </span>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#F4F2F6] rounded-xl p-3">
                <dt className="text-slate-500">Skor Pengaruh</dt>
                <dd className="font-bold text-slate-900 text-base mt-0.5 tabular-nums">
                  {computedMetrics.influenceIndex}%
                </dd>
              </div>
              <div className="bg-[#F4F2F6] rounded-xl p-3">
                <dt className="text-slate-500">Est. Views</dt>
                <dd className="font-bold text-slate-900 text-base mt-0.5 tabular-nums">
                  {computedMetrics.estimatedReach}
                </dd>
              </div>
              <div className="bg-[#F4F2F6] rounded-xl p-3">
                <dt className="text-slate-500">Est. Konversi</dt>
                <dd className="font-bold text-slate-900 text-base mt-0.5 tabular-nums">
                  {computedMetrics.estimatedConversions}
                </dd>
              </div>
              <div className="bg-[#F4F2F6] rounded-xl p-3">
                <dt className="text-slate-500">Biaya / View</dt>
                <dd className="font-bold text-slate-900 text-base mt-0.5 tabular-nums">
                  {computedMetrics.costPerViewIdr}
                </dd>
              </div>
            </dl>

            <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-900">
                  Demografi Audiens
                </div>
                <div className="text-slate-600">
                  Usia dominan: {resolvedProfile.demographics.topAgeRange}
                </div>
                <div className="text-slate-600">
                  Gender: {resolvedProfile.demographics.femalePct}% Wanita ·{' '}
                  {resolvedProfile.demographics.malePct}% Pria
                </div>
                <div className="text-slate-600">
                  Kota: {resolvedProfile.demographics.topCities.join(', ')}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-900">
                  Format Konten Terkuat
                </div>
                <div className="text-slate-600">
                  Instagram: {resolvedProfile.instagram.topFormat}
                </div>
                <div className="text-slate-600">
                  TikTok: {resolvedProfile.tiktok.topFormat}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
