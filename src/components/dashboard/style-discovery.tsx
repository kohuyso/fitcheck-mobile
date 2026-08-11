import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Compass, Palette, Sparkles } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getStyleSuggestionsApiV1AiStyleSuggestionsGetOptions } from '@/api/@tanstack/react-query.gen';

export default function StyleDiscovery() {
  const { data: suggestionsData } = useQuery(
    getStyleSuggestionsApiV1AiStyleSuggestionsGetOptions()
  );

  const suggestionText = (suggestionsData as any)?.suggestion || (suggestionsData as any)?.advice || 'Khám phá phối màu tương phản giữa Blazer đen và Jeans sáng màu cho ngày đi làm.';

  return (
    <View className="mt-8">
      <Text className="font-sans font-bold text-headline-md text-on-surface tracking-tight mb-4">
        AI Style Discovery
      </Text>

      {/* AI Suggestion Box */}
      <View className="bg-white p-5 rounded-2xl border border-primary/20 shadow-sm mb-4">
        <View className="flex-row items-center gap-2 mb-2">
          <Sparkles size={18} color="#005c55" fill="#005c55" />
          <Text className="font-sans font-bold text-title-lg text-primary">Gợi Ý Thời Trang Cá Nhân</Text>
        </View>
        <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed">
          {suggestionText}
        </Text>
      </View>

      <View className="flex-row gap-4">
        <Pressable className="flex-1 bg-surface-container-high p-4 rounded-2xl flex-col gap-3 active:bg-surface-variant">
          <Compass size={24} color="#005c55" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">New Trends</Text>
        </Pressable>
        <Pressable className="flex-1 bg-surface-container-high p-4 rounded-2xl flex-col gap-3 active:bg-surface-variant">
          <Palette size={24} color="#005c55" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">Color Theory</Text>
        </Pressable>
      </View>
    </View>
  );
}
