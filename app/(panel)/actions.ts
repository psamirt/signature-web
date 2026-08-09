'use server';

import {
  getAnalyticsOverview,
  getLeadInsights,
  runLeadAnalysis,
  type AnalyticsOverview,
  type LeadInsights,
} from '@/lib/api';

export async function getAnalyticsOverviewAction(): Promise<AnalyticsOverview> {
  return getAnalyticsOverview();
}

export async function getLeadInsightsAction(): Promise<LeadInsights> {
  return getLeadInsights();
}

export async function runLeadAnalysisAction(): Promise<{ analyzed: number }> {
  return runLeadAnalysis();
}
