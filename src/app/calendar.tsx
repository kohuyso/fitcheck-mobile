import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, Alert } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Lightbulb, Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCalendarInsightsApiV1DashboardCalendarInsightsGetOptions,
  getWardrobeStyleInsightsApiV1DashboardInsightsGetOptions,
  getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetOptions,
  getCalendarByRangeApiV1DashboardCalendarGetOptions,
  deleteCalendarHistoryApiV1DashboardCalendarHistoryIdDeleteMutation,
  scheduleCalendarEventApiV1DashboardCalendarSchedulePostMutation,
  getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetOptions,
  getDailyCalendarDetailApiV1DashboardCalendarDailyGetOptions,
} from '@/api/@tanstack/react-query.gen';
import { calendarKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';
import { resolveImageUrl } from '@/utils/image-url';

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const bottomTabBarHeight = 72 + insets.bottom;

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Fetch Calendar Strip API Query
  const { data: calendarData } = useQuery(
    getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetOptions()
  );

  // Fetch Daily Detail Query for selected date
  const { data: dailyDetail } = useQuery(
    getDailyCalendarDetailApiV1DashboardCalendarDailyGetOptions({
      query: { date: selectedDateStr },
    })
  );

  // Fetch Upcoming Events API Query
  const { data: upcomingEventsData } = useQuery(
    getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetOptions()
  );

  // Schedule Event Mutation
  const scheduleEventMutation = useMutation({
    ...scheduleCalendarEventApiV1DashboardCalendarSchedulePostMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.weekly() });
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
      queryClient.invalidateQueries({ queryKey: calendarKeys.weekly() });
    },
  });

  // Fetch Wardrobe Insights Query
  const { data: wardrobeInsights } = useQuery(
    getWardrobeStyleInsightsApiV1DashboardInsightsGetOptions()
  );

  // Fetch Calendar Insights Query
  const { data: calendarInsightsData } = useQuery(
    getCalendarInsightsApiV1DashboardCalendarInsightsGetOptions()
  );

  // Map API calendar days to display format
  const displayDays = (calendarData || []).map((item) => {
    const parsedDate = new Date(item.date);
    const dateNum = isNaN(parsedDate.getTime()) ? 1 : parsedDate.getDate();
    return {
      dateStr: item.date,
      day: item.day_name ? item.day_name.slice(0, 3) : '',
      date: dateNum,
      active: item.date === selectedDateStr || item.is_highlighted,
      outfit: item.outfit,
      eventTitle: item.event_title,
    };
  });

  const formattedMonthYear = React.useMemo(() => {
    const d = new Date(selectedDateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDateStr]);

  const handleDaySelect = (dateStr: string) => {
    setSelectedDateStr(dateStr);
  };

  const handleScheduleEvent = async () => {
    try {
      await scheduleEventMutation.mutateAsync({
        body: {
          date: selectedDateStr,
          outfit_id: 1,
          event_title: 'Client Presentation',
        },
      });
      Alert.alert('Scheduled', `Event scheduled for ${selectedDateStr}`);
    } catch (err) {
      console.log('Schedule event error:', err);
    }
  };

  const handleDeleteHistory = async (historyId: number) => {
    try {
      await deleteCalendarHistoryMutation.mutateAsync({
        path: { history_id: historyId },
      });
      Alert.alert('Deleted', 'Outfit history record removed');
    } catch (err) {
      console.log('Delete history error:', err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: bottomTabBarHeight + 24 }} className="px-margin-mobile pt-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="font-sans font-bold text-headline-sm text-on-surface">
                {formattedMonthYear || 'Outfit Calendar'}
              </Text>
              <Text className="font-sans text-label-md text-on-surface-variant">
                Plan and track your weekly style history
              </Text>
            </View>

            <Pressable
              onPress={handleScheduleEvent}
              className="p-2.5 bg-primary/10 rounded-full border border-primary/20 active:scale-95 flex-row items-center gap-1"
            >
              <Plus size={18} color="#005c55" />
            </Pressable>
          </View>

          {/* Weekly Days Strip */}
          <View className="flex-row justify-between items-center mb-6 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20">
            {displayDays.map((item) => (
              <Pressable
                key={item.dateStr}
                onPress={() => handleDaySelect(item.dateStr)}
                className={cn(
                  'items-center py-2.5 px-3 rounded-xl transition-all',
                  item.active ? 'bg-primary' : 'bg-transparent'
                )}
              >
                <Text
                  className={cn(
                    'font-sans font-medium text-label-xs uppercase mb-1',
                    item.active ? 'text-white' : 'text-on-surface-variant'
                  )}
                >
                  {item.day}
                </Text>
                <Text
                  className={cn(
                    'font-sans font-bold text-title-md',
                    item.active ? 'text-white' : 'text-on-surface'
                  )}
                >
                  {item.date}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Daily Outfit Detail Card */}
          {dailyDetail && (
            <View className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm mb-6">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="font-sans font-bold text-headline-xs text-on-surface">
                    {dailyDetail.event_title || 'Daily Planned Outfit'}
                  </Text>
                  <Text className="font-sans text-label-md text-on-surface-variant">
                    Date: {dailyDetail.date}
                  </Text>
                </View>
              </View>

              {dailyDetail.outfit && (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/outfit-detail',
                      params: {
                        outfit_id: dailyDetail.outfit?.outfit_id
                          ? String(dailyDetail.outfit.outfit_id)
                          : undefined,
                        title: dailyDetail.outfit?.title || 'Planned Outfit',
                        image: dailyDetail.outfit?.image_url || '',
                      },
                    })
                  }
                  className="flex-row items-center gap-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 active:scale-95"
                >
                  <View className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                    <Image
                      source={resolveImageUrl(dailyDetail.outfit.image_url)}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="font-sans font-bold text-body-lg text-on-surface">
                      {dailyDetail.outfit.title}
                    </Text>
                    <Text className="font-sans text-label-md text-on-surface-variant">
                      {dailyDetail.outfit.style_type || 'Custom Style'}
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
          )}

          {/* AI Style Insights Banner */}
          {calendarInsightsData && (
            <View className="bg-primary/10 p-5 rounded-2xl border border-primary/20 mb-6 flex-row items-start gap-3">
              <Lightbulb size={22} color="#005c55" className="mt-0.5" />
              <View className="flex-1">
                <Text className="font-sans font-bold text-title-md text-primary mb-1">
                  AI Style Insight
                </Text>
                <Text className="font-sans text-body-md text-on-surface leading-6">
                  Weekly outfit styling performance optimized.
                </Text>
              </View>
            </View>
          )}

          {/* Upcoming Events List */}
          <View className="mb-4">
            <Text className="font-sans font-bold text-headline-xs text-on-surface mb-3">
              Upcoming Events
            </Text>
            {upcomingEventsData && upcomingEventsData.length > 0 ? (
              upcomingEventsData.map((evt, idx) => (
                <View
                  key={idx}
                  className="p-4 bg-white rounded-xl border border-outline-variant/20 mb-3 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="font-sans font-bold text-body-md text-on-surface">
                      {evt.event_title || 'Upcoming Event'}
                    </Text>
                    <Text className="font-sans text-label-md text-on-surface-variant">
                      {evt.date}
                    </Text>
                  </View>
                  <CalendarIcon size={20} color="#005c55" />
                </View>
              ))
            ) : (
              <View className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 items-center">
                <Text className="font-sans text-body-md text-on-surface-variant">
                  No upcoming events scheduled.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
