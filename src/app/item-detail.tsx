import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  Heart,
  Sparkles,
  CheckCircle,
  Check,
  Calendar,
  Tag,
  Shirt,
  Wand2,
} from 'lucide-react-native';

import { getItemDetailApiV1ClosetItemsItemIdGetOptions } from '@/api/@tanstack/react-query.gen';

export default function ItemDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const numericId = Number(params.id);
  const isValidId = !isNaN(numericId) && numericId > 0;

  // Query Backend API for Item Detail
  const { data: itemDetailData, isLoading } = useQuery({
    ...getItemDetailApiV1ClosetItemsItemIdGetOptions({
      path: { item_id: numericId },
    }),
    enabled: isValidId,
  });

  const name = itemDetailData?.name || (params.name as string) || 'Item';
  const category = itemDetailData?.category || (params.category as string) || 'Category';
  const color = itemDetailData?.color_name || (params.color as string) || 'Color';
  const style = itemDetailData?.style || (params.style as string) || 'Style';
  const image = itemDetailData?.image_url || (params.image as string) || '';

  const wornCount = itemDetailData?.stats?.worn_count_this_month ?? 0;
  const versatilityScore = itemDetailData?.stats?.versatility_score ?? 0;
  const matchingItemsCount = itemDetailData?.stats?.matching_items_count ?? 0;
  const pairsWellWith = itemDetailData?.pairs_well_with || [];
  const aiStylingNote = itemDetailData?.ai_styling_note || '';

  const [isFavorite, setIsFavorite] = useState(false);
  const [isWorn, setIsWorn] = useState(false);

  const handleWearToday = () => {
    setIsWorn(true);
    setTimeout(() => {
      setIsWorn(false);
    }, 3000);
  };

  const handleBuildOutfitWithItem = () => {
    router.navigate({
      pathname: '/outfit-detail' as any,
      params: {
        title: `${name} Outfit`,
        image,
        tags: `${category}, ${style}`,
        description: `Custom outfit designed around your ${color.toLowerCase()} ${name.toLowerCase()}.`,
        insight: `"AI styled a complete look anchored around your ${name} for maximum color contrast and silhouette ratio."`,
      },
    });
  };

  const handleBack = () => {
    router.navigate('/closet' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-margin-mobile h-16 bg-surface/80 border-b border-outline-variant/30 z-50">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 items-center justify-center rounded-full active:scale-95 transition-transform"
          hitSlop={8}
        >
          <ChevronLeft size={24} className="text-on-surface" />
        </Pressable>

        <Text className="font-sans font-bold text-title-lg text-primary tracking-tight">
          Item Detail
        </Text>

        <Pressable
          onPress={() => setIsFavorite(!isFavorite)}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container active:scale-95"
        >
          <Heart
            size={20}
            className={isFavorite ? 'text-rose-500 fill-rose-500' : 'text-on-surface-variant'}
          />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Item Hero Image Section */}
        <View className="relative w-full aspect-[4/5] bg-surface-container-low justify-center items-center p-6">
          {isLoading ? (
            <ActivityIndicator size="large" color="#005c55" />
          ) : (
            <Image source={image} className="w-full h-full" contentFit="contain" />
          )}

          {/* Style Badge */}
          <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-outline-variant/20 shadow-sm">
            <Tag size={14} className="text-primary" />
            <Text className="font-sans font-bold text-label-sm text-primary uppercase">
              {style}
            </Text>
          </View>
        </View>

        {/* Item Info Section */}
        <View className="px-margin-mobile pt-6">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-sans font-semibold text-label-sm text-on-surface-variant uppercase tracking-wider">
                {category}
              </Text>
              <Text className="font-sans font-bold text-headline-lg text-on-surface mt-1">
                {name}
              </Text>
              <Text className="font-sans font-semibold text-body-md text-primary mt-1">
                Color: {color}
              </Text>
            </View>
          </View>

          {/* AI Wear Statistics Bento Cards */}
          <View className="grid grid-cols-2 gap-3 mt-6 flex-row flex-wrap">
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Calendar size={16} className="text-primary" />
                <Text className="font-sans font-bold text-label-sm text-on-surface-variant uppercase">
                  Worn Count
                </Text>
              </View>
              <Text className="font-sans font-bold text-headline-md text-on-surface">
                {wornCount} times
              </Text>
              <Text className="font-sans text-label-sm text-on-surface-variant/70 mt-0.5">
                This month
              </Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Shirt size={16} className="text-primary" />
                <Text className="font-sans font-bold text-label-sm text-on-surface-variant uppercase">
                  Versatility
                </Text>
              </View>
              <Text className="font-sans font-bold text-headline-md text-primary">
                {versatilityScore}%
              </Text>
              <Text className="font-sans text-label-sm text-on-surface-variant/70 mt-0.5">
                Matches {matchingItemsCount} items
              </Text>
            </View>
          </View>
        </View>

        {/* AI Pairing Recommendations */}
        <View className="px-margin-mobile mt-8">
          <Text className="font-sans font-bold text-title-lg text-on-surface mb-3">
            Pairs Well With
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            {pairsWellWith.map((pair) => (
              <Pressable
                key={pair.id}
                onPress={handleBuildOutfitWithItem}
                className="w-36 bg-white rounded-2xl overflow-hidden border border-outline-variant/30 p-2.5 mr-3 shadow-xs active:scale-95"
              >
                <View className="w-full h-32 bg-surface-container rounded-xl overflow-hidden mb-2">
                  <Image source={pair.image_url} className="w-full h-full" contentFit="cover" />
                </View>
                <Text className="font-sans font-bold text-label-md text-on-surface" numberOfLines={1}>
                  {pair.name}
                </Text>
                <Text className="font-sans text-label-sm text-primary mt-0.5">{pair.category}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* AI Style Advice */}
        <View className="px-margin-mobile mt-8 mb-32">
          <View className="bg-white rounded-2xl p-6 border border-primary/20 shadow-sm relative overflow-hidden">
            <View className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles size={80} className="text-primary" />
            </View>

            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={20} className="text-primary fill-primary" />
              <Text className="font-sans font-bold text-title-lg text-primary">
                AI Styling Note
              </Text>
            </View>

            <Text className="font-sans italic text-body-md text-on-surface-variant leading-relaxed">
              "{aiStylingNote}"
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Bar at Bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-outline-variant/30 px-margin-mobile py-4 z-40 flex-row gap-3">
        <Pressable
          onPress={handleBuildOutfitWithItem}
          className="flex-1 bg-surface-container-high py-4 rounded-2xl flex-row items-center justify-center gap-2 active:scale-95"
        >
          <Wand2 size={18} className="text-on-surface" />
          <Text className="font-sans font-bold text-body-lg text-on-surface">Build Outfit</Text>
        </Pressable>

        <Pressable
          onPress={handleWearToday}
          className={`flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg active:scale-95 ${
            isWorn ? 'bg-emerald-700' : 'bg-primary'
          }`}
        >
          <Text className="font-sans font-bold text-body-lg text-white">
            {isWorn ? 'Marked Worn' : 'Wear Today'}
          </Text>
          {isWorn ? (
            <Check size={18} className="text-white" />
          ) : (
            <CheckCircle size={18} className="text-white" />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

