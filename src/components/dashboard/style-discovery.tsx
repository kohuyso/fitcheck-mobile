import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Compass, Palette, Sparkles, RefreshCw, X, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getStyleSuggestionsApiV1AiStyleSuggestionsGetOptions,
  getStyleSuggestionsApiV1AiStyleSuggestionsGetQueryKey,
  getFashionTrendsApiV1ExploreTrendsGetOptions,
  getColorTheoryGuidesApiV1ExploreColorTheoryGetOptions,
} from '@/api/@tanstack/react-query.gen';
import { AiStylist } from '@/api/sdk.gen';
import { StyleSuggestionResponse } from '@/api/types.gen';
import { resolveImageUrl } from '@/utils/image-url';

const DEFAULT_TREND_ARTICLES = [
  {
    id: 101,
    title: 'Quy tắc phối đồ Smart Casual 2026',
    season: 'Summer 2026',
    read_time: '3 min read',
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    content: 'Dựa trên phân tích tủ đồ, phong cách chủ đạo Smart Casual kết hợp linh hoạt chất liệu nhẹ như Linen hay Denim giúp bạn giữ nét thời thượng bất kể thời tiết.',
    tags: ['Smart Casual', 'Layering', 'AI Tips'],
  },
  {
    id: 102,
    title: 'Xu hướng Color Blocking Tương phản dịu',
    season: 'All Season',
    read_time: '5 min read',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    content: 'Thay vì kết hợp các màu chói rực rỡ, xu hướng năm nay hướng tới tông pastel tương phản nhẹ như Navy Blue - Off White hoặc Beige - Olive Green.',
    tags: ['Color Matching', 'Trends'],
  },
];

const DEFAULT_COLOR_GUIDES = [
  {
    harmony_type: 'Monochromatic (Phối màu Đơn sắc)',
    description: 'Sử dụng các sắc thái (shades) khác nhau của cùng 1 tông màu chính.',
    color_wheel_tip: 'Tăng tính thanh lịch và tạo cảm giác chiều cao tốt hơn.',
  },
  {
    harmony_type: 'Complementary (Màu tương phản)',
    description: 'Phối hợp 2 tông màu đối diện trên bánh xe màu sắc để tạo điểm nhấn nổi bật.',
    color_wheel_tip: 'Nên chọn 1 màu chủ đạo 70% và 1 màu tương phản 30% làm nhấn.',
  },
  {
    harmony_type: 'Analogous (Tương tự/Liền kề)',
    description: 'Sử dụng 3 màu nằm sát nhau trên bánh xe màu sắc (như Xanh dương - Xanh ngọc - Xanh lá).',
    color_wheel_tip: 'Mang lại cảm giác tự nhiên, hài hòa và dễ chịu cho mắt người nhìn.',
  },
];

export default function StyleDiscovery() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<'trends' | 'color-theory' | null>(null);

  const { data: suggestionsData, isFetching: isQueryFetching } = useQuery(
    getStyleSuggestionsApiV1AiStyleSuggestionsGetOptions()
  );

  const { data: trendsData, isLoading: isTrendsLoading } = useQuery({
    ...getFashionTrendsApiV1ExploreTrendsGetOptions(),
    enabled: activeModal === 'trends',
  });

  const { data: colorTheoryData, isLoading: isColorTheoryLoading } = useQuery({
    ...getColorTheoryGuidesApiV1ExploreColorTheoryGetOptions(),
    enabled: activeModal === 'color-theory',
  });

  const forceRefreshMutation = useMutation({
    mutationFn: async () => {
      const { data } = await AiStylist.getStyleSuggestionsApiV1AiStyleSuggestionsGet({
        query: { force_refresh: true },
      });
      return data;
    },
    onSuccess: (newData) => {
      if (newData) {
        queryClient.setQueryData(
          getStyleSuggestionsApiV1AiStyleSuggestionsGetQueryKey(),
          newData
        );
      }
    },
  });

  const isRefreshing = forceRefreshMutation.isPending || (isQueryFetching && forceRefreshMutation.isSuccess);

  const typedSuggestions = suggestionsData as StyleSuggestionResponse | undefined;

  const styleAnalysis = typedSuggestions?.style_analysis;
  const styleTips = typedSuggestions?.style_tips?.join(' • ');

  const suggestionText =
    styleAnalysis ||
    (typeof suggestionsData === 'object' && suggestionsData !== null && 'suggestion' in suggestionsData
      ? (suggestionsData as { suggestion?: string }).suggestion
      : undefined) ||
    (typeof suggestionsData === 'object' && suggestionsData !== null && 'advice' in suggestionsData
      ? (suggestionsData as { advice?: string }).advice
      : undefined) ||
    'Khám phá phối màu tương phản giữa Blazer đen và Jeans sáng màu cho ngày đi làm.';

  const handleForceRefresh = () => {
    if (!isRefreshing) {
      forceRefreshMutation.mutate();
    }
  };

  const trendArticles =
    trendsData?.trend_articles && trendsData.trend_articles.length > 0
      ? trendsData.trend_articles
      : DEFAULT_TREND_ARTICLES;

  const colorGuides =
    colorTheoryData?.guides && colorTheoryData.guides.length > 0
      ? colorTheoryData.guides
      : DEFAULT_COLOR_GUIDES;

  const handleOpenTrends = () => {
    console.log('[StyleDiscovery] Opening New Trends modal');
    setActiveModal('trends');
  };

  const handleOpenColorTheory = () => {
    console.log('[StyleDiscovery] Opening Color Theory modal');
    setActiveModal('color-theory');
  };

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-sans font-bold text-headline-md text-on-surface tracking-tight">
          AI Style Discovery
        </Text>
        <Pressable
          onPress={handleForceRefresh}
          disabled={isRefreshing}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 active:bg-primary/20"
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#005c55" />
          ) : (
            <RefreshCw size={14} color="#005c55" />
          )}
          <Text className="font-sans font-semibold text-label-md text-primary">
            {isRefreshing ? 'Đang tạo mới...' : 'Tạo gợi ý mới'}
          </Text>
        </Pressable>
      </View>

      {/* AI Suggestion Box */}
      <View className="bg-white p-5 rounded-2xl border border-primary/20 shadow-sm mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Sparkles size={18} color="#005c55" fill="#005c55" />
            <Text className="font-sans font-bold text-title-lg text-primary">Gợi Ý Thời Trang Cá Nhân</Text>
          </View>
        </View>
        <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed">
          {suggestionText}
        </Text>
        {styleTips ? (
          <View className="mt-3 pt-3 border-t border-outline-variant/20">
            <Text className="font-sans text-body-sm text-primary font-medium">
              💡 Mẹo phối đồ: {styleTips}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row gap-4">
        <Pressable
          onPress={handleOpenTrends}
          className="flex-1 bg-surface-container-high p-4 rounded-2xl flex-col gap-3 active:scale-95 border border-outline-variant/20"
        >
          <Compass size={24} color="#005c55" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">New Trends</Text>
        </Pressable>
        <Pressable
          onPress={handleOpenColorTheory}
          className="flex-1 bg-surface-container-high p-4 rounded-2xl flex-col gap-3 active:scale-95 border border-outline-variant/20"
        >
          <Palette size={24} color="#005c55" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">Color Theory</Text>
        </Pressable>
      </View>

      {/* Interactive Modal for Trends & Color Theory */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
        statusBarTranslucent
      >
        <View style={{ paddingTop: Math.max(insets.top, 20) }} className="flex-1 bg-surface">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-outline-variant/30">
            <View className="flex-row items-center gap-2">
              {activeModal === 'trends' ? (
                <TrendingUp size={22} color="#005c55" />
              ) : (
                <Palette size={22} color="#005c55" />
              )}
              <Text className="font-sans font-bold text-title-lg text-on-surface">
                {activeModal === 'trends' ? 'Fashion Trends 2026' : 'Color Theory & Guides'}
              </Text>
            </View>
            <Pressable
              onPress={() => setActiveModal(null)}
              className="p-2 rounded-full bg-surface-container-low active:scale-95"
            >
              <X size={22} color="#181c1c" />
            </Pressable>
          </View>

          {/* Modal Content */}
          <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
            {activeModal === 'trends' && (
              <View>
                {isTrendsLoading && trendArticles.length === 0 ? (
                  <ActivityIndicator size="large" color="#005c55" className="my-12" />
                ) : (
                  trendArticles.map((article) => (
                    <View
                      key={article.id}
                      className="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm mb-5 p-4"
                    >
                      {article.image_url ? (
                        <View className="h-44 rounded-xl overflow-hidden mb-3 bg-slate-100">
                          <Image
                            source={resolveImageUrl(article.image_url)}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                          />
                        </View>
                      ) : null}
                      <Text className="font-sans font-bold text-title-lg text-on-surface mb-2">
                        {article.title}
                      </Text>
                      <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed mb-3">
                        {article.content}
                      </Text>
                      {article.tags && article.tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-2">
                          {article.tags.map((tag, idx) => (
                            <View key={idx} className="bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                              <Text className="font-sans text-label-sm font-semibold color-primary">#{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {activeModal === 'color-theory' && (
              <View>
                {isColorTheoryLoading && colorGuides.length === 0 ? (
                  <ActivityIndicator size="large" color="#005c55" className="my-12" />
                ) : (
                  colorGuides.map((guide, idx) => (
                    <View
                      key={idx}
                      className="bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-sm mb-4"
                    >
                      <View className="flex-row items-center gap-3 mb-2">
                        <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                          <Sparkles size={20} color="#005c55" />
                        </View>
                        <Text className="font-sans font-bold text-title-md text-on-surface flex-1">
                          {guide.harmony_type || 'Quy Tắc Phối Màu'}
                        </Text>
                      </View>
                      <Text className="font-sans text-body-md text-on-surface-variant mb-2">
                        {guide.description}
                      </Text>
                      <View className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                        <Text className="font-sans text-body-sm font-medium text-primary">
                          💡 Mẹo bánh xe màu: {guide.color_wheel_tip}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Link to Full Explore Screen */}
            <Pressable
              onPress={() => {
                setActiveModal(null);
                router.navigate('/explore');
              }}
              className="mt-4 bg-primary p-4 rounded-xl flex-row items-center justify-center gap-2 active:opacity-90 shadow-sm"
            >
              <Text className="font-sans font-bold text-title-md text-white">Khám Phá Thêm Ở Tab Explore</Text>
              <ChevronRight size={18} color="#ffffff" />
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
