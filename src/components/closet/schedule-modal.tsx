import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { X, Calendar as CalendarIcon, Shirt, Check } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  getMyOutfitsApiV1ClosetOutfitsGetOptions,
  scheduleCalendarEventApiV1DashboardCalendarSchedulePostMutation,
} from '@/api/@tanstack/react-query.gen';
import { calendarKeys } from '@/api/query-keys';
import { resolveImageUrl } from '@/utils/image-url';

interface ScheduleModalProps {
  visible: boolean;
  outfitId?: number;
  outfitTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScheduleModal({
  visible,
  outfitId,
  outfitTitle,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [dateStr, setDateStr] = useState<string>(getTodayStr());
  const [eventTitle, setEventTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedOutfitId, setSelectedOutfitId] = useState<number | undefined>(outfitId);

  const { data: myOutfitsData, isLoading: isOutfitsLoading } = useQuery({
    ...getMyOutfitsApiV1ClosetOutfitsGetOptions(),
    enabled: visible,
  });

  useEffect(() => {
    if (outfitId) {
      setSelectedOutfitId(outfitId);
    } else if (myOutfitsData && myOutfitsData.length > 0 && !selectedOutfitId) {
      setSelectedOutfitId(myOutfitsData[0].outfit_id);
    }
  }, [outfitId, myOutfitsData]);

  const activeOutfit = (myOutfitsData || []).find((o) => o.outfit_id === selectedOutfitId);

  const scheduleMutation = useMutation({
    ...scheduleCalendarEventApiV1DashboardCalendarSchedulePostMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.weekly() });
      if (onSuccess) onSuccess();
      Alert.alert('Thành công', `Đã lên lịch mặc outfit cho ngày ${dateStr}!`);
      onClose();
    },
    onError: (error) => {
      console.log('Schedule outfit error:', error);
      Alert.alert('Lỗi', 'Không thể lên lịch mặc cho outfit. Vui lòng thử lại.');
    },
  });

  const handleSchedule = () => {
    const targetOutfitId = selectedOutfitId || outfitId;
    if (!targetOutfitId) {
      Alert.alert('Lỗi', 'Vui lòng chọn 1 outfit để lên lịch');
      return;
    }

    if (!dateStr.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn hoặc nhập ngày hợp lệ (YYYY-MM-DD)');
      return;
    }

    scheduleMutation.mutate({
      body: {
        outfit_id: targetOutfitId,
        date: dateStr.trim(),
        event_title:
          eventTitle.trim() ||
          activeOutfit?.title ||
          outfitTitle ||
          'Lịch mặc Outfit',
        notes: notes.trim() || undefined,
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center p-4">
        <View className="w-full max-w-sm bg-white rounded-3xl p-5 border border-outline-variant/30 shadow-xl max-h-[85%]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="p-2 bg-primary/10 rounded-full">
                <CalendarIcon size={20} color="#005c55" />
              </View>
              <Text className="font-sans font-bold text-headline-xs text-on-surface">
                Lên lịch mặc Outfit
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="p-1.5 rounded-full bg-surface-container-low active:scale-95"
            >
              <X size={20} color="#181c1c" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-grow-0">
            {/* Outfit Selector Section */}
            <Text className="font-sans font-bold text-label-md text-on-surface mb-2">
              Chọn Outfit:
            </Text>
            {myOutfitsData && myOutfitsData.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-2 mb-4"
              >
                {myOutfitsData.map((outfit) => {
                  const isSelected = outfit.outfit_id === selectedOutfitId;
                  return (
                    <Pressable
                      key={outfit.outfit_id}
                      onPress={() => setSelectedOutfitId(outfit.outfit_id)}
                      className={`p-2 rounded-2xl border items-center w-28 mr-2 relative ${
                        isSelected
                          ? 'bg-primary/5 border-primary'
                          : 'bg-surface-container-low border-outline-variant/30'
                      }`}
                    >
                      {isSelected && (
                        <View className="absolute top-1.5 right-1.5 z-10 bg-primary rounded-full p-0.5">
                          <Check size={12} color="#ffffff" />
                        </View>
                      )}
                      <View className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 mb-1.5 items-center justify-center">
                        {outfit.image_url ? (
                          <Image
                            source={resolveImageUrl(outfit.image_url)}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                          />
                        ) : (
                          <Shirt size={24} color="#94a3b8" />
                        )}
                      </View>
                      <Text
                        className={`font-sans font-bold text-label-sm text-center ${
                          isSelected ? 'text-primary' : 'text-on-surface'
                        }`}
                        numberOfLines={1}
                      >
                        {outfit.title || `Outfit #${outfit.outfit_id}`}
                      </Text>
                      <Text className="font-sans text-label-xs text-on-surface-variant text-center" numberOfLines={1}>
                        {outfit.items ? `${outfit.items.length} món` : outfit.style_type || 'Custom'}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : outfitTitle ? (
              <View className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 mb-4 items-center">
                <Text className="font-sans font-semibold text-body-sm text-on-surface">
                  Outfit đã chọn: {outfitTitle}
                </Text>
              </View>
            ) : isOutfitsLoading ? (
              <View className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 mb-4 items-center">
                <Text className="font-sans text-body-sm text-on-surface-variant">
                  Đang tải danh sách outfits...
                </Text>
              </View>
            ) : (
              <View className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mb-4 items-center">
                <Text className="font-sans font-bold text-body-md text-on-surface mb-1 text-center">
                  Chưa có outfit nào để lên lịch
                </Text>
                <Text className="font-sans text-label-sm text-on-surface-variant text-center mb-3">
                  Hãy tạo hoặc lưu ít nhất 1 outfit trong tủ đồ trước khi lên lịch mặc.
                </Text>
                <Pressable
                  onPress={() => {
                    onClose();
                    router.push('/closet');
                  }}
                  className="px-4 py-2 bg-primary rounded-xl active:scale-95 shadow-sm"
                >
                  <Text className="font-sans font-bold text-label-sm text-white">
                    Đến Tủ Đồ Tạo Outfit
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Date Selector Shortcuts */}
            <Text className="font-sans font-bold text-label-md text-on-surface mb-2">
              Chọn ngày mặc:
            </Text>
            <View className="flex-row gap-2 mb-4">
              <Pressable
                onPress={() => setDateStr(getTodayStr())}
                className={`flex-1 py-2 px-3 rounded-xl border items-center ${
                  dateStr === getTodayStr()
                    ? 'bg-primary border-primary'
                    : 'bg-surface-container-low border-outline-variant/30'
                }`}
              >
                <Text
                  className={`font-sans font-semibold text-label-md ${
                    dateStr === getTodayStr() ? 'text-white' : 'text-on-surface'
                  }`}
                >
                  Hôm nay
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDateStr(getTomorrowStr())}
                className={`flex-1 py-2 px-3 rounded-xl border items-center ${
                  dateStr === getTomorrowStr()
                    ? 'bg-primary border-primary'
                    : 'bg-surface-container-low border-outline-variant/30'
                }`}
              >
                <Text
                  className={`font-sans font-semibold text-label-md ${
                    dateStr === getTomorrowStr() ? 'text-white' : 'text-on-surface'
                  }`}
                >
                  Ngày mai
                </Text>
              </Pressable>
            </View>

            {/* Custom Date Input */}
            <Text className="font-sans font-bold text-label-sm text-on-surface-variant mb-1">
              Ngày cụ thể (YYYY-MM-DD):
            </Text>
            <TextInput
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-sans text-body-md text-on-surface mb-4"
            />

            {/* Event Title Input */}
            <Text className="font-sans font-bold text-label-sm text-on-surface-variant mb-1">
              Tên sự kiện / Dịp (Tùy chọn):
            </Text>
            <TextInput
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Ví dụ: Đi làm, Đi chơi cuối tuần..."
              placeholderTextColor="#94a3b8"
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-sans text-body-md text-on-surface mb-4"
            />
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-3 pt-3 border-t border-outline-variant/20">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 bg-surface-container-high rounded-xl items-center active:scale-95"
            >
              <Text className="font-sans font-bold text-label-lg text-on-surface-variant">Hủy</Text>
            </Pressable>

            <Pressable
              onPress={handleSchedule}
              disabled={scheduleMutation.isPending}
              className="flex-1 py-3 bg-primary rounded-xl items-center active:scale-95 shadow-sm"
            >
              <Text className="font-sans font-bold text-label-lg text-white">
                {scheduleMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

