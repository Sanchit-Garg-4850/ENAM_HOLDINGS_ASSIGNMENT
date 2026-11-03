// Primary Corporate Disclosures & Windowed Push Announcements Dataset
import { Announcement } from '../lib/types';

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  // 1. TRENT: Quarterly Results (Within last 24h - Tier 1 Urgent)
  {
    id: 'ann-trent-q2-results',
    ticker: 'TRENT.NS',
    companyName: 'Trent Ltd',
    timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    publishedAt: '2h ago',
    hoursAgo: 2.5,
    category: 'results',
    tier: 'tier1_urgent',
    headline: 'Financial Results for Q2 FY25 (Unaudited Standalone & Consolidated)',
    oneLineTakeaway: 'Zudio store additions power 39.4% YoY revenue growth; EBITDA margin remains robust at 16.4%.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/TRENT_07112024143212_FinancialResults.pdf',
    results: {
      quarter: 'Q2 FY25',
      periodEnded: 'September 30, 2024',
      revenue: 4156.7,
      revenueQoQ: 1.2,
      revenueYoY: 39.4,
      ebitda: 681.7,
      ebitdaMargin: 16.4,
      ebitdaQoQ: 4.8,
      ebitdaYoY: 46.1,
      pbt: 472.3,
      pbtQoQ: 3.5,
      pbtYoY: 48.9,
      pat: 335.1,
      patMargin: 8.1,
      patQoQ: -0.8,
      patYoY: 46.9,
      keyTakeaway: 'Revenue ₹4,157 Cr (+39.4% YoY) led by 43 net new Zudio stores; Star Bazaar formats crossed breakeven.',
    },
  },

  // 2. DIXON: Management Change - Incoming CFO (Enriched Bio - Tier 1 Urgent)
  {
    id: 'ann-dixon-mgmt-cfo',
    ticker: 'DIXON.NS',
    companyName: 'Dixon Technologies (India) Ltd',
    timestamp: new Date(Date.now() - 4.0 * 3600 * 1000).toISOString(),
    publishedAt: '4h ago',
    hoursAgo: 4.0,
    category: 'management_change',
    tier: 'tier1_urgent',
    headline: 'Appointment of Chief Financial Officer (Key Managerial Personnel)',
    oneLineTakeaway: 'Former Havells India VP Finance appointed new CFO following planned retirement of Saurabh Gupta.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/DIXON_07112024121544_KMP_Change.pdf',
    managementChange: {
      personName: 'Ramesh Krishnamurthy',
      role: 'Chief Financial Officer & Key Managerial Personnel',
      changeType: 'incoming',
      effectiveDate: 'December 1, 2024',
      priorCompany: 'Havells India (VP Finance & Treasury)',
      education: 'Chartered Accountant (ICAI, All India Rank 14), B.Com (Hons) SRCC Delhi',
      experienceYears: 24,
      bio: '24+ years in manufacturing & consumer electronics treasury. Previously spearheaded supply-chain financing and working-capital optimization at Havells and Philips Electronics India.',
      significance: 'Brings high-caliber working capital discipline crucial for EMS low-margin, high-turnover business models.',
    },
  },

  // 3. RELIANCE: Mega Capex - Solar Giga-factory (Tier 1 Urgent - Capex)
  {
    id: 'ann-ril-solar-capex',
    ticker: 'RELIANCE.NS',
    companyName: 'Reliance Industries Ltd',
    timestamp: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
    publishedAt: '5h ago',
    hoursAgo: 5.5,
    category: 'capex',
    tier: 'tier1_urgent',
    headline: 'Board Approves ₹12,500 Crore Phase-1 Integrated 10GW Solar PV Giga-Factory & Battery Storage Capex',
    oneLineTakeaway: 'Dhirubhai Ambani Green Energy Complex reaches commercial execution; first 10GW solar cell and module line to commission in H1 2025.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/RELIANCE_07112024101500_GreenEnergyCapex.pdf',
    capexDetails: {
      projectType: 'Integrated Solar PV & Battery Giga-Factory',
      investmentAmountCr: 12500,
      location: 'Jamnagar, Gujarat',
      capacityAddition: '10 GW Solar Photovoltaic Modules & 10 GWh Battery Pack Assembly',
      targetCompletion: 'Q2 FY26',
      strategicRationale: 'Captive supply for green hydrogen and internal decarbonization, reducing annual energy costs by ₹4,200 Cr while enabling green ammonia exports.',
    },
  },

  // 4. KAYNES: Volume & Price Anomaly Alert (Tier 1 Triggered)
  {
    id: 'ann-kaynes-anomaly',
    ticker: 'KAYNES.NS',
    companyName: 'Kaynes Technology India Ltd',
    timestamp: new Date(Date.now() - 6.5 * 3600 * 1000).toISOString(),
    publishedAt: '6h ago',
    hoursAgo: 6.5,
    category: 'press_release',
    tier: 'tier1_urgent',
    headline: 'EOD Anomaly: Unusual Trading Volume Spike (3.4x 20-DMA) with +5.8% Gain',
    oneLineTakeaway: 'Heavy institutional buying follows Gujarat semiconductor OSAT plant environmental clearance.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/KAYNES_07112024103000_PressRelease.pdf',
    anomaly: {
      type: 'both',
      volumeSpikeRatio: 3.42,
      priceChangePercent: 5.82,
      currentVolume: 1845200,
      avgVolume20d: 539500,
      currentPrice: 4890.0,
      headline: 'Traded volume surged to 1.85M shares (3.42x 20-day avg) with clean price breakout above ₹4,800 resistance.',
    },
  },

  // 5. POLYCAB: Major Capex Approval - Halol EHV Plant (Tier 2 Material - Capex)
  {
    id: 'ann-polycab-capex',
    ticker: 'POLYCAB.NS',
    companyName: 'Polycab India Ltd',
    timestamp: new Date(Date.now() - 8.5 * 3600 * 1000).toISOString(),
    publishedAt: '8h ago',
    hoursAgo: 8.5,
    category: 'capex',
    tier: 'tier2_material',
    headline: 'Board Approves ₹1,100 Crore Green-Field EHV Cable Manufacturing Plant in Halol, Gujarat',
    oneLineTakeaway: 'Expands into high-margin 550kV Extra High Voltage power cables targeting national grid transmission utilities.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/POLYCAB_07112024093012_CapexApproval.pdf',
    capexDetails: {
      projectType: 'Extra High Voltage (550kV) Power Cable Manufacturing',
      investmentAmountCr: 1100,
      location: 'Halol, Gujarat',
      capacityAddition: '+35% EHV Transmission Line Capacity',
      targetCompletion: 'Q3 FY26',
      strategicRationale: 'Capitalizes on ₹2.8 Lakh Cr national grid transmission capex by Power Grid & private utilities with 22%+ operating margins.',
    },
  },

  // 6. TRENT: Supply Chain & Fulfillment Capex (Tier 2 Material - Capex)
  {
    id: 'ann-trent-logistics-capex',
    ticker: 'TRENT.NS',
    companyName: 'Trent Ltd',
    timestamp: new Date(Date.now() - 12.0 * 3600 * 1000).toISOString(),
    publishedAt: '12h ago',
    hoursAgo: 12.0,
    category: 'capex',
    tier: 'tier2_material',
    headline: 'Board Sanctions ₹450 Crore Automated Central Logistics & Sorting Facility in Navi Mumbai',
    oneLineTakeaway: 'Quadruples weekly replenishment throughput for Westside & Zudio stores across Western and Southern India.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/TRENT_06112024160000_CapexSanction.pdf',
    capexDetails: {
      projectType: 'Automated Central Logistics & Sorting Facility',
      investmentAmountCr: 450,
      location: 'Navi Mumbai, Maharashtra',
      capacityAddition: '550,000 sq ft High-Density Automated Storage & Sortation',
      targetCompletion: 'Q4 FY25',
      strategicRationale: 'Compresses store inventory turn cycle from 18 to 11 days, supporting rapid 200+ annual store additions without stockouts.',
    },
  },

  // 7. RELIANCE: M&A / JV Announcement (Tier 1 Urgent)
  {
    id: 'ann-ril-merger',
    ticker: 'RELIANCE.NS',
    companyName: 'Reliance Industries Ltd',
    timestamp: new Date(Date.now() - 15.0 * 3600 * 1000).toISOString(),
    publishedAt: '15h ago',
    hoursAgo: 15.0,
    category: 'M&A',
    tier: 'tier1_urgent',
    headline: 'Completion of Strategic Media Joint Venture with The Walt Disney Company',
    oneLineTakeaway: 'Formed ₹70,352 Cr entertainment giant; Viacom18 holds 46.82%, Digital18 16.34%, Disney 36.84%.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/RELIANCE_06112024183022_DisneyJV_Completion.pdf',
  },

  // 8. DIXON: PLI Component Manufacturing Expansion (Tier 2 Material - Capex)
  {
    id: 'ann-dixon-pli-capex',
    ticker: 'DIXON.NS',
    companyName: 'Dixon Technologies (India) Ltd',
    timestamp: new Date(Date.now() - 18.0 * 3600 * 1000).toISOString(),
    publishedAt: '18h ago',
    hoursAgo: 18.0,
    category: 'capex',
    tier: 'tier2_material',
    headline: 'Investment of ₹320 Crore under PLI Scheme for Precision Smartphone Mechanics & Display Modules',
    oneLineTakeaway: 'Expands backward integration into mechanical housings and display assemblies, boosting EMS EBITDA margins by 80 bps.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/DIXON_06112024110000_PLI_Capex.pdf',
    capexDetails: {
      projectType: 'Precision Electronics Mechanics & Display Sub-Assemblies',
      investmentAmountCr: 320,
      location: 'Sector 68, Noida, Uttar Pradesh',
      capacityAddition: '35 Million Annual Phone Mechanical Enclosures',
      targetCompletion: 'Q1 FY26',
      strategicRationale: 'Increases domestic value addition from 14% to 28%, capturing high-margin Tier-1 global smartphone anchor contracts.',
    },
  },

  // 9. Routine Paperwork 1: TCS ESOP Allotment (Tier 3 - Noise / Hidden by Default)
  {
    id: 'ann-tcs-esop',
    ticker: 'TCS.NS',
    companyName: 'Tata Consultancy Services Ltd',
    timestamp: new Date(Date.now() - 19.5 * 3600 * 1000).toISOString(),
    publishedAt: '20h ago',
    hoursAgo: 19.5,
    category: 'unclassified',
    tier: 'tier3_routine',
    headline: 'Allotment of 14,250 Equity Shares under Employee Stock Option Scheme',
    oneLineTakeaway: 'Routine equity allotment under ESOP 2021; equity capital marginally expands by ₹14,250.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/TCS_06112024171000_ESOP.pdf',
  },

  // 10. Routine Paperwork 2: HDFCBANK Duplicate Share Certificates (Tier 3 - Noise / Hidden)
  {
    id: 'ann-hdfc-duplicate',
    ticker: 'HDFCBANK.NS',
    companyName: 'HDFC Bank Ltd',
    timestamp: new Date(Date.now() - 21.0 * 3600 * 1000).toISOString(),
    publishedAt: '21h ago',
    hoursAgo: 21.0,
    category: 'unclassified',
    tier: 'tier3_routine',
    headline: 'Intimation of Loss of Share Certificates / Duplicate Share Certificate Requests',
    oneLineTakeaway: 'Routine secretarial disclosure under Regulation 39(3) regarding 4 shareholder folios.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/HDFCBANK_06112024154010_Reg39_3.pdf',
  },

  // 11. Routine Paperwork 3: MARUTI Reg 74(5) Certificate (Tier 3 - Noise / Hidden)
  {
    id: 'ann-maruti-reg74',
    ticker: 'MARUTI.NS',
    companyName: 'Maruti Suzuki India Ltd',
    timestamp: new Date(Date.now() - 22.8 * 3600 * 1000).toISOString(),
    publishedAt: '23h ago',
    hoursAgo: 22.8,
    category: 'unclassified',
    tier: 'tier3_routine',
    headline: 'Certificate under Regulation 74(5) of SEBI (DP) Regulations, 2018 for Quarter Ended Sept 2024',
    oneLineTakeaway: 'Routine compliance certificate confirming dematerialization requests processed by KFintech.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/MARUTI_06112024140000_Reg74_5.pdf',
  },

  // 12. KAYNES: Semiconductor OSAT Facility Capex (Tier 1 Urgent - Capex - Within 3 days)
  {
    id: 'ann-kaynes-osat-capex',
    ticker: 'KAYNES.NS',
    companyName: 'Kaynes Technology India Ltd',
    timestamp: new Date(Date.now() - 28.0 * 3600 * 1000).toISOString(),
    publishedAt: '1d ago',
    hoursAgo: 28.0,
    category: 'capex',
    tier: 'tier1_urgent',
    headline: 'Commercial Progress on ₹3,307 Crore Semiconductor OSAT Facility at Sanand, Gujarat',
    oneLineTakeaway: 'Achieved environmental clearance and foundation laying; projected ₹3,500 Cr annual revenue at full 100% capacity.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/KAYNES_05112024143000_OSAT_Sanand.pdf',
    capexDetails: {
      projectType: 'Semiconductor OSAT & Advanced High-Density Interconnect (HDI) Facility',
      investmentAmountCr: 3307,
      location: 'Sanand, Gujarat (India Semiconductor Mission)',
      capacityAddition: '6 Million Chips/Day Assembly & Advanced Packaging',
      targetCompletion: 'Q3 FY26',
      strategicRationale: 'Enables Kaynes to capture high-margin aerospace, automotive, and industrial packaging demand under ISM fiscal subsidies.',
    },
  },

  // 13. ZOMATO: Quarterly Results (Within last 3 days - Tier 1 Urgent)
  {
    id: 'ann-zomato-q2',
    ticker: 'ZOMATO.NS',
    companyName: 'Zomato Ltd',
    timestamp: new Date(Date.now() - 36.0 * 3600 * 1000).toISOString(),
    publishedAt: '1d ago',
    hoursAgo: 36.0,
    category: 'results',
    tier: 'tier1_urgent',
    headline: 'Consolidated Financial Results for Quarter Ended September 30, 2024',
    oneLineTakeaway: 'Blinkit GOV jumps 122% YoY; consolidated PAT reaches ₹176 Cr vs ₹36 Cr in prior year.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/ZOMATO_05112024163012_ResultsQ2.pdf',
    results: {
      quarter: 'Q2 FY25',
      periodEnded: 'September 30, 2024',
      revenue: 4799.0,
      revenueQoQ: 14.1,
      revenueYoY: 68.5,
      ebitda: 226.0,
      ebitdaMargin: 4.7,
      ebitdaQoQ: 27.7,
      ebitdaYoY: 182.5,
      pbt: 258.0,
      pbtQoQ: 21.7,
      pbtYoY: 344.8,
      pat: 176.0,
      patMargin: 3.7,
      patQoQ: -30.4,
      patYoY: 388.9,
      keyTakeaway: 'Blinkit store count touched 791 stores; targeting 2,000 dark stores by end of FY26.',
    },
  },

  // 14. FEDERALBNK: Credit Rating Upgrade (Within last 3 days - Tier 2 Material)
  {
    id: 'ann-federal-rating',
    ticker: 'FEDERALBNK.NS',
    companyName: 'The Federal Bank Ltd',
    timestamp: new Date(Date.now() - 48.0 * 3600 * 1000).toISOString(),
    publishedAt: '2d ago',
    hoursAgo: 48.0,
    category: 'credit_rating',
    tier: 'tier2_material',
    headline: 'CRISIL Upgrades Rating on Tier II Bonds (Basel III) to CRISIL AA+/Stable',
    oneLineTakeaway: 'Credit rating upgrade reflects improved systemic market share, robust capitalization, and lower credit cost.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/FEDERALBNK_04112024110000_RatingUpgrade.pdf',
  },

  // 15. ITC: Demerger Scheme Approval (Within last 7 days - Tier 1 Urgent)
  {
    id: 'ann-itc-demerger',
    ticker: 'ITC.NS',
    companyName: 'ITC Ltd',
    timestamp: new Date(Date.now() - 72.0 * 3600 * 1000).toISOString(),
    publishedAt: '3d ago',
    hoursAgo: 72.0,
    category: 'M&A',
    tier: 'tier1_urgent',
    headline: 'NCLT Sanctions Scheme of Arrangement between ITC Limited and ITC Hotels Limited',
    oneLineTakeaway: 'Clears path for listing of ITC Hotels; shareholders to receive 1 share in ITC Hotels for every 10 shares held.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/ITC_02112024173000_NCLTSanctionHotels.pdf',
  },

  // 16. CLEAN: Concall Transcript (Within last 7 days - Tier 2 Material)
  {
    id: 'ann-clean-concall',
    ticker: 'CLEAN.NS',
    companyName: 'Clean Science and Technology Ltd',
    timestamp: new Date(Date.now() - 96.0 * 3600 * 1000).toISOString(),
    publishedAt: '4d ago',
    hoursAgo: 96.0,
    category: 'earnings_call',
    tier: 'tier2_material',
    headline: 'Transcript of Q2 FY25 Post-Results Conference Call with Analysts and Investors',
    oneLineTakeaway: 'Management guided HALS production ramping to 70% capacity utilization by Q4 FY25 with 38%+ margins.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/CLEAN_01112024180000_ConcallTranscript.pdf',
  },

  // 17. CDSL: Dividend Declaration (Within last 7 days - Tier 2 Material)
  {
    id: 'ann-cdsl-dividend',
    ticker: 'CDSL.NS',
    companyName: 'Central Depository Services Ltd',
    timestamp: new Date(Date.now() - 120.0 * 3600 * 1000).toISOString(),
    publishedAt: '5d ago',
    hoursAgo: 120.0,
    category: 'dividend',
    tier: 'tier2_material',
    headline: 'Declaration of Special Interim Dividend of ₹19.00 per Equity Share (190%)',
    oneLineTakeaway: 'Special payout utilizing surplus treasury reserves following completion of 1:1 bonus issue.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/CDSL_31102024151500_Dividend.pdf',
  },

  // 18. Routine Paperwork 4: PERSISTENT Schedule of Analyst Meet (Tier 3 - Noise / Hidden)
  {
    id: 'ann-persistent-meet',
    ticker: 'PERSISTENT.NS',
    companyName: 'Persistent Systems Ltd',
    timestamp: new Date(Date.now() - 135.0 * 3600 * 1000).toISOString(),
    publishedAt: '6d ago',
    hoursAgo: 135.0,
    category: 'investor_meetings',
    tier: 'tier3_routine',
    headline: 'Intimation of Schedule of Analyst / Institutional Investor Meeting',
    oneLineTakeaway: 'Group interaction at Morgan Stanley India Summit; no unpublished price-sensitive information shared.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/PERSISTENT_30102024110000_AnalystMeet.pdf',
  },

  // 19. ASTRAL: Promoter Pledging Status (Within last 14 days - Tier 1 Urgent)
  {
    id: 'ann-astral-pledge',
    ticker: 'ASTRAL.NS',
    companyName: 'Astral Ltd',
    timestamp: new Date(Date.now() - 160.0 * 3600 * 1000).toISOString(),
    publishedAt: '7d ago',
    hoursAgo: 160.0,
    category: 'pledging',
    tier: 'tier1_urgent',
    headline: 'Disclosure under Regulation 31(1) and 31(2) - Release of Pledged Promoter Shares',
    oneLineTakeaway: 'Promoter entity releases 450,000 pledged shares (0.17% of equity); total promoter encumbrance drops to zero.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/ASTRAL_26102024164500_ReleasePledge.pdf',
  },

  // 20. SUNPHARMA: Litigation / USFDA Warning Letter Resolution (Within last 20 days - Tier 1)
  {
    id: 'ann-sunpharma-lit',
    ticker: 'SUNPHARMA.NS',
    companyName: 'Sun Pharmaceutical Industries Ltd',
    timestamp: new Date(Date.now() - 220.0 * 3600 * 1000).toISOString(),
    publishedAt: '9d ago',
    hoursAgo: 220.0,
    category: 'litigation',
    tier: 'tier1_urgent',
    headline: 'Regulatory Update: US FDA Completes Inspection at Mohali Facility with Voluntary Action Indicated (VAI)',
    oneLineTakeaway: 'Positive regulatory clearance paves way for resumption of new ANDA approvals from Mohali plant.',
    sourceFilingUrl: 'https://archives.nseindia.com/corporate/SUNPHARMA_20102024140000_USFDA_Mohali.pdf',
  },
];

/**
 * Returns announcements with dynamically recomputed ISO timestamps and human-readable relative ages
 * anchored directly to the exact current time (Date.now()).
 */
export function getFreshAnnouncements(): Announcement[] {
  const now = Date.now();
  return SEED_ANNOUNCEMENTS.map((a) => {
    const ts = new Date(now - a.hoursAgo * 3600 * 1000).toISOString();
    let publishedAt = '';
    if (a.hoursAgo < 1) {
      const mins = Math.max(1, Math.round(a.hoursAgo * 60));
      publishedAt = `${mins}m ago`;
    } else if (a.hoursAgo < 24) {
      const h = Math.round(a.hoursAgo);
      publishedAt = `${h}h ago`;
    } else {
      const d = Math.round(a.hoursAgo / 24);
      publishedAt = `${d}d ago`;
    }
    return {
      ...a,
      timestamp: ts,
      publishedAt,
    };
  });
}
