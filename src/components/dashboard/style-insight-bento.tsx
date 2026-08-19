import React from 'react';
import { View, Text } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getWardrobeStyleInsightsApiV1DashboardInsightsGetOptions } from '@/api/@tanstack/react-query.gen';

export default function StyleInsightBento() {
  const { data: insightsData } = useQuery(
    getWardrobeStyleInsightsApiV1DashboardInsightsGetOptions()
  );

  const utilizationRate = insightsData?.utilization_rate ?? 68;
  const insightsObj = typeof insightsData === 'object' && insightsData !== null ? (insightsData as Record<string, unknown>) : {};
  const mainStyleTag = (typeof insightsObj.top_style === 'string' ? insightsObj.top_style : undefined) || (typeof insightsObj.recommended_category === 'string' ? insightsObj.recommended_category : undefined) || 'Smart Casual';
  const insightNote = (typeof insightsObj.insight_text === 'string' ? insightsObj.insight_text : undefined) || (typeof insightsObj.message === 'string' ? insightsObj.message : undefined) || "Since your schedule includes client meetings, this outfit balances casual comfort with professional elegance.";

  return (
    <View className="mt-12 flex-row flex-wrap gap-4">
      <View className="w-full bg-white/80 border-l-4 border-primary/40 border border-outline-variant/30 p-5 rounded-2xl">
        <View className="flex-row items-center gap-3 mb-2">
          <Lightbulb size={20} color="#005c55" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">AI Style Insight</Text>
        </View>
        <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed">
          {insightNote}
        </Text>
      </View>

      <View className="flex-1 min-w-[45%] bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
        <Text className="font-sans font-bold text-label-sm text-secondary uppercase tracking-widest mb-1">
          Top Style Focus
        </Text>
        <Text className="font-sans font-bold text-headline-md text-on-surface">{mainStyleTag}</Text>
      </View>

      <View className="flex-1 min-w-[45%] bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
        <Text className="font-sans font-bold text-label-sm text-secondary uppercase tracking-widest mb-1">
          Wardrobe Use
        </Text>
        <Text className="font-sans font-bold text-headline-md text-on-surface">{utilizationRate}%</Text>
      </View>
    </View>
  );
}
