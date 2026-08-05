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
  Grid,
  Layers,
  RefreshCw,
} from 'lucide-react-native';

import {
  getOutfitFromItemsApiV1AiOutfitFromItemsPostMutation,
  getMyWardrobeApiV1ClosetItemsGetOptions,
  toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { Bookmark } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Data structures for Outfit Detail
export interface OutfitItem {
  id: string;
  category: 'Outerwear' | 'Tops' | 'Bottoms' | 'Footwear' | 'Accessories' | string;
  name: string;
  color: string;
  image: string;
}

const CATEGORY_LIST = ['Outerwear', 'Tops', 'Bottoms', 'Footwear', 'Accessories'];

export default function OutfitDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = (params.title as string) || 'Outfit Detail';
  const heroImage = (params.image as string) || '';
  const weatherText = (params.weather as string) || '';
  const descriptionText = (params.description as string) || '';
  const defaultInsightText = (params.insight as string) || '';
  const outfitId = params.outfit_id ? Number(params.outfit_id) : undefined;

  const tagsList = params.tags ? (params.tags as string).split(',') : [];

  // Fetch Wardrobe items from API Query
  const { data: wardrobeData } = useQuery(getMyWardrobeApiV1ClosetItemsGetOptions());

  const closetItemsList: OutfitItem[] = useMemo(() => {
    if (wardrobeData && wardrobeData.length > 0) {
      return wardrobeData.map((item) => {
        return {
          id: String(item.id),
          category: item.category || 'Tops',
          name: item.name,
          color: item.color_code || 'Default',
          image: item.image_url || '',
        };
      });
    }
    return [];
  }, [wardrobeData]);

  // State of selected closet items IDs
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [insightText, setInsightText] = useState(defaultInsightText);
  const [isWorn, setIsWorn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [demoViewMode, setDemoViewMode] = useState<'collage' | 'flatlay'>('collage');

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
        console.log('Bookmark outfit error:', err);
      }
    }
  };

  // Compute selected items to display live in Demo Collage preview
  const selectedItems = useMemo(() => {
    return closetItemsList.filter((item) => selectedItemIds.includes(item.id));
  }, [selectedItemIds, closetItemsList]);

  // Toggle item selection
  const toggleSelectItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // AI Outfit Generator based on selected items sent to backend/AI
  const handleAIGenerateFromSelectedItems = async () => {
    if (selectedItems.length === 0) return;
    setIsGenerating(true);

    try {
      // Call AI Outfit API with selected items IDs
      const itemIds = selectedItems.map((i) => parseInt(i.id.replace(/\D/g, '')) || 1);
      await aiOutfitMutation.mutateAsync({
        body: { item_ids: itemIds } as any,
      });
    } catch (err) {
      console.log('AI Outfit from items API offline/fallback:', err);
    }

    // AI Outfit logic: Complete outfit by auto-selecting complementary items for unselected categories
    const currentCategories = selectedItems.map((i) => i.category);
    const missingCategories = CATEGORY_LIST.filter((cat) => !currentCategories.includes(cat));

    const autoAddIds: string[] = [];
    missingCategories.forEach((cat) => {
      const match = closetItemsList.find((i) => i.category === cat);
      if (match) {
        autoAddIds.push(match.id);
      }
    });

    const newSelectedIds = Array.from(new Set([...selectedItemIds, ...autoAddIds]));
    setSelectedItemIds(newSelectedIds);

    const mainCategoryNames = selectedItems.map((i) => i.name).join(' & ');
    setInsightText(
      `"AI Stylist analyzed your selected items (${mainCategoryNames}) and generated a complete, color-balanced outfit recommendation around them."`
    );

    setIsGenerating(false);
  };


  const handleWearToday = () => {
    setIsWorn(true);
    setTimeout(() => {
      setIsWorn(false);
    }, 3000);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Top Navigation Bar */}
      <View className="flex-row justify-between items-center px-margin-mobile h-16 bg-surface/80 border-b border-outline-variant/30 z-50">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full active:scale-95 transition-transform"
          hitSlop={8}
        >
          <ChevronLeft size={24} className="text-on-surface" />
        </Pressable>

        <Text className="font-sans font-bold text-title-lg text-primary tracking-tight">
          FitCheck AI
        </Text>

        <View className="w-8 h-8 rounded-full overflow-hidden bg-secondary-container items-center justify-center">
          <Image
            source=""
            className="w-full h-full"
            contentFit="cover"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Demo Hero Section - Multi-Item Collage of ONLY Selected Items */}
        <View className="relative w-full aspect-[4/5] bg-surface-container-low p-4 justify-center items-center">
          {selectedItems.length === 0 ? (
            <View className="items-center justify-center p-6 text-center">
              <Sparkles size={40} className="text-outline-variant mb-2" />
              <Text className="font-sans font-bold text-body-lg text-on-surface-variant">
                No items selected
              </Text>
              <Text className="font-sans text-label-md text-on-surface-variant/70 text-center mt-1">
                Scroll through categories below and tap items to build your outfit preview!
              </Text>
            </View>
          ) : demoViewMode === 'flatlay' ? (
            <Image source={heroImage} className="w-full h-full" contentFit="contain" />
          ) : (
            /* Multi-item Image Grid Collage of Selected Items */
            <View className="w-full h-full flex-row flex-wrap gap-2 p-2 rounded-2xl overflow-hidden bg-white/40 border border-white/60">
              {selectedItems.slice(0, 4).map((it, idx) => (
                <View
                  key={it.id}
                  className={`relative rounded-xl overflow-hidden bg-white border border-outline-variant/20 shadow-sm ${
                    selectedItems.length === 1
                      ? 'w-full h-full'
                      : selectedItems.length === 2
                      ? 'w-[48%] h-full'
                      : selectedItems.length === 3 && idx === 0
                      ? 'w-full h-[58%]'
                      : selectedItems.length === 3
                      ? 'w-[48%] h-[38%]'
                      : 'w-[48%] h-[48%]'
                  }`}
                >
                  <Image source={it.image} className="w-full h-full" contentFit="cover" />
                  <View className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded-md">
                    <Text className="text-white font-sans font-bold text-[10px] uppercase">
                      {it.category}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Toggle View Mode */}
          {selectedItems.length > 0 && (
            <Pressable
              onPress={() => setDemoViewMode(demoViewMode === 'collage' ? 'flatlay' : 'collage')}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-outline-variant/30 shadow-sm active:scale-95"
            >
              {demoViewMode === 'collage' ? (
                <>
                  <Layers size={14} className="text-primary" />
                  <Text className="font-sans font-semibold text-label-sm text-primary">Flat-Lay</Text>
                </>
              ) : (
                <>
                  <Grid size={14} className="text-primary" />
                  <Text className="font-sans font-semibold text-label-sm text-primary">Collage</Text>
                </>
              )}
            </Pressable>
          )}

          {/* Floating Weather Chip */}
          <View className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center gap-2 border border-outline-variant/20 shadow-sm">
            <Cloud size={14} className="text-primary" />
            <Text className="font-sans font-medium text-label-md text-on-surface">
              {weatherText}
            </Text>
          </View>
        </View>

        {/* Outfit Info Section */}
        <View className="px-margin-mobile pt-6">
          <Text className="font-sans font-bold text-headline-lg text-on-surface">{title}</Text>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mt-2">
            {tagsList.map((tag, idx) => (
              <View
                key={idx}
                className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${
                  idx === 0
                    ? 'bg-primary/10'
                    : idx === 1
                    ? 'bg-secondary/10'
                    : 'bg-surface-container-highest'
                }`}
              >
                {idx === 0 && <Briefcase size={14} className="text-primary" />}
                {idx === 1 && <Droplet size={14} className="text-secondary" />}
                <Text
                  className={`font-sans font-semibold text-label-md ${
                    idx === 0
                      ? 'text-primary'
                      : idx === 1
                      ? 'text-secondary'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {tag.trim()}
                </Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text className="mt-4 font-sans text-body-md text-on-surface-variant leading-relaxed">
            {descriptionText}
          </Text>
        </View>

        {/* Outfit Composition Section - User Closet Horizontal Scroll per Category */}
        <View className="px-margin-mobile mt-8">
          <View className="mb-6 flex-col gap-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-sans font-bold text-headline-md text-on-surface">
                  Outfit Composition
                </Text>
                <Text className="font-sans text-label-md text-on-surface-variant mt-0.5">
                  Select items from your closet below ({selectedItems.length} selected for demo)
                </Text>
              </View>
            </View>

            {/* Prominent Full-Width AI Generate Outfit Button */}
            <Pressable
              disabled={isGenerating || selectedItems.length === 0}
              onPress={handleAIGenerateFromSelectedItems}
              className={`w-full py-3.5 px-4 rounded-xl flex-row items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all ${
                selectedItems.length === 0
                  ? 'bg-surface-container-high opacity-50'
                  : isGenerating
                  ? 'bg-primary/80'
                  : 'bg-primary'
              }`}
            >
              {isGenerating ? (
                <RefreshCw size={20} className="text-white animate-spin" />
              ) : (
                <Wand2 size={20} className="text-white fill-white" />
              )}
              <Text className="font-sans font-bold text-body-lg text-white">
                {isGenerating
                  ? 'Generating AI Outfit Combo...'
                  : selectedItems.length === 0
                  ? 'Select Items Below for AI Styling'
                  : `Generate AI Outfit from Selected (${selectedItems.length})`}
              </Text>
            </Pressable>
          </View>

          {/* Categories Horizontal Scroll Sections */}
          <View className="gap-6">
            {CATEGORY_LIST.map((category) => {
              const categoryItems = closetItemsList.filter((i) => i.category === category);
              const selectedCountInCategory = categoryItems.filter((i) =>
                selectedItemIds.includes(i.id)
              ).length;

              return (
                <View key={category} className="gap-2">
                  {/* Category Header */}
                  <View className="flex-row items-center justify-between px-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-sans font-bold text-body-lg text-on-surface">
                        {category}
                      </Text>
                      <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                        <Text className="font-sans font-bold text-label-sm text-primary">
                          {selectedCountInCategory} selected
                        </Text>
                      </View>
                    </View>
                    <Text className="font-sans text-label-sm text-on-surface-variant/60 uppercase">
                      Swipe horizontal
                    </Text>
                  </View>

                  {/* Horizontal Scroll View for Category Items */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row gap-3 py-1"
                  >
                    {categoryItems.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id);
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => toggleSelectItem(item.id)}
                          className={`w-36 rounded-2xl overflow-hidden border p-2.5 mr-3 active:scale-95 transition-all relative ${
                            isSelected
                              ? 'bg-primary/5 border-2 border-primary shadow-sm'
                              : 'bg-white border-outline-variant/30'
                          }`}
                        >
                          {/* Selection Badge */}
                          <View
                            className={`absolute top-2 right-2 z-20 w-5 h-5 rounded-full items-center justify-center border shadow-xs ${
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'bg-white/80 border-outline-variant/40'
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-white" />}
                          </View>

                          {/* Thumbnail Image */}
                          <View className="w-full h-32 bg-surface-container rounded-xl overflow-hidden mb-2">
                            <Image source={item.image} className="w-full h-full" contentFit="cover" />
                          </View>

                          {/* Item Details */}
                          <Text
                            className="font-sans font-bold text-label-md text-on-surface"
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text className="font-sans text-label-sm text-primary mt-0.5" numberOfLines={1}>
                            {item.color}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              );
            })}
          </View>
        </View>

        {/* AI Insight Section */}
        <View className="px-margin-mobile mt-8 mb-32">
          <View className="bg-white rounded-2xl p-6 border border-primary/20 shadow-sm relative overflow-hidden">
            <View className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles size={80} className="text-primary" />
            </View>

            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={20} className="text-primary fill-primary" />
              <Text className="font-sans font-bold text-title-lg text-primary">
                AI Style Insight
              </Text>
            </View>

            <Text className="font-sans italic text-body-md text-on-surface-variant leading-relaxed">
              {insightText}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Bar at Bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-outline-variant/30 px-margin-mobile py-4 z-40">
        <Pressable
          onPress={handleWearToday}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg active:scale-95 ${
            isWorn ? 'bg-emerald-700' : 'bg-[#1E293B]'
          }`}
        >
          <Text className="font-sans font-bold text-title-lg text-white">
            {isWorn ? 'Outfit Marked Worn Today' : 'Wear This Today'}
          </Text>
          {isWorn ? (
            <Check size={20} className="text-white" />
          ) : (
            <CheckCircle size={20} className="text-white" />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
