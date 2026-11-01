# FINN: AI Financial Investment Agent
### Built for ENAM Holdings — AI Engineer Build Challenge
*A mobile-first, high-conviction intelligence layer for public-markets investing.*

---

## 🌟 Overview & Core Philosophy

An investor today is drowning in hundreds of corporate filings, earnings notifications, price movements, and broker noise every day. The scarce skill is **filtering**: surfacing the few disclosures that actually move the needle and burying everything else, beautifully.

**FINN** is built from the ground up to solve this for a lean, high-conviction public-markets investment team:
1. **Push Stream (Proactive Alerting)**: Watches end-of-day prices, volumes, and NSE/BSE filings across the portfolio. It prioritizes material events (quarterly results, management changes, M&A, capex) and automatically collapses routine secretarial noise (ESOP allotments, duplicate certificates).
2. **Pull Workspace (Grounded Diligence)**: On-demand research grounded **strictly in primary sources** (Annual Reports, Concall Transcripts, and Exchange Filings). No secondary news, broker target prices, or speculative noise.
3. **⭐ Narrative vs. Numbers Audit**: Audits management's promises over the past 4 quarters against what was actually delivered in audited financials with citations to transcripts and exchange filings.
4. **On-Demand Generalization**: While pre-loaded with an 18-company mock portfolio and 4 ad-hoc research stocks, FINN dynamically generates a primary-grounded diligence package for **any valid NSE ticker** entered on the fly.
5. **Zero Cost Architecture**: Runs 100% on free tiers (free EOD market data via `yfinance`, free Vercel hosting, deterministic calculations for 100% mathematical accuracy without token burns).

---

## 📱 Mobile-First Interface & Interaction Model

- **Bloomberg-meets-Linear Executive Dark Mode**: Ultra-clean typography, tabular figures (`font-mono`), instant responsiveness, and touch-first ergonomics.
- **Push Stream**:
  - **Windowed Digest**: Toggle between `24 Hours`, `3 Days`, `7 Days`, and `30 Days`.
  - **Materiality Filter**: Collapses routine paperwork into an expandable tray with one tap.
  - **Quarterly Results Headline Grid**: Instant 4-box metric card (**Revenue, EBITDA, PBT, PAT** with QoQ & YoY margin changes).
  - **Contextual Management Changes**: Automatically enriches executive changes with incoming pedigree (past company, education, domain tenure).
  - **EOD Anomaly Detector**: Flags volume spikes $> 2\times$ 20-DMA and price moves $> \pm 3\%$.
- **Pull Diligence**:
  - 8 core modules: Business Model, Financial Snapshot, Trajectory, Balance Sheet, Cash Quality (Cash Conversion Ratio $\text{OCF}/\text{PAT}$), Forward Guidance Ledger, Bull vs. Bear case, and Primary Citations.
- **FINN Copilot Drawer**:
  - Conversational primary diligence agent with quick prompt chips and citations to primary disclosures.
- **Configurable Alert Sliders**:
  - User-configurable volume multiplier ($1.2\times$ to $5.0\times$) and price move ($\pm 1\%$ to $\pm 10\%$) triggers.

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

### 4 Ad-hoc Demonstration Companies (Outside Portfolio)
- **TITAN.NS** (Titan Company — Watches, Jewelry & Eyewear)
- **DMART.NS** (Avenue Supermarts — Value Retail)
- **SUZLON.NS** (Suzlon Energy — Renewable Wind Turnaround)
- **DEEPAKNTR.NS** (Deepak Nitrite — Specialty Chemical Intermediates)

---

## ⚡ Zero-Cost Architecture & Technology Stack

```
┌──────────────────────────────────────────────────────────┐
│                   Next.js 16 (App Router)                │
│    React 19 • Tailwind CSS • Lucide • Tabular Fonts      │
├──────────────────────────┬───────────────────────────────┤
│    Push Engine           │    Pull Diligence Engine      │
│  • 17-Category Classifier│  • 8-Module Diligence Core    │
│  • Materiality Filter    │  • Narrative vs Numbers Audit │
│  • Anomaly Detector      │  • Cash Quality Gauges        │
├──────────────────────────┴───────────────────────────────┤
│            Zero-Cost Primary Data Layer                  │
│   • yahoo-finance2 (Free Real-time EOD Market Quotes)    │
│   • Primary Exchange Filings & Concall Transcripts       │
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
   git clone <repo-url>
   cd antigravity
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

---

## 🧪 Automated Test Suite

FINN includes an end-to-end integration test suite (`scripts/test_suite.ts`) verifying:
- ✅ Homepage UI HTML rendering (200 OK)
- ✅ Portfolio live EOD price & volume quotes
- ✅ Windowed push digest & routine paperwork collapsing
- ✅ Results 4-box metric card (Revenue, EBITDA, PBT, PAT, QoQ, YoY, Margins)
- ✅ Management change bio & pedigree enrichment
- ✅ 8 primary diligence modules for portfolio companies
- ✅ 4-quarter Narrative vs Numbers guidance audit with concall/filing citations
- ✅ On-demand research generalization on ad-hoc stocks (`TITAN.NS`)
- ✅ Dynamic generation on unseen arbitrary NSE tickers (`HAL.NS`)
- ✅ Primary-grounded Copilot Q&A with citations
- ✅ Search autocomplete and dynamic ticker lookups

---

## 📋 Evaluation Deliverables Check

- [x] **Mobile-first Working Prototype**: Built and optimized for mobile viewports, responsive, runs on `localhost:3000` and deployable to Vercel in 1 click.
- [x] **GitHub Repository**: Clean, modular, typed codebase.
- [x] **AI Build History**: Documented in [`docs/AI_BUILD_HISTORY.md`](file:///home/abhi/sanchit/antigravity/docs/AI_BUILD_HISTORY.md).
- [x] **Covering Note**: Complete writeup in [`docs/COVERING_NOTE.md`](file:///home/abhi/sanchit/antigravity/docs/COVERING_NOTE.md).
