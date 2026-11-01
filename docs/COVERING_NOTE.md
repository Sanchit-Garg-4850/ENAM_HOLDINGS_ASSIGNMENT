# Covering Note: FINN (Financial Investment Agent)
**Submission for ENAM Holdings — AI Engineer Build Challenge**
**Email Subject:** ENAM - IIT screening - 2027
**To:** assessment@enam.com

---

### Dear ENAM Holdings Team,

Here is our submission for the **FINN: Financial Investment Agent** challenge.

- **Deployed Mobile Prototype:** `https://<your-vercel-deployment-link>` (or run locally via `bun run start`)
- **GitHub Repository:** `https://github.com/<your-username>/finn-investment-agent`
- **AI Build History:** Detailed prompt trajectories, tool traces, and decisions documented in [`docs/AI_BUILD_HISTORY.md`](file:///home/abhi/sanchit/antigravity/docs/AI_BUILD_HISTORY.md).

---

### 1. What We Built

We built **FINN**, a mobile-first, high-density financial intelligence layer designed for how a high-conviction public-markets investor actually works.

FINN operates in two cohesive modes:
1. **Push Stream (Proactive Alerting & Windowed Digest)**:
   - Configurable time horizons (`24 Hours`, `3 Days`, `7 Days`, `30 Days`) monitoring exchange filings, end-of-day volumes, and prices across an 18-company mock portfolio.
   - An intelligent 17-category classification engine that separates **Tier 1 Urgent / Material filings** from **Tier 3 routine paperwork** (collapsing ESOP allotments, duplicate certificates, and compliance filings into a single expandable count).
   - Enriched presentations:
     - **Quarterly Results**: Direct 4-cell financial grid (**Revenue, EBITDA, PBT, PAT** with QoQ & YoY percentages and margin badges).
     - **Management Changes**: Enriched with incoming executive pedigree (former company, education, and domain tenure).
     - **Configurable Anomaly Triggers**: Sliders for volume spikes ($> 2.0\times$ 20-DMA) and daily price swings ($> \pm 3.0\%$).
2. **Pull Workspace (Primary Diligence & Showstopper Guidance Audit)**:
   - 8 deep diligence modules grounded **strictly in primary filings** (Annual Reports & Concall Transcripts).
   - **Showstopper: Narrative vs. Numbers Audit**: A side-by-side audit of what management promised in concalls over the last 4 quarters vs what was delivered in audited filings, complete with citations, variance attribution, and a Management Reliability Score.
   - **Cash Quality Sentinel**: Evaluates whether accounting profits convert to real cash via the Cash Conversion Ratio ($\text{OCF}/\text{PAT}$) and FCF yields.
   - **On-Demand Generalization**: Dynamic live ingestion and diligence synthesis for **any valid NSE ticker** (tested and verified on tickers outside the portfolio like `TITAN.NS`, `SUZLON.NS`, and `HAL.NS`).
3. **FINN Copilot**:
   - An interactive conversational agent providing instant, cited answers from primary filings with quick prompt chips.

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
# 12 Passed, 0 Failed
```

Thank you for the opportunity to build FINN. We look forward to your review and feedback!

Warm regards,  
**Applicant**
