import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Calendar as CalendarIcon, Plus, Trash2, Shirt, ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';

import { CalendarDayPreview } from '@/api/types.gen';
import { resolveImageUrl } from '@/utils/image-url';

import { cn } from '@/utils/cn';

interface CalendarEventListProps {
  events?: CalendarDayPreview[];
  selectedDateStr?: string;
  onDeleteEvent: (historyId?: number, eventTitle?: string) => void;
  onScheduleNew: () => void;
  onSelectEvent?: (evt: CalendarDayPreview) => void;
}

export const CalendarEventList = React.memo(function CalendarEventList({
  events,
  selectedDateStr,
  onDeleteEvent,
  onScheduleNew,
  onSelectEvent,
}: CalendarEventListProps) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-sans font-bold text-headline-xs text-on-surface">
          Sự kiện sắp tới (Upcoming Events)
        </Text>
        <Pressable onPress={onScheduleNew} className="flex-row items-center gap-1 active:opacity-70">
          <Plus size={16} color="#005c55" />
          <Text className="font-sans font-semibold text-label-md text-primary">Tạo mới</Text>
        </Pressable>
      </View>

      {events && events.length > 0 ? (
        events.map((evt, idx) => {
          const historyId = evt.history_id ?? evt.id ?? undefined;
          const hasOutfit = Boolean(evt.outfit);
          const isSelected = evt.date === selectedDateStr;

          return (
            <Pressable
              key={idx}
              onPress={() => onSelectEvent && onSelectEvent(evt)}
              className={cn(
                "p-4 rounded-2xl border mb-3 flex-row justify-between items-center shadow-sm active:scale-[0.99]",
                isSelected
                  ? "bg-primary/5 border-primary"
                  : "bg-white border-outline-variant/20",
              )}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-14 h-14 rounded-xl overflow-hidden bg-primary/10 items-center justify-center border border-outline-variant/20">
                  {evt.outfit?.image_url ? (
                    <Image
                      source={resolveImageUrl(evt.outfit.image_url)}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  ) : (
                    <CalendarIcon size={22} color="#005c55" />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="font-sans font-bold text-body-lg text-on-surface" numberOfLines={1}>
                    {evt.event_title || evt.outfit?.title || 'Sự kiện outfit'}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    <Text className="font-sans font-medium text-label-md text-on-surface-variant">
                      {evt.date}
                    </Text>
                    {hasOutfit && (
                      <Text className="font-sans text-label-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        {evt.outfit?.items ? `${evt.outfit.items.length} món đồ` : evt.outfit?.style_type || 'Outfit'}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => onDeleteEvent(historyId, evt.event_title || 'Sự kiện')}
                  className="p-2 rounded-full bg-red-50 active:scale-95 ml-2"
                  hitSlop={8}
                >
                  <Trash2 size={18} color="#ef4444" />
                </Pressable>
                {onSelectEvent && <ChevronRight size={18} color="#94a3b8" />}
              </View>
            </Pressable>
          );
        })
      ) : (
        <View className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 items-center">
          <Text className="font-sans text-body-md text-on-surface-variant text-center mb-3">
            Chưa có sự kiện lên lịch nào sắp tới.
          </Text>
          <Pressable
            onPress={onScheduleNew}
            className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 active:scale-95"
          >
            <Text className="font-sans font-semibold text-label-md text-primary">
              + Lên lịch ngay
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

