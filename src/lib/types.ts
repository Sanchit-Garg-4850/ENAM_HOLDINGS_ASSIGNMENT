// FINN Domain Model Definitions (ENAM AI Engineer Challenge)

export type AnnouncementCategory =
  | 'results'
  | 'M&A'
  | 'fund_raise'
  | 'management_change'
  | 'litigation'
  | 'insider_trading'
  | 'earnings_call'
  | 'investor_meetings'
  | 'credit_rating'
  | 'dividend'
  | 'bonus_split'
  | 'capex'
  | 'press_release'
  | 'postal_ballot'
  | 'agm_egm'
  | 'pledging'
  | 'unclassified';

export type MaterialityTier = 'tier1_urgent' | 'tier2_material' | 'tier3_routine';

export interface QuarterlyResultsData {
  quarter: string; // e.g. "Q2 FY25"
  periodEnded: string;
  revenue: number; // in ₹ Cr
  revenueQoQ: number; // %
  revenueYoY: number; // %
  ebitda: number; // in ₹ Cr
  ebitdaMargin: number; // %
  ebitdaQoQ: number;
  ebitdaYoY: number;
  pbt: number; // in ₹ Cr
  pbtQoQ: number;
  pbtYoY: number;
  pat: number; // in ₹ Cr
  patMargin: number; // %
  patQoQ: number;
  patYoY: number;
  keyTakeaway: string;
}

export interface ManagementChangeData {
  personName: string;
  role: string;
  changeType: 'incoming' | 'outgoing' | 'elevation';
  effectiveDate: string;
  priorCompany?: string;
  education?: string;
  experienceYears?: number;
  bio: string;
  significance: string;
}

export interface AnomalyData {
  type: 'volume' | 'price' | 'both';
  volumeSpikeRatio: number; // e.g. 2.8x
  priceChangePercent: number; // e.g. +4.2%
  currentVolume: number;
  avgVolume20d: number;
  currentPrice: number;
  headline: string;
}

export interface Announcement {
  id: string;
  ticker: string;
  companyName: string;
  timestamp: string; // ISO string
  publishedAt: string; // display string e.g. "Today, 14:32"
  hoursAgo: number;
  category: AnnouncementCategory;
  tier: MaterialityTier;
  headline: string;
  oneLineTakeaway: string;
  sourceFilingUrl?: string;
  results?: QuarterlyResultsData;
  managementChange?: ManagementChangeData;
  anomaly?: AnomalyData;
  isRead?: boolean;
}

export interface StockQuote {
  ticker: string;
  symbol: string;
  name: string;
  sector: string;
  marketCapCategory: 'Mega Cap' | 'Large Cap' | 'Mid Cap' | 'Small Cap';
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume10d: number;
  volumeRatio: number; // volume / avgVolume10d
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCapCr: number; // ₹ Cr
  peRatio?: number;
  isPortfolio: boolean;
}

export interface GuidanceAuditItem {
  quarter: string; // e.g. "Q1 FY25"
  metric: string; // e.g. "EBITDA Margin" | "Revenue Growth" | "Capex"
  promisedGuidance: string; // From concall transcript
  concallDate: string;
  concallCitation: string;
  deliveredResult: string; // From audited exchange filing
  filingDate: string;
  filingCitation: string;
  status: 'DELIVERED' | 'PARTIAL' | 'MISSED';
  divergenceAnalysis: string; // Why it missed/delivered
}

export interface DiligenceModule {
  businessSnapshot: {
    overview: string;
    segments: Array<{ name: string; sharePercent: number; description: string }>;
    geographyMix: Array<{ region: string; sharePercent: number }>;
    competitiveMoat: string;
  };
  financialSnapshot: {
    ttmRevenueCr: number;
    ebitdaMarginPercent: number;
    ttmPatCr: number;
    rocePercent: number;
    roePercent: number;
    peMultiple: number;
    evEbitdaMultiple: number;
    marketCapCr: number;
  };
  trajectory: {
    threeYearRevenueCagr: number;
    threeYearPatCagr: number;
    marginDirection: 'expanding' | 'compressing' | 'stable';
    marginSummary: string;
    multiYearFinancials: Array<{
      year: string;
      revenue: number;
      ebitda: number;
      pat: number;
      margin: number;
    }>;
  };
  balanceSheet: {
    netDebtToEquity: number;
    totalDebtCr: number;
    cashAndEquivalentsCr: number;
    workingCapitalDays: number;
    debtorDays: number;
    inventoryDays: number;
    payableDays: number;
    solvencyCommentary: string;
  };
  cashQuality: {
    cashConversionRatio: number; // OCF / PAT
    operatingCashFlowCr: number;
    freeCashFlowCr: number;
    fcfYieldPercent: number;
    redFlagAlert?: string;
    qualityRating: 'High' | 'Moderate' | 'Poor';
    assessment: string;
  };
  narrativeVsNumbers: {
    executiveSummary: string;
    reliabilityScore: number; // 0 to 100
    audits: GuidanceAuditItem[];
  };
  guidanceLedger: {
    latestCallQuarter: string;
    forwardRevenueGrowth: string;
    forwardMarginBand: string;
    capexGuidanceCr: number | string;
    keyManagementQuotes: Array<{ quote: string; speaker: string; topic: string }>;
  };
  bullVsBear: {
    bullPoints: string[];
    bearPoints: string[];
    enamConvictionVerdict: string;
  };
  primarySources: Array<{
    title: string;
    type: 'Annual Report' | 'Concall Transcript' | 'Quarterly Results' | 'Exchange Disclosure';
    date: string;
    url: string;
  }>;
}

export interface AlertConfig {
  volumeMultiplierThreshold: number; // default: 2.0x
  priceMoveThresholdPercent: number; // default: 3.0%
  onlyMaterial: boolean; // default: true
  monitoredCategories: AnnouncementCategory[];
}
