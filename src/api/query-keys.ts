/**
 * FitCheck Mobile - TanStack Query Key Factory
 * Centralized, structured query keys for robust cache management & invalidation.
 */

import {
  getHomeDashboardApiV1DashboardHomeGetQueryKey,
  readRootGetQueryKey,
  getMyWardrobeApiV1ClosetItemsGetQueryKey,
  getItemDetailApiV1ClosetItemsItemIdGetQueryKey,
  getItemPairingsApiV1ClosetItemsItemIdPairingsGetQueryKey,
  getClosetSummaryApiV1ClosetSummaryGetQueryKey,
  getMyOutfitsApiV1ClosetOutfitsGetQueryKey,
  getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetQueryKey,
  getDailyCalendarDetailApiV1DashboardCalendarDailyGetQueryKey,
  getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetQueryKey,
  getCalendarByRangeApiV1DashboardCalendarGetQueryKey,
  getCalendarInsightsApiV1DashboardCalendarInsightsGetQueryKey,
  getWardrobeStyleInsightsApiV1DashboardInsightsGetQueryKey,
  getFashionTrendsApiV1ExploreTrendsGetQueryKey,
  getColorTheoryGuidesApiV1ExploreColorTheoryGetQueryKey,
  getTrendArticleDetailApiV1ExploreTrendsArticleIdGetQueryKey,
  getChatHistoryApiV1AiChatHistoryGetQueryKey,
  testAiConnectionApiV1AiTestConnectionGetQueryKey,
  getProfileApiV1AuthProfileGetQueryKey,
} from '@/api/@tanstack/react-query.gen';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  home: getHomeDashboardApiV1DashboardHomeGetQueryKey,
  rootHealth: readRootGetQueryKey,
};

export const closetKeys = {
  all: ['closet'] as const,
  items: getMyWardrobeApiV1ClosetItemsGetQueryKey,
  itemDetail: getItemDetailApiV1ClosetItemsItemIdGetQueryKey,
  itemPairings: getItemPairingsApiV1ClosetItemsItemIdPairingsGetQueryKey,
  summary: getClosetSummaryApiV1ClosetSummaryGetQueryKey,
  outfits: getMyOutfitsApiV1ClosetOutfitsGetQueryKey,
};

export const calendarKeys = {
  all: ['calendar'] as const,
  weekly: getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetQueryKey,
  daily: getDailyCalendarDetailApiV1DashboardCalendarDailyGetQueryKey,
  events: getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetQueryKey,
  range: getCalendarByRangeApiV1DashboardCalendarGetQueryKey,
  insights: getCalendarInsightsApiV1DashboardCalendarInsightsGetQueryKey,
  wardrobeInsights: getWardrobeStyleInsightsApiV1DashboardInsightsGetQueryKey,
};

export const exploreKeys = {
  all: ['explore'] as const,
  trends: getFashionTrendsApiV1ExploreTrendsGetQueryKey,
  colorTheory: getColorTheoryGuidesApiV1ExploreColorTheoryGetQueryKey,
  articleDetail: getTrendArticleDetailApiV1ExploreTrendsArticleIdGetQueryKey,
};

export const chatKeys = {
  all: ['chat'] as const,
  history: getChatHistoryApiV1AiChatHistoryGetQueryKey,
  aiTest: testAiConnectionApiV1AiTestConnectionGetQueryKey,
};

export const authKeys = {
  all: ['auth'] as const,
  profile: getProfileApiV1AuthProfileGetQueryKey,
};
