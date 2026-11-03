// 17-Category Exchange Announcement Classifier & Materiality Scoring
import { AnnouncementCategory, MaterialityTier, Announcement } from './types';

export interface CategoryInfo {
  category: AnnouncementCategory;
  label: string;
  badgeBg: string;
  badgeText: string;
  priorityTier: MaterialityTier;
  description: string;
}

export const CATEGORY_REGISTRY: Record<AnnouncementCategory, CategoryInfo> = {
  results: {
    category: 'results',
    label: 'Quarterly Results',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    badgeText: 'text-emerald-400',
    priorityTier: 'tier1_urgent',
    description: 'Financial results, board meetings approving them, results decks & shareholder letters.',
  },
  management_change: {
    category: 'management_change',
    label: 'Management Change',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    badgeText: 'text-amber-400',
    priorityTier: 'tier1_urgent',
    description: 'Any change at the top: CEO, CFO, MD, or Director joining, resigning, or retiring.',
  },
  'M&A': {
    category: 'M&A',
    label: 'M&A & Restructuring',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
    badgeText: 'text-purple-400',
    priorityTier: 'tier1_urgent',
    description: 'Acquisitions, mergers, demergers, JVs, subsidiary stake sales.',
  },
  litigation: {
    category: 'litigation',
    label: 'Litigation & Regulatory',
    badgeBg: 'bg-rose-500/10 border-rose-500/30',
    badgeText: 'text-rose-400',
    priorityTier: 'tier1_urgent',
    description: 'Lawsuits, regulatory orders, penalties, insolvency, restructuring.',
  },
  pledging: {
    category: 'pledging',
    label: 'Promoter Pledging',
    badgeBg: 'bg-red-500/10 border-red-500/30',
    badgeText: 'text-red-400',
    priorityTier: 'tier1_urgent',
    description: 'Promoter pledging, releasing, or changing pledge status of shares.',
  },
  capex: {
    category: 'capex',
    label: 'Capex & Expansion',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    badgeText: 'text-blue-400',
    priorityTier: 'tier2_material',
    description: 'Approving spend on new plants, facilities, or capacity expansions.',
  },
  credit_rating: {
    category: 'credit_rating',
    label: 'Credit Rating',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
    badgeText: 'text-cyan-400',
    priorityTier: 'tier2_material',
    description: 'Rating agencies assigning, upgrading, downgrading, or reaffirming credit ratings.',
  },
  fund_raise: {
    category: 'fund_raise',
    label: 'Fund Raise & Capital',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/30',
    badgeText: 'text-indigo-400',
    priorityTier: 'tier2_material',
    description: 'Rights issues, QIPs, preferential allotments, buybacks, or commercial paper.',
  },
  dividend: {
    category: 'dividend',
    label: 'Dividend Declaration',
    badgeBg: 'bg-teal-500/10 border-teal-500/30',
    badgeText: 'text-teal-400',
    priorityTier: 'tier2_material',
    description: 'Cash dividend declared with its record date.',
  },
  bonus_split: {
    category: 'bonus_split',
    label: 'Bonus / Split',
    badgeBg: 'bg-sky-500/10 border-sky-500/30',
    badgeText: 'text-sky-400',
    priorityTier: 'tier2_material',
    description: 'Bonus issue or stock split altering share counts.',
  },
  earnings_call: {
    category: 'earnings_call',
    label: 'Concall Transcript',
    badgeBg: 'bg-violet-500/10 border-violet-500/30',
    badgeText: 'text-violet-400',
    priorityTier: 'tier2_material',
    description: 'Investor conference call notices, audio recordings, or verbatim transcripts.',
  },
  press_release: {
    category: 'press_release',
    label: 'Press Release',
    badgeBg: 'bg-slate-500/10 border-slate-500/30',
    badgeText: 'text-slate-300',
    priorityTier: 'tier2_material',
    description: 'Order wins, new product rollouts, strategic tie-ups, market updates.',
  },
  insider_trading: {
    category: 'insider_trading',
    label: 'Insider Trading',
    badgeBg: 'bg-yellow-500/10 border-yellow-500/30',
    badgeText: 'text-yellow-400',
    priorityTier: 'tier2_material',
    description: 'Promoter or insider buying/selling personal shareholding under PIT regulations.',
  },
  investor_meetings: {
    category: 'investor_meetings',
    label: 'Investor Meetings',
    badgeBg: 'bg-zinc-500/10 border-zinc-500/30',
    badgeText: 'text-zinc-400',
    priorityTier: 'tier3_routine',
    description: 'One-on-one or institutional investor conferences schedule intimations.',
  },
  postal_ballot: {
    category: 'postal_ballot',
    label: 'Postal Ballot',
    badgeBg: 'bg-zinc-500/10 border-zinc-500/30',
    badgeText: 'text-zinc-400',
    priorityTier: 'tier3_routine',
    description: 'Shareholders voting notices and voting outcomes.',
  },
  agm_egm: {
    category: 'agm_egm',
    label: 'AGM / EGM',
    badgeBg: 'bg-zinc-500/10 border-zinc-500/30',
    badgeText: 'text-zinc-400',
    priorityTier: 'tier3_routine',
    description: 'Annual or Extraordinary General Meeting notice and proceedings.',
  },
  unusual_activity: {
    category: 'unusual_activity',
    label: 'Market Anomaly',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    badgeText: 'text-amber-400',
    priorityTier: 'tier1_urgent',
    description: 'Trading volume spike (>2x 10-DMA) or sharp price volatility (>2.5%).',
  },
  unclassified: {
    category: 'unclassified',
    label: 'Routine Secretarial',
    badgeBg: 'bg-neutral-800/60 border-neutral-700/40',
    badgeText: 'text-neutral-400',
    priorityTier: 'tier3_routine',
    description: 'Low-relevance paperwork (ESOP allotments, duplicate share certificates, compliance certs).',
  },
};

/**
 * Classifies raw exchange filing headlines into one of the 17 taxonomy categories
 * and assigns an appropriate materiality priority tier.
 */
export function classifyFilingHeadline(headline: string): {
  category: AnnouncementCategory;
  tier: MaterialityTier;
} {
  const h = headline.toLowerCase();

  // 0. Market Anomaly / Unusual Volume Spike (Tier 1 Urgent)
  if (
    h.includes('unusual activity') ||
    h.includes('volume spike') ||
    h.includes('volume surge') ||
    h.includes('market anomaly')
  ) {
    return { category: 'unusual_activity', tier: 'tier1_urgent' };
  }

  // 1. Routine Secretarial Paperwork (Collapse by default)
  if (
    h.includes('esop') ||
    h.includes('esps') ||
    h.includes('newspaper publication') ||
    h.includes('trading window') ||
    h.includes('reg. 74') ||
    h.includes('reg 74') ||
    h.includes('certificate under reg') ||
    h.includes('duplicate') ||
    h.includes('loss of share')
  ) {
    return { category: 'unclassified', tier: 'tier3_routine' };
  }

  // 2. Financial Results (Tier 1 Urgent)
  if (
    h.includes('financial result') ||
    h.includes('board meeting outcome') ||
    h.includes('quarterly result') ||
    h.includes('audited result') ||
    h.includes('unaudited result') ||
    h.includes('results for the quarter') ||
    h.includes('financials for the quarter')
  ) {
    return { category: 'results', tier: 'tier1_urgent' };
  }

  // 3. Management Changes & Key Managerial Personnel (Tier 1 Urgent)
  if (
    h.includes('resignation') ||
    h.includes('appointment') ||
    h.includes('retirement') ||
    h.includes('change in directorate') ||
    h.includes('change in management') ||
    h.includes('superannuat') ||
    h.includes('ceasing as') ||
    h.includes('kmp') ||
    h.includes('cfo') ||
    h.includes('ceo') ||
    h.includes('managing director')
  ) {
    return { category: 'management_change', tier: 'tier1_urgent' };
  }

  // 4. M&A, Restructuring, Subsidiaries & Acquisitions (Tier 1 Urgent)
  if (
    h.includes('merger') ||
    h.includes('acquisition') ||
    h.includes('demerger') ||
    h.includes('joint venture') ||
    h.includes('subsidiary') ||
    h.includes('scheme of arrangement') ||
    h.includes('business transfer agreement')
  ) {
    return { category: 'M&A', tier: 'tier1_urgent' };
  }

  // 5. Litigation & Regulatory Actions (Tier 1 Urgent)
  if (
    h.includes('litigation') ||
    h.includes('nclt') ||
    h.includes('order') ||
    h.includes('penalty') ||
    h.includes('regulatory') ||
    h.includes('warning letter')
  ) {
    return { category: 'litigation', tier: 'tier1_urgent' };
  }

  // 6. Promoter Pledging (Tier 1 Urgent)
  if (h.includes('pledge') || h.includes('encumbrance') || h.includes('reg 31')) {
    return { category: 'pledging', tier: 'tier1_urgent' };
  }

  // 7. Capex & Capacity Expansions (Tier 2 Material)
  if (
    h.includes('capex') ||
    h.includes('expansion') ||
    h.includes('new plant') ||
    h.includes('facility') ||
    h.includes('capacity') ||
    h.includes('development center') ||
    h.includes('store opening') ||
    h.includes('opened new store') ||
    h.includes('store opened') ||
    h.includes('commissioning') ||
    h.includes('epc complex')
  ) {
    return { category: 'capex', tier: 'tier2_material' };
  }

  // 8. Credit Rating Actions (Tier 2 Material)
  if (
    h.includes('credit rating') ||
    h.includes('rating update') ||
    h.includes('crisil') ||
    h.includes('icra') ||
    h.includes('care')
  ) {
    return { category: 'credit_rating', tier: 'tier2_material' };
  }

  // 9. Earnings Calls & Transcripts (Tier 2 Material)
  if (
    h.includes('transcript') ||
    h.includes('earnings call') ||
    h.includes('analyst / investor meet') ||
    h.includes('analyst meet') ||
    h.includes('investor presentation') ||
    h.includes('audio recording')
  ) {
    return { category: 'earnings_call', tier: 'tier2_material' };
  }
  if (h.includes('dividend') || h.includes('record date')) {
    return { category: 'dividend', tier: 'tier2_material' };
  }
  if (h.includes('bonus') || h.includes('split')) {
    return { category: 'bonus_split', tier: 'tier2_material' };
  }
  if (
    h.includes('rights issue') ||
    h.includes('qip') ||
    h.includes('preferential allotment') ||
    h.includes('fund raise')
  ) {
    return { category: 'fund_raise', tier: 'tier2_material' };
  }
  if (
    h.includes('concall') ||
    h.includes('earnings call') ||
    h.includes('audio recording') ||
    h.includes('transcript')
  ) {
    return { category: 'earnings_call', tier: 'tier2_material' };
  }
  if (
    h.includes('investor presentation') ||
    h.includes('presentation') ||
    h.includes('analyst meet') ||
    h.includes('investor meeting')
  ) {
    return { category: 'investor_meetings', tier: 'tier3_routine' };
  }
  if (
    h.includes('duplicate') ||
    h.includes('loss of share') ||
    h.includes('reg 39') ||
    h.includes('reg 74') ||
    h.includes('esop') ||
    h.includes('compliance certificate')
  ) {
    return { category: 'unclassified', tier: 'tier3_routine' };
  }

  return { category: 'press_release', tier: 'tier2_material' };
}

/**
 * Filter announcements based on window hours, materiality preference, and anomaly sliders.
 */
export function filterAnnouncements(
  announcements: Announcement[],
  options: {
    windowHours: number; // e.g. 24, 72, 168 (7d), 720 (30d)
    onlyMaterial: boolean; // if true, hide tier3_routine
    volumeThreshold?: number; // e.g. 2.0x
    priceThreshold?: number; // e.g. 3.0%
    category?: AnnouncementCategory | 'ALL';
    ticker?: string;
  }
): {
  displayed: Announcement[];
  collapsedRoutineCount: number;
} {
  const cutoffTime = Date.now() - options.windowHours * 3600 * 1000;

  // Filter by time window
  const inWindow = announcements.filter((a) => {
    const itemTime = new Date(a.timestamp).getTime();
    return itemTime >= cutoffTime;
  });

  // Ticker filter if specified
  const tickerFiltered = options.ticker
    ? inWindow.filter((a) => a.ticker.toUpperCase() === options.ticker!.toUpperCase())
    : inWindow;

  // Category filter if specified
  const categoryFiltered =
    options.category && options.category !== 'ALL'
      ? tickerFiltered.filter((a) => a.category === options.category)
      : tickerFiltered;

  // Count routine items
  const routineItems = categoryFiltered.filter((a) => a.tier === 'tier3_routine');

  // Filter based on materiality
  let displayed = categoryFiltered;
  if (options.onlyMaterial) {
    displayed = categoryFiltered.filter((a) => a.tier !== 'tier3_routine');
  }

  // Sort: Tier 1 Urgent first, then Tier 2 Material, then Tier 3, then by timestamp descending
  displayed.sort((a, b) => {
    const tierPriority = { tier1_urgent: 1, tier2_material: 2, tier3_routine: 3 };
    const pDiff = tierPriority[a.tier] - tierPriority[b.tier];
    if (pDiff !== 0) return pDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return {
    displayed,
    collapsedRoutineCount: options.onlyMaterial ? routineItems.length : 0,
  };
}
