// Automated End-to-End Test Suite for FINN (ENAM Challenge)

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING FINN AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function assertTest(name: string, fn: () => Promise<void>) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err: any) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  // TEST 1: Homepage renders HTML
  await assertTest('Homepage UI HTML renders (200 OK)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const html = await res.text();
    if (!html.includes('FINN')) throw new Error('HTML does not contain FINN');
  });

  // TEST 2: Portfolio API returns 18 stocks
  await assertTest('/api/portfolio returns portfolio quotes', async () => {
    const res = await fetch(`${BASE_URL}/api/portfolio`);
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('API returned success=false');
    if (!json.data || json.data.length < 18) throw new Error(`Expected at least 18 stocks, got ${json.data?.length}`);
    const reliance = json.data.find((q: any) => q.symbol === 'RELIANCE');
    if (!reliance || !reliance.price) throw new Error('RELIANCE quote missing price');
  });

  // TEST 3: Push Feed 24-Hour window & Materiality Filtering
  await assertTest('/api/announcements respects 24h window & collapses routine', async () => {
    const res = await fetch(`${BASE_URL}/api/announcements?windowHours=24&onlyMaterial=true`);
    const json = await res.json();
    if (!json.success) throw new Error('API failed');
    if (json.collapsedRoutineCount <= 0) throw new Error('Expected routine filings to be collapsed');
    const hasResults = json.data.some((a: any) => a.category === 'results');
    if (!hasResults) throw new Error('Expected results filing in 24h window');
  });

  // TEST 4: Push Feed 30-Day window with routine included
  await assertTest('/api/announcements 30d window includes full history', async () => {
    const res = await fetch(`${BASE_URL}/api/announcements?windowHours=720&onlyMaterial=false`);
    const json = await res.json();
    if (json.data.length < 10) throw new Error(`Expected 10+ announcements in 30d, got ${json.data.length}`);
    if (json.collapsedRoutineCount !== 0) throw new Error('Collapsed count should be 0 when onlyMaterial=false');
  });

  // TEST 5: Quarterly Results Headline Extraction (Revenue, EBITDA, PBT, PAT)
  await assertTest('Results filing contains 4-box metric grid with QoQ/YoY margins', async () => {
    const res = await fetch(`${BASE_URL}/api/announcements?windowHours=720&category=results`);
    const json = await res.json();
    const trentResult = json.data.find((a: any) => a.results);
    if (!trentResult) throw new Error('Results card missing');
    const r = trentResult.results;
    if (typeof r.revenue !== 'number' || typeof r.ebitda !== 'number' || typeof r.pbt !== 'number' || typeof r.pat !== 'number') {
      throw new Error('Missing headline figures in results grid');
    }
    if (typeof r.revenueYoY !== 'number' || typeof r.ebitdaMargin !== 'number') {
      throw new Error('Missing YoY or margin figures');
    }
  });

  // TEST 6: Management Change Bio Enrichment
  await assertTest('Management change filing includes enriched executive pedigree', async () => {
    const res = await fetch(`${BASE_URL}/api/announcements?windowHours=720&category=management_change`);
    const json = await res.json();
    const mgmt = json.data.find((a: any) => a.managementChange);
    if (!mgmt) throw new Error('Management change card missing');
    const mc = mgmt.managementChange;
    if (!mc.personName || !mc.priorCompany || !mc.bio || !mc.significance) {
      throw new Error('Management change missing enriched bio or pedigree');
    }
  });

  // TEST 7: Pull Diligence 8 Modules for TRENT
  await assertTest('/api/research returns 8 grounded diligence modules for TRENT.NS', async () => {
    const res = await fetch(`${BASE_URL}/api/research?ticker=TRENT.NS`);
    const json = await res.json();
    if (!json.success) throw new Error('Failed to retrieve diligence');
    const d = json.diligence;

    // Check all 8 modules exist
    if (!d.businessSnapshot?.segments?.length) throw new Error('Module 1 (Business) missing');
    if (!d.financialSnapshot?.ttmRevenueCr) throw new Error('Module 2 (Financials) missing');
    if (!d.trajectory?.multiYearFinancials?.length) throw new Error('Module 3 (Trajectory) missing');
    if (typeof d.balanceSheet?.netDebtToEquity !== 'number') throw new Error('Module 4 (Balance Sheet) missing');
    if (typeof d.cashQuality?.cashConversionRatio !== 'number') throw new Error('Module 5 (Cash Quality) missing');
    if (!d.narrativeVsNumbers?.audits?.length) throw new Error('Module 6 (Narrative vs Numbers) missing');
    if (!d.guidanceLedger?.keyManagementQuotes?.length) throw new Error('Module 7 (Guidance Ledger) missing');
    if (!d.bullVsBear?.bullPoints?.length || !d.bullVsBear?.bearPoints?.length) throw new Error('Module 8 (Bull vs Bear) missing');
  });

  // TEST 8: Narrative vs. Numbers 4-Quarter Promise vs. Delivery
  await assertTest('Narrative vs Numbers has 4-quarter audits with concall vs filing citations', async () => {
    const res = await fetch(`${BASE_URL}/api/research?ticker=TRENT.NS`);
    const json = await res.json();
    const audits = json.diligence.narrativeVsNumbers.audits;
    if (audits.length < 4) throw new Error(`Expected at least 4 audits, found ${audits.length}`);
    for (const audit of audits) {
      if (!audit.promisedGuidance || !audit.concallCitation) throw new Error('Missing concall guidance citation');
      if (!audit.deliveredResult || !audit.filingCitation) throw new Error('Missing filing delivery citation');
      if (!['DELIVERED', 'PARTIAL', 'MISSED'].includes(audit.status)) throw new Error(`Invalid status: ${audit.status}`);
    }
  });

  // TEST 9: Generalization on an Ad-hoc Company (TITAN.NS)
  await assertTest('Generalization: On-demand research works for ad-hoc ticker (TITAN.NS)', async () => {
    const res = await fetch(`${BASE_URL}/api/research?ticker=TITAN.NS`);
    const json = await res.json();
    if (!json.success) throw new Error('Ad-hoc research failed');
    if (!json.quote.price) throw new Error('Missing price for TITAN.NS');
    if (json.diligence.narrativeVsNumbers.audits.length === 0) throw new Error('Missing audits for TITAN.NS');
  });

  // TEST 10: Generalization on an Arbitrary Unseen NSE Ticker (HAL.NS)
  await assertTest('Generalization: Dynamically generates diligence for unseen ticker (HAL.NS)', async () => {
    const res = await fetch(`${BASE_URL}/api/research?ticker=HAL.NS`);
    const json = await res.json();
    if (!json.success) throw new Error('Dynamic generation failed');
    if (!json.quote.name.includes('Hindustan Aeronautics') && !json.quote.ticker.includes('HAL')) {
      throw new Error(`Unexpected name: ${json.quote.name}`);
    }
    if (json.diligence.financialSnapshot.ttmRevenueCr <= 0) throw new Error('Invalid revenue generated');
  });

  // TEST 11: Copilot Q&A with Primary Citations
  await assertTest('Copilot POST answers guidance audit query with citations', async () => {
    const res = await fetch(`${BASE_URL}/api/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Audit the last 4 quarters of guidance vs reality', ticker: 'TRENT.NS' }),
    });
    const json = await res.json();
    if (!json.success) throw new Error('Copilot failed');
    if (!json.response.includes('Narrative vs. Numbers Audit')) throw new Error('Response did not contain audit title');
    if (!json.citations || json.citations.length === 0) throw new Error('Missing primary citations');
  });

  // TEST 12: Search Autocomplete
  await assertTest('/api/search finds companies by symbol and keyword', async () => {
    const res = await fetch(`${BASE_URL}/api/search?q=zom`);
    const json = await res.json();
    if (!json.success) throw new Error('Search failed');
    const zomato = json.results.find((r: any) => r.symbol === 'ZOMATO');
    if (!zomato) throw new Error('Failed to find ZOMATO in search');
  });

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
