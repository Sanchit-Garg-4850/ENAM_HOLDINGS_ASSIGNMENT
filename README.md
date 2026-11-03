# FINN: AI Financial Investment Agent
### Built for ENAM Holdings — AI Engineer Build Challenge
*A mobile-first, high-conviction intelligence layer for public-markets investing.*

**Candidate:** Sanchit Garg  
**Roll Number:** 230908  
**Submission For:** ENAM Holdings — AI Engineer Build Challenge  
**Email Subject:** `ENAM - IIT screening - 2027`  
**GitHub Repository:** [https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT](https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT)  
**Test Suite Status:** 14 Passed, 0 Failed (`bun run scripts/test_suite.ts`)

---

## 🌟 Overview & Core Philosophy

An investor today is drowning in hundreds of corporate filings, earnings notifications, price movements, and broker noise every day. The scarce skill is **filtering**: surfacing the few disclosures that actually move the needle and burying everything else, beautifully.

**FINN** is built from the ground up to solve this for a lean, high-conviction public-markets investment team:
1. **Push Stream (Proactive Alerting & Windowed Digest)**: Watches end-of-day prices, volumes, and NSE/BSE filings across the portfolio. It prioritizes material events (quarterly results, management changes, M&A, capex) and automatically collapses routine secretarial noise (ESOP allotments, duplicate certificates).
2. **Pull Workspace (Grounded Diligence)**: On-demand research grounded **strictly in primary sources** (Annual Reports, Concall Transcripts, and Exchange Filings). No secondary news, broker target prices, or speculative noise.
3. **⭐ 100% Dynamic Narrative vs. Numbers Audit**: Audits management's promises over the past 4 quarters against what was actually delivered in audited financials with direct citations to BSE concall transcripts and primary exchange filings.
4. **100% Dynamic Financial Statement Extraction**: Dynamically scrapes and computes audited Balance Sheets, Working Capital cycles (Debtor Days, Inventory Days, Cash Conversion), historical CAGRs, and audited Pros/Cons from Screener.in and Yahoo Finance for **any arbitrary NSE ticker**.
5. **Intelligent Typo-Tolerant Equity Search**: Comprehensive search engine covering 4,500+ NSE/BSE listed tickers with Damerau-Levenshtein fuzzy matching ("Did you mean?") and strict 404 validation against invalid symbols.
6. **Zero Cost Architecture**: Runs 100% on free tiers (free EOD market data via `yfinance`, free Vercel hosting, deterministic calculations for 100% mathematical accuracy without token burns).

---

## 📱 Mobile-First Interface & Interaction Model

- **Bloomberg-meets-Linear Executive Dark & Light Modes**: Ultra-clean typography, tabular figures (`font-mono`), instant responsiveness, and touch-first ergonomics.
- **Push Stream**:
  - **Windowed Digest**: Toggle between `24 Hours`, `3 Days`, `7 Days`, and `30 Days`.
  - **Materiality Filter**: Collapses routine paperwork into an expandable tray with one tap.
  - **Quarterly Results Headline Grid**: Instant 4-box metric card (**Revenue, EBITDA, PBT, PAT** with QoQ & YoY margin changes).
  - **Contextual Management Changes**: Automatically enriches executive changes with incoming pedigree (past company, education, domain tenure).
  - **EOD Anomaly Detector**: Flags volume spikes $> 2\times$ 20-DMA and price moves $> \pm 3\%$.
  - **Morning Briefing Delta Pill**: Quiet header pill calculating overnight deltas ("3 New Filings | 1 Margin Alert | 0 Forensic Flags") with 1-tap executive slide-over synthesis.
  - **Spacebar / 1-Tap Quick Peek Drawer**: Inspect complete 4-box financials, executive backgrounds, and official BSE PDFs without leaving the feed.
- **Pull Diligence**:
  - 8 core modules: Business Model, Financial Snapshot, Multi-Year Trajectory with Interactive Scrubbing SVG Charts, Balance Sheet Health, Cash Quality with Visual Cash Waterfall, Forward Guidance Ledger, Bull vs. Bear Case, and Peer Benchmark Matrix.
  - **Cash Flow Waterfall Visualizer**: Step-by-step visual waterfall decomposing accounting profit into real cash: Revenue → EBITDA → PAT → Working Capital changes → Operating Cash Flow (OCF) → Free Cash Flow (FCF).
  - **Financial Analytics Suite**: DuPont 3-Stage ROCE Decomposition Gauge, Cash Conversion Cycle, Capex Reinvestment Rate, and 52W Valuation Band.
  - **Sector Peer Chips**: Direct 1-tap model switching between competitors (e.g. `TITAN`, `DMART`, `VMART` for `TRENT.NS`).
  - **1-Page Institutional Investment Memo**: Generates presentation-ready memos with DuPont ROCE, forensic checks, valuation percentiles, copyable Markdown, and print-to-PDF formatting.
- **🌌 3D Portfolio Universe**:
  - Real-time 3D orbital physics canvas mapping portfolio companies into Fibonacci clusters by sector, with inertial mouse/touch drag rotation, holographic HUD inspect cards, and double-click diligence jump.
- **🎙️ Voice-Enabled FINN Copilot**:
  - Speech-to-Text voice dictation (Web Speech API) for hands-free queries.
  - Text-to-Speech audio readout with animated equalizer waveform.
  - Quartr-grade concall audio synchronization with 1-click citation copy button.
  - Primary Citation Inspector modal showing verbatim concall quotes and exchange paragraphs.
  - One-click investment memo export in Markdown format.
- **🔊 Tactile Zero-Dependency Web Audio Synthesizer**:
  - Procedurally generated subtle mechanical clicks, chimes, and chords using the Web Audio API.
- **⌨️ Keyboard Shortcuts**:
  - `⌘K` or `Ctrl+K`: Instant ticker search modal.
  - Keys `1`-`5`: Instant tab switching across Push, Pull, Narrative, 3D Orbit, and Copilot.
  - `Space`: Instant Quick Peek on highlighted announcement card.
- **Configurable Alert Sliders**:
  - User-configurable volume multiplier ($1.2\times$ to $5.0\times$) and price move ($\pm 1\%$ to $\pm 10\%$) triggers.
- **5 Theme Accent Palettes**:
  - Emerald Green, Cyber Cyan, Terminal Amber, Violet Iris, and Rose Quartz.
- **Interactive 5-Stage Guided Onboarding Tour**:
  - Auto-launches for first-time visitors with keyboard shortcut navigation, tab auto-switching, and celebratory confetti upon completing the tour of ENAM's core mandate and features.

---

## 🏛️ Portfolio & Coverage Scope

### 18 Mock Portfolio Companies
| Ticker | Company Name | Sector | Market Cap | Focus Nuance |
| :--- | :--- | :--- | :--- | :--- |
| **RELIANCE.NS** | Reliance Industries | Conglomerates | Mega Cap | Telecom & Retail capex turning into FCF |
| **HDFCBANK.NS** | HDFC Bank | Banking & Financials | Mega Cap | Post-merger NIM compression & credit-deposit ratio |
| **TCS.NS** | Tata Consultancy Services | IT Services | Large Cap | Deal TCV vs revenue conversion |
| **ITC.NS** | ITC Ltd | FMCG & Hotels | Large Cap | Hotels demerger, cigarette volume resilience |
| **LT.NS** | Larsen & Toubro | Capital Goods | Large Cap | Order backlog execution & working capital |
| **SUNPHARMA.NS** | Sun Pharmaceutical | Healthcare | Large Cap | US FDA regulatory clearance & specialty ramp |
| **MARUTI.NS** | Maruti Suzuki | Automotive | Large Cap | SUV market share & EV transition timeline |
| **TRENT.NS** | Trent Ltd | Retail | Large/Mid | Zudio store addition velocity vs margins |
| **POLYCAB.NS** | Polycab India | Cables & Wires | Mid Cap | Halol EHV plant capex & working capital |
| **DIXON.NS** | Dixon Technologies | EMS / Electronics | Mid Cap | Smartphone assembly volumes vs margin dilution |
| **FEDERALBNK.NS**| Federal Bank | Private Banking | Mid Cap | Branch expansion & asset quality |
| **PERSISTENT.NS**| Persistent Systems | IT Services | Mid Cap | Enterprise digital engineering growth |
| **ASTRAL.NS** | Astral Ltd | Building Materials | Mid Cap | PVC raw material pricing & margin spread |
| **ZOMATO.NS** | Zomato Ltd | Consumer Tech | Large/Mid | Blinkit EBITDA breakeven & dark store expansion |
| **CDSL.NS** | Central Depository Services | Financial Infrastructure | Mid Cap | Demat market share & operating leverage |
| **KAYNES.NS** | Kaynes Technology | High-Tech EMS | Small/Mid | Defense & OSAT semiconductor plant rollout |
| **MAPMYINDIA.NS**| C.E. Info Systems | Deep Tech SaaS | Small Cap | High EBITDA margins & automotive OEM navigation |
| **CLEAN.NS** | Clean Science & Tech | Specialty Chemicals | Small Cap | HALS facility capacity ramp & green chemistry |

### Dynamic Ad-hoc & Arbitrary Stock Generalization
FINN dynamically fetches live exchange announcements, quarterly results, audited balance sheets, and guidance audits for **any valid NSE ticker** (e.g. `TITAN.NS`, `SUZLON.NS`, `HAL.NS`, `BEL.NS`, `INFY.NS`).

---

## ⚡ Zero-Cost Architecture & Technology Stack

```
┌──────────────────────────────────────────────────────────┐
│                   Next.js 16 (App Router)                │
│    React 19 • Tailwind CSS • Lucide • Tabular Fonts      │
├──────────────────────────┬───────────────────────────────┤
│    Push Engine           │    Pull Diligence Engine      │
│  • 17-Category Classifier│  • 8-Module Diligence Core    │
│  • Materiality Filter    │  • Dynamic Guidance Audit     │
│  • Live Anomaly Detector │  • Cash Flow Waterfall        │
├──────────────────────────┴───────────────────────────────┤
│            Zero-Cost Primary Data Layer                  │
│   • yahoo-finance2 (Free Real-time EOD Market Quotes)    │
│   • Live Screener.in Exchange Scraper & BSE Filings      │
│   • Damerau-Levenshtein Fuzzy Ticker Matching            │
│   • In-Memory Cache with Sub-Second Responses            │
└──────────────────────────────────────────────────────────┘
```

- **Deterministic Layer ($0.00, 0ms, 100% Accurate)**: Formula-driven calculations for financial metrics (Revenue, EBITDA, PBT, PAT, QoQ/YoY margins, ROCE, D/E, Cash Conversion $\text{OCF}/\text{PAT}$, and anomaly detection). Eliminates LLM math hallucinations.
- **Semantic Layer**: Synthesizes executive background profiles and concall guidance statements.
- **Resilience**: Pre-cached high-fidelity primary filings for all portfolio companies ensure zero downtime during offline evaluations, while dynamically fetching live data for any new arbitrary NSE ticker.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or [Bun](https://bun.sh) (recommended for fastest execution)

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT.git
   cd ENAM_HOLDINGS_ASSIGNMENT
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Build and run production server:
   ```bash
   bun run build
   bun run start
   ```
   Open [http://localhost:3000](http://localhost:3000) on your desktop or mobile browser.

4. Run the automated test suite:
   ```bash
   bun run scripts/test_suite.ts
   ```

### 1-Click Deployment
FINN is zero-config ready for Vercel deployment:
```bash
npx vercel --prod
```
Or import directly via GitHub repository: `https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT`.

---

## 🧪 Automated Test Suite (14/14 Tests Passing)

FINN includes an end-to-end integration test suite (`scripts/test_suite.ts`) verifying:
- ✅ Homepage UI HTML rendering (200 OK)
- ✅ Portfolio live EOD price & volume quotes
- ✅ Windowed push digest & routine paperwork collapsing
- ✅ 30-day window includes full historical disclosures
- ✅ Results filing contains 4-box metric grid with QoQ/YoY margins
- ✅ Management change filing includes enriched executive pedigree
- ✅ `/api/research` returns 8 grounded diligence modules for `TRENT.NS`
- ✅ Narrative vs Numbers has 4-quarter audits with concall vs filing citations
- ✅ Generalization: On-demand research works for ad-hoc ticker (`TITAN.NS`)
- ✅ Generalization: Dynamically generates diligence for unseen ticker (`HAL.NS`)
- ✅ Copilot POST answers guidance audit query with citations
- ✅ `/api/search` finds companies by symbol and keyword
- ✅ `/api/search` suggests correct ticker on typos (e.g. `HALLL` → `HAL`)
- ✅ `/api/research` rejects typos with 404 and provides `didYouMean` instead of static page

---

## 📋 Evaluation Deliverables Check

- [x] **Mobile-first Working Prototype**: Built and optimized for mobile viewports, responsive, runs on `localhost:3000` and deployable to Vercel in 1 click.
- [x] **GitHub Repository**: Clean, modular, typed codebase at `https://github.com/Sanchit-Garg-4850/ENAM_HOLDINGS_ASSIGNMENT`.
- [x] **AI Build History**: Documented in [`docs/AI_BUILD_HISTORY.md`](file:///home/abhi/sanchit/antigravity/docs/AI_BUILD_HISTORY.md).
- [x] **Covering Note**: Complete writeup in [`docs/COVERING_NOTE.md`](file:///home/abhi/sanchit/antigravity/docs/COVERING_NOTE.md).
- [x] **Requirements Checklist**: Line-by-line verification in [`docs/REQUIREMENTS_CHECKLIST.md`](file:///home/abhi/sanchit/antigravity/docs/REQUIREMENTS_CHECKLIST.md).
