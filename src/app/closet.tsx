import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Wand2,
  X,
} from 'lucide-react-native';

import {
  getMyWardrobeApiV1ClosetItemsGetOptions,
  getMyOutfitsApiV1ClosetOutfitsGetOptions,
  createCustomOutfitApiV1ClosetOutfitsPostMutation,
  deleteCustomOutfitApiV1ClosetOutfitsOutfitIdDeleteMutation,
  updateCustomOutfitApiV1ClosetOutfitsOutfitIdPutMutation,
  getClosetSummaryApiV1ClosetSummaryGetOptions,
} from '@/api/@tanstack/react-query.gen';
import { closetKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';
import { WardrobeCard, WardrobeItemData } from '@/components/closet/wardrobe-card';
import { SelectionActionBar } from '@/components/closet/selection-action-bar';

const CATEGORIES = ['All', 'Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories'];

const DEFAULT_WARDROBE_ITEMS: WardrobeItemData[] = [
  {
    id: 'mock-1',
    name: 'White Oxford Shirt',
    category: 'Shirts',
    color: 'WHITE',
    colorHex: '#FFFFFF',
    style: 'Formal',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
    isAiFixed: true,
  },
  {
    id: 'mock-2',
    name: 'Slim Fit Chinos',
    category: 'Pants',
    color: 'BLACK',
    colorHex: '#2B2B2B',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=500&q=80',
    isAiFixed: false,
  },
  {
    id: 'mock-3',
    name: 'Leather Sneakers',
    category: 'Shoes',
    color: 'GREY',
    colorHex: '#EAEAEA',
    style: 'Minimalist',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
    isAiFixed: true,
  },
  {
    id: 'mock-4',
    name: 'Denim Jacket',
    category: 'Jackets',
    color: 'BLUE',
    colorHex: '#1D4ED8',
    style: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
    isAiFixed: false,
  },
];

export default function ClosetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection mode for manual outfit builder
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const bottomTabBarHeight = 72 + insets.bottom;

  // Fetch Wardrobe items using API query
  const { data: wardrobeData } = useQuery({
    ...getMyWardrobeApiV1ClosetItemsGetOptions(),
    queryKey: closetKeys.items(),
  });

  // Fetch Closet Summary API Query
  const { data: closetSummaryData } = useQuery({
    ...getClosetSummaryApiV1ClosetSummaryGetOptions(),
    queryKey: closetKeys.summary(),
  });

  // Fetch My Outfits using API query
  const { data: myOutfitsData } = useQuery({
    ...getMyOutfitsApiV1ClosetOutfitsGetOptions(),
    queryKey: closetKeys.outfits(),
  });

  // Mutation to create custom outfit
  const createOutfitMutation = useMutation({
    ...createCustomOutfitApiV1ClosetOutfitsPostMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
    },
  });

  // Mutation to delete custom outfit
  const deleteOutfitMutation = useMutation({
    ...deleteCustomOutfitApiV1ClosetOutfitsOutfitIdDeleteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
    },
  });

  // Mutation to update custom outfit
  const updateOutfitMutation = useMutation({
    ...updateCustomOutfitApiV1ClosetOutfitsOutfitIdPutMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
    },
  });

  const itemsList: WardrobeItemData[] =
    wardrobeData && wardrobeData.length > 0
      ? wardrobeData.map((item, index) => ({
          id: String(item.id || index),
          name: item.name,
          category: item.category || 'Tops',
          color: item.color_name || 'DEFAULT',
          colorHex: item.color_code || '#333333',
          style: item.style_tag || 'Casual',
          image: item.image_url || '',
          isAiFixed: item.is_ai_fixed ?? false,
        }))
      : DEFAULT_WARDROBE_ITEMS;

  const filteredItems = itemsList.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedItemIds([]);
    } else {
      setIsSelectionMode(true);
    }
  };

  const handleConfirmOutfit = async () => {
    const selectedItems = itemsList.filter((item) => selectedItemIds.includes(item.id));
    if (selectedItems.length === 0) return;

    const firstItem = selectedItems[0];
    const outfitTitle =
      selectedItems.length === 1
        ? `${firstItem.name} Look`
        : `${firstItem.name} & ${selectedItems[1].name}`;

    const numericItemIds = selectedItemIds.map((id) => Number(id)).filter((id) => !isNaN(id));

    try {
      if (numericItemIds.length > 0) {
        await createOutfitMutation.mutateAsync({
          body: {
            item_ids: numericItemIds,
            style_type: outfitTitle,
            tags: ['Custom Mix'],
          } as any,
        });
      }
    } catch (err) {
      console.log('Create custom outfit API error:', err);
    }

    const categoriesTag = Array.from(new Set(selectedItems.map((i) => i.category))).join(', ');
    const itemNamesList = selectedItems.map((i) => i.name).join(', ');

    const outfitParams = {
      title: outfitTitle,
      image: firstItem.image,
      tags: `Custom Mix, ${categoriesTag}`,
      description: `A custom outfit composed of ${itemNamesList} selected directly from your closet.`,
      insight: `"Handcrafted power combination tailored from your personal wardrobe selection."`,
    };

    setIsSelectionMode(false);
    setSelectedItemIds([]);

    router.push({
      pathname: '/outfit-detail',
      params: outfitParams,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30">
        <View className="flex-row items-center gap-2">
          <MapPin size={22} color="#005c55" />
          <Text className="font-sans font-bold text-headline-md text-on-surface">FitCheck AI</Text>
        </View>

        {/* Build Outfit / Cancel Button */}
        <Pressable
          onPress={toggleSelectionMode}
          className={cn(
            'flex-row items-center gap-1.5 px-4 py-2 rounded-full active:scale-95 transition-all',
            isSelectionMode ? 'bg-secondary' : 'bg-primary'
          )}
        >
          {isSelectionMode ? (
            <>
              <X size={16} color="#ffffff" />
              <Text className="font-sans font-semibold text-label-md text-white">Cancel</Text>
            </>
          ) : (
            <>
              <Wand2 size={16} color="#ffffff" />
              <Text className="font-sans font-semibold text-label-md text-white">Build Outfit</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Selection Mode Notice Banner */}
      {isSelectionMode && (
        <View className="bg-primary/10 px-margin-mobile py-2.5 flex-row justify-between items-center border-b border-primary/20">
          <Text className="font-sans font-semibold text-label-md text-primary">
            Tap items to select ({selectedItemIds.length} selected)
          </Text>
          <Pressable onPress={() => setSelectedItemIds([])}>
            <Text className="font-sans font-bold text-label-sm text-secondary uppercase">
              Clear
            </Text>
          </Pressable>
        </View>
      )}

      {/* Search & Filter */}
      <View className="px-margin-mobile pt-4 flex-row gap-3 items-center">
        <View className="flex-1 h-12 bg-surface-container-low rounded-xl px-4 flex-row items-center gap-2 border border-outline-variant/20">
          <Search size={20} color="#3e4947" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your closet..."
            placeholderTextColor="#6e7977"
            className="flex-1 font-sans text-body-md text-on-surface"
          />
        </View>
        <Pressable className="h-12 w-12 bg-surface-container-low rounded-xl items-center justify-center border border-outline-variant/20 active:scale-95">
          <SlidersHorizontal size={20} color="#3e4947" />
        </Pressable>
      </View>

      {/* Categories Wrapping Container */}
      <View className="py-4 px-margin-mobile flex-row flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full active:scale-95 border transition-all',
                isActive
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-low border-outline-variant/20'
              )}
            >
              <Text
                className={cn(
                  'font-sans font-semibold text-label-md',
                  isActive ? 'text-white' : 'text-on-surface-variant'
                )}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Wardrobe Grid Items */}
      <FlatList
        data={filteredItems}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: bottomTabBarHeight + (isSelectionMode ? 100 : 24) }}
        renderItem={({ item }) => {
          const isSelected = selectedItemIds.includes(item.id);
          return (
            <WardrobeCard
              item={item}
              isSelectionMode={isSelectionMode}
              isSelected={isSelected}
              onPress={() => {
                if (isSelectionMode) {
                  setSelectedItemIds((prev) =>
                    prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                  );
                } else {
                  router.push({
                    pathname: '/item-detail',
                    params: {
                      id: item.id,
                      name: item.name,
                      category: item.category,
                      color: item.color,
                      style: item.style,
                      image: item.image,
                    },
                  });
                }
              }}
            />
          );
        }}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />

      {/* Floating Outfit Confirmation Action Bar */}
      {isSelectionMode && (
        <SelectionActionBar
          selectedCount={selectedItemIds.length}
          bottomOffset={bottomTabBarHeight + 16}
          onConfirm={handleConfirmOutfit}
        />
      )}
    </SafeAreaView>
  );
}
