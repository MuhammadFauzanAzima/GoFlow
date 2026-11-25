import React, {useMemo, useState} from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  GitCompare,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import {INFLUENCE_GOALS, PRESET_INFLUENCERS} from '../data/flowchartData';
import {InfluencerProfile, SocialPlatform} from '../types/flowchart';

interface CreatorExplorerViewProps {
  onLaunchCreatorInSimulator: (
    profile: InfluencerProfile,
    platformFocus: SocialPlatform
  ) => void;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CreatorExplorerView({
  onLaunchCreatorInSimulator,
}: CreatorExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<
    'Semua' | 'Instagram' | 'TikTok'
  >('Semua');
  const [compareHandles, setCompareHandles] = useState<[string, string]>([
    '@tasya.farasya',
    '@fujiiian',
  ]);
  const [activeGoalId, setActiveGoalId] = useState(INFLUENCE_GOALS[0].id);

  const validCreators = useMemo(
    () => PRESET_INFLUENCERS.filter((c) => c.isValid),
    []
  );

  const filteredCreators = useMemo(() => {
    return validCreators.filter((creator) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        creator.name.toLowerCase().includes(q) ||
        creator.handle.toLowerCase().includes(q) ||
        creator.niche.toLowerCase().includes(q);
      const matchesPlatform =
        platformFilter === 'Semua'
          ? true
          : platformFilter === 'Instagram'
          ? creator.instagram.engagementRate >= creator.tiktok.engagementRate ||
            creator.primaryPlatform.includes('Instagram')
          : creator.tiktok.engagementRate >= creator.instagram.engagementRate ||
            creator.primaryPlatform.includes('TikTok');
      return matchesQuery && matchesPlatform;
    });
  }, [validCreators, searchQuery, platformFilter]);

  const compareA =
    validCreators.find((c) => c.handle === compareHandles[0]) ?? validCreators[0];
  const compareB =
    validCreators.find((c) => c.handle === compareHandles[1]) ?? validCreators[1];

  const activeGoal =
    INFLUENCE_GOALS.find((g) => g.id === activeGoalId) ?? INFLUENCE_GOALS[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-xs font-mono text-[#4C2368]">
            Inteligensi Lintas Platform · Instagram & TikTok
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Direktori Kreator & Matriks Pengaruh
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Bandingkan performa influencer di Instagram dan TikTok, cek demografi
            audiens, lalu jalankan analisis lengkap langsung di GoFlow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau niche..."
              className="w-full h-10 pl-10 pr-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C2368]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
            {(['Semua', 'Instagram', 'TikTok'] as const).map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setPlatformFilter(plat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  platformFilter === plat
                    ? 'bg-[#4C2368] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Creator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCreators.map((creator) => (
          <div
            key={creator.handle}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-4">
              {/* Top Profile Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#4C2368] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {creator.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        {creator.name}
                      </h2>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {creator.handle} · {creator.niche}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#4C2368] font-semibold shrink-0 tabular-nums">
                  {creator.authenticityScore}/100
                </span>
              </div>

              {/* Instagram vs TikTok Split Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F4F2F6] rounded-xl p-3 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-700">
                    Instagram
                  </div>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">
                    {creator.instagram.followers}
                  </div>
                  <div className="text-[11px] text-slate-600 tabular-nums">
                    ER {creator.instagram.engagementRate}% · {creator.instagram.avgViews} views
                  </div>
                </div>

                <div className="bg-[#F4F2F6] rounded-xl p-3 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-700">
                    TikTok
                  </div>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">
                    {creator.tiktok.followers}
                  </div>
                  <div className="text-[11px] text-slate-600 tabular-nums">
                    ER {creator.tiktok.engagementRate}% · {creator.tiktok.avgViews} views
                  </div>
                </div>
              </div>

              {/* Demographics & Rate */}
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Audiens Utama</span>
                  <span className="font-medium text-slate-900">
                    {creator.demographics.topAgeRange}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kota Teratas</span>
                  <span className="font-medium text-slate-900">
                    {creator.demographics.topCities.slice(0, 2).join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimasi Rate Card</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {formatRupiah(creator.estimatedRateIdr)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onLaunchCreatorInSimulator(
                  creator,
                  platformFilter === 'Semua'
                    ? 'Instagram & TikTok'
                    : platformFilter
                )
              }
              className="w-full h-10 rounded-full bg-[#44E27B] text-[#3A1952] text-xs font-bold hover:brightness-95 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Analisis di GoFlow</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Head-to-Head Creator Comparison + Social Media Influence Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Side-by-Side Comparison */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-[#4C2368]">
                Perbandingan Lintas Platform
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Bandingkan 2 Influencer
              </h2>
            </div>
            <GitCompare className="w-5 h-5 text-[#4C2368]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              aria-label="Pilih kreator pertama"
              value={compareA.handle}
              onChange={(e) =>
                setCompareHandles([e.target.value, compareB.handle])
              }
              className="h-10 px-3 text-xs font-semibold bg-[#F4F2F6] rounded-xl text-slate-900 border border-slate-200"
            >
              {validCreators.map((c) => (
                <option key={c.handle} value={c.handle}>
                  {c.name} ({c.handle})
                </option>
              ))}
            </select>
            <select
              aria-label="Pilih kreator kedua"
              value={compareB.handle}
              onChange={(e) =>
                setCompareHandles([compareA.handle, e.target.value])
              }
              className="h-10 px-3 text-xs font-semibold bg-[#F4F2F6] rounded-xl text-slate-900 border border-slate-200"
            >
              {validCreators.map((c) => (
                <option key={c.handle} value={c.handle}>
                  {c.name} ({c.handle})
                </option>
              ))}
            </select>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F4F2F6] text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 text-left">Metrik</th>
                  <th className="py-2.5 px-3 text-right">{compareA.name}</th>
                  <th className="py-2.5 px-3 text-right">{compareB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums">
                <tr>
                  <td className="py-2.5 px-3 text-slate-600">IG Engagement</td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {compareA.instagram.engagementRate}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {compareB.instagram.engagementRate}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-600">TikTok Engagement</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#4C2368]">
                    {compareA.tiktok.engagementRate}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#4C2368]">
                    {compareB.tiktok.engagementRate}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-600">Avg. TikTok Views</td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {compareA.tiktok.avgViews}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {compareB.tiktok.avgViews}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-600">Autentisitas</td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {compareA.authenticityScore}/100
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {compareB.authenticityScore}/100
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-600">Sentimen Positif</td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {compareA.sentimentPositive}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {compareB.sentimentPositive}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 8 Social Media Influence Matrix */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-[#4C2368]">
                8 Pengaruh Media Sosial di GoFlow
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Peta Dampak Kampanye IG & TikTok
              </h2>
            </div>
            <Users className="w-5 h-5 text-[#4C2368]" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {INFLUENCE_GOALS.map((goal) => {
              const isSelected = goal.id === activeGoalId;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setActiveGoalId(goal.id)}
                  className={`p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#4C2368] text-white'
                      : 'bg-[#F4F2F6] text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  <div className="font-semibold truncate">{goal.label}</div>
                </button>
              );
            })}
          </div>

          <div className="bg-[#F4F2F6] rounded-xl p-4 space-y-2">
            <div className="text-sm font-bold text-slate-900">
              {activeGoal.label}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeGoal.description}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Platform Unggulan</span>
                <span className="font-semibold text-[#4C2368]">
                  {activeGoal.bestPlatform}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">KPI Utama</span>
                <span className="font-semibold text-slate-900">
                  {activeGoal.keyMetric}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
