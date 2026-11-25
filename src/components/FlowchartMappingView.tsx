import React, {useMemo, useState} from 'react';
import {ExternalLink, Search} from 'lucide-react';
import {FLOWCHART_NODES, GROUP_AUTHORS} from '../data/flowchartData';
import {FlowchartSymbol} from '../types/flowchart';

interface FlowchartMappingViewProps {
  onOpenSimulatorAtScreen: (screenIndex: number) => void;
}

const SYMBOL_FILTERS: ('Semua' | FlowchartSymbol)[] = [
  'Semua',
  'Terminator',
  'Input / Output',
  'Proses',
  'Decision',
  'Preparation',
  'Database / Penyimpanan',
  'Dokumen',
];

export function FlowchartMappingView({
  onOpenSimulatorAtScreen,
}: FlowchartMappingViewProps) {
  const [query, setQuery] = useState('');
  const [symbolFilter, setSymbolFilter] = useState<'Semua' | FlowchartSymbol>('Semua');

  const filteredNodes = useMemo(() => {
    return FLOWCHART_NODES.filter((node) => {
      const matchesSymbol =
        symbolFilter === 'Semua' || node.symbol === symbolFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        node.label.toLowerCase().includes(q) ||
        node.uiElement.toLowerCase().includes(q) ||
        node.screenTitle.toLowerCase().includes(q);
      return matchesSymbol && matchesQuery;
    });
  }, [query, symbolFilter]);

  const screenIndexFromId = (screenId: string) => {
    const num = Number(screenId.replace('screen-', ''));
    return Number.isFinite(num) && num >= 1 ? num - 1 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 max-w-2xl">
        <div className="text-xs font-mono text-[#4C2368]">
          Pemetaan GoFlow · Kelompok: {GROUP_AUTHORS.join(' · ')}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Pemetaan Flowchart ke Layar GoFlow
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Rincian konversi 15 node flowchart ke 7 layar aplikasi GoFlow, termasuk posisi
          baru <span className="font-semibold text-slate-900">SAVE PROGRESS</span> setelah{' '}
          <span className="font-semibold text-slate-900">ANALISIS</span> dan sebelum{' '}
          <span className="font-semibold text-slate-900">SUSUN DOKUMEN</span>.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari node flowchart atau layar..."
            className="w-full h-10 pl-10 pr-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C2368]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
          {SYMBOL_FILTERS.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => setSymbolFilter(sym)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                symbolFilter === sym
                  ? 'bg-[#4C2368] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F4F2F6] text-xs font-medium text-slate-600">
                <th className="py-3 px-4 w-12">No</th>
                <th className="py-3 px-4">Node Flowchart</th>
                <th className="py-3 px-4">Simbol</th>
                <th className="py-3 px-4">Layar GoFlow</th>
                <th className="py-3 px-4">Elemen Antarmuka</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredNodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    Tidak ada node yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-50/70 align-top">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      {String(node.order).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-[#4C2368]">
                        {node.label}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
                        {node.description}
                      </div>
                      {node.lecturerNote ? (
                        <div className="mt-2 text-xs text-[#4C2368] bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1.5 leading-relaxed">
                          {node.lecturerNote}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {node.symbol}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                      {node.screenTitle}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 max-w-sm leading-relaxed">
                      {node.uiElement}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenSimulatorAtScreen(screenIndexFromId(node.screenId))
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4C2368] hover:underline underline-offset-4 cursor-pointer"
                      >
                        <span>Buka Layar</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Presentation Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
        <div className="space-y-1.5">
          <div className="font-bold text-slate-900">
            1. Posisi Baru SAVE PROGRESS
          </div>
          <p>
            Sesuai penyesuaian alur GoFlow, <span className="font-mono text-[#4C2368]">SAVE PROGRESS</span>{' '}
            kini ditempatkan pada Layar 05 tepat setelah grafik{' '}
            <span className="font-mono text-[#4C2368]">ANALISIS</span> muncul dan sebelum pengguna
            melanjutkan ke <span className="font-mono text-[#4C2368]">SUSUN DOKUMEN</span>.
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="font-bold text-slate-900">
            2. Percabangan VALID dan TIDAK ke LANJUT
          </div>
          <p>
            Jika hasil validasi berstatus <span className="font-mono text-red-700">TIDAK</span>,
            aplikasi menyediakan opsi untuk mengganti nama influencer atau tetap melanjutkan
            proses dengan catatan data manual agar sesuai dengan alur panah pada diagram.
          </p>
        </div>
      </div>
    </div>
  );
}
