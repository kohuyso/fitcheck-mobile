import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Compass, Palette, Sparkles, BookOpen, ChevronRight, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import {
  getColorTheoryGuidesApiV1ExploreColorTheoryGetOptions,
  getFashionTrendsApiV1ExploreTrendsGetOptions,
} from '@/api/@tanstack/react-query.gen';

export default function ExploreScreen() {
  const router = useRouter();

  // Fetch Trends API Query
  const { data: trendsData } = useQuery(
    getFashionTrendsApiV1ExploreTrendsGetOptions()
  );

  // Fetch Color Theory API Query
  const { data: colorTheoryData } = useQuery(
    getColorTheoryGuidesApiV1ExploreColorTheoryGetOptions()
  );

  const articles = trendsData?.trend_articles || [];
  const colorGuides = colorTheoryData?.guides || [];
  const aiColorAdvice = colorTheoryData?.ai_advice || '';

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30">
        <View className="flex-row items-center gap-2">
          <Compass size={24} className="text-primary" />
          <Text className="font-sans font-bold text-headline-md text-on-surface">Explore & Style</Text>
        </View>
        <View className="bg-primary/10 px-3 py-1 rounded-full flex-row items-center gap-1">
          <TrendingUp size={14} className="text-primary" />
          <Text className="font-sans font-bold text-label-sm text-primary uppercase">Trending</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-margin-mobile pt-6 pb-28">
          {/* AI Color Theory Banner */}
          <View className="bg-white rounded-3xl p-6 border border-primary/20 shadow-sm mb-8 relative overflow-hidden">
            <View className="flex-row items-center gap-2 mb-3">
              <Palette size={22} className="text-primary" />
              <Text className="font-sans font-bold text-title-lg text-on-surface">
                AI Color Theory Guide
              </Text>
            </View>
            <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed mb-4">
              {aiColorAdvice}
            </Text>

            {/* Color Harmony Cards */}
            <View className="gap-3">
              {colorGuides.map((guide, idx) => (
                <View
                  key={idx}
                  className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20"
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-sans font-bold text-body-md text-primary">
                      {guide.harmony_type}
                    </Text>
                    <Text className="font-sans text-label-sm font-semibold text-secondary">
                      {guide.color_wheel_tip}
                    </Text>
                  </View>
                  <Text className="font-sans text-label-md text-on-surface-variant">
                    {guide.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trend Articles Section */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-sans font-bold text-headline-md text-on-surface">
              Latest Trend Insights
            </Text>
            <Pressable className="flex-row items-center gap-1">
              <Text className="font-sans font-semibold text-label-md text-primary">See All</Text>
              <ChevronRight size={16} className="text-primary" />
            </Pressable>
          </View>

          <View className="gap-4">
            {articles.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  router.navigate('/chat' as any);
                }}
                className="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm active:scale-[0.98]"
              >
                <View className="h-48 w-full bg-surface-container-high relative">
                  <Image source={item.image_url} className="w-full h-full" contentFit="cover" />
                  <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                    <Text className="font-sans font-bold text-label-sm text-primary uppercase">
                      {(item as any).category || (item as any).season || 'Seasonal Trends'}
                    </Text>
                  </View>
                </View>
                <View className="p-4">
                  <Text className="font-sans font-bold text-title-lg text-on-surface mb-1">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <BookOpen size={14} className="text-on-surface-variant" />
                    <Text className="font-sans text-label-md text-on-surface-variant">
                      {item.read_time}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
