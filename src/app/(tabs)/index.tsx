import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Bot, Check, Link2, MapPin, Sun, Sparkles } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  getHomeDashboardApiV1DashboardHomeGetOptions,
  readRootGetOptions,
  syncOfflineHistoryApiV1DashboardSyncOfflineHistoryPostMutation,
  wearOutfitApiV1DashboardWearOutfitPostMutation,
  getMyWardrobeApiV1ClosetItemsGetOptions,
  getMyOutfitsApiV1ClosetOutfitsGetOptions,
} from "@/api/@tanstack/react-query.gen";
import { closetKeys } from "@/api/query-keys";
import { cn } from "@/utils/cn";
import { prefetchImages } from "@/utils/image-url";

import OutfitCarousel from "@/components/dashboard/outfit-carousel";
import ScheduleTag from "@/components/dashboard/schedule-tag";
import StyleAssistantBanner from "@/components/dashboard/style-assistant-banner";
import StyleDiscovery from "@/components/dashboard/style-discovery";
import StyleInsightBento from "@/components/dashboard/style-insight-bento";
import SwapItemSheet from "@/components/dashboard/swap-item-sheet";
import WeatherAdvice from "@/components/dashboard/weather-advice";
import { OnboardingChecklistCard } from "@/components/dashboard/onboarding-checklist-card";
import { CapsuleStarterModal } from "@/components/closet/capsule-starter-modal";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isWorn, setIsWorn] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);

  // Queries for user's wardrobe & outfits to evaluate onboarding progress
  const { data: wardrobeData } = useQuery({
    ...getMyWardrobeApiV1ClosetItemsGetOptions(),
    queryKey: closetKeys.items(),
  });

  const { data: myOutfitsData } = useQuery({
    ...getMyOutfitsApiV1ClosetOutfitsGetOptions(),
    queryKey: closetKeys.outfits(),
  });

  const wardrobeCount = wardrobeData?.length ?? 0;
  const outfitsCount = myOutfitsData?.length ?? 0;

  // Health check API query
  const { data: serverHealthData } = useQuery(readRootGetOptions());

  // Offline Sync History Mutation
  const syncOfflineMutation = useMutation(
    syncOfflineHistoryApiV1DashboardSyncOfflineHistoryPostMutation(),
  );

  useEffect(() => {
    const syncOffline = async () => {
      try {
        await syncOfflineMutation.mutateAsync({ body: [] });
      } catch (err) {
        // Fallback for offline sync
      }
    };
    syncOffline();
  }, []);

  // Fetch Dashboard API Query
  const { data: dashboardData } = useQuery(
    getHomeDashboardApiV1DashboardHomeGetOptions({
      query: { lat: 21.0285, lon: 105.8542 },
    }),
  );

  const data = dashboardData;

  // Prefetch dashboard outfit images into memory cache
  useEffect(() => {
    if (data?.recommended_outfits && data.recommended_outfits.length > 0) {
      const urls = data.recommended_outfits.flatMap((o) => [
        o.image_url,
        ...(o.items?.map((i) => i.image_url) || []),
      ]);
      prefetchImages(urls);
    }
  }, [data?.recommended_outfits]);

  // Wear Outfit API Mutation
  const wearMutation = useMutation(
    wearOutfitApiV1DashboardWearOutfitPostMutation(),
  );

  const toggleWear = async () => {
    try {
      const outfitId = data?.recommended_outfits?.[0]?.outfit_id;
      if (outfitId !== undefined) {
        await wearMutation.mutateAsync({
          query: { outfit_id: outfitId },
        });
      }
    } catch (error) {
      console.log("Wear outfit skipped/failed:", error);
    }
    setIsWorn(true);
    setTimeout(() => {
      setIsWorn(false);
    }, 3000);
  };

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setRefreshing(false);
    }
  };

  const displayLocation = data?.location ?? "Hanoi, VN";
  const displayTemp =
    data?.weather?.temperature !== undefined
      ? `${data.weather.temperature}°C`
      : "--°C";

  const bottomTabBarHeight = 72 + insets.bottom;

  return (
    <SafeAreaView
      className="flex-1 bg-surface w-full max-w-full overflow-hidden"
      edges={["top"]}
    >
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30">
        <View className="flex-row items-center gap-2">
          <MapPin size={22} color="#005c55" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">
            {displayLocation}
          </Text>
        </View>
        <View className="bg-surface-container-low px-3 py-1.5 rounded-full flex-row items-center gap-2">
          <Sun size={16} color="#005c55" fill="#005c55" />
          <Text className="font-sans font-medium text-label-md text-on-surface">
            {displayTemp}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#005c55"
            colors={["#005c55"]}
          />
        }
      >
        <View
          style={{ paddingBottom: bottomTabBarHeight + 24 }}
          className="px-margin-mobile pt-6"
        >
          {/* Weather Advice */}
          <WeatherAdvice
            condition={dashboardData?.weather?.condition}
            temperature={dashboardData?.weather?.temperature}
            recommendation={dashboardData?.weather?.recommendation}
          />

          {/* Onboarding Checklist Card */}
          <OnboardingChecklistCard
            wardrobeCount={wardrobeCount}
            outfitsCount={outfitsCount}
            onOpenCapsuleModal={() => setIsCapsuleModalOpen(true)}
          />

          {/* Schedule Tag */}
          <ScheduleTag schedule={dashboardData?.schedule} />

          {/* Style Assistant Card */}
          <StyleAssistantBanner />

          {/* Carousel */}
          <OutfitCarousel
            outfits={dashboardData?.recommended_outfits}
            isCuratedFallback={wardrobeCount === 0}
          />

          {/* Interaction Buttons */}
          <View className="flex-col gap-2.5 mb-2">
            {wardrobeCount === 0 ? (
              <>
                <Pressable
                  onPress={() => setIsCapsuleModalOpen(true)}
                  className="w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 active:scale-95 shadow-md bg-primary shadow-primary/25"
                >
                  <Sparkles size={20} color="#ffffff" />
                  <Text className="font-sans font-bold text-title-md text-white">
                    Thêm đồ vào tủ để AI phối đồ
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    const firstOutfit = dashboardData?.recommended_outfits?.[0];
                    router.push({
                      pathname: "/outfit-detail",
                      params: {
                        outfit_id: firstOutfit?.outfit_id ? String(firstOutfit.outfit_id) : "demo-outfit-1",
                        title: firstOutfit?.style_type || "Smart Business Casual",
                        image: firstOutfit?.image_url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
                      },
                    });
                  }}
                  className="w-full h-11 rounded-2xl flex-row items-center justify-center gap-2 active:scale-95 bg-surface-container-low border border-outline-variant/30"
                >
                  <Text className="font-sans font-semibold text-label-md text-primary">
                    Xem chi tiết bản phối mẫu
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={toggleWear}
                className={cn(
                  "w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 active:scale-95 shadow-md",
                  isWorn ? "bg-emerald-600" : "bg-primary shadow-primary/20",
                )}
              >
                <Text className="font-sans font-bold text-title-lg text-white">
                  {isWorn ? "Đã Chọn Mặc Hôm Nay" : "Mặc Bộ Trang Phục Này"}
                </Text>
                {isWorn ? (
                  <Check size={20} color="#ffffff" />
                ) : (
                  <Link2 size={20} color="#ffffff" />
                )}
              </Pressable>
            )}
          </View>

          {/* AI Style Insight Section */}
          <StyleInsightBento wardrobeCount={wardrobeCount} />

          {/* Style Discovery */}
          <StyleDiscovery />
        </View>
      </ScrollView>

      {/* Floating Style Assistant FAB */}
      <Pressable
        onPress={() => router.push("/chat")}
        style={{ bottom: bottomTabBarHeight + 16 }}
        className="absolute right-6 w-14 h-14 bg-primary rounded-full shadow-2xl items-center justify-center z-50 active:scale-90"
      >
        <Bot size={28} color="#ffffff" />
      </Pressable>

      {/* Item Swapping Bottom Sheet */}
      <SwapItemSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* Capsule Starter Modal */}
      <CapsuleStarterModal
        visible={isCapsuleModalOpen}
        onClose={() => setIsCapsuleModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries();
        }}
      />
    </SafeAreaView>
  );
}
