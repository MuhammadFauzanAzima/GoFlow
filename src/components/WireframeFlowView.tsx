import React, {useState} from 'react';
import {
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  FileText,
  Printer,
  Search,
  SquareCheck,
} from 'lucide-react';
import {GROUP_AUTHORS, WIREFRAME_SCREENS} from '../data/flowchartData';
import {WireframeScreenSpec} from '../types/flowchart';
import {FlowchartMappingView} from './FlowchartMappingView';
import {GoFlowLogo, GoFlowWelcomeIllustration} from './GoFlowBrand';

interface WireframeFlowViewProps {
  onOpenSimulatorAtScreen: (screenIndex: number) => void;
}

function WireframeXBox({
  className = '',
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`relative border border-slate-400 bg-slate-100 flex items-center justify-center overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full text-slate-300 pointer-events-none"
        aria-hidden="true"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {label ? (
        <span className="relative z-10 px-1.5 py-0.5 bg-white/90 text-[9px] font-mono text-slate-600 border border-slate-300">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function GoFlowModernThumbnail({
  screen,
  branchMode,
}: {
  screen: WireframeScreenSpec;
  branchMode: 'valid' | 'invalid';
}) {
  switch (screen.id) {
    case 'screen-01':
      return (
        <div className="h-full bg-[#4C2368] text-white p-3.5 flex flex-col justify-between">
          <div className="pt-2 flex justify-center">
            <GoFlowLogo variant="light" size="sm" />
          </div>
          <div className="space-y-2 text-center">
            <GoFlowWelcomeIllustration compact />
            <div className="text-[11px] font-bold leading-tight">
              Selamat Datang di GoFlow!
            </div>
            <div className="text-[9px] text-purple-100/90">
              Temukan & Analisis Influencer Terbaik
            </div>
          </div>
          <div className="h-7 rounded-full bg-[#44E27B] text-[#3A1952] text-[10px] font-bold flex items-center justify-center">
            MULAI
          </div>
        </div>
      );

    case 'screen-02':
      return (
        <div className="h-full bg-[#4C2368] flex flex-col">
          <div className="py-2.5 text-center text-white text-xs font-bold">
            GoFlow
          </div>
          <div className="flex-1 bg-white rounded-t-2xl p-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-6 rounded-full bg-[#F4F2F6] px-2.5 flex items-center gap-1.5 text-[9px] text-slate-500">
                <Search className="w-2.5 h-2.5" />
                <span className="truncate">Masukan Nama Influencer</span>
              </div>
              <div className="rounded-xl bg-[#F4F2F6] p-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#4C2368] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  {branchMode === 'valid' ? 'CR' : 'AN'}
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-slate-900 truncate">
                    {branchMode === 'valid' ? 'Cristiano Ronaldo' : 'Akun Anomali'}
                  </div>
                  <span
                    className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      branchMode === 'valid'
                        ? 'bg-[#44E27B] text-[#3A1952]'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {branchMode === 'valid' ? 'VALID' : 'TIDAK VALID'}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-[#F4F2F6] p-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  JN
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-slate-900 truncate">
                    Jefri Nichol
                  </div>
                  <span className="inline-block mt-0.5 px-1.5 rounded bg-[#44E27B] text-[#3A1952] text-[8px] font-bold">
                    VALID
                  </span>
                </div>
              </div>
            </div>
            <div className="h-7 rounded-full bg-[#44E27B] text-[#3A1952] text-[10px] font-bold flex items-center justify-center">
              LANJUT
            </div>
          </div>
        </div>
      );

    case 'screen-03':
      return (
        <div className="h-full bg-[#4C2368] flex flex-col">
          <div className="py-2.5 text-center text-white text-xs font-bold">
            GoFlow
          </div>
          <div className="flex-1 bg-white rounded-t-2xl p-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-900 leading-tight">
                Analisis yang Dibutuhkan
              </div>
              <div className="space-y-1.5">
                {['Engagement Rate', 'Demografi Audiens', 'Tren Konten'].map(
                  (label, i) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 bg-[#F4F2F6] rounded-lg px-2 py-1.5"
                    >
                      <div
                        className={`w-3 h-3 rounded flex items-center justify-center ${
                          i < 2
                            ? 'bg-[#4C2368] text-white'
                            : 'border border-slate-400 bg-white'
                        }`}
                      >
                        {i < 2 ? <Check className="w-2 h-2" /> : null}
                      </div>
                      <span className="text-[9px] text-slate-800 truncate">
                        {label}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="h-7 rounded-full bg-[#44E27B] text-[#3A1952] text-[10px] font-bold flex items-center justify-center">
              MEMULAI
            </div>
          </div>
        </div>
      );

    case 'screen-04':
      return (
        <div className="h-full bg-[#4C2368] flex flex-col">
          <div className="py-2.5 text-center text-white text-xs font-bold">
            GoFlow
          </div>
          <div className="flex-1 bg-white rounded-t-2xl p-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-900">
                Masukkan Pengaruh
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 bg-[#F4F2F6] rounded-lg px-2 py-1.5">
                  <div className="w-3 h-3 rounded bg-[#4C2368] text-white flex items-center justify-center">
                    <Check className="w-2 h-2" />
                  </div>
                  <span className="text-[9px] text-slate-800">
                    Jangkauan (Reach)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F4F2F6] rounded-lg px-2 py-1.5">
                  <div className="w-3 h-3 rounded border border-slate-400 bg-white" />
                  <span className="text-[9px] text-slate-800">
                    Konversi Penjualan
                  </span>
                </div>
              </div>
              <div className="pt-2 space-y-1 text-center">
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full w-3/4 bg-[#4C2368] rounded-full" />
                </div>
                <div className="text-[8px] font-mono text-slate-500">
                  MEMPROSES DATA...
                </div>
              </div>
            </div>
            <div className="h-7 rounded-full bg-[#44E27B] text-[#3A1952] text-[10px] font-bold flex items-center justify-center">
              ANALISIS
            </div>
          </div>
        </div>
      );

    case 'screen-05':
      return (
        <div className="h-full bg-[#4C2368] flex flex-col">
          <div className="py-2.5 text-center text-white text-xs font-bold">
            GoFlow
          </div>
          <div className="flex-1 bg-white rounded-t-2xl p-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Mini Bar Chart */}
              <div className="bg-[#F4F2F6] rounded-xl p-2 flex items-end justify-between gap-1 h-16">
                <div className="w-2.5 bg-[#4C2368] rounded-t h-6" />
                <div className="w-2.5 bg-amber-400 rounded-t h-9" />
                <div className="w-2.5 bg-[#44E27B] rounded-t h-11" />
                <div className="w-2.5 bg-sky-400 rounded-t h-7" />
                <div className="w-2.5 bg-rose-400 rounded-t h-12" />
                <div className="w-2.5 bg-purple-500 rounded-t h-10" />
              </div>
              <div className="text-center">
                <div className="text-[9px] font-bold text-slate-900">
                  Hasil Analisis Pengaruh
                </div>
                <div className="text-[9px] font-bold text-emerald-600">
                  Sangat Bagus (88%)
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-6 rounded-full border border-[#4C2368] text-[#4C2368] text-[9px] font-bold flex items-center justify-center">
                SAVE PROGRESS
              </div>
              <div className="h-7 rounded-full bg-[#44E27B] text-[#3A1952] text-[10px] font-bold flex items-center justify-center">
                SUSUN DOKUMEN
              </div>
            </div>
          </div>
        </div>
      );

    case 'screen-06':
      return (
        <div className="h-full bg-[#4C2368] flex flex-col">
          <div className="py-2.5 text-center text-white text-xs font-bold">
            GoFlow
          </div>
          <div className="flex-1 bg-white rounded-t-2xl p-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-900">
                Susun Dokumen
              </div>
              <div className="bg-[#F4F2F6] rounded-lg p-2 space-y-1.5">
                <div className="h-2 w-3/4 bg-[#4C2368]/70 rounded" />
                <div className="h-1.5 w-full bg-slate-300 rounded" />
                <div className="h-1.5 w-5/6 bg-slate-300 rounded" />
              </div>
              <div className="bg-[#F4F2F6] rounded-lg p-2 space-y-1">
                <div className="h-1.5 w-1/2 bg-slate-400 rounded" />
                <div className="h-1.5 w-full bg-slate-300 rounded" />
              </div>
            </div>
            <div className="h-7 rounded-full bg-[#44E27B] text-[#3A1952] text-[10px] font-bold flex items-center justify-center">
              NEXT
            </div>
          </div>
        </div>
      );

    case 'screen-07':
    default:
      return (
        <div className="h-full bg-[#4C2368] flex flex-col">
          <div className="py-2.5 text-center text-white text-xs font-bold">
            GoFlow
          </div>
          <div className="flex-1 bg-white rounded-t-2xl p-2.5 flex flex-col justify-between">
            <div className="bg-[#F4F2F6] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 my-auto">
              <FileText className="w-8 h-8 text-[#4C2368]" />
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[8px] font-bold">
                PDF
              </span>
              <div className="text-[9px] font-semibold text-slate-700 text-center">
                Laporan Analisis Siap Simpan
              </div>
            </div>
            <div className="h-7 rounded-full bg-[#44E27B] text-[#3A1952] text-[10px] font-bold flex items-center justify-center">
              SAVE
            </div>
          </div>
        </div>
      );
  }
}

function WireframeLoFiThumbnail({
  screen,
  branchMode,
}: {
  screen: WireframeScreenSpec;
  branchMode: 'valid' | 'invalid';
}) {
  switch (screen.id) {
    case 'screen-01':
      return (
        <div className="p-2.5 flex flex-col h-full justify-between bg-white">
          <div className="space-y-2.5 pt-2">
            <div className="h-3 w-16 bg-slate-800 mx-auto" />
            <WireframeXBox className="h-20 w-full" label="ILUSTRASI" />
            <div className="h-2.5 w-3/4 bg-slate-700 mx-auto" />
            <div className="h-2 w-1/2 bg-slate-300 mx-auto" />
          </div>
          <div className="h-7 bg-slate-900 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
            MULAI
          </div>
        </div>
      );

    case 'screen-02':
      return (
        <div className="p-2.5 flex flex-col h-full justify-between bg-white">
          <div className="space-y-2">
            <div className="h-6 border border-slate-700 rounded-full px-2 flex items-center text-[9px] text-slate-500">
              Masukan Nama Influencer
            </div>
            <div className="border border-slate-300 rounded-lg p-2 flex items-center gap-2">
              <WireframeXBox className="w-7 h-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-3/4 bg-slate-700" />
                <div className="text-[8px] font-mono text-slate-900">
                  {branchMode === 'valid' ? '[VALID]' : '[TIDAK VALID]'}
                </div>
              </div>
            </div>
            <div className="border border-slate-300 rounded-lg p-2 flex items-center gap-2">
              <WireframeXBox className="w-7 h-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-2/3 bg-slate-700" />
                <div className="text-[8px] font-mono text-slate-500">[VALID]</div>
              </div>
            </div>
          </div>
          <div className="h-7 bg-slate-900 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
            LANJUT
          </div>
        </div>
      );

    case 'screen-03':
      return (
        <div className="p-2.5 flex flex-col h-full justify-between bg-white">
          <div className="space-y-2">
            <div className="text-[9px] font-mono text-slate-600">
              ANALISIS DIBUTUHKAN
            </div>
            {['Engagement Rate', 'Demografi', 'Tren Konten'].map((item, i) => (
              <div
                key={item}
                className="border border-slate-300 rounded-md px-2 py-1.5 flex items-center gap-1.5"
              >
                <div
                  className={`w-3 h-3 border border-slate-700 ${
                    i < 2 ? 'bg-slate-800' : 'bg-white'
                  }`}
                />
                <span className="text-[9px] text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="h-7 bg-slate-900 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
            MEMULAI
          </div>
        </div>
      );

    case 'screen-04':
      return (
        <div className="p-2.5 flex flex-col h-full justify-between bg-white">
          <div className="space-y-2">
            <div className="text-[9px] font-mono text-slate-600">
              MASUKKAN PENGARUH
            </div>
            <div className="border border-slate-300 rounded-md px-2 py-1.5 text-[9px] text-slate-700">
              [x] Jangkauan (Reach)
            </div>
            <div className="border border-slate-300 rounded-md px-2 py-1.5 text-[9px] text-slate-500">
              [ ] Konversi Penjualan
            </div>
            <div className="pt-2 space-y-1">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-slate-800" />
              </div>
              <div className="text-[8px] font-mono text-center text-slate-500">
                MEMPROSES...
              </div>
            </div>
          </div>
          <div className="h-7 bg-slate-900 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
            ANALISIS
          </div>
        </div>
      );

    case 'screen-05':
      return (
        <div className="p-2.5 flex flex-col h-full justify-between bg-white">
          <div className="space-y-2">
            <WireframeXBox className="h-20 w-full" label="GRAFIK HASIL" />
            <div className="h-2 w-3/4 bg-slate-700 mx-auto" />
          </div>
          <div className="space-y-1.5">
            <div className="h-6 border border-slate-800 text-slate-800 text-[9px] font-medium flex items-center justify-center rounded-full">
              SAVE PROGRESS
            </div>
            <div className="h-7 bg-slate-900 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
              SUSUN DOKUMEN
            </div>
          </div>
        </div>
      );

    case 'screen-06':
      return (
        <div className="p-2.5 flex flex-col h-full justify-between bg-white">
          <div className="space-y-2">
            <div className="text-[9px] font-mono text-slate-600">SUSUN DOKUMEN</div>
            <div className="border border-slate-300 rounded p-2 space-y-1.5">
              <div className="h-2 w-2/3 bg-slate-700" />
              <div className="h-1.5 w-full bg-slate-300" />
              <div className="h-1.5 w-4/5 bg-slate-300" />
            </div>
            <div className="h-12 border border-slate-300 rounded p-1.5 text-[8px] text-slate-500">
              Catatan rekomendasi...
            </div>
          </div>
          <div className="h-7 bg-slate-900 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
            NEXT
          </div>
        </div>
      );

    case 'screen-07':
    default:
      return (
        <div className="p-2.5 flex flex-col h-full justify-between bg-white">
          <div className="space-y-2 my-auto">
            <WireframeXBox className="h-24 w-full" label="DOKUMEN PDF" />
            <div className="h-2 w-2/3 bg-slate-600 mx-auto" />
          </div>
          <div className="h-7 bg-slate-900 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
            SAVE
          </div>
        </div>
      );
  }
}

export function WireframeFlowView({
  onOpenSimulatorAtScreen,
}: WireframeFlowViewProps) {
  const [selectedScreenIndex, setSelectedScreenIndex] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<'modern' | 'lofi' | 'mapping'>(
    'modern'
  );
  const [branchMode, setBranchMode] = useState<'valid' | 'invalid'>('valid');

  const selectedScreen = WIREFRAME_SCREENS[selectedScreenIndex];

  const handleDownloadSpec = () => {
    const lines = [
      '# Spesifikasi Alur Aplikasi GoFlow — Analisis Influencer',
      `Disusun oleh: ${GROUP_AUTHORS.join(', ')}`,
      '',
      ...WIREFRAME_SCREENS.flatMap((s, idx) => [
        `## Layar ${idx + 1}: ${s.title} (${s.stepRange})`,
        `- Pemetaan Flowchart: ${s.flowchartNodes.join(' -> ')}`,
        `- Aksi Pengguna: ${s.userAction}`,
        '- Komponen UI:',
        ...s.components.map((c) => `  - ${c}`),
        '',
      ]),
    ].join('\n');

    const blob = new Blob([lines], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spesifikasi-goflow-influencer.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Clean Simple Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-xs font-mono text-[#4C2368]">
            GoFlow Blueprint · Kelompok: {GROUP_AUTHORS.join(' · ')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Alur Layar Aplikasi GoFlow
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            7 layar terhubung dari tahap Mulai hingga Save, dengan tombol{' '}
            <span className="font-medium text-slate-900">Save Progress</span> berada
            tepat setelah hasil Analisis dan sebelum Susun Dokumen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDisplayMode('modern')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                displayMode === 'modern'
                  ? 'bg-[#4C2368] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              UI GoFlow
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('lofi')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                displayMode === 'lofi'
                  ? 'bg-[#4C2368] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wireframe Lo-Fi
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('mapping')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                displayMode === 'mapping'
                  ? 'bg-[#4C2368] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabel Pemetaan
            </button>
          </div>

          {displayMode !== 'mapping' ? (
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setBranchMode('valid')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  branchMode === 'valid'
                    ? 'bg-[#44E27B] text-[#3A1952]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Valid
              </button>
              <button
                type="button"
                onClick={() => setBranchMode('invalid')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  branchMode === 'invalid'
                    ? 'bg-red-100 text-red-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tidak Valid
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleDownloadSpec}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh (.md)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {displayMode === 'mapping' ? (
        <FlowchartMappingView onOpenSimulatorAtScreen={onOpenSimulatorAtScreen} />
      ) : (
        <>
      {/* Connected Flow Canvas */}
      <div
        className={`rounded-2xl p-6 overflow-x-auto transition-colors ${
          displayMode === 'modern'
            ? 'bg-[#3A1952] text-white'
            : 'bg-white border border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-max pb-2">
          {WIREFRAME_SCREENS.map((screen, idx) => {
            const isSelected = idx === selectedScreenIndex;
            return (
              <React.Fragment key={screen.id}>
                <button
                  type="button"
                  onClick={() => setSelectedScreenIndex(idx)}
                  className={`text-left flex flex-col w-[186px] shrink-0 rounded-2xl p-2 transition-all cursor-pointer ${
                    displayMode === 'modern'
                      ? isSelected
                        ? 'bg-white/15 ring-2 ring-[#44E27B]'
                        : 'hover:bg-white/10'
                      : isSelected
                      ? 'bg-slate-100 ring-2 ring-slate-900'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="px-1 pb-2 space-y-0.5">
                    <div
                      className={`text-[10px] font-mono ${
                        displayMode === 'modern'
                          ? 'text-purple-200'
                          : 'text-slate-500'
                      }`}
                    >
                      0{idx + 1} · {screen.stepRange}
                    </div>
                    <div className="text-xs font-semibold truncate">
                      {screen.title}
                    </div>
                  </div>

                  {/* Mobile Frame */}
                  <div
                    className={`rounded-[22px] overflow-hidden h-[290px] border-2 ${
                      displayMode === 'modern'
                        ? 'border-slate-900 shadow-lg'
                        : 'border-slate-800 bg-white'
                    }`}
                  >
                    {displayMode === 'modern' ? (
                      <GoFlowModernThumbnail
                        screen={screen}
                        branchMode={branchMode}
                      />
                    ) : (
                      <WireframeLoFiThumbnail
                        screen={screen}
                        branchMode={branchMode}
                      />
                    )}
                  </div>
                </button>

                {idx < WIREFRAME_SCREENS.length - 1 ? (
                  <div
                    className={`flex flex-col items-center justify-center self-center pt-4 shrink-0 ${
                      displayMode === 'modern'
                        ? 'text-[#44E27B]'
                        : 'text-slate-400'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Simple Selected Screen Inspector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono text-[#4C2368]">
              Layar 0{selectedScreenIndex + 1} · {selectedScreen.stepRange}
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {selectedScreen.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedScreen.userAction}
            </p>
            <div className="text-xs font-mono text-slate-700 pt-1">
              {selectedScreen.flowchartNodes.join(' → ')}
            </div>
            <div className="pt-2 no-print">
              <button
                type="button"
                onClick={() => onOpenSimulatorAtScreen(selectedScreenIndex)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#3A1952] bg-[#44E27B] rounded-full hover:brightness-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Coba Layar Ini di Simulasi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-slate-200 pt-5 lg:pt-0 lg:pl-6 space-y-3">
            <div className="text-xs font-medium text-slate-500">
              Komponen pada Layar
            </div>
            <ul className="space-y-2.5">
              {selectedScreen.components.map((comp) => (
                <li
                  key={comp}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <SquareCheck className="w-4 h-4 text-[#4C2368] shrink-0 mt-0.5" />
                  <span>{comp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SaaS Platform Capabilities Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 no-print">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1.5">
          <div className="text-xs font-mono text-[#4C2368]">01 · Lintas Platform</div>
          <h3 className="text-sm font-bold text-slate-900">
            Audit Instagram & TikTok
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bandingkan performa Reels, Story, dan TikTok FYP secara berdampingan lengkap
            dengan skor keaslian audiens.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1.5">
          <div className="text-xs font-mono text-[#4C2368]">02 · 8 Pengaruh Sosial</div>
          <h3 className="text-sm font-bold text-slate-900">
            Matriks Dampak Kampanye
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ukur awareness, konversi TikTok Shop, efek viral tren sound, klik tautan,
            hingga sentimen komentar dalam satu alur.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1.5">
          <div className="text-xs font-mono text-[#4C2368]">03 · Proyeksi ROI & Arsip</div>
          <h3 className="text-sm font-bold text-slate-900">
            Kalkulator Anggaran & Laporan PDF
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Simulasikan estimasi views, biaya per tayangan, dan konversi lalu simpan
            progres sebelum menyusun laporan final.
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
