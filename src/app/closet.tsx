import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Check,
  CheckCircle,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMyWardrobeApiV1ClosetItemsGetOptions } from '@/api/@tanstack/react-query.gen';

const CATEGORIES = ['All', 'Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories'];

export default function ClosetScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection mode for manual outfit builder
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Fetch Wardrobe items using API query
  const { data: wardrobeData } = useQuery(getMyWardrobeApiV1ClosetItemsGetOptions());

  const itemsList = (wardrobeData || []).map((item, index) => {
    return {
      id: String(item.id),
      name: item.name,
      category: item.category,
      color: item.color_code || 'Default',
      colorHex: item.color_code || '#333333',
      style: item.style_tag || 'Casual',
      image: item.image_url || '',
      isAiFixed: index === 0,
    };
  });

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

  const handleConfirmOutfit = () => {
    const selectedItems = itemsList.filter((item) => selectedItemIds.includes(item.id));
    if (selectedItems.length === 0) return;

    const firstItem = selectedItems[0];
    const outfitTitle =
      selectedItems.length === 1
        ? `${firstItem.name} Look`
        : `${firstItem.name} & ${selectedItems[1].name}`;

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

    router.navigate({
      pathname: '/outfit-detail' as any,
      params: outfitParams,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30">
        <View className="flex-row items-center gap-2">
          <MapPin size={22} className="text-primary" />
          <Text className="font-sans font-bold text-headline-md text-on-surface">FitCheck AI</Text>
        </View>

        {/* Build Outfit / Cancel Button */}
        <Pressable
          onPress={toggleSelectionMode}
          className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full active:scale-95 ${
            isSelectionMode ? 'bg-secondary' : 'bg-primary'
          }`}
        >
          {isSelectionMode ? (
            <>
              <X size={16} className="text-white" />
              <Text className="font-sans font-semibold text-label-md text-white">Cancel</Text>
            </>
          ) : (
            <>
              <Wand2 size={16} className="text-white" />
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
          <Search size={20} className="text-on-surface-variant" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your closet..."
            placeholderTextColor="#6e7977"
            className="flex-1 font-sans text-body-md text-on-surface"
          />
        </View>
        <Pressable className="h-12 w-12 bg-surface-container-low rounded-xl items-center justify-center border border-outline-variant/20 active:scale-95">
          <SlidersHorizontal size={20} className="text-on-surface-variant" />
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
              className={`px-4 py-1.5 rounded-full active:scale-95 border transition-all ${
                isActive
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-low border-outline-variant/20'
              }`}
            >
              <Text
                className={`font-sans font-semibold text-label-md ${
                  isActive ? 'text-white' : 'text-on-surface-variant'
                }`}
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
        contentContainerStyle={{ paddingBottom: isSelectionMode ? 180 : 100 }}
        renderItem={({ item }) => {
          const isSelected = selectedItemIds.includes(item.id);
          return (
            <Pressable
              onPress={() => {
                if (isSelectionMode) {
                  setSelectedItemIds((prev) =>
                    prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                  );
                } else {
                  router.navigate({
                    pathname: '/item-detail' as any,
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
              className={`w-[47%] bg-white rounded-2xl overflow-hidden border mb-4 shadow-sm active:scale-98 relative ${
                isSelectionMode && isSelected
                  ? 'border-2 border-primary bg-primary/5'
                  : 'border-[#E2E8F0]'
              }`}
            >
              {/* Selection Checkbox */}
              {isSelectionMode && (
                <View
                  className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-full items-center justify-center border shadow-sm ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-white/90 border-outline-variant/50'
                  }`}
                >
                  {isSelected && <Check size={14} className="text-white" />}
                </View>
              )}

              <View className="relative aspect-[4/5] bg-[#F1F5F9] items-center justify-center p-4">
                <Image source={item.image} className="w-full h-full" contentFit="contain" />
                {item.isAiFixed && !isSelectionMode && (
                  <View className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full border border-black/5">
                    <Sparkles size={14} className="text-primary fill-primary" />
                  </View>
                )}
              </View>
              <View className="p-3">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <View
                    style={{ backgroundColor: item.colorHex }}
                    className="w-2.5 h-2.5 rounded-full border border-outline-variant/30"
                  />
                  <Text className="font-sans font-bold text-label-sm text-outline uppercase tracking-wider">
                    {item.color}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans font-bold text-body-md text-on-surface truncate flex-1 mr-1">
                    {item.name}
                  </Text>
                  <View
                    className={`px-2 py-0.5 rounded ${
                      item.style === 'Formal' ? 'bg-emerald-50' : 'bg-surface-container-high'
                    }`}
                  >
                    <Text
                      className={`font-sans font-bold text-[10px] uppercase ${
                        item.style === 'Formal' ? 'text-primary' : 'text-secondary'
                      }`}
                    >
                      {item.style}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Floating Outfit Confirmation Action Bar */}
      {isSelectionMode && (
        <View className="absolute bottom-24 left-5 right-5 bg-white p-4 rounded-2xl border border-primary/20 shadow-2xl z-[150] flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="font-sans font-bold text-body-lg text-on-surface">
              {selectedItemIds.length} {selectedItemIds.length === 1 ? 'item' : 'items'} selected
            </Text>
            <Text className="font-sans text-label-md text-on-surface-variant">
              {selectedItemIds.length === 0 ? 'Select items above' : 'Ready to create outfit'}
            </Text>
          </View>

          <Pressable
            disabled={selectedItemIds.length === 0}
            onPress={handleConfirmOutfit}
            className={`px-5 py-3 rounded-xl flex-row items-center gap-2 active:scale-95 shadow-md ${
              selectedItemIds.length > 0 ? 'bg-primary' : 'bg-surface-container-high opacity-50'
            }`}
          >
            <CheckCircle size={18} className="text-white" />
            <Text className="font-sans font-bold text-label-md text-white">Create Outfit</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

