// API Route: /api/copilot (FINN Intelligent Agent Copilot)
import { NextResponse } from 'next/server';
import { getCompanyDiligence } from '@/lib/primaryAnalyzer';
import { getLiveStockQuote } from '@/lib/yfinance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, ticker = 'TRENT.NS' } = body;

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question required' }, { status: 400 });
    }

    const [diligence, quote] = await Promise.all([
      getCompanyDiligence(ticker),
      getLiveStockQuote(ticker),
    ]);

    const qLower = question.toLowerCase();
    let responseText = '';
    let citations: Array<{ source: string; quote: string; type: string }> = [];

    // 1. Audit / Guidance vs Numbers query
    if (qLower.includes('audit') || qLower.includes('guidance') || qLower.includes('promise') || qLower.includes('narrative')) {
      const audits = diligence.narrativeVsNumbers.audits;
      const metCount = audits.filter((a) => a.status === 'DELIVERED').length;
      const reliability = diligence.narrativeVsNumbers.reliabilityScore;

      responseText = `### 🎯 Narrative vs. Numbers Audit: **${quote.name} (${quote.symbol})**\n\n` +
        `**Management Guidance Reliability Score: ${reliability}/100** (${metCount} of ${audits.length} major guided milestones delivered).\n\n` +
        `Here is the 4-quarter audit grounded in audited exchange filings vs concall transcripts:\n\n` +
        audits.map((a) => {
          const badge = a.status === 'DELIVERED' ? '🟢 DELIVERED' : a.status === 'PARTIAL' ? '🟡 PARTIAL' : '🔴 MISSED';
          return `* **${a.quarter} — ${a.metric}** [${badge}]\n` +
                 `  - **Promised (Concall):** "${a.promisedGuidance}" _(${a.concallCitation})_\n` +
                 `  - **Delivered (Filing):** "${a.deliveredResult}" _(${a.filingCitation})_\n` +
                 `  - **Divergence:** ${a.divergenceAnalysis}`;
        }).join('\n\n') +
        `\n\n**Key Takeaway for Investors:** ${diligence.narrativeVsNumbers.executiveSummary}`;

      citations = audits.map((a) => ({
        source: `${a.quarter} Concall & Audited Filing`,
        quote: `${a.promisedGuidance} → Result: ${a.deliveredResult}`,
        type: 'Primary Primary Filing',
      }));
    }
    // 2. Cash Quality & Red Flags query
    else if (qLower.includes('cash') || qLower.includes('red flag') || qLower.includes('conversion') || qLower.includes('quality') || qLower.includes('fcf')) {
      const cq = diligence.cashQuality;
      const bs = diligence.balanceSheet;

      responseText = `### 💎 Cash Quality & Balance Sheet Audit: **${quote.name}**\n\n` +
        `* **Cash Conversion Ratio (OCF / PAT):** **${cq.cashConversionRatio}x** (${cq.qualityRating} Quality)\n` +
        `* **Operating Cash Flow (OCF):** ₹${cq.operatingCashFlowCr.toLocaleString()} Cr\n` +
        `* **Reported TTM PAT:** ₹${diligence.financialSnapshot.ttmPatCr.toLocaleString()} Cr\n` +
        `* **Free Cash Flow (FCF):** ₹${cq.freeCashFlowCr.toLocaleString()} Cr (FCF Yield: ${cq.fcfYieldPercent}%)\n` +
        `* **Net Debt to Equity:** ${bs.netDebtToEquity}x (Total Debt: ₹${bs.totalDebtCr} Cr, Cash: ₹${bs.cashAndEquivalentsCr} Cr)\n` +
        `* **Working Capital Days:** ${bs.workingCapitalDays} days (Debtors: ${bs.debtorDays}d, Inventory: ${bs.inventoryDays}d, Payables: ${bs.payableDays}d)\n\n` +
        `**Analytical Assessment:** ${cq.assessment}\n\n` +
        `**Solvency & Liquidity Commentary:** ${bs.solvencyCommentary}`;

      citations = [
        {
          source: `${quote.name} Annual Report Cash Flow Statement (Indirect Method)`,
          quote: `Cash from Operations ₹${cq.operatingCashFlowCr} Cr vs PAT ₹${diligence.financialSnapshot.ttmPatCr} Cr`,
          type: 'Annual Report',
        },
      ];
    }
    // 3. Margin & Headline Results query
    else if (qLower.includes('margin') || qLower.includes('headline') || qLower.includes('results') || qLower.includes('q2') || qLower.includes('ebitda')) {
      const fs = diligence.financialSnapshot;
      const tr = diligence.trajectory;

      responseText = `### 📊 Headline Financials & Margin Trajectory: **${quote.name}**\n\n` +
        `* **TTM Revenue:** ₹${fs.ttmRevenueCr.toLocaleString()} Cr (3-Yr CAGR: ${tr.threeYearRevenueCagr}%)\n` +
        `* **EBITDA Margin:** **${fs.ebitdaMarginPercent}%** (Direction: **${tr.marginDirection.toUpperCase()}**)\n` +
        `* **TTM PAT:** ₹${fs.ttmPatCr.toLocaleString()} Cr (3-Yr CAGR: ${tr.threeYearPatCagr}%)\n` +
        `* **ROCE:** ${fs.rocePercent}% | **ROE:** ${fs.roePercent}%\n` +
        `* **Valuation Multiples:** P/E: ${fs.peMultiple}x | EV/EBITDA: ${fs.evEbitdaMultiple}x\n\n` +
        `**Margin Trajectory Context:** ${tr.marginSummary}\n\n` +
        `**Forward Margin Guidance:** ${diligence.guidanceLedger.forwardMarginBand}`;

      citations = [
        {
          source: `${quote.symbol} Q2 Financial Results (BSE/NSE Filing)`,
          quote: `EBITDA Margin ${fs.ebitdaMarginPercent}%, ROCE ${fs.rocePercent}%`,
          type: 'Exchange Filing',
        },
      ];
    }
    // 4. Bull vs Bear / Investment Thesis query
    else if (qLower.includes('bull') || qLower.includes('bear') || qLower.includes('verdict') || qLower.includes('thesis')) {
      const bb = diligence.bullVsBear;

      responseText = `### ⚖️ High-Conviction Bull vs. Bear Case: **${quote.name}**\n\n` +
        `#### 🐂 The Bull Case (Primary Grounds):\n` +
        bb.bullPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') +
        `\n\n#### 🐻 The Bear Case (Risk Sentinel):\n` +
        bb.bearPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') +
        `\n\n**ENAM Conviction Verdict:** ${bb.enamConvictionVerdict}`;

      citations = diligence.primarySources.map((s) => ({
        source: s.title,
        quote: `Audited fundamentals and transcript disclosures (${s.date})`,
        type: s.type,
      }));
    }
    // 5. Default General / Contextual Investor query
    else {
      responseText = `### 💡 Primary Intelligence Brief: **${quote.name} (${quote.ticker})**\n\n` +
        `* **Current Market Price:** ₹${quote.price.toLocaleString()} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent}%)\n` +
        `* **Market Cap:** ₹${quote.marketCapCr.toLocaleString()} Cr (${quote.marketCapCategory})\n` +
        `* **Business Model:** ${diligence.businessSnapshot.overview}\n` +
        `* **Core Moat:** ${diligence.businessSnapshot.competitiveMoat}\n` +
        `* **Cash Conversion Quality:** ${diligence.cashQuality.cashConversionRatio}x OCF/PAT (${diligence.cashQuality.qualityRating})\n` +
        `* **Forward Guidance:** ${diligence.guidanceLedger.forwardRevenueGrowth} | Margin target: ${diligence.guidanceLedger.forwardMarginBand}\n\n` +
        `*All analysis strictly grounded in primary annual reports and quarterly concall transcripts.*`;

      citations = diligence.primarySources.slice(0, 2).map((s) => ({
        source: s.title,
        quote: `Exchange disclosure dated ${s.date}`,
        type: s.type,
      }));
    }

    return NextResponse.json({
      success: true,
      ticker: quote.ticker,
      response: responseText,
      citations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/copilot:', error);
    return NextResponse.json(
      { success: false, error: 'Copilot query execution failed' },
      { status: 500 }
    );
  }
}
