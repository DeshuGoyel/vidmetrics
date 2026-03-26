# VidMetrics — YouTube Competitor Intelligence Platform

> Paste a competitor's YouTube channel URL and instantly see which videos are crushing it, ranked by momentum (views/day), powered by Gemini AI insights.

**Live Demo:** [vidmetrics.replit.app](https://vidmetrics.replit.app) *(or current Replit URL)*

---

## What It Does

VidMetrics lets you analyze any YouTube channel and surface:

- **Momentum ranking** — every video scored by views/day (not vanity total views)
- **"Crushing It This Month"** — the top 3 featured + next 7 rising stars at a glance
- **AI Content Intelligence** — 4 Gemini-generated insight cards: strategy, timing, formula, trajectory
- **Performance Analytics** — 4 interactive charts: momentum area, upload cadence, top performers bar, historical area
- **Trending indicators** — 🔥 Trending badges on videos gaining momentum right now
- **Smart filtering** — search, time range, duration type, trending-only toggle, 7 sort options
- **Export** — download data as CSV spreadsheet, JSON, or a formatted intelligence text report
- **Demo mode** — works without an API key (MKBHD sample data with real Gemini insights)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7, TypeScript |
| Styling | Tailwind CSS v4, deep-space dark theme |
| Animation | Framer Motion |
| Charts | Recharts |
| 3D Background | React Three Fiber / Three.js |
| State | Zustand |
| Routing | Wouter |
| Backend | Node.js + Express 5, TypeScript (ESBuild) |
| AI | Google Gemini 2.5 Flash (via Replit AI Integrations proxy) |
| YouTube Data | YouTube Data API v3 |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
/
├── artifacts/
│   ├── vidmetrics/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── AIInsightsPanel.tsx   # Gemini insight cards
│   │   │   │   │   ├── Charts.tsx            # 4 chart types + collapsible section
│   │   │   │   │   ├── CrushingThisMonth.tsx # Top video cards
│   │   │   │   │   ├── ExportModal.tsx       # CSV/JSON/TXT export
│   │   │   │   │   ├── FilterBar.tsx         # Search, sort, filter controls
│   │   │   │   │   ├── VideoDrawer.tsx       # Slide-out video detail panel
│   │   │   │   │   └── VideoSection.tsx      # Full video table + grid
│   │   │   │   └── ui/
│   │   │   │       └── Primitives.tsx        # GlassCard, TrendBadge, AnimatedNumber...
│   │   │   ├── lib/
│   │   │   │   ├── reportBuilder.ts          # Shared text report generator
│   │   │   │   └── utils.ts                  # formatNumber, formatDuration, cn
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx             # Main analysis dashboard
│   │   │   │   └── Home.tsx                  # Landing + URL input
│   │   │   └── store/
│   │   │       └── useStore.ts               # Zustand store (state + API calls)
│   │   └── vite.config.ts
│   └── api-server/          # Express API backend
│       └── src/
│           ├── lib/
│           │   ├── insights.ts      # Gemini → OpenAI → algorithmic AI fallback
│           │   ├── youtube.ts       # YouTube Data API v3 integration
│           │   └── demoData.ts      # Static MKBHD demo dataset
│           └── routes/
│               └── analyze.ts       # GET /api/analyze?url=...
├── lib/                     # Shared workspace packages
└── pnpm-workspace.yaml
```

---

## Setup & Running Locally

### Prerequisites

- Node.js 20+
- pnpm 9+

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set environment variables

Create a `.env` file or export these in your shell:

```bash
# Required for real YouTube analysis
GOOGLE_API_KEY=your_youtube_data_api_v3_key

# Auto-provisioned by Replit AI Integrations (Gemini) — set manually if self-hosting:
AI_INTEGRATIONS_GEMINI_BASE_URL=https://api.gemini-proxy.example.com
AI_INTEGRATIONS_GEMINI_API_KEY=your_gemini_key

# Optional — used as Gemini fallback
OPENAI_API_KEY=your_openai_key
```

> **No API key?** The app automatically falls back to demo mode with real MKBHD channel data and pre-generated Gemini insights. Just leave `GOOGLE_API_KEY` unset.

**Getting a YouTube Data API v3 key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable "YouTube Data API v3"
3. Create an API key under Credentials

### 3. Start both services

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (port 5173 or next available)
pnpm --filter @workspace/vidmetrics run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## How It Works

### Analysis Flow

```
User inputs URL → /api/analyze?url=...
  → Parse URL (handle @handles, /watch?v=, /channel/, channel names)
  → YouTube Data API: resolve channel → fetch 50 videos → calculate engagement
  → Gemini AI: generate 4 insight cards (strategy/timing/formula/trajectory)
  → Return AnalysisResult to frontend
  → Frontend: compute momentum (views/day), apply filters/sort, render
```

### Momentum Score

Every video is scored as **views ÷ days since publish**. This surfaces videos that are *currently winning* regardless of publish date — a 2-week-old video with 2M views outranks a 3-year-old video with 5M views.

### AI Insights Cascade

The API tries three providers in order:
1. **Gemini 2.5 Flash** (via Replit AI Integrations proxy — no key required)
2. **OpenAI GPT-4o** (if `OPENAI_API_KEY` is set)
3. **Algorithmic fallback** (pure computation, always works)

### Demo Mode

Visiting the demo or entering any URL without `GOOGLE_API_KEY` returns static MKBHD channel data with real Gemini-generated insights baked in. Useful for evaluating the UI without spending API quota.

---

## Build Notes & AI-Assisted Workflow

This project was built using [Replit Agent](https://replit.com) — an AI-powered development environment.

### What AI Accelerated

| Task | AI Contribution |
|---|---|
| Architecture planning | Full monorepo layout, API design, data flow |
| YouTube API parsing | URL normalization for all YouTube URL formats |
| UI component library | Glass cards, animated counters, trend badges |
| Chart implementation | 4 Recharts components with custom styling |
| Gemini integration | Prompt engineering, JSON parsing, fallback cascade |
| Export formats | CSV field mapping, text report formatting |
| Tailwind config | Custom deep-space color palette, animations |
| TypeScript types | Full type coverage across frontend/backend |

### Key Engineering Decisions

**Momentum over raw views.** Most YouTube analytics tools sort by total views — a misleading metric dominated by channel age. Views/day (since publish) is a far better signal for what's *currently resonating*.

**Three-layer AI fallback.** AI APIs fail, rate-limit, or return malformed responses. The cascading Gemini → OpenAI → algorithmic fallback ensures the app always delivers insights — degrading gracefully rather than erroring.

**Demo mode as a feature.** Instead of blocking users without API keys, demo mode makes the app immediately usable for evaluation — especially important for a tool that requires third-party credentials.

**Client-side exports.** CSV, JSON, and text reports are generated entirely in the browser. No server round-trips, no storage, no privacy concerns.

**Shared type system.** `AnalysisResult` and all video/channel types are defined once in the Zustand store and imported everywhere. No type drift between frontend and backend response shapes.

---

## Features Roadmap (V2)

- **Multi-channel comparison** — side-by-side competitor benchmarking
- **Historical tracking** — save analyses and chart momentum over time
- **Topic clustering** — NLP-based grouping of video titles into content pillars
- **Optimal posting time** — aggregate upload timing data into a personalized schedule recommendation
- **Thumbnail analysis** — Vision AI scoring of thumbnail style, text density, and CTR potential
- **Shorts vs long-form split** — separate momentum scoring for each format
- **Email digest** — weekly automated report for tracked competitors
- **API quota management** — caching layer to reduce YouTube API costs

---

## License

MIT — free to use, modify, and deploy.
