import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  Cloud,
  Briefcase,
  Droplet,
  Sparkles,
  CheckCircle,
  Check,
  Wand2,
  Bookmark,
} from 'lucide-react-native';

import {
  getOutfitFromItemsApiV1AiOutfitFromItemsPostMutation,
  getMyWardrobeApiV1ClosetItemsGetOptions,
  toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { closetKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';
import { useAppNavigation } from '@/context/navigation-history';
import { resolveImageUrl } from '@/utils/image-url';

export interface OutfitItem {
  id: string;
  category: string;
  name: string;
  color: string;
  image: string;
}

export default function OutfitDetailScreen() {
  const router = useRouter();
  const { goBack } = useAppNavigation();
  const params = useLocalSearchParams<{
    outfit_id?: string;
    title?: string;
    image?: string;
    weather?: string;
    description?: string;
    insight?: string;
    tags?: string;
  }>();

  const title = params.title || 'Outfit Detail';
  const heroImage = params.image || '';
  const weatherText = params.weather || '';
  const descriptionText = params.description || '';
  const defaultInsightText = params.insight || '';
  const outfitId = params.outfit_id ? Number(params.outfit_id) : undefined;

  const tagsList = params.tags ? params.tags.split(',') : [];

  // Fetch Wardrobe items from API Query
  const { data: wardrobeData } = useQuery({
    ...getMyWardrobeApiV1ClosetItemsGetOptions(),
    queryKey: closetKeys.items(),
  });

  const closetItemsList: OutfitItem[] = useMemo(() => {
    if (wardrobeData && wardrobeData.length > 0) {
      return wardrobeData.map((item) => ({
        id: String(item.id),
        category: item.category || 'Tops',
        name: item.name,
        color: item.color_code || 'Default',
        image: item.image_url || '',
      }));
    }
    return [];
  }, [wardrobeData]);

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [insightText, setInsightText] = useState(defaultInsightText);
  const [isWorn, setIsWorn] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // React Query AI Outfit Mutation & Bookmark Mutation
  const aiOutfitMutation = useMutation(getOutfitFromItemsApiV1AiOutfitFromItemsPostMutation());
  const bookmarkMutation = useMutation(toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation());

  const handleToggleBookmark = async () => {
    setIsBookmarked((prev) => !prev);
    if (outfitId) {
      try {
        await bookmarkMutation.mutateAsync({
          path: { outfit_id: outfitId },
        });
      } catch (err) {
        console.log('Bookmark error:', err);
      }
    }
  };

  const handleToggleWear = () => {
    setIsWorn((prev) => !prev);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-margin-mobile py-3 border-b border-outline-variant/30 bg-surface">
        <Pressable
          onPress={() => goBack('/')}
          hitSlop={12}
          className="p-2 rounded-full active:scale-95 bg-surface-container-low"
        >
          <ChevronLeft size={22} color="#181c1c" />
        </Pressable>

        <Text className="font-sans font-bold text-title-lg text-on-surface truncate flex-1 mx-4 text-center">
          {title}
        </Text>

        <Pressable
          onPress={handleToggleBookmark}
          hitSlop={8}
          className="p-2 rounded-full bg-surface-container-low active:scale-95"
        >
          <Bookmark size={20} color="#005c55" fill={isBookmarked ? '#005c55' : 'none'} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Main Hero Image */}
        {heroImage ? (
          <View className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-6 border border-outline-variant/20 shadow-sm relative items-center justify-center p-4">
            <Image
              source={resolveImageUrl(heroImage)}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          </View>
        ) : null}

        {/* Outfit Metadata Header */}
        <View className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm mb-6">
          <Text className="font-sans font-bold text-headline-sm text-on-surface mb-2">{title}</Text>

          {descriptionText ? (
            <Text className="font-sans text-body-md text-on-surface-variant leading-6 mb-4">
              {descriptionText}
            </Text>
          ) : null}

          {/* Tags */}
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

        {/* AI Insight Card */}
        {insightText ? (
          <View className="bg-primary/10 p-5 rounded-2xl border border-primary/20 mb-6 flex-row items-start gap-3">
            <Sparkles size={22} color="#005c55" fill="#005c55" className="mt-0.5" />
            <View className="flex-1">
              <Text className="font-sans font-bold text-title-md text-primary mb-1">
                Stylist Insight
              </Text>
              <Text className="font-sans text-body-md text-on-surface leading-6">{insightText}</Text>
            </View>
          </View>
        ) : null}

        {/* Wear Action Button */}
        <Pressable
          onPress={handleToggleWear}
          className={cn(
            'w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 active:scale-95 shadow-md transition-all mb-6',
            isWorn ? 'bg-emerald-600' : 'bg-primary shadow-primary/20'
          )}
        >
          <Text className="font-sans font-bold text-title-lg text-white">
            {isWorn ? 'Outfit Selected For Today' : 'Wear This Outfit Today'}
          </Text>
          {isWorn ? <CheckCircle size={20} color="#ffffff" /> : <Briefcase size={20} color="#ffffff" />}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
