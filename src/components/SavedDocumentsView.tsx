import React, {useState} from 'react';
import {Download, FileText, Play, Trash2} from 'lucide-react';
import {ANALYSIS_OPTIONS, INFLUENCE_GOALS} from '../data/flowchartData';
import {SavedAnalysisRecord} from '../types/flowchart';

interface SavedDocumentsViewProps {
  records: SavedAnalysisRecord[];
  onResumeDraft: (record: SavedAnalysisRecord) => void;
  onDeleteRecord: (id: string) => void;
  onStartNewSimulation: () => void;
}

export function SavedDocumentsView({
  records,
  onResumeDraft,
  onDeleteRecord,
  onStartNewSimulation,
}: SavedDocumentsViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'final'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(
    records[0]?.id ?? null
  );

  const filteredRecords = records.filter((rec) =>
    filterStatus === 'all' ? true : rec.status === filterStatus
  );

  const selectedRecord =
    filteredRecords.find((r) => r.id === selectedId) ?? filteredRecords[0] ?? null;

  const handleDownloadMarkdown = (record: SavedAnalysisRecord) => {
    const analysisLabels = record.selectedAnalyses
      .map((id) => ANALYSIS_OPTIONS.find((a) => a.id === id)?.label ?? id)
      .join(', ');
    const goalLabels = record.selectedGoals
      .map((id) => INFLUENCE_GOALS.find((g) => g.id === id)?.label ?? id)
      .join(', ');

    const content = [
      `# ${record.documentTitle}`,
      '',
      `- Status: ${record.status === 'final' ? 'Dokumen Final (SAVE)' : 'Draf Progres (SAVE PROGRESS)'}`,
      `- Tanggal Simpan: ${record.savedAt}`,
      `- Influencer: ${record.influencerInput} (${record.isValid ? 'Valid' : 'Tidak Valid / Manual'})`,
      `- Platform Target: ${record.platformFocus ?? 'Instagram & TikTok'}`,
      `- Anggaran Kampanye: Rp ${(record.budgetIdr ?? 25000000).toLocaleString('id-ID')}`,
      `- Kampanye: ${record.targetCampaign}`,
      `- Parameter Analisis: ${analysisLabels}`,
      `- Target Pengaruh: ${goalLabels}`,
      '',
      '## Metrik Hasil Analisis',
      `- Skor Pengaruh: ${record.metrics.influenceIndex}%`,
      `- Estimasi Views: ${record.metrics.estimatedReach}`,
      `- Estimasi Konversi: ${record.metrics.estimatedConversions ?? '-'}`,
      `- Biaya per View: ${record.metrics.costPerViewIdr ?? '-'}`,
      `- Proyeksi CTR: ${record.metrics.projectedCtr}`,
      `- Tingkat Risiko: ${record.metrics.riskLevel}`,
      '',
      '## Ringkasan Analisis',
      record.executiveSummary,
      '',
      '## Rekomendasi',
      record.recommendation,
    ].join('\n');

    const blob = new Blob([content], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.influencerInput.replace(/[^a-zA-Z0-9]/g, '') || 'laporan'}-goflow.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-[#4C2368]">
            Arsip GoFlow · Hasil SAVE PROGRESS & SAVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Arsip Dokumen & Progres
          </h1>
          <p className="text-sm text-slate-600">
            Progres analisis lintas platform Instagram & TikTok maupun laporan final
            tersimpan rapi di sini.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 self-start sm:self-auto">
          {(
            [
              {id: 'all', label: 'Semua'},
              {id: 'final', label: 'Final (SAVE)'},
              {id: 'draft', label: 'Progres'},
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#4C2368] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <FileText className="w-8 h-8 text-[#4C2368] mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-base font-bold text-slate-900">
              Belum Ada Dokumen Tersimpan
            </h2>
            <p className="text-sm text-slate-600">
              Jalankan simulasi GoFlow dan tekan SAVE PROGRESS setelah hasil analisis atau
              SAVE pada akhir penyusunan dokumen.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartNewSimulation}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#3A1952] bg-[#44E27B] rounded-full hover:brightness-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Mulai Simulasi GoFlow</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200 overflow-hidden">
            {filteredRecords.map((rec) => {
              const active = selectedRecord?.id === rec.id;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setSelectedId(rec.id)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer ${
                    active ? 'bg-purple-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono font-semibold text-[#4C2368]">
                      {rec.status === 'final' ? 'SAVE FINAL' : 'SAVE PROGRESS'} ·{' '}
                      {rec.platformFocus ?? 'IG & TikTok'}
                    </span>
                    <span className="tabular-nums">{rec.savedAt}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {rec.documentTitle}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {rec.influencerInput} · Skor{' '}
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {rec.metrics.influenceIndex}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRecord ? (
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#4C2368]">
                    {selectedRecord.status === 'final'
                      ? 'Dokumen Final (SAVE)'
                      : 'Progres Tersimpan (SAVE PROGRESS)'}{' '}
                    · {selectedRecord.platformFocus ?? 'Instagram & TikTok'} ·{' '}
                    {selectedRecord.savedAt}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedRecord.documentTitle}
                  </h2>
                  <div className="text-xs text-slate-600">
                    {selectedRecord.influencerInput} · {selectedRecord.targetCampaign}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onResumeDraft(selectedRecord)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3A1952] bg-[#44E27B] rounded-full hover:brightness-95 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Lanjutkan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadMarkdown(selectedRecord)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .md</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(selectedRecord.id)}
                    aria-label="Hapus dokumen"
                    className="inline-flex items-center justify-center w-9 h-9 text-slate-500 hover:text-red-700 border border-slate-200 rounded-full hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F4F2F6] rounded-xl p-3">
                  <div className="text-xs text-slate-500">Skor Pengaruh</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
                    {selectedRecord.metrics.influenceIndex}%
                  </div>
                </div>
                <div className="bg-[#F4F2F6] rounded-xl p-3">
                  <div className="text-xs text-slate-500">Est. Views</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
                    {selectedRecord.metrics.estimatedReach}
                  </div>
                </div>
                <div className="bg-[#F4F2F6] rounded-xl p-3">
                  <div className="text-xs text-slate-500">Est. Konversi</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
                    {selectedRecord.metrics.estimatedConversions ?? '-'}
                  </div>
                </div>
                <div className="bg-[#F4F2F6] rounded-xl p-3">
                  <div className="text-xs text-slate-500">Biaya / View</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
                    {selectedRecord.metrics.costPerViewIdr ?? '-'}
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">
                    Ringkasan Analisis
                  </div>
                  <p>{selectedRecord.executiveSummary}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">
                    Rekomendasi Strategi
                  </div>
                  <p>{selectedRecord.recommendation}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
