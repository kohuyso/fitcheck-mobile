import {
  deleteCalendarHistoryApiV1DashboardCalendarHistoryIdDeleteMutation,
  getCalendarByRangeApiV1DashboardCalendarGetOptions,
  getCalendarInsightsApiV1DashboardCalendarInsightsGetOptions,
  getDailyCalendarDetailApiV1DashboardCalendarDailyGetOptions,
  getMyOutfitsApiV1ClosetOutfitsGetOptions,
  getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetOptions,
} from "@/api/@tanstack/react-query.gen";
import { calendarKeys } from "@/api/query-keys";
import { OutfitRecommendation } from "@/api/types.gen";
import { CalendarEventList } from "@/components/calendar/calendar-event-list";
import { ScheduleModal } from "@/components/closet/schedule-modal";
import { cn } from "@/utils/cn";
import { resolveImageUrl } from "@/utils/image-url";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Lightbulb, RotateCcw, Trash2, Calendar as CalendarIcon } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { EmptyState } from "@/components/ui/empty-state";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const bottomTabBarHeight = 72 + insets.bottom;
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Compute Monday date for active week view
  const weekStartEnd = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;

    const mon = new Date(d.setDate(diffToMon));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    return {
      startDateStr: mon.toISOString().split("T")[0],
      endDateStr: sun.toISOString().split("T")[0],
      monDate: mon,
    };
  }, [weekOffset]);

  const { data: rangeCalendarData } = useQuery(
    getCalendarByRangeApiV1DashboardCalendarGetOptions({
      query: {
        start_date: weekStartEnd.startDateStr,
        end_date: weekStartEnd.endDateStr,
      },
    }),
  );

  const { data: dailyDetail } = useQuery(
    getDailyCalendarDetailApiV1DashboardCalendarDailyGetOptions({
      query: { date: selectedDateStr },
    }),
  );

  const { data: upcomingEventsData } = useQuery(
    getUpcomingCalendarEventsApiV1DashboardCalendarEventsGetOptions(),
  );

  const { data: myOutfitsData } = useQuery(
    getMyOutfitsApiV1ClosetOutfitsGetOptions(),
  );

  const deleteCalendarHistoryMutation = useMutation({
    ...deleteCalendarHistoryApiV1DashboardCalendarHistoryIdDeleteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      Alert.alert("Thành công", "Đã xóa sự kiện khỏi lịch thành công!");
    },
    onError: (err) => {
      console.log("Delete calendar event error:", err);
      Alert.alert("Lỗi", "Không thể xóa sự kiện. Vui lòng kiểm tra lại.");
    },
  });

  const { data: calendarInsightsData } = useQuery(
    getCalendarInsightsApiV1DashboardCalendarInsightsGetOptions(),
  );

  const displayDays = useMemo(() => {
    const daysMapping = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const result = [];

    const baseMon = new Date(weekStartEnd.monDate);

    for (let i = 0; i < 7; i++) {
      const cur = new Date(baseMon);
      cur.setDate(baseMon.getDate() + i);
      const curStr = cur.toISOString().split("T")[0];

      const itemInDb = (rangeCalendarData || []).find((d) => d.date === curStr);

      result.push({
        dateStr: curStr,
        day: daysMapping[i],
        date: cur.getDate(),
        active: curStr === selectedDateStr,
        isToday: curStr === todayStr,
        outfit: itemInDb?.outfit,
        eventTitle: itemInDb?.event_title,
      });
    }

    return result;
  }, [weekStartEnd, rangeCalendarData, selectedDateStr, todayStr]);

  const formattedMonthYear = useMemo(() => {
    const d = new Date(selectedDateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [selectedDateStr]);

  // Aggregate ALL scheduled outfit entries for the selected date
  const selectedDayEntries = useMemo(() => {
    const entries: Array<{
      history_id?: number;
      event_title?: string | null;
      outfit?: OutfitRecommendation | null;
    }> = [];

    const addEntry = (
      hId?: number | null,
      title?: string | null,
      outfit?: OutfitRecommendation | null,
    ) => {
      if (!outfit) return;
      const outfitId = outfit.outfit_id;
      const historyId = hId ?? undefined;

      const exists = entries.some(
        (e) =>
          (e.outfit?.outfit_id && e.outfit.outfit_id === outfitId) ||
          (historyId && e.history_id === historyId),
      );

      if (!exists) {
        entries.push({
          history_id: historyId,
          event_title: title || outfit.title || "Outfit Lên Lịch",
          outfit,
        });
      }
    };

    if (dailyDetail?.outfit) {
      addEntry(
        dailyDetail.history_id || dailyDetail.id,
        dailyDetail.event_title,
        dailyDetail.outfit,
      );
    }

    (rangeCalendarData || []).forEach((item) => {
      if (item.date === selectedDateStr && item.outfit) {
        addEntry(item.history_id || item.id, item.event_title, item.outfit);
      }
    });

    (upcomingEventsData || []).forEach((item) => {
      if (item.date === selectedDateStr && item.outfit) {
        addEntry(item.history_id || item.id, item.event_title, item.outfit);
      }
    });

    return entries;
  }, [dailyDetail, rangeCalendarData, upcomingEventsData, selectedDateStr]);

  const handleDeleteEventPress = useCallback(
    (historyId?: number, eventTitle?: string) => {
      Alert.alert(
        "Xóa sự kiện?",
        `Bạn có chắc chắn muốn xóa sự kiện "${eventTitle || "Sự kiện lịch"}" không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: () => {
              if (historyId) {
                deleteCalendarHistoryMutation.mutate({
                  path: { history_id: historyId },
                });
              } else {
                Alert.alert(
                  "Thông báo",
                  "Không tìm thấy mã sự kiện để xóa.",
                );
              }
            },
          },
        ],
      );
    },
    [deleteCalendarHistoryMutation],
  );

  const handleResetToToday = () => {
    setWeekOffset(0);
    setSelectedDateStr(todayStr);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-surface w-full max-w-full overflow-hidden"
      edges={["top"]}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View
          style={{ paddingBottom: bottomTabBarHeight + 24 }}
          className="px-margin-mobile pt-4"
        >
          {/* Header & Week Navigation Controls */}
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="font-sans font-bold text-headline-sm text-on-surface">
                {formattedMonthYear || "Lịch Outfit"}
              </Text>
              <Text className="font-sans text-label-md text-on-surface-variant">
                Lên lịch và theo dõi phong cách mặc hàng tuần
              </Text>
            </View>

            {/* Today Shortcut Button */}
            {weekOffset !== 0 && (
              <Pressable
                onPress={handleResetToToday}
                className="flex-row items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 active:scale-95"
              >
                <RotateCcw size={14} color="#005c55" />
                <Text className="font-sans font-bold text-label-xs text-primary">
                  Hôm nay
                </Text>
              </Pressable>
            )}
          </View>

          {/* Week Strip Navigation Header */}
          <View className="flex-row justify-between items-center mb-2 px-1">
            <Pressable
              onPress={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-full bg-surface-container-low border border-outline-variant/20 active:scale-95 flex-row items-center gap-1"
            >
              <ChevronLeft size={18} color="#005c55" />
              <Text className="font-sans font-bold text-label-xs text-primary">Tuần trước</Text>
            </Pressable>

            <Pressable
              onPress={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 rounded-full bg-surface-container-low border border-outline-variant/20 active:scale-95 flex-row items-center gap-1"
            >
              <Text className="font-sans font-bold text-label-xs text-primary">Tuần sau</Text>
              <ChevronRight size={18} color="#005c55" />
            </Pressable>
          </View>

          {/* Weekly Strip */}
          <View className="flex-row justify-between items-center mb-6 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20">
            {displayDays.map((item) => (
              <Pressable
                key={item.dateStr}
                onPress={() => setSelectedDateStr(item.dateStr)}
                className={cn(
                  "items-center py-2.5 px-3 rounded-xl relative",
                  item.active ? "bg-primary" : "bg-transparent",
                )}
              >
                <Text
                  className={cn(
                    "font-sans font-medium text-label-xs uppercase mb-1",
                    item.active ? "text-white" : "text-on-surface-variant",
                  )}
                >
                  {item.day}
                </Text>
                <Text
                  className={cn(
                    "font-sans font-bold text-title-md",
                    item.active ? "text-white" : "text-on-surface",
                  )}
                >
                  {item.date}
                </Text>

                {/* Scheduled Outfit Indicator */}
                {Boolean(item.outfit) && (
                  <View
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1",
                      item.active ? "bg-white" : "bg-primary",
                    )}
                  />
                )}

                {/* Today Indicator Ring */}
                {item.isToday && !item.active && (
                  <View className="absolute bottom-1 w-1 h-1 rounded-full bg-primary/40" />
                )}
              </Pressable>
            ))}
          </View>

          {/* Daily Outfit Detail Cards Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-sans font-bold text-headline-xs text-on-surface">
                Outfit Cho Ngày {selectedDateStr}
              </Text>
              {selectedDayEntries.length > 0 && (
                <Text className="font-sans font-semibold text-label-md text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {selectedDayEntries.length} outfit
                </Text>
              )}
            </View>

            {selectedDayEntries.length > 0 ? (
              selectedDayEntries.map((entry, idx) => (
                <View
                  key={entry.history_id ?? entry.outfit?.outfit_id ?? idx}
                  className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm mb-4"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-2">
                      <Text
                        className="font-sans font-bold text-title-md text-on-surface"
                        numberOfLines={1}
                      >
                        {entry.event_title || `Outfit #${idx + 1}`}
                      </Text>
                      <Text className="font-sans text-label-md text-on-surface-variant">
                        Style: {entry.outfit?.style_type || "Custom Style"}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() =>
                        handleDeleteEventPress(
                          entry.history_id,
                          entry.event_title || `Outfit #${idx + 1}`,
                        )
                      }
                      className="p-2 rounded-full bg-red-50 active:scale-95"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </Pressable>
                  </View>

                  {entry.outfit && (
                    <View>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/outfit-detail",
                            params: {
                              outfit_id: entry.outfit?.outfit_id
                                ? String(entry.outfit.outfit_id)
                                : undefined,
                              title: entry.outfit?.title || "Outfit Lên Lịch",
                              image: entry.outfit?.image_url || "",
                              items: entry.outfit?.items
                                ? JSON.stringify(entry.outfit.items)
                                : undefined,
                            },
                          })
                        }
                        className="flex-row items-center gap-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 active:scale-95 mb-3"
                      >
                        <View className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-outline-variant/20">
                          <Image
                            source={resolveImageUrl(entry.outfit.image_url)}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                          />
                        </View>

                        <View className="flex-1">
                          <Text
                            className="font-sans font-bold text-body-lg text-on-surface"
                            numberOfLines={1}
                          >
                            {entry.outfit.title || "Outfit Lên Lịch"}
                          </Text>
                          <Text className="font-sans text-label-md text-on-surface-variant">
                            {entry.outfit.items ? `${entry.outfit.items.length} món đồ` : "Custom"}
                          </Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                      </Pressable>

                      {/* Render items list inside outfit */}
                      {entry.outfit.items && entry.outfit.items.length > 0 && (
                        <View className="pt-2 border-t border-outline-variant/10">
                          <Text className="font-sans font-bold text-label-sm text-on-surface-variant mb-2">
                            Các món đồ trong Outfit ({entry.outfit.items.length}):
                          </Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row gap-2"
                          >
                            {entry.outfit.items.map((item, i) => (
                              <View
                                key={item.id ?? i}
                                className="p-2 bg-surface-container-low rounded-xl border border-outline-variant/20 items-center w-20 mr-2"
                              >
                                <View className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 mb-1">
                                  <Image
                                    source={resolveImageUrl(item.image_url)}
                                    style={{ width: "100%", height: "100%" }}
                                    contentFit="cover"
                                  />
                                </View>
                                <Text
                                  className="font-sans font-semibold text-label-xs text-on-surface text-center"
                                  numberOfLines={1}
                                >
                                  {item.category || item.name || "Món đồ"}
                                </Text>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <EmptyState
                icon={CalendarIcon}
                badgeText={selectedDateStr === todayStr ? "Hôm nay" : `Ngày ${selectedDateStr}`}
                title="Chưa có outfit cho ngày này"
                description="Lên lịch trang phục trước giúp bạn luôn chủ động, tự tin và tiết kiệm 15 phút đắn đo mỗi sáng."
                actionLabel="+ Lên lịch Outfit ngay"
                onAction={() => setScheduleModalVisible(true)}
                tipText="💡 Mẹo: Bạn có thể lên lịch trước cho cả tuần dựa trên dự báo thời tiết!"
                variant="card"
              />
            )}
          </View>

          {/* AI Style Insights Banner */}
          {calendarInsightsData && (
            <View className="bg-primary/10 p-5 rounded-2xl border border-primary/20 mb-6 flex-row items-start gap-3">
              <Lightbulb size={22} color="#005c55" className="mt-0.5" />
              <View className="flex-1">
                <Text className="font-sans font-bold text-title-md text-primary mb-1">
                  AI Style Insight
                </Text>
                <Text className="font-sans text-body-md text-on-surface leading-6">
                  Hiệu suất phối đồ tuần này của bạn rất ấn tượng!
                </Text>
              </View>
            </View>
          )}

          {/* Upcoming Events List Component */}
          <CalendarEventList
            events={upcomingEventsData}
            selectedDateStr={selectedDateStr}
            onDeleteEvent={handleDeleteEventPress}
            onScheduleNew={() => setScheduleModalVisible(true)}
            onSelectEvent={(evt) => setSelectedDateStr(evt.date)}
          />
        </View>
      </ScrollView>

      {/* Schedule Modal */}
      <ScheduleModal
        visible={scheduleModalVisible}
        onClose={() => setScheduleModalVisible(false)}
      />
    </SafeAreaView>
  );
}

