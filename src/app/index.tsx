import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Bot, Check, Link2, MapPin, RefreshCw, Sun } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getHomeDashboardApiV1DashboardHomeGetOptions,
  wearOutfitApiV1DashboardWearOutfitPostMutation,
} from '@/api/@tanstack/react-query.gen';

import OutfitCarousel from '@/components/dashboard/outfit-carousel';
import ScheduleTag from '@/components/dashboard/schedule-tag';
import StyleAssistantBanner from '@/components/dashboard/style-assistant-banner';
import StyleDiscovery from '@/components/dashboard/style-discovery';
import StyleInsightBento from '@/components/dashboard/style-insight-bento';
import SwapItemSheet from '@/components/dashboard/swap-item-sheet';
import WeatherAdvice from '@/components/dashboard/weather-advice';

export default function HomeScreen() {
  const router = useRouter();
  const [isWorn, setIsWorn] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch Dashboard API Query
  const { data: dashboardData } = useQuery(
    getHomeDashboardApiV1DashboardHomeGetOptions({
      query: { lat: 21.0285, lon: 105.8542 },
    })
  );

  const data = dashboardData;

  // Wear Outfit API Mutation
  const wearMutation = useMutation(wearOutfitApiV1DashboardWearOutfitPostMutation());

  const toggleWear = async () => {
    try {
      const outfitId = data?.recommended_outfits?.[0]?.outfit_id;
      if (outfitId !== undefined) {
        await wearMutation.mutateAsync({
          query: { outfit_id: outfitId },
        });
      }
    } catch (error) {
      console.log('Wear outfit skipped/failed:', error);
    }
    setIsWorn(true);
    setTimeout(() => {
      setIsWorn(false);
    }, 3000);
  };

  const displayLocation = data?.location ?? 'Hanoi, VN';
  const displayTemp =
    data?.weather?.temperature !== undefined
      ? `${data.weather.temperature}°C`
      : '--°C';

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30">
        <View className="flex-row items-center gap-2">
          <MapPin size={22} className="text-primary" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">{displayLocation}</Text>
        </View>
        <View className="bg-surface-container-low px-3 py-1.5 rounded-full flex-row items-center gap-2">
          <Sun size={16} className="text-primary fill-primary" />
          <Text className="font-sans font-medium text-label-md text-on-surface">{displayTemp}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-margin-mobile pt-6 pb-28">
          {/* Weather Advice */}
          <WeatherAdvice
            condition={dashboardData?.weather?.condition}
            temperature={dashboardData?.weather?.temperature}
            recommendation={dashboardData?.weather?.recommendation}
          />

          {/* Schedule Tag */}
          <ScheduleTag schedule={dashboardData?.schedule} />

          {/* Style Assistant Card */}
          <StyleAssistantBanner />

          {/* AI Curated Daily Section */}
          <View className="mb-4 flex-row items-end justify-between">
            <Text className="font-sans font-bold text-headline-md text-on-surface tracking-tight">
              AI Curated Daily
            </Text>
            <Pressable onPress={() => router.navigate('/outfit-detail' as any)}>
              <Text className="text-primary font-sans font-semibold text-label-md">View All</Text>
            </Pressable>
          </View>

          {/* Carousel */}
          <OutfitCarousel outfits={dashboardData?.recommended_outfits} />

          {/* Interaction Buttons */}
          <View className="flex-col gap-3">
            <Pressable
              onPress={toggleWear}
              className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 active:scale-95 shadow-md ${
                isWorn ? 'bg-emerald-600' : 'bg-primary shadow-primary/20'
              }`}
            >
              <Text className="font-sans font-bold text-title-lg text-white">
                {isWorn ? 'Outfit Selected' : 'Wear This Outfit'}
              </Text>
              {isWorn ? (
                <Check size={20} className="text-white" />
              ) : (
                <Link2 size={20} className="text-white" />
              )}
            </Pressable>

            <Pressable
              onPress={() => setIsSheetOpen(true)}
              className="w-full h-14 bg-surface-container rounded-xl flex-row items-center justify-center gap-2 active:scale-95 border border-outline-variant/30"
            >
              <Text className="font-sans font-bold text-title-lg text-on-surface">Replace Item</Text>
              <RefreshCw size={18} className="text-on-surface" />
            </Pressable>
          </View>

          {/* AI Style Insight Section */}
          <StyleInsightBento />

          {/* Style Discovery */}
          <StyleDiscovery />
        </View>
      </ScrollView>

      {/* Floating Style Assistant FAB */}
      <Pressable
        onPress={() => {
          console.log('FAB pressed! Navigating to /chat');
          router.navigate('/chat');
        }}
        className="absolute bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-2xl items-center justify-center z-50 active:scale-90"
      >
        <Bot size={28} className="text-white" />
      </Pressable>

      {/* Item Swapping Bottom Sheet */}
      <SwapItemSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </SafeAreaView>
  );
}
