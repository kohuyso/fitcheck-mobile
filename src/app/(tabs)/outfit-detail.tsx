import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Calendar as CalendarIcon, Briefcase, CheckCircle } from 'lucide-react-native';

import {
  deleteCustomOutfitApiV1ClosetOutfitsOutfitIdDeleteMutation,
  getMyOutfitsApiV1ClosetOutfitsGetOptions,
  getOutfitDetailApiV1ClosetOutfitsOutfitIdGetOptions,
  getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetOptions,
  toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation,
  wearOutfitApiV1DashboardWearOutfitPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { calendarKeys, closetKeys } from '@/api/query-keys';
import { ClothingItemFlat, OutfitRecommendation } from '@/api/types.gen';
import { ScheduleModal } from '@/components/closet/schedule-modal';
import { OutfitHeaderBar } from '@/components/outfit/outfit-header-bar';
import { OutfitItemGrid } from '@/components/outfit/outfit-item-grid';
import { useAppNavigation } from '@/context/navigation-history';
import { cn } from '@/utils/cn';
import { resolveImageUrl, DEFAULT_BLURHASH } from '@/utils/image-url';

export default function OutfitDetailScreen() {
  const router = useRouter();
  const { goBack } = useAppNavigation();
  const queryClient = useQueryClient();

  const searchParams = useLocalSearchParams<{
    outfit_id?: string | string[];
    id?: string | string[];
    title?: string;
    image?: string;
    description?: string;
    tags?: string;
    items?: string;
  }>();

  const outfitIdParam = Array.isArray(searchParams.outfit_id)
    ? searchParams.outfit_id[0]
    : searchParams.outfit_id || (Array.isArray(searchParams.id) ? searchParams.id[0] : searchParams.id);

  const currentCachedOutfit = queryClient.getQueryData<OutfitRecommendation>(
    closetKeys.activeOutfit('current')
  );

  const parsedParamId = outfitIdParam ? Number(outfitIdParam) : undefined;
  const hasValidParamId = parsedParamId !== undefined && !isNaN(parsedParamId) && parsedParamId > 0;
  const outfitId = hasValidParamId
    ? parsedParamId
    : currentCachedOutfit?.outfit_id && !isNaN(Number(currentCachedOutfit.outfit_id))
    ? Number(currentCachedOutfit.outfit_id)
    : undefined;

  const isValidOutfitId = outfitId !== undefined && outfitId > 0;
  const activeCacheKey = closetKeys.activeOutfit(outfitId || searchParams.title || 'current');
  const tanstackCachedOutfit = queryClient.getQueryData<OutfitRecommendation>(activeCacheKey);

  const { data: singleOutfitData } = useQuery({
    ...getOutfitDetailApiV1ClosetOutfitsOutfitIdGetOptions({
      path: { outfit_id: (outfitId || 0) as number },
    }),
    queryKey: closetKeys.outfitDetail({ path: { outfit_id: (outfitId || 0) as number } }),
    enabled: isValidOutfitId,
    staleTime: 1000 * 60 * 15,
  });

  const { data: myOutfitsData } = useQuery({
    ...getMyOutfitsApiV1ClosetOutfitsGetOptions(),
    queryKey: closetKeys.outfits(),
    enabled: !singleOutfitData && isValidOutfitId,
    staleTime: 1000 * 60 * 15,
  });

  const { data: weeklyCalendarData } = useQuery({
    ...getWeeklyCalendarStripApiV1DashboardCalendarWeeklyGetOptions(),
    queryKey: calendarKeys.weekly(),
    staleTime: 1000 * 60 * 5,
  });

  const currentOutfit: OutfitRecommendation | undefined = useMemo(() => {
    if (singleOutfitData) return singleOutfitData as OutfitRecommendation;
    if (isValidOutfitId && myOutfitsData) {
      return myOutfitsData.find((o) => o.outfit_id === outfitId);
    }
    return undefined;
  }, [singleOutfitData, isValidOutfitId, myOutfitsData, outfitId]);

  const parsedItemsFromParams: ClothingItemFlat[] = useMemo(() => {
    if (searchParams.items) {
      try {
        const parsed = typeof searchParams.items === 'string' ? JSON.parse(searchParams.items) : searchParams.items;
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.log('Failed to parse items param:', e);
      }
    }
    return [];
  }, [searchParams.items]);

  const activeOutfit = useMemo(() => {
    if (currentOutfit) return currentOutfit;
    if (tanstackCachedOutfit) return tanstackCachedOutfit;
    if (currentCachedOutfit && (!hasValidParamId || currentCachedOutfit.outfit_id === outfitId)) {
      return currentCachedOutfit;
    }
    return undefined;
  }, [currentOutfit, tanstackCachedOutfit, currentCachedOutfit, hasValidParamId, outfitId]);

  const title = activeOutfit?.title || searchParams.title || 'Chi tiết Outfit';
  const heroImage = activeOutfit?.image_url || searchParams.image || '';
  const descriptionText = activeOutfit?.description || searchParams.description || '';
  const styleType = activeOutfit?.style_type || 'Custom Style';
  const outfitItems: ClothingItemFlat[] =
    activeOutfit?.items && activeOutfit.items.length > 0 ? activeOutfit.items : parsedItemsFromParams;
  const tagsList: string[] =
    activeOutfit?.tags || (searchParams.tags ? searchParams.tags.split(',') : []);

  const [sessionWornOutfitId, setSessionWornOutfitId] = useState<number | string | null>(null);
  const [sessionBookmarkMap, setSessionBookmarkMap] = useState<Record<string | number, boolean>>({});
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayWornOutfitId = useMemo(() => {
    if (!weeklyCalendarData) return undefined;
    const todayItem = weeklyCalendarData.find((item) => item.date === todayStr);
    return todayItem?.outfit?.outfit_id ? Number(todayItem.outfit.outfit_id) : undefined;
  }, [weeklyCalendarData, todayStr]);

  const isWorn = useMemo(() => {
    if (isValidOutfitId && outfitId) {
      if (sessionWornOutfitId === outfitId) return true;
      return todayWornOutfitId === outfitId;
    }
    if (sessionWornOutfitId && sessionWornOutfitId === (searchParams.title || 'current')) {
      return true;
    }
    return false;
  }, [isValidOutfitId, outfitId, sessionWornOutfitId, todayWornOutfitId, searchParams.title]);

  const isBookmarked = useMemo(() => {
    const key = outfitId || searchParams.title || 'current';
    if (sessionBookmarkMap[key] !== undefined) {
      return sessionBookmarkMap[key];
    }
    if (isValidOutfitId && myOutfitsData) {
      return myOutfitsData.some((o) => o.outfit_id === outfitId);
    }
    return false;
  }, [outfitId, searchParams.title, sessionBookmarkMap, isValidOutfitId, myOutfitsData]);

  const bookmarkMutation = useMutation(toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation());
  const deleteOutfitMutation = useMutation({
    ...deleteCustomOutfitApiV1ClosetOutfitsOutfitIdDeleteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
      Alert.alert('Thành công', 'Đã xóa outfit khỏi bộ sưu tập của bạn.');
      goBack('/closet');
    },
    onError: () => Alert.alert('Lỗi', 'Không thể xóa outfit. Vui lòng thử lại.'),
  });

  const wearOutfitMutation = useMutation({
    ...wearOutfitApiV1DashboardWearOutfitPostMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.weekly() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      if (outfitId) {
        setSessionWornOutfitId(outfitId);
      }
      Alert.alert('Tuyệt vời!', 'Đã ghi nhận outfit được mặc hôm nay!');
    },
  });

  const handleToggleBookmark = useCallback(async () => {
    const key = outfitId || searchParams.title || 'current';
    const nextState = !isBookmarked;
    setSessionBookmarkMap((prev) => ({ ...prev, [key]: nextState }));

    if (isValidOutfitId && outfitId) {
      try {
        await bookmarkMutation.mutateAsync({ path: { outfit_id: outfitId } });
        queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
      } catch (err) {
        console.log('Bookmark error:', err);
        setSessionBookmarkMap((prev) => ({ ...prev, [key]: !nextState }));
      }
    }
  }, [outfitId, searchParams.title, isBookmarked, isValidOutfitId, bookmarkMutation, queryClient]);

  const handleItemPress = useCallback((item: ClothingItemFlat) => {
    router.push({
      pathname: '/item-detail',
      params: {
        id: String(item.id),
        name: item.name,
        category: item.category,
        color: item.color_name || 'Color',
        style: item.style || item.style_tag || 'Casual',
        image: item.image_url,
        from: '/outfit-detail',
        outfit_id: outfitId ? String(outfitId) : undefined,
      },
    });
  }, [router, outfitId]);

  const handleDeleteOutfit = useCallback(() => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa outfit "${title}" khỏi danh sách?`);
      if (confirmed) {
        if (isValidOutfitId) {
          deleteOutfitMutation.mutate({ path: { outfit_id: outfitId } });
        } else {
          goBack('/closet');
        }
      }
      return;
    }

    Alert.alert('Xóa Outfit này?', `Bạn có chắc chắn muốn xóa outfit "${title}" khỏi danh sách?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          if (isValidOutfitId) {
            deleteOutfitMutation.mutate({ path: { outfit_id: outfitId } });
          } else {
            goBack('/closet');
          }
        },
      },
    ]);
  }, [title, isValidOutfitId, outfitId, deleteOutfitMutation, goBack]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <OutfitHeaderBar
        title={title}
        isBookmarked={isBookmarked}
        onBack={() => goBack('/closet')}
        onToggleBookmark={handleToggleBookmark}
        onDelete={handleDeleteOutfit}
      />

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {heroImage ? (
          <View className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 mb-6 border border-outline-variant/20 shadow-sm relative items-center justify-center p-4">
            <Image
              source={resolveImageUrl(heroImage)}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
              placeholder={{ blurhash: DEFAULT_BLURHASH }}
              transition={200}
            />
            <View className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
              <Text className="font-sans font-bold text-label-xs text-white uppercase tracking-wider">
                {styleType}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="bg-white p-5 rounded-3xl border border-outline-variant/30 shadow-sm mb-6">
          <Text className="font-sans font-bold text-headline-sm text-on-surface mb-2">{title}</Text>
          {descriptionText ? (
            <Text className="font-sans text-body-md text-on-surface-variant leading-6 mb-4">
              {descriptionText}
            </Text>
          ) : null}
          {tagsList.length > 0 && (
            <View className="flex-row flex-wrap gap-2 pt-2 border-t border-outline-variant/20">
              {tagsList.map((tag, idx) => (
                <View key={idx} className="px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant/20">
                  <Text className="font-sans font-semibold text-label-xs text-on-surface-variant uppercase">
                    {tag.trim()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <OutfitItemGrid items={outfitItems} onItemPress={handleItemPress} />

        <View className="bg-primary/10 p-5 rounded-3xl border border-primary/20 mb-6 flex-row items-start gap-3">
          <Sparkles size={22} color="#005c55" fill="#005c55" className="mt-0.5" />
          <View className="flex-1">
            <Text className="font-sans font-bold text-title-md text-primary mb-1">
              Lời khuyên phối đồ AI Stylist
            </Text>
            <Text className="font-sans text-body-md text-on-surface leading-6">
              Outfit được tối ưu hóa cân bằng giữa sự thoải mái và phong cách cá nhân.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setScheduleModalVisible(true)}
          className="w-full h-14 bg-surface-container-high border border-outline-variant/40 rounded-2xl flex-row items-center justify-center gap-2 active:scale-95 mb-3 shadow-sm"
        >
          <CalendarIcon size={20} color="#005c55" />
          <Text className="font-sans font-bold text-title-md text-primary">
            Set lịch mặc outfit này vào Lịch
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (isValidOutfitId) {
              wearOutfitMutation.mutate({ query: { outfit_id: outfitId } });
            } else {
              setSessionWornOutfitId(searchParams.title || 'current');
            }
          }}
          disabled={wearOutfitMutation.isPending}
          className={cn(
            'w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 active:scale-95 shadow-md mb-4',
            isWorn ? 'bg-emerald-600' : 'bg-primary shadow-primary/20'
          )}
        >
          {isWorn ? (
            <>
              <CheckCircle size={20} color="#ffffff" />
              <Text className="font-sans font-bold text-title-lg text-white">Đã chọn mặc Outfit này hôm nay</Text>
            </>
          ) : (
            <>
              <Briefcase size={20} color="#ffffff" />
              <Text className="font-sans font-bold text-title-lg text-white">
                {wearOutfitMutation.isPending ? 'Đang cập nhật...' : 'Hôm nay mặc Outfit này'}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <ScheduleModal
        visible={scheduleModalVisible}
        outfitId={outfitId}
        outfitTitle={title}
        onClose={() => setScheduleModalVisible(false)}
      />
    </SafeAreaView>
  );
}
