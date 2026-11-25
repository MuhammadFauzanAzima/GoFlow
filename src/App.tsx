import {useCallback, useEffect, useState} from 'react';
import {CreatorExplorerView} from './components/CreatorExplorerView';
import {GoFlowLogo} from './components/GoFlowBrand';
import {PrototypeSimulatorView} from './components/PrototypeSimulatorView';
import {SavedDocumentsView} from './components/SavedDocumentsView';
import {SocialCheckView} from './components/SocialCheckView';
import {WireframeFlowView} from './components/WireframeFlowView';
import {
  AppView,
  InfluencerProfile,
  OAuthStatusResponse,
  SavedAnalysisRecord,
  SocialPlatform,
} from './types/flowchart';

const STORAGE_KEY = 'goflow_saved_records_v2';

const NAV_ITEMS: {id: AppView; label: string}[] = [
  {id: 'wireframe', label: 'Alur Layar'},
  {id: 'simulator', label: 'Simulasi'},
  {id: 'socialCheck', label: 'Cek Sosmed'},
  {id: 'explorer', label: 'Eksplor Kreator'},
  {id: 'saved', label: 'Arsip'},
];

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('socialCheck');
  const [simulatorStep, setSimulatorStep] = useState<number>(0);
  const [simulatorSessionKey, setSimulatorSessionKey] = useState<number>(0);
  const [selectedHandle, setSelectedHandle] = useState<string | undefined>(undefined);
  const [selectedPlatform, setSelectedPlatform] = useState<
    SocialPlatform | undefined
  >(undefined);
  const [liveProfileToLoad, setLiveProfileToLoad] =
    useState<InfluencerProfile | null>(null);
  const [draftToLoad, setDraftToLoad] = useState<SavedAnalysisRecord | null>(null);

  // OAuth session token held strictly in memory (never localStorage)
  const [oauthSessionToken, setOauthSessionToken] = useState<string | null>(null);
  const [oauthStatus, setOauthStatus] = useState<OAuthStatusResponse | null>(null);
  const [oauthMessage, setOauthMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [savedRecords, setSavedRecords] = useState<SavedAnalysisRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as SavedAnalysisRecord[];
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
    } catch {
      // Ignore storage write errors
    }
  }, [savedRecords]);

  const fetchOAuthStatus = useCallback(
    async (tokenOverride?: string | null) => {
      const token = tokenOverride !== undefined ? tokenOverride : oauthSessionToken;
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const resp = await fetch('/api/oauth/status', {headers});
        if (resp.ok) {
          const data = (await resp.json()) as OAuthStatusResponse;
          setOauthStatus(data);
        }
      } catch {
        // Ignore network error on status check
      }
    },
    [oauthSessionToken]
  );

  useEffect(() => {
    fetchOAuthStatus();
  }, [fetchOAuthStatus]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const nextToken =
          typeof event.data.sessionToken === 'string'
            ? event.data.sessionToken
            : null;
        if (nextToken) {
          setOauthSessionToken(nextToken);
          fetchOAuthStatus(nextToken);
        } else {
          fetchOAuthStatus();
        }
        setOauthMessage({
          type: 'success',
          text: `Akun ${
            event.data.provider === 'tiktok' ? 'TikTok' : 'Instagram'
          } berhasil terhubung secara real-time.`,
        });
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setOauthMessage({
          type: 'error',
          text:
            event.data.message ||
            'Otorisasi gagal atau dibatalkan. Periksa Redirect URI dan kredensial.',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchOAuthStatus]);

  const handleDisconnectProvider = async (provider: 'instagram' | 'tiktok') => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      if (oauthSessionToken) {
        headers.Authorization = `Bearer ${oauthSessionToken}`;
      }
      await fetch('/api/oauth/disconnect', {
        method: 'POST',
        headers,
        body: JSON.stringify({provider}),
      });
      await fetchOAuthStatus();
      setOauthMessage({
        type: 'success',
        text: `Koneksi ${provider === 'tiktok' ? 'TikTok' : 'Instagram'} diputuskan.`,
      });
    } catch {
      // Ignore disconnect errors
    }
  };

  const handleOpenSimulatorAtScreen = (screenIndex: number) => {
    setDraftToLoad(null);
    setLiveProfileToLoad(null);
    setSelectedHandle(undefined);
    setSelectedPlatform(undefined);
    setSimulatorStep(screenIndex);
    setSimulatorSessionKey((k) => k + 1);
    setActiveView('simulator');
  };

  const handleLaunchCreatorInSimulator = (
    profile: InfluencerProfile,
    platformFocus: SocialPlatform
  ) => {
    setDraftToLoad(null);
    setLiveProfileToLoad(profile);
    setSelectedHandle(profile.handle);
    setSelectedPlatform(platformFocus);
    setSimulatorStep(1);
    setSimulatorSessionKey((k) => k + 1);
    setActiveView('simulator');
  };

  const handleSaveRecord = (record: SavedAnalysisRecord) => {
    setSavedRecords((prev) => [record, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setSavedRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResumeDraft = (record: SavedAnalysisRecord) => {
    setDraftToLoad(record);
    setLiveProfileToLoad(null);
    setSelectedHandle(undefined);
    setSelectedPlatform(undefined);
    setSimulatorStep(record.status === 'draft' ? 5 : 6);
    setSimulatorSessionKey((k) => k + 1);
    setActiveView('simulator');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FA] text-slate-900">
      {/* Clean 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setActiveView('wireframe')}
            className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4C2368] rounded-lg"
          >
            <GoFlowLogo variant="dark" size="md" />
          </button>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#4C2368] font-semibold border-[#4C2368]'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleOpenSimulatorAtScreen(0)}
              className="px-5 py-2 text-xs font-bold text-[#3A1952] bg-[#44E27B] rounded-full hover:brightness-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mulai Simulasi
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center gap-4 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`text-xs font-medium whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#4C2368] font-semibold underline underline-offset-4'
                    : 'text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-7">
        {activeView === 'wireframe' ? (
          <WireframeFlowView
            onOpenSimulatorAtScreen={handleOpenSimulatorAtScreen}
          />
        ) : null}

        {activeView === 'simulator' ? (
          <PrototypeSimulatorView
            key={simulatorSessionKey}
            initialStep={simulatorStep}
            initialInfluencerHandle={selectedHandle}
            initialPlatformFocus={selectedPlatform}
            initialLiveProfile={liveProfileToLoad}
            oauthSessionToken={oauthSessionToken}
            initialDraft={draftToLoad}
            onSaveRecord={handleSaveRecord}
            onOpenSavedTab={() => setActiveView('saved')}
          />
        ) : null}

        {activeView === 'socialCheck' ? (
          <SocialCheckView
            oauthSessionToken={oauthSessionToken}
            oauthStatus={oauthStatus}
            oauthMessage={oauthMessage}
            onRefreshOAuthStatus={() => fetchOAuthStatus()}
            onDisconnectProvider={handleDisconnectProvider}
            onUseLiveProfileInSimulator={handleLaunchCreatorInSimulator}
          />
        ) : null}

        {activeView === 'explorer' ? (
          <CreatorExplorerView
            onLaunchCreatorInSimulator={handleLaunchCreatorInSimulator}
          />
        ) : null}

        {activeView === 'saved' ? (
          <SavedDocumentsView
            records={savedRecords}
            onResumeDraft={handleResumeDraft}
            onDeleteRecord={handleDeleteRecord}
            onStartNewSimulation={() => handleOpenSimulatorAtScreen(0)}
          />
        ) : null}
      </main>
    </div>
  );
}
