import React from 'react';
import { View, Text } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getWardrobeStyleInsightsApiV1DashboardInsightsGetOptions } from '@/api/@tanstack/react-query.gen';

interface StyleInsightBentoProps {
  wardrobeCount?: number;
}

export default function StyleInsightBento({ wardrobeCount = 0 }: StyleInsightBentoProps) {
  const { data: insightsData } = useQuery(
    getWardrobeStyleInsightsApiV1DashboardInsightsGetOptions()
  );

  const isNewUser = wardrobeCount === 0;

  const utilizationRate = isNewUser ? 0 : (insightsData?.utilization_rate ?? 68);
  const insightsObj =
    typeof insightsData === 'object' && insightsData !== null
      ? (insightsData as Record<string, unknown>)
      : {};

  const mainStyleTag = isNewUser
    ? 'Đang khám phá'
    : ((typeof insightsObj.top_style === 'string' ? insightsObj.top_style : undefined) ||
        (typeof insightsObj.recommended_category === 'string'
          ? insightsObj.recommended_category
          : undefined) ||
        'Smart Casual');

  const insightNote = isNewUser
    ? 'FitCheck AI sẽ phân tích thói quen mặc và đưa ra gợi ý nâng tầm phong cách sau khi bạn nạp những món đồ đầu tiên vào tủ.'
    : ((typeof insightsObj.insight_text === 'string' ? insightsObj.insight_text : undefined) ||
        (typeof insightsObj.message === 'string' ? insightsObj.message : undefined) ||
        'Since your schedule includes client meetings, this outfit balances casual comfort with professional elegance.');

  return (
    <View className="mt-10 flex-row flex-wrap gap-4">
      {/* Top AI Insight Banner */}
      <View className="w-full bg-white/90 border-l-4 border-primary border border-outline-variant/30 p-5 rounded-3xl shadow-sm">
        <View className="flex-row items-center gap-2.5 mb-2">
          <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center">
            <Lightbulb size={16} color="#005c55" />
          </View>
          <Text className="font-sans font-bold text-title-md text-on-surface">AI Style Insight</Text>
        </View>
        <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed">
          {insightNote}
        </Text>
      </View>

      {/* Bento Item 1: Top Style Focus */}
      <View className="flex-1 min-w-[45%] bg-surface-container-low p-4 rounded-3xl border border-outline-variant/20 justify-between">
        <Text className="font-sans font-bold text-label-xs text-secondary uppercase tracking-widest mb-1.5">
          Top Style Focus
        </Text>
        <Text className="font-sans font-bold text-title-lg text-on-surface" numberOfLines={1}>
          {mainStyleTag}
        </Text>
        <Text className="font-sans text-label-xs text-on-surface-variant mt-1">
          {isNewUser ? 'Chưa đủ dữ liệu' : 'Phong cách chủ đạo'}
        </Text>
      </View>

      {/* Bento Item 2: Wardrobe Use */}
      <View className="flex-1 min-w-[45%] bg-surface-container-low p-4 rounded-3xl border border-outline-variant/20 justify-between">
        <Text className="font-sans font-bold text-label-xs text-secondary uppercase tracking-widest mb-1.5">
          Wardrobe Use
        </Text>
        <Text className="font-sans font-bold text-headline-md text-on-surface">
          {utilizationRate}%
        </Text>
        <Text className="font-sans text-label-xs text-on-surface-variant mt-1">
          {isNewUser ? 'Thêm đồ để mở khóa' : 'Hiệu suất sử dụng'}
        </Text>
      </View>
    </View>
  );
}
