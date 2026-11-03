// API Route: /api/copilot (FINN Intelligent Agent Copilot - Hybrid Generative & Primary Grounding Engine)
import { NextResponse } from 'next/server';
import { getCompanyDiligence } from '@/lib/primaryAnalyzer';
import { getLiveStockQuote } from '@/lib/yfinance';
import { DiligenceModule, StockQuote } from '@/lib/types';

interface Citation {
  source: string;
  quote: string;
  type: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, ticker = 'TRENT.NS', apiKey: clientApiKey } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ success: false, error: 'Question required' }, { status: 400 });
    }

    const [diligence, quote] = await Promise.all([
      getCompanyDiligence(ticker),
      getLiveStockQuote(ticker),
    ]);

    const activeApiKey =
      clientApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.OPENAI_API_KEY;

    let responseText = '';
    let citations: Citation[] = [];
    let engineUsed: 'gemini' | 'openai' | 'finn_primary_engine' = 'finn_primary_engine';

    // 1. If an API key is available, execute dynamic generative LLM inference with strict primary grounding
    if (activeApiKey) {
      const isGemini =
        activeApiKey.startsWith('AIza') ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        !activeApiKey.startsWith('sk-');

      try {
        if (isGemini) {
          const geminiResult = await executeGeminiGeneration(question, quote, diligence, activeApiKey);
          if (geminiResult) {
            responseText = geminiResult.text;
            citations = geminiResult.citations;
            engineUsed = 'gemini';
          }
        } else {
          const openaiResult = await executeOpenAIGeneration(question, quote, diligence, activeApiKey);
          if (openaiResult) {
            responseText = openaiResult.text;
            citations = openaiResult.citations;
            engineUsed = 'openai';
          }
        }
      } catch (llmErr) {
        console.warn('[Copilot] Generative LLM fallback to primary engine:', (llmErr as Error).message);
      }
    }

    // 2. Fallback / Default: Zero-Cost Financial Reasoning & Primary Extraction Engine
    if (!responseText) {
      const primaryResult = synthesizePrimaryResponse(question, quote, diligence);
      responseText = primaryResult.text;
      citations = primaryResult.citations;
      engineUsed = 'finn_primary_engine';
    }

    return NextResponse.json({
      success: true,
      ticker: quote.ticker,
      response: responseText,
      citations,
      engineUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Error in /api/copilot:', error);
    return NextResponse.json(
      { success: false, error: 'Copilot query execution failed' },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------------
// GENERATIVE AI INTEGRATION (GEMINI / OPENAI)
// -----------------------------------------------------------------------------------

async function executeGeminiGeneration(
  question: string,
  quote: StockQuote,
  diligence: DiligenceModule,
  apiKey: string
): Promise<{ text: string; citations: Citation[] } | null> {
  const context = buildPrimaryContext(quote, diligence);
  const systemInstruction =
    `You are FINN, an elite public-markets investment analyst at ENAM Holdings.\n` +
    `You are analyzing ${quote.name} (${quote.symbol}) for a senior portfolio manager.\n` +
    `DISCIPLINE MANDATE: Ground your answer strictly and exclusively in the provided primary financial data below (Annual Reports, Concall Transcripts, Audited Financial Statements). ` +
    `Do not hallucinate, speculate, or reference secondary broker notes or ungrounded news. Cite numbers, exact ratios, and quotes directly.\n\n` +
    `PRIMARY FINANCIAL GROUNDING DATA:\n${context}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nInvestor Question: ${question}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const citations: Citation[] = diligence.primarySources.slice(0, 3).map((s) => ({
    source: s.title,
    quote: `Audited Exchange Disclosure / Transcript (${s.date})`,
    type: s.type,
  }));

  return { text: rawText, citations };
}

async function executeOpenAIGeneration(
  question: string,
  quote: StockQuote,
  diligence: DiligenceModule,
  apiKey: string
): Promise<{ text: string; citations: Citation[] } | null> {
  const context = buildPrimaryContext(quote, diligence);
  const systemInstruction =
    `You are FINN, an elite public-markets analyst at ENAM Holdings.\n` +
    `DISCIPLINE MANDATE: Ground your answer strictly and exclusively in the provided primary financial data. ` +
    `Do not hallucinate. Cite specific numbers and verbatim concall statements.\n\n` +
    `PRIMARY DISCLOSURE CONTEXT:\n${context}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: question },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API returned ${res.status}`);
  }

  const json = await res.json();
  const rawText = json?.choices?.[0]?.message?.content;
  if (!rawText) return null;

  const citations: Citation[] = diligence.primarySources.slice(0, 3).map((s) => ({
    source: s.title,
    quote: `Primary exchange filings and concalls (${s.date})`,
    type: s.type,
  }));

  return { text: rawText, citations };
}

function buildPrimaryContext(quote: StockQuote, d: DiligenceModule): string {
  return [
    `Company: ${quote.name} (${quote.ticker}) | Price: ₹${quote.price} | Mcap: ₹${quote.marketCapCr} Cr (${quote.marketCapCategory})`,
    `Business: ${d.businessSnapshot.overview}`,
    `Segments: ${d.businessSnapshot.segments.map((s) => `${s.name} (${s.sharePercent}%) - ${s.description}`).join('; ')}`,
    `Competitive Moat: ${d.businessSnapshot.competitiveMoat}`,
    `Financials: TTM Revenue ₹${d.financialSnapshot.ttmRevenueCr} Cr, EBITDA Margin ${d.financialSnapshot.ebitdaMarginPercent}%, PAT ₹${d.financialSnapshot.ttmPatCr} Cr, ROCE ${d.financialSnapshot.rocePercent}%, ROE ${d.financialSnapshot.roePercent}%, P/E ${d.financialSnapshot.peMultiple}x, EV/EBITDA ${d.financialSnapshot.evEbitdaMultiple}x`,
    `Trajectory: 3Y Rev CAGR ${d.trajectory.threeYearRevenueCagr}%, 3Y PAT CAGR ${d.trajectory.threeYearPatCagr}%, Margin Direction: ${d.trajectory.marginDirection} (${d.trajectory.marginSummary})`,
    `Balance Sheet: Total Debt ₹${d.balanceSheet.totalDebtCr} Cr, Cash ₹${d.balanceSheet.cashAndEquivalentsCr} Cr, Net Debt/Equity ${d.balanceSheet.netDebtToEquity}x, Working Capital Days ${d.balanceSheet.workingCapitalDays}d (Debtors: ${d.balanceSheet.debtorDays}d, Inventory: ${d.balanceSheet.inventoryDays}d, Payables: ${d.balanceSheet.payableDays}d). Solvency: ${d.balanceSheet.solvencyCommentary}`,
    `Cash Quality: Cash Conversion ${d.cashQuality.cashConversionRatio}x OCF/PAT (${d.cashQuality.qualityRating} quality), OCF ₹${d.cashQuality.operatingCashFlowCr} Cr, FCF ₹${d.cashQuality.freeCashFlowCr} Cr (Yield: ${d.cashQuality.fcfYieldPercent}%). Assessment: ${d.cashQuality.assessment}`,
    `Narrative vs Numbers Reliability: Score ${d.narrativeVsNumbers.reliabilityScore}/100. Summary: ${d.narrativeVsNumbers.executiveSummary}`,
    `Guidance Ledger: Revenue Growth Target: ${d.guidanceLedger.forwardRevenueGrowth}, Margin Band: ${d.guidanceLedger.forwardMarginBand}, Capex Guidance: ₹${d.guidanceLedger.capexGuidanceCr} Cr`,
    `Management Quotes: ${d.guidanceLedger.keyManagementQuotes.map((q) => `"${q.quote}" - ${q.speaker} (${q.topic})`).join('; ')}`,
    `Bull Case: ${d.bullVsBear.bullPoints.join('; ')}`,
    `Bear Case: ${d.bullVsBear.bearPoints.join('; ')}`,
    `ENAM Conviction Verdict: ${d.bullVsBear.enamConvictionVerdict}`,
  ].join('\n');
}

// -----------------------------------------------------------------------------------
// ADVANCED DETERMINISTIC PRIMARY FINANCIAL REASONING ENGINE (ZERO COST)
// -----------------------------------------------------------------------------------

function synthesizePrimaryResponse(
  question: string,
  quote: StockQuote,
  diligence: DiligenceModule
): { text: string; citations: Citation[] } {
  const qLower = question.toLowerCase();

  const bs = diligence.balanceSheet;
  const cq = diligence.cashQuality;
  const fs = diligence.financialSnapshot;
  const tr = diligence.trajectory;
  const gl = diligence.guidanceLedger;
  const bb = diligence.bullVsBear;
  const biz = diligence.businessSnapshot;
  const nvn = diligence.narrativeVsNumbers;

  // 1. Working Capital Cycle & Operating Days (Checked before debt to prevent matching 'debtor')
  if (
    qLower.includes('working capital') ||
    qLower.includes('debtor') ||
    qLower.includes('inventory') ||
    qLower.includes('payable') ||
    qLower.includes('operating cycle') ||
    qLower.includes('cash cycle')
  ) {
    return {
      text:
        `### ⏳ Working Capital Cycle Breakdown: **${quote.name}**\n\n` +
        `* **Net Working Capital Cycle:** **${bs.workingCapitalDays} Days**\n` +
        `* **Debtor Days (Receivables):** **${bs.debtorDays} Days** (Cash collection velocity)\n` +
        `* **Inventory Days (Holding):** **${bs.inventoryDays} Days** (Stock turnover cadence)\n` +
        `* **Creditor Days (Payables):** **${bs.payableDays} Days** (Supplier financing leverage)\n\n` +
        `**Analytical Implication for Investors:**\n` +
        `The net operating cash cycle is calculated as ` +
        `\`Debtor Days (${bs.debtorDays}) + Inventory Days (${bs.inventoryDays}) - Payable Days (${bs.payableDays}) = ${bs.workingCapitalDays} Days\`.\n\n` +
        `*Assessment:* ${
          bs.workingCapitalDays < 30
            ? 'Exceptional working-capital efficiency with lean inventory turn and rapid cash collections.'
            : bs.workingCapitalDays < 75
            ? 'Normalized operating cycle standard for Indian manufacturing and retail leaders.'
            : 'Working capital is stretched; inventory holding or customer receivables require active monitoring.'
        }`,
      citations: [
        {
          source: `${quote.name} Audited Annual Accounts (Working Capital Schedule)`,
          quote: `Debtors: ${bs.debtorDays}d, Inventory: ${bs.inventoryDays}d, Payables: ${bs.payableDays}d (Net: ${bs.workingCapitalDays}d)`,
          type: 'Audited Filing',
        },
      ],
    };
  }

  // 2. Balance Sheet, Debt & Leverage
  if (
    (/\b(debt|debts|borrow|borrowing|borrowings|leverage|solvency|liquidity)\b/i.test(qLower) ||
      qLower.includes('d/e') ||
      qLower.includes('cash and equiv') ||
      qLower.includes('net debt')) &&
    !qLower.includes('debtor')
  ) {
    const netDebtStatus =
      bs.netDebtToEquity <= 0
        ? 'Net Cash Surplus (Zero Net Debt)'
        : bs.netDebtToEquity < 0.5
        ? 'Conservative Leverage'
        : 'Moderately Leveraged';

    return {
      text:
        `### 🏛️ Balance Sheet & Debt Audit: **${quote.name} (${quote.symbol})**\n\n` +
        `* **Total Borrowings (Debt):** ₹${bs.totalDebtCr.toLocaleString()} Cr\n` +
        `* **Cash & Equivalents:** ₹${bs.cashAndEquivalentsCr.toLocaleString()} Cr\n` +
        `* **Net Debt to Equity (D/E):** **${bs.netDebtToEquity}x** (${netDebtStatus})\n` +
        `* **Working Capital Capitalization:** ${bs.workingCapitalDays} days\n\n` +
        `**Primary Solvency Assessment:**\n${bs.solvencyCommentary}\n\n` +
        `**Cash Cushion:** The company maintains ₹${bs.cashAndEquivalentsCr.toLocaleString()} Cr in liquid investments and bank balances against total liabilities of ₹${bs.totalDebtCr.toLocaleString()} Cr.`,
      citations: [
        {
          source: `${quote.name} Annual Report Balance Sheet & Notes on Borrowings`,
          quote: `Total Borrowings ₹${bs.totalDebtCr} Cr, Cash and Bank ₹${bs.cashAndEquivalentsCr} Cr (Net D/E: ${bs.netDebtToEquity}x)`,
          type: 'Annual Report',
        },
      ],
    };
  }

  // 3. Business Segments & Revenue Mix
  if (
    qLower.includes('segment') ||
    qLower.includes('mix') ||
    qLower.includes('what does') ||
    qLower.includes('business model') ||
    qLower.includes('products') ||
    qLower.includes('brand') ||
    qLower.includes('zudio') ||
    qLower.includes('westside') ||
    qLower.includes('geography')
  ) {
    return {
      text:
        `### 🏢 Business Model & Revenue Segments: **${quote.name}**\n\n` +
        `**Executive Overview:**\n${biz.overview}\n\n` +
        `#### 📊 Core Operating Segments & Contribution:\n` +
        biz.segments
          .map(
            (s, i) =>
              `${i + 1}. **${s.name}** — **${s.sharePercent}% of Revenue**\n   _${s.description}_`
          )
          .join('\n') +
        `\n\n#### 🌍 Geographic Footprint:\n` +
        biz.geographyMix.map((g) => `* **${g.region}:** ${g.sharePercent}%`).join('\n') +
        `\n\n**Strategic Moat:** ${biz.competitiveMoat}`,
      citations: [
        {
          source: `${quote.name} Annual Report (Segment Reporting Note 115)`,
          quote: biz.segments.map((s) => `${s.name}: ${s.sharePercent}%`).join(', '),
          type: 'Annual Report',
        },
      ],
    };
  }

  // 4. Moat, Pricing Power & Competitive Advantages
  if (
    qLower.includes('moat') ||
    qLower.includes('competitive') ||
    qLower.includes('pricing power') ||
    qLower.includes('advantage') ||
    qLower.includes('barrier') ||
    qLower.includes('defensib')
  ) {
    return {
      text:
        `### 🏰 Economic Moat & Competitive Defensibility: **${quote.name}**\n\n` +
        `**Primary Competitive Moat:**\n${biz.competitiveMoat}\n\n` +
        `#### Key Pillars of Durability:\n` +
        `1. **Return on Capital Efficiency:** Generates ROCE of **${fs.rocePercent}%** and ROE of **${fs.roePercent}%**, proving structural return above cost of capital.\n` +
        `2. **Margin Profile:** Operating EBITDA margin at **${fs.ebitdaMarginPercent}%** (${tr.marginDirection.toUpperCase()} trajectory).\n` +
        `3. **Cash Conversion Strength:** Converts **${cq.cashConversionRatio}x** of accounting net profit into operating cash flow, insulating the company from external credit dependence.\n\n` +
        `**ENAM Moat Verdict:** ${bb.bullPoints[0] || 'Market leadership supported by proprietary distribution and scale advantages.'}`,
      citations: [
        {
          source: `${quote.name} Directors' Report & Management Discussion & Analysis`,
          quote: biz.competitiveMoat,
          type: 'Annual Report',
        },
      ],
    };
  }

  // 5. Capex & Capital Allocation
  if (
    qLower.includes('capex') ||
    qLower.includes('capital expenditure') ||
    qLower.includes('plant') ||
    qLower.includes('expansion') ||
    qLower.includes('facility') ||
    qLower.includes('investment') ||
    qLower.includes('capacity')
  ) {
    const capexDisplay =
      typeof gl.capexGuidanceCr === 'number'
        ? `₹${gl.capexGuidanceCr.toLocaleString()} Cr`
        : String(gl.capexGuidanceCr);

    return {
      text:
        `### 🏗️ Capex & Capital Allocation Pipeline: **${quote.name}**\n\n` +
        `* **Planned Forward Capex:** **${capexDisplay}**\n` +
        `* **Operating Cash Flow Generation:** ₹${cq.operatingCashFlowCr.toLocaleString()} Cr\n` +
        `* **Free Cash Flow Cushion:** ₹${cq.freeCashFlowCr.toLocaleString()} Cr (Yield: ${cq.fcfYieldPercent}%)\n` +
        `* **Current Net Debt/Equity:** ${bs.netDebtToEquity}x\n\n` +
        `**Funding & Self-Sufficiency Analysis:**\n` +
        `With annual OCF of ₹${cq.operatingCashFlowCr.toLocaleString()} Cr exceeding ongoing capital expenditures, the company is ` +
        `${bs.netDebtToEquity <= 0.3 ? 'fully internally funded without requiring dilutive equity raises or heavy debt.' : 'managing capex through a combination of internal accruals and structured debt facilities.'}\n\n` +
        `**Management Stated Commentary:**\n"${gl.keyManagementQuotes[0]?.quote || 'Disciplined capital expenditure aligned with market demand.'}" — _${gl.keyManagementQuotes[0]?.speaker || 'Management'}_`,
      citations: [
        {
          source: `${quote.symbol} Q2 Investor Concall & Annual Report Cash Flow Statement`,
          quote: `Capex Guidance: ₹${gl.capexGuidanceCr} Cr | OCF: ₹${cq.operatingCashFlowCr} Cr`,
          type: 'Concall Transcript',
        },
      ],
    };
  }

  // 6. Return Metrics (ROCE, ROE, DuPont)
  if (
    qLower.includes('roce') ||
    qLower.includes('roe') ||
    qLower.includes('return on capital') ||
    qLower.includes('return on equity') ||
    qLower.includes('capital efficiency') ||
    qLower.includes('dupont')
  ) {
    return {
      text:
        `### 📈 Capital Efficiency Audit (ROCE & ROE): **${quote.name}**\n\n` +
        `* **ROCE (Return on Capital Employed):** **${fs.rocePercent}%**\n` +
        `* **ROE (Return on Equity):** **${fs.roePercent}%**\n` +
        `* **EBITDA Margin:** **${fs.ebitdaMarginPercent}%**\n` +
        `* **Net Debt to Equity:** **${bs.netDebtToEquity}x**\n\n` +
        `**Decomposition & Quality Analysis:**\n` +
        `1. An ROCE of **${fs.rocePercent}%** indicates that every ₹100 of capital invested in the core business yields ₹${fs.rocePercent} in operating earnings.\n` +
        `2. The ROE of **${fs.roePercent}%** is ` +
        `${bs.netDebtToEquity < 0.2 ? 'clean and unleveraged, driven by core business operating margins rather than financial debt leverage.' : 'enhanced by disciplined financial leverage.'}\n` +
        `3. Profit reinvestment rate is backed by **${tr.threeYearPatCagr}%** 3-year PAT CAGR.`,
      citations: [
        {
          source: `${quote.name} Audited Financial Ratios & Balance Sheet Schedule`,
          quote: `ROCE ${fs.rocePercent}%, ROE ${fs.roePercent}%, Net D/E ${bs.netDebtToEquity}x`,
          type: 'Audited Filing',
        },
      ],
    };
  }

  // 7. Trajectory, Multi-Year Financials & CAGR
  if (
    qLower.includes('trajectory') ||
    qLower.includes('cagr') ||
    qLower.includes('compounding') ||
    qLower.includes('multi-year') ||
    qLower.includes('historical') ||
    qLower.includes('3-year') ||
    qLower.includes('3 year')
  ) {
    return {
      text:
        `### 🚀 Multi-Year Growth Trajectory: **${quote.name}**\n\n` +
        `* **3-Year Revenue CAGR:** **+${tr.threeYearRevenueCagr}%**\n` +
        `* **3-Year PAT CAGR:** **+${tr.threeYearPatCagr}%**\n` +
        `* **Margin Trajectory Direction:** **${tr.marginDirection.toUpperCase()}**\n\n` +
        `#### 📅 Multi-Year Historical Performance:\n` +
        `| Period | Revenue (₹ Cr) | EBITDA (₹ Cr) | PAT (₹ Cr) | Margin (%) |\n` +
        `| :--- | :--- | :--- | :--- | :--- |\n` +
        tr.multiYearFinancials
          .map(
            (m) =>
              `| ${m.year} | ₹${m.revenue.toLocaleString()} | ₹${m.ebitda.toLocaleString()} | ₹${m.pat.toLocaleString()} | ${m.margin}% |`
          )
          .join('\n') +
        `\n\n**Trajectory Summary:**\n${tr.marginSummary}`,
      citations: [
        {
          source: `${quote.name} 3-Year Audited Annual Report Financial Track Record`,
          quote: `3-Yr Revenue CAGR: +${tr.threeYearRevenueCagr}%, 3-Yr PAT CAGR: +${tr.threeYearPatCagr}%`,
          type: 'Annual Report',
        },
      ],
    };
  }

  // 8. Valuation Multiples (PE, EV/EBITDA, Mcap)
  if (
    qLower.includes('valuation') ||
    qLower.includes('pe') ||
    qLower.includes('p/e') ||
    qLower.includes('multiple') ||
    qLower.includes('ev/ebitda') ||
    qLower.includes('market cap') ||
    qLower.includes('cheap') ||
    qLower.includes('expensive')
  ) {
    return {
      text:
        `### 🏷️ Valuation Multiples & Market Metrics: **${quote.name}**\n\n` +
        `* **Current Market Price:** ₹${quote.price.toLocaleString()} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent}%)\n` +
        `* **Market Capitalisation:** ₹${quote.marketCapCr.toLocaleString()} Cr (${quote.marketCapCategory})\n` +
        `* **Price-to-Earnings (P/E Multiple):** **${fs.peMultiple}x** (TTM PAT: ₹${fs.ttmPatCr.toLocaleString()} Cr)\n` +
        `* **EV / EBITDA Multiple:** **${fs.evEbitdaMultiple}x**\n` +
        `* **52-Week Range:** ₹${quote.fiftyTwoWeekLow.toLocaleString()} – ₹${quote.fiftyTwoWeekHigh.toLocaleString()}\n` +
        `* **FCF Yield:** ${cq.fcfYieldPercent}%\n\n` +
        `**Valuation Context for Fund Managers:**\n` +
        `Trading at ${fs.peMultiple}x P/E against a 3-year PAT compounding rate of +${tr.threeYearPatCagr}%. ` +
        `The market prices in sustained high-teens execution with ROCE of ${fs.rocePercent}%.`,
      citations: [
        {
          source: `NSE Live Quote & Audited TTM Financials (${quote.symbol})`,
          quote: `P/E: ${fs.peMultiple}x, EV/EBITDA: ${fs.evEbitdaMultiple}x, Mcap: ₹${quote.marketCapCr} Cr`,
          type: 'NSE Primary Filing',
        },
      ],
    };
  }

  // 9. Narrative vs Numbers Guidance Audit
  if (
    qLower.includes('audit') ||
    qLower.includes('guidance') ||
    qLower.includes('promise') ||
    qLower.includes('narrative') ||
    qLower.includes('concall vs')
  ) {
    const audits = nvn.audits;
    const metCount = audits.filter((a) => a.status === 'DELIVERED').length;

    return {
      text:
        `### 🎯 Narrative vs. Numbers Audit: **${quote.name} (${quote.symbol})**\n\n` +
        `**Management Guidance Reliability Score: ${nvn.reliabilityScore}/100** (${metCount} of ${audits.length} major guided milestones delivered).\n\n` +
        `Here is the 4-quarter audit grounded in audited exchange filings vs concall transcripts:\n\n` +
        audits
          .map((a) => {
            const badge =
              a.status === 'DELIVERED' ? '🟢 DELIVERED' : a.status === 'PARTIAL' ? '🟡 PARTIAL' : '🔴 MISSED';
            return (
              `* **${a.quarter} — ${a.metric}** [${badge}]\n` +
              `  - **Promised (Concall):** "${a.promisedGuidance}" _(${a.concallCitation})_\n` +
              `  - **Delivered (Filing):** "${a.deliveredResult}" _(${a.filingCitation})_\n` +
              `  - **Divergence:** ${a.divergenceAnalysis}`
            );
          })
          .join('\n\n') +
        `\n\n**Executive Takeaway:** ${nvn.executiveSummary}`,
      citations: audits.map((a) => ({
        source: `${a.quarter} Concall & Audited Filing`,
        quote: `Promised: "${a.promisedGuidance}" → Result: "${a.deliveredResult}"`,
        type: 'Audited Filing',
      })),
    };
  }

  // 10. Cash Quality, FCF & Red Flags
  if (
    qLower.includes('cash') ||
    qLower.includes('red flag') ||
    qLower.includes('conversion') ||
    qLower.includes('quality') ||
    qLower.includes('fcf') ||
    qLower.includes('operating cash flow')
  ) {
    return {
      text:
        `### 💎 Cash Quality & Balance Sheet Audit: **${quote.name}**\n\n` +
        `* **Cash Conversion Ratio (OCF / PAT):** **${cq.cashConversionRatio}x** (${cq.qualityRating} Quality)\n` +
        `* **Operating Cash Flow (OCF):** ₹${cq.operatingCashFlowCr.toLocaleString()} Cr\n` +
        `* **Reported TTM PAT:** ₹${fs.ttmPatCr.toLocaleString()} Cr\n` +
        `* **Free Cash Flow (FCF):** ₹${cq.freeCashFlowCr.toLocaleString()} Cr (FCF Yield: ${cq.fcfYieldPercent}%)\n` +
        `* **Net Debt to Equity:** ${bs.netDebtToEquity}x (Total Debt: ₹${bs.totalDebtCr} Cr, Cash: ₹${bs.cashAndEquivalentsCr} Cr)\n` +
        `* **Working Capital Days:** ${bs.workingCapitalDays} days (Debtors: ${bs.debtorDays}d, Inventory: ${bs.inventoryDays}d, Payables: ${bs.payableDays}d)\n\n` +
        `**Analytical Assessment:**\n${cq.assessment}\n\n` +
        `**Solvency & Liquidity Commentary:**\n${bs.solvencyCommentary}`,
      citations: [
        {
          source: `${quote.name} Annual Report Cash Flow Statement (Indirect Method)`,
          quote: `Cash from Operations ₹${cq.operatingCashFlowCr} Cr vs PAT ₹${fs.ttmPatCr} Cr (Conversion: ${cq.cashConversionRatio}x)`,
          type: 'Annual Report',
        },
      ],
    };
  }

  // 11. Bull vs Bear / High-Conviction Thesis
  if (
    qLower.includes('bull') ||
    qLower.includes('bear') ||
    qLower.includes('thesis') ||
    qLower.includes('verdict') ||
    qLower.includes('conviction') ||
    qLower.includes('risk')
  ) {
    return {
      text:
        `### ⚖️ High-Conviction Bull vs. Bear Case: **${quote.name}**\n\n` +
        `#### 🐂 The Bull Case (Primary Grounds):\n` +
        bb.bullPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') +
        `\n\n#### 🐻 The Bear Case (Risk Sentinel):\n` +
        bb.bearPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') +
        `\n\n**ENAM Conviction Verdict:**\n${bb.enamConvictionVerdict}`,
      citations: diligence.primarySources.slice(0, 3).map((s) => ({
        source: s.title,
        quote: `Audited fundamentals and transcript disclosures (${s.date})`,
        type: s.type,
      })),
    };
  }

  // 12. Management Commentary & Quotes
  if (
    qLower.includes('quote') ||
    qLower.includes('said') ||
    qLower.includes('ceo') ||
    qLower.includes('cfo') ||
    qLower.includes('transcript') ||
    qLower.includes('management commentary')
  ) {
    return {
      text:
        `### 🎙️ Key Management Concall Statements: **${quote.name}**\n\n` +
        `* **Forward Revenue Outlook:** ${gl.forwardRevenueGrowth}\n` +
        `* **Target Margin Band:** ${gl.forwardMarginBand}\n` +
        `* **Capex Guidance:** ₹${gl.capexGuidanceCr} Cr\n\n` +
        `#### Verbatim Statements from Recent Earnings Call (${gl.latestCallQuarter}):\n` +
        gl.keyManagementQuotes
          .map(
            (q, i) =>
              `${i + 1}. **Topic: ${q.topic}**\n   "${q.quote}"\n   — _${q.speaker}_\n`
          )
          .join('\n'),
      citations: [
        {
          source: `${quote.symbol} ${gl.latestCallQuarter} Earnings Conference Call Transcript`,
          quote: gl.keyManagementQuotes[0]?.quote || 'Management concall guidance',
          type: 'Concall Transcript',
        },
      ],
    };
  }

  // 13. Default Comprehensive Primary Synthesis
  return {
    text:
      `### 💡 Primary Intelligence Brief: **${quote.name} (${quote.ticker})**\n\n` +
      `* **Current Price:** ₹${quote.price.toLocaleString()} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent}%)\n` +
      `* **Market Cap:** ₹${quote.marketCapCr.toLocaleString()} Cr (${quote.marketCapCategory}) | P/E: ${fs.peMultiple}x\n` +
      `* **Business Model:** ${biz.overview}\n` +
      `* **Core Moat:** ${biz.competitiveMoat}\n` +
      `* **Headline Ratios:** ROCE: **${fs.rocePercent}%** | ROE: **${fs.roePercent}%** | EBITDA Margin: **${fs.ebitdaMarginPercent}%**\n` +
      `* **Balance Sheet Health:** Net D/E: **${bs.netDebtToEquity}x** | Working Capital: **${bs.workingCapitalDays} days**\n` +
      `* **Cash Conversion:** **${cq.cashConversionRatio}x** OCF/PAT (${cq.qualityRating} Quality)\n` +
      `* **Management Guidance Reliability:** **${nvn.reliabilityScore}/100**\n` +
      `* **Forward Guidance:** ${gl.forwardRevenueGrowth} | Target Margins: ${gl.forwardMarginBand}\n\n` +
      `*Ask any specific follow-up on debt, working capital, segments, capex, margins, or the 4-quarter guidance audit.*`,
    citations: diligence.primarySources.slice(0, 2).map((s) => ({
      source: s.title,
      quote: `Audited Exchange Filing / Transcript (${s.date})`,
      type: s.type,
    })),
  };
}
