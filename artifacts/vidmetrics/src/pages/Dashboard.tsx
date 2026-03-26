import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useStore } from '@/store/useStore';
import { SkeletonDashboard } from '@/components/ui/SkeletonDashboard';
import { ChannelHeader } from '@/components/dashboard/ChannelHeader';
import { CrushingThisMonth } from '@/components/dashboard/CrushingThisMonth';
import { VideoSection } from '@/components/dashboard/VideoSection';
import { VideoDrawer } from '@/components/dashboard/VideoDrawer';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { ChartsSection } from '@/components/dashboard/Charts';
import { AlertCircle, KeyRound, ExternalLink, RefreshCw } from 'lucide-react';
import { GlowButton } from '@/components/ui/Primitives';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { result, isLoading, loadingStage, error, reset, inputUrl, analyze } = useStore();

  useEffect(() => {
    if (!result && !isLoading && !error) {
      setLocation('/');
    }
  }, [result, isLoading, error, setLocation]);

  if (error) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface border border-red/20 p-8 rounded-2xl flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.08)]"
        >
          <div className="w-14 h-14 bg-red/10 rounded-full flex items-center justify-center mb-5">
            <AlertCircle className="w-7 h-7 text-red" />
          </div>
          <h1 className="text-lg font-bold text-text-primary mb-2">Analysis Failed</h1>
          <p className="text-text-secondary text-sm mb-7">{error}</p>
          <GlowButton variant="ghost" onClick={() => { reset(); setLocation('/'); }} className="w-full">
            ← Try Another Channel
          </GlowButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void w-full relative">
      <div className="fixed top-0 left-0 w-[50%] h-[30%] bg-blue/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[30%] h-[30%] bg-violet/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-void/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue to-violet flex-shrink-0" />
            <span className="font-bold text-sm tracking-tight text-text-primary">VidMetrics</span>
          </div>

          {result && !isLoading && (
            <div className="flex-1 overflow-hidden">
              <ChannelHeader />
            </div>
          )}

          {result && !isLoading && (
            <button
              onClick={() => analyze(inputUrl)}
              className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/60 bg-surface/60 text-text-muted hover:text-text-primary hover:border-blue/40 hover:bg-elevated transition-all font-medium"
              title="Re-run analysis"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Re-analyze</span>
            </button>
          )}
        </div>
      </header>

      {/* Demo Banner */}
      {result?.isDemo && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className={`w-full border-b ${inputUrl === 'demo' ? 'border-blue/20 bg-blue/5' : 'border-amber/20 bg-amber/5'}`}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 justify-between">
            {inputUrl === 'demo' ? (
              <p className="text-xs text-blue/80">
                <span className="font-semibold text-blue">Demo mode</span>
                <span className="text-blue/60"> — sample channel data. Paste any competitor's URL above to analyze a real channel.</span>
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber shrink-0" />
                  <p className="text-xs text-amber/90">
                    <span className="font-semibold">No YouTube API key — showing demo data.</span>
                    {inputUrl && (
                      <span className="text-amber/70"> "{inputUrl}" was not analyzed.</span>
                    )}
                  </p>
                </div>
                <a
                  href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-amber/80 hover:text-amber underline-offset-2 hover:underline shrink-0 transition-colors"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        </motion.div>
      )}

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10 pb-24">

        {isLoading ? (
          <div className="flex flex-col items-center pt-12">
            <div className="flex flex-col items-center gap-3 mb-10">
              <div className="w-10 h-10 border-[3px] border-surface border-t-blue rounded-full animate-spin" />
              <p className="text-sm text-blue font-medium font-mono animate-pulse">{loadingStage}</p>
            </div>
            <SkeletonDashboard />
          </div>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
            className="flex flex-col gap-10"
          >
            <CrushingThisMonth />

            <AIInsightsPanel />

            <ChartsSection />

            <div className="w-full h-px bg-border/50" />

            <VideoSection />
          </motion.div>
        ) : null}

      </main>

      <VideoDrawer />
    </div>
  );
}
