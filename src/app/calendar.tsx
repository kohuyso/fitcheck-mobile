import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Cloud, CloudSun, Lightbulb, Sun, Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCalendarInsightsApiV1DashboardCalendarInsightsGetOptions,
  getWardrobeStyleInsightsApiV1DashboardInsightsGetOptions,
  getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetOptions,
  getCalendarByRangeApiV1DashboardCalendarGetOptions,
  deleteCalendarHistoryApiV1DashboardCalendarHistoryIdDeleteMutation,
  getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetQueryKey,
  scheduleCalendarEventApiV1DashboardCalendarSchedulePostMutation,
  getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetOptions,
  getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetQueryKey,
} from '@/api/@tanstack/react-query.gen';

export default function CalendarScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  // Fetch Calendar Strip API Query
  const { data: calendarData } = useQuery(
    getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetOptions()
  );

  // Fetch Upcoming Events API Query
  const { data: upcomingEventsData } = useQuery(
    getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetOptions()
  );

  // Schedule Event Mutation
  const scheduleEventMutation = useMutation({
    ...scheduleCalendarEventApiV1DashboardCalendarSchedulePostMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetQueryKey() });
    },
  });

  // Fetch Calendar By Range Query (30 Days)
  const { data: calendarRangeData } = useQuery(
    getCalendarByRangeApiV1DashboardCalendarGetOptions()
  );

  // Delete Calendar History Mutation
  const deleteCalendarHistoryMutation = useMutation({
    ...deleteCalendarHistoryApiV1DashboardCalendarHistoryIdDeleteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetQueryKey() });
    },
  });

  // Fetch Wardrobe Insights Query
  const { data: wardrobeInsights } = useQuery(
    getWardrobeStyleInsightsApiV1DashboardInsightsGetOptions()
  );

  // Fetch Calendar Insights Query (New Backend API)
  const { data: calendarInsightsData } = useQuery(
    getCalendarInsightsApiV1DashboardCalendarInsightsGetOptions()
  );

  // Map API calendar days to display format
  const displayDays = (calendarData || []).map((item) => {
    const parsedDate = new Date(item.date);
    const dateNum = isNaN(parsedDate.getTime()) ? 1 : parsedDate.getDate();
    return {
      day: item.day_name.slice(0, 3),
      date: dateNum,
      active: item.is_highlighted,
    };
  });

  const displayUtilization =
    calendarInsightsData?.utilization_rate ??
    wardrobeInsights?.utilization_rate ??
    0;

  const unwornMessage =
    calendarInsightsData?.unworn_items_insight?.message || '';

  const forecast = calendarInsightsData?.next_3_days_forecast || [];

  const weatherImpactLevel = calendarInsightsData?.weather_impact?.level || 'Normal';
  const weatherImpactSummary =
    calendarInsightsData?.weather_impact?.recommendation_summary || '';

  // SVG dimensions for utilization chart
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // 251.2
  const progressOffset = circumference * (1 - displayUtilization / 100);

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-margin-mobile pt-6 pb-28">
          {/* 7-Day Calendar Strip */}
          <View className="mb-6">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="font-sans font-bold text-title-lg text-on-surface">Outfit Calendar</Text>
              <Text className="font-sans font-semibold text-label-md text-primary">October 2023</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
              {displayDays.map((item) => {
                const isSelected = item.date === selectedDate;
                return (
                  <Pressable
                    key={item.date}
                    onPress={() => setSelectedDate(item.date)}
                    className={`flex-col items-center justify-center min-w-[52px] h-20 rounded-xl mr-2 active:scale-95 ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                        : 'bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    <Text
                      className={`font-sans text-label-sm uppercase ${
                        isSelected ? 'text-white/80' : 'text-on-surface-variant/60'
                      }`}
                    >
                      {item.day}
                    </Text>
                    <Text
                      className={`font-sans font-bold text-title-lg mt-1 ${
                        isSelected ? 'text-white' : 'text-on-surface'
                      }`}
                    >
                      {item.date}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Outfit Preview Card */}
          <Pressable
            onPress={() =>
              router.navigate({
                pathname: '/outfit-detail' as any,
                params: {
                  title: 'Daily Outfit',
                  image: '',
                  weather: weatherImpactSummary,
                  tags: 'Daily Match',
                  description: 'Daily outfit preview based on calendar and weather.',
                  insight: unwornMessage,
                },
              })
            }
            className="mb-6 rounded-[2rem] overflow-hidden bg-white shadow-sm border border-outline-variant/30 active:scale-[0.98]"
          >
            <View className="aspect-[3/4] w-full bg-surface-container-highest">
              <Image
                source=""
                className="w-full h-full"
                contentFit="cover"
              />
            </View>
            {/* Glass Overlay Info */}
            <View className="p-5 border-t border-outline-variant/20 bg-white/95">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-sans font-bold text-title-lg text-on-surface">
                  Rainy Day Professional
                </Text>
                <View className="flex-row items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full">
                  <CloudSun size={12} className="text-primary" />
                  <Text className="font-sans font-bold text-[11px] text-primary">Weather Adjusted</Text>
                </View>
              </View>
              <Text className="font-sans text-body-md text-on-surface-variant mb-4 leading-relaxed">
                Optimized for 14°C with light showers. Minimalist layers for comfort and style.
              </Text>
              <View className="flex-row gap-2">
                <View className="px-3 py-1 rounded-full bg-surface-container-highest">
                  <Text className="font-sans font-medium text-label-md text-on-surface-variant">
                    Business Casual
                  </Text>
                </View>
                <View className="px-3 py-1 rounded-full bg-surface-container-highest">
                  <Text className="font-sans font-medium text-label-md text-on-surface-variant">
                    Monochrome Base
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Insights Bento Section */}
          <View className="flex-row flex-wrap gap-4">
            {/* Utilization Circular Progress */}
            <View className="flex-1 min-w-[45%] p-5 rounded-3xl bg-white border border-outline-variant/30 items-center justify-center text-center shadow-sm">
              <View className="relative w-24 h-24 mb-4 justify-center items-center">
                <Svg width={96} height={96} className="absolute rotate-[-90deg]">
                  {/* Background Track Circle */}
                  <Circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="transparent"
                    stroke="#e5e9e7"
                    strokeWidth={strokeWidth}
                  />
                  {/* Active Progress Circle */}
                  <Circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="transparent"
                    stroke="#005c55"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                  />
                </Svg>
                <Text className="font-sans font-bold text-headline-md text-on-surface">{displayUtilization}%</Text>
              </View>
              <Text className="font-sans font-medium text-label-md text-on-surface-variant">
                Wardrobe Utilization
              </Text>
            </View>

            {/* AI Suggestion Box */}
            <View className="flex-1 min-w-[45%] p-5 rounded-3xl bg-primary-container/20 border border-primary/20 justify-between shadow-sm">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-4">
                <Lightbulb size={20} className="text-primary" />
              </View>
              <View>
                <Text className="font-sans font-bold text-label-sm text-primary uppercase mb-1">
                  AI Insight
                </Text>
                <Text className="font-sans text-body-md text-on-surface-variant leading-tight">
                  {unwornMessage}{' '}
                  <Text className="text-primary font-bold">Sell or Restyle?</Text>
                </Text>
              </View>
            </View>

            {/* Weather Card */}
            <View className="w-full p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 flex-row items-center gap-4 shadow-sm">
              <View className="flex-1">
                <Text className="font-sans font-medium text-label-md text-on-surface-variant mb-2">
                  Next 3-Day Forecast
                </Text>
                <View className="flex-row gap-4">
                  {forecast.slice(0, 3).map((item, idx) => (
                    <View key={idx} className={`items-center ${idx > 0 ? 'opacity-40' : ''}`}>
                      {idx === 0 ? (
                        <Cloud size={18} className="text-primary mb-1" />
                      ) : idx === 1 ? (
                        <Sun size={18} className="text-on-surface-variant mb-1" />
                      ) : (
                        <CloudSun size={18} className="text-on-surface-variant mb-1" />
                      )}
                      <Text className="font-sans text-label-sm text-on-surface">{item.temp_c}°C</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className="h-10 w-[1px] bg-outline-variant" />
              <View className="items-end pl-2">
                <Text className="font-sans font-bold text-label-sm text-primary uppercase">Impact</Text>
                <Text className="font-sans font-bold text-headline-md text-on-surface leading-none mt-1">
                  {weatherImpactLevel}
                </Text>
                <Text className="font-sans text-label-sm text-on-surface-variant mt-0.5">
                  {weatherImpactSummary}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

