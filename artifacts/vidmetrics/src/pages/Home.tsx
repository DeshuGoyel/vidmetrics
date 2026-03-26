import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useStore } from '@/store/useStore';
import { GlowButton, GlassCard } from '@/components/ui/Primitives';
import HeroGlobe from '@/components/three/HeroGlobe';
import { Search, ArrowRight, BarChart3, Brain, Download, Link as LinkIcon, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [url, setUrl] = useState('');
  const [, setLocation] = useLocation();
  const { analyze, isLoading } = useStore();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    // Very basic validation, backend does the real one
    if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.startsWith('@') && !/^[a-zA-Z0-9_-]{2,}$/.test(url)) {
      setError('Enter a YouTube channel URL, video URL, or @handle');
      return;
    }
    setError('');
    analyze(url);
    setLocation('/dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-void w-full overflow-hidden font-sans selection:bg-blue/30 selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/30 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue to-violet flex items-center justify-center shadow-lg shadow-blue/20" />
            <span className="font-bold text-lg tracking-tight text-text-primary">VidMetrics</span>
          </div>
          <GlowButton variant="ghost" size="sm" onClick={() => { analyze('demo'); setLocation('/dashboard'); }}>
            View Demo
          </GlowButton>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(37,99,235,0.1)_0%,transparent_50%)]" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(rgba(22,35,56,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(22,35,56,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6 max-w-xl"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                <span className="text-xs font-medium text-text-secondary">AI-Powered Competitor Intelligence</span>
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold tracking-tight text-text-primary leading-[1.1]">
              Decode What's Crushing It <br />
              <span className="text-gradient-primary">on YouTube</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-text-secondary leading-relaxed">
              Paste any competitor's channel URL and instantly see which videos are winning — views, engagement, trends, and AI-powered strategy insights.
            </motion.p>

            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="mt-4 relative">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-text-muted">
                  <Youtube className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="youtube.com/@mkbhd or youtube.com/watch?v=..."
                  className={`w-full bg-surface/80 backdrop-blur-md border ${error ? 'border-red/50 focus:border-red' : 'border-border/80 focus:border-blue'} rounded-2xl pl-12 pr-36 py-4 text-text-primary placeholder:text-text-muted focus:ring-4 focus:ring-blue/10 transition-all shadow-xl`}
                />
                <div className="absolute right-2">
                  <GlowButton type="submit" loading={isLoading} size="sm" className="py-2.5">
                    Analyze <ArrowRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                </div>
              </div>
              {error && <p className="text-red text-xs mt-2 ml-2 font-medium">{error}</p>}
              {!error && <p className="text-text-muted text-xs mt-2 ml-2">Works with channel URLs, video links, @handles, or channel names</p>}
            </motion.form>

            <motion.div variants={itemVariants} className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-void bg-gradient-to-br from-blue to-cyan opacity-${100 - i*10} shadow-md`} />
                ))}
              </div>
              <div className="text-xs font-medium text-text-secondary">
                Trusted by <span className="text-text-primary">500+</span> creators
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Globe */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:block relative h-[500px] w-full"
          >
            <HeroGlobe />
            
            {/* Floating Stats */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-[20%] right-[10%] z-20"
            >
              <GlassCard className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center text-cyan">👀</div>
                <div>
                  <div className="text-xs text-text-muted font-medium">Top Video</div>
                  <div className="text-sm font-bold font-mono">8.2M views</div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[25%] left-[5%] z-20"
            >
              <GlassCard className="px-4 py-3 flex items-center gap-3 border-green/20">
                <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center text-green">🎯</div>
                <div>
                  <div className="text-xs text-text-muted font-medium">Engagement</div>
                  <div className="text-sm font-bold font-mono text-green">9.4% Rate</div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 relative z-10 border-t border-border/30 bg-base/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">From URL to insights in seconds</h2>
          <p className="text-text-secondary mb-16">No setup. No signup. Just results.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line desktop */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-border/50 border-t border-dashed border-border/80" />
            
            <Step number="1" icon={<LinkIcon />} title="Paste Channel URL" desc="Drop any public YouTube channel link into the engine." />
            <Step number="2" icon={<Brain />} title="AI Analyzes Data" desc="We fetch their recent history and run it through GPT-4o." />
            <Step number="3" icon={<BarChart3 />} title="Get Instant Insights" desc="Uncover their optimal video length, cadence, and content strategy." />
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard glow="blue" hover className="p-8">
            <div className="w-12 h-12 bg-blue/10 rounded-xl flex items-center justify-center text-blue mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Video Performance</h3>
            <p className="text-sm text-text-secondary">Views, likes, comments, engagement rates — sorted, filtered, and beautifully visualized.</p>
          </GlassCard>

          <GlassCard glow="violet" hover className="p-8">
            <div className="w-12 h-12 bg-violet/10 rounded-xl flex items-center justify-center text-violet mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">AI Intelligence</h3>
            <p className="text-sm text-text-secondary">Pattern detection, timing analysis, and strategic recommendations generated automatically.</p>
          </GlassCard>

          <GlassCard glow="cyan" hover className="p-8">
            <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan mb-6">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Export & Share</h3>
            <p className="text-sm text-text-secondary">Download raw CSV data or generate beautiful PDF snapshots to share with your team.</p>
          </GlassCard>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-border/50 text-center text-xs text-text-muted mt-20">
        <p>VidMetrics © {new Date().getFullYear()}. For demonstration purposes.</p>
      </footer>
    </div>
  );
}

function Step({ number, icon, title, desc }: any) {
  return (
    <div className="flex flex-col items-center relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border shadow-xl flex items-center justify-center text-text-primary mb-6 relative">
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue text-white text-xs font-bold flex items-center justify-center">
          {number}
        </div>
        {React.cloneElement(icon, { className: "w-7 h-7 text-text-secondary" })}
      </div>
      <h3 className="text-base font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary">{desc}</p>
    </div>
  );
}
