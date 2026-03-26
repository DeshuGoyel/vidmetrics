import React from 'react';
import { GlassCard } from '../ui/Primitives';
import { useStore } from '@/store/useStore';
import { Sparkles, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { downloadTextReport } from '@/lib/reportBuilder';

export function AIInsightsPanel() {
  const { result } = useStore();
  if (!result || !result.insights) return null;

  const handleDownload = () => downloadTextReport(result);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="relative mt-4">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet/30 via-cyan/20 to-blue/30 rounded-3xl opacity-50 blur-sm pointer-events-none" />

      <GlassCard className="relative p-6 md:p-8 bg-surface/95 z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet/10 text-violet">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">AI Content Intelligence</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface border border-border text-text-muted flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
              Gemini AI
            </span>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue/10 border border-blue/30 text-blue hover:bg-blue/20 hover:border-blue/50 transition-all font-medium"
              title="Download intelligence report"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {result.insights.map((ins) => (
            <motion.div key={ins.id} variants={item}>
              <InsightCard insight={ins} />
            </motion.div>
          ))}
        </motion.div>
      </GlassCard>
    </div>
  );
}

type InsightCardData = {
  id: string;
  type: string;
  icon: string;
  title: string;
  body: string;
  stat?: string;
  confidence: string;
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-green',
  medium: 'text-amber',
  low: 'text-text-muted',
};

const TYPE_ACCENTS: Record<string, { border: string; bg: string; dot: string }> = {
  strategy: { border: 'border-blue/20', bg: 'bg-blue/5', dot: 'bg-blue' },
  timing:   { border: 'border-cyan/20',  bg: 'bg-cyan/5',  dot: 'bg-cyan' },
  formula:  { border: 'border-violet/20', bg: 'bg-violet/5', dot: 'bg-violet' },
  trajectory: { border: 'border-green/20', bg: 'bg-green/5', dot: 'bg-green' },
};

function InsightCard({ insight }: { insight: InsightCardData }) {
  const accent = TYPE_ACCENTS[insight.type] ?? TYPE_ACCENTS.strategy;
  const confColor = CONFIDENCE_COLORS[insight.confidence] ?? 'text-text-muted';

  return (
    <div className={`h-full flex flex-col gap-3 p-5 rounded-xl border ${accent.border} ${accent.bg} backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none mt-0.5">{insight.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-text-primary leading-snug">{insight.title}</h3>
          {insight.stat && (
            <p className="text-xs text-cyan font-mono mt-0.5">{insight.stat}</p>
          )}
        </div>
        <span className="shrink-0 flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-text-muted">
          <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
          {insight.confidence}
        </span>
      </div>
      <p className={`text-xs leading-relaxed ${confColor}`}>
        {insight.body}
      </p>
    </div>
  );
}
