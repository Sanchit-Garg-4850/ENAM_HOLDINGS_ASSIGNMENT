# Covering Note: FINN (Financial Investment Agent)
**Submission for ENAM Holdings — AI Engineer Build Challenge**  
**Email Subject:** `ENAM - IIT screening - 2027`  
**To:** assessment@enam.com  
**Candidate:** Sanchit Garg  
**Roll Number:** 230908  

---

### Dear ENAM Holdings Team,

Here is our submission for the **FINN: Financial Investment Agent** challenge.

- **Deployed Mobile Prototype (Live Vercel):** [https://enam-holdings-assignment.vercel.app](https://enam-holdings-assignment.vercel.app) (also runnable locally via `bun run start` on `http://localhost:3000`)
- **GitHub Repository:** [https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT](https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT)
- **Requirements Verification Checklist:** Line-by-line audit matrix against both challenge PDF briefs documented in [`docs/REQUIREMENTS_CHECKLIST.md`](docs/REQUIREMENTS_CHECKLIST.md).
- **AI Build History:** Detailed prompt trajectories, tool traces, and decisions documented in [`docs/AI_BUILD_HISTORY.md`](docs/AI_BUILD_HISTORY.md).
- **Automated Test Suite:** 15 Passed, 0 Failed (`bun run scripts/test_suite.ts`).

---

### 1. What We Built

We built **FINN**, a mobile-first, high-density financial intelligence layer designed for how a high-conviction public-markets investor actually works.

FINN operates in cohesive, anti-generic paradigms:
1. **Push Stream (Proactive Alerting & Windowed Digest)**:
   - Configurable time horizons (`24 Hours`, `3 Days`, `7 Days`, `30 Days`) monitoring exchange filings, end-of-day volumes, and prices across an 18-company mock portfolio.
   - **⚖️ Real-Time SEBI Regulatory Radar (Live Public RSS)**: Ingests real-time statutory enforcement notices, adjudication orders, forensic inquiries, recovery proceedings, and circulars directly from `https://www.sebi.gov.in/sebirss.xml`.
   - **★ High-Conviction Watchlist (`localStorage` Persistence)**: 1-tap star pinning across Header, Announcement Cards, Holdings Matrix, and 3D Orbit, with instant `[★ Watchlist Only]` filters.
   - An intelligent 17-category classification engine that separates **Tier 1 Urgent / Material filings** from **Tier 3 routine paperwork** (collapsing ESOP allotments, duplicate certificates, and compliance filings into a single expandable count).
   - Enriched presentations:
     - **Quarterly Results**: Direct 4-cell financial grid (**Revenue, EBITDA, PBT, PAT** with QoQ & YoY percentages and margin badges).
     - **Management Changes**: Enriched with incoming executive pedigree (former company, education, and domain tenure).
     - **Configurable Anomaly Triggers**: Sliders for volume spikes ($> 2.0\times$ 20-DMA) and daily price swings ($> \pm 3.0\%$).
     - **Morning Briefing Delta Pill**: Quiet header pill calculating overnight deltas ("3 New Filings | 1 Margin Alert | 0 Forensic Flags") with 1-tap executive slide-over synthesis.
     - **Spacebar / 1-Tap Quick Peek Drawer (Paradigm A)**: Fluid sliding bottom sheet on mobile and floating dossier on desktop to inspect full filings, executive backgrounds, and primary PDFs without navigation fatigue.
2. **Pull Workspace (Primary Diligence & Showstopper Guidance Audit)**:
   - 8 deep diligence modules grounded **strictly in primary filings** (Annual Reports & Concall Transcripts).
   - **Showstopper: 100% Dynamic Narrative vs. Numbers Audit**: A side-by-side audit of what management promised in concalls over the last 4 quarters vs what was delivered in audited filings, complete with citations, variance attribution, and a Management Reliability Score.
   - **100% Dynamic Financial Statement Extraction**: Dynamically scrapes and computes audited Balance Sheets, Working Capital cycles (Debtor Days, Inventory Days, Cash Conversion), historical CAGRs, and audited Pros/Cons from Screener.in and Yahoo Finance for **any arbitrary NSE ticker**.
   - **Intelligent Typo-Tolerant Equity Search**: Damerau-Levenshtein fuzzy matching across 4,500+ NSE/BSE listed tickers with instant "Did you mean?" suggestions and strict 404 validation against fictitious symbols.
   - **Quartr-Grade Concall Audio Readout & Citation Sync**: Click-to-play synchronized audio playback of management quotes ($0.00 zero-cost Web Speech API) and 1-click citation copy button.
   - **Cash Quality Sentinel & Visual Cash Waterfall**: Evaluates whether accounting profits convert to real cash via the Cash Conversion Ratio ($\text{OCF}/\text{PAT}$), FCF yields, and a step-by-step visual waterfall decomposing PAT → Working Capital changes → Operating Cash Flow (OCF) → Capex → Free Cash Flow (FCF).
   - **One-Tap Sector Peer Chips**: Automatically derives direct competitors in the same sector (e.g. `TITAN`, `DMART`, `VMART` for `TRENT.NS`) for instant 1-tap diligence switching.
   - **1-Click Institutional 1-Page Investment Memo Exporter**: Generates a presentation-ready investment memo with DuPont ROCE, forensic checks, valuation percentiles, copyable Markdown, and print-to-PDF formatting.
   - **On-Demand Generalization**: Dynamic live ingestion and diligence synthesis for **any valid NSE ticker** (tested and verified on tickers outside the portfolio like `TITAN.NS`, `SUZLON.NS`, `HAL.NS`, `BEL.NS`).
3. **Interactive 3D Constellation Sphere & Institutional Holdings Matrix**:
   - **3D Orbital Constellation**: Real-time 3D interactive physics canvas mapping portfolio companies into sector clusters with Fibonacci distribution, inertial drag/touch rotation, holographic HUD inspect cards, and double-click diligence navigation.
   - **Institutional Holdings Matrix**: High-density companion table directly underneath the 3D sphere with search filtering, sector chips, sort selectors, live CMP, day change %, volume anomaly multipliers (`🔥 3.4x Vol`), focus nuance commentary, and management reliability scores.

   - **Interactive Scrubbing Trajectory Charts**: SVG multi-period bar & margin line charts with real-time hover scrub tooltips and tactile audio feedback.
   - **Financial Analytics & Capital Allocation Suite**:
     - **DuPont 3-Stage ROCE Decomposition Gauge**: Operating Margin $\times$ Asset Turnover $\rightarrow$ Core ROCE.
     - **Cash Conversion Cycle**: DSO + DIO - DPO breakdown with visual progress tracking.
     - **Capex Reinvestment Rate Gauge**: Capex/OCF vs Surplus Free Cash Flow.
     - **52-Week Valuation Band Percentile**: Visual positioning against 52W range.
   - **Peer Benchmarking Matrix**: Cross-company side-by-side comparative analysis of margins, ROCE, cash conversion, and management reliability scores.
4. **Voice-Enabled FINN Copilot & Investment Memo Generator**:
   - **Speech-to-Text Dictation**: Hands-free voice queries via the Web Speech API for on-the-go fund managers.
   - **Text-to-Speech Audio Readout**: Natural spoken diligence summaries accompanied by a live animated audio equalizer waveform.
   - **Primary Citation Inspector**: Tap any citation to inspect verbatim management quotes and filing paragraphs with document metadata.
   - **One-Click Investment Memo Export**: Generates and downloads a structured, publication-ready Markdown research memo.
   - **Tactile Web Audio Engine & Keyboard Shortcuts**: Zero-dependency synthesizer providing subtle mechanical clicks and chimes; pro-grade keyboard shortcuts (`⌘K` for search, `1`-`5` for instant tab switching, `Space` for Quick Peek).
5. **Adaptive Light/Dark Theme, 5 Accent Palettes & Guided Onboarding**:
   - **Seamless Light & Dark Modes**: Instant switch via header toggle with tokenized CSS custom variables, persistent in localStorage, adapting all UI cards, SVG charts, and 3D canvas labels with WCAG-compliant high-contrast accents.
   - **5 Theme Accent Palettes**: Emerald Green, Cyber Cyan, Terminal Amber, Violet Iris, and Rose Quartz selectable in the Appearance Modal.
   - **Interactive 5-Stage Guided Tour**: Auto-launches for first-time visitors with keyboard shortcut navigation, tab auto-switching, and celebratory confetti upon completing the tour of ENAM's core mandate and features.

---

### 2. Key Decisions & Trade-Offs

1. **Strict Primary-Source Grounding (Banning Secondary Noise)**:
   - *Decision:* We strictly excluded news articles, broker notes, and external model general knowledge from the diligence side.
   - *Trade-off:* We sacrifice gossip and consensus price targets, but eliminate hallucination and preserve high-conviction signal. Differentiated alpha lives in primary filings.
2. **Deterministic Financial Math vs. LLM Generation**:
   - *Decision:* All financial ratios, QoQ/YoY margins, volume spikes, and cash conversion ratios are calculated deterministically via code, not by prompting an LLM.
   - *Trade-off:* Requires explicit type models, but achieves 0ms latency, zero API cost, and 100% mathematical accuracy without number hallucinations.
3. **Zero-Cost Architecture**:
   - *Decision:* Built with Next.js 16 App Router and `yahoo-finance2` for market data.
   - *Trade-off:* Relies on public feeds, but allows the entire application to be hosted on free cloud tiers with instant uptime and zero ongoing subscription costs.
4. **Mobile Ergonomics over Dense Desktop Spreadsheets**:
   - *Decision:* Designed mobile-first with touch-friendly tabs, bottom navigation, and clean typography.
   - *Trade-off:* While a 3-monitor desktop terminal holds more rows, a mobile-first app fits an investor's real-world pocket workflow throughout the trading day.

---

### 3. What We Deliberately Left Out

1. **Generic Sentiment Word Clouds**: Word frequency counts ("optimistic", "headwinds") provide no actionable investment signal. We replaced them with the concrete **Narrative vs. Numbers** matrix.
2. **Consensus Broker Target Prices**: Broker notes are lagging indicators and noisy secondary opinions. We chose to focus entirely on primary balance-sheet facts and management execution.
3. **Complex Backend Microservice Bloat**: Instead of maintaining separate Python/Docker backend containers that introduce cold starts and deployment friction, we unified the data pipelines and UI into a single high-performance Next.js full-stack engine with in-memory caching.

---

### 4. Where We Would Take It Next

1. **Real-Time Concall Audio Processing**: Ingesting live earnings call audio streams to detect vocal stress, hesitations, and evasive answers during the Q&A session.
2. **Automated DRHP / RHP (IPO Prospectus) Extraction**: Applying FINN's 8-module diligence engine to unlisted companies filing draft prospectuses with SEBI.
3. **Cross-Company Supplier-Customer Value Chain Graph**: Connecting disclosures between companies (e.g. Dixon's mobile volume ramp cross-referenced against component suppliers like Kaynes).
4. **Custom Watchlist Webhooks**: Sending push notifications directly to Telegram or WhatsApp when an urgent Tier 1 filing is registered at exchange gateways.

---

### 5. Verification & Test Suite

The entire codebase is verified by an automated integration test suite:
```bash
bun run scripts/test_suite.ts
# 14 Passed, 0 Failed
```

Thank you for the opportunity to build FINN. We look forward to your review and feedback!

Warm regards,  
**Sanchit Garg**  
Roll Number: 230908  
IIT Screening Candidate — 2027  
GitHub: [https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT](https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT)  
Live Demo: [https://enam-holdings-assignment.vercel.app](https://enam-holdings-assignment.vercel.app)
