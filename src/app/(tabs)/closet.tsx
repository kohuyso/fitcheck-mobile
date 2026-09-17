import { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, Text, TextInput, View, Alert, Platform } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Search, SlidersHorizontal, Wand2, X, Sparkles, Shirt } from 'lucide-react-native';

import {
  getMyWardrobeApiV1ClosetItemsGetOptions,
  getMyOutfitsApiV1ClosetOutfitsGetOptions,
  createCustomOutfitApiV1ClosetOutfitsPostMutation,
  deleteCustomOutfitApiV1ClosetOutfitsOutfitIdDeleteMutation,
  toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { closetKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';
import { WardrobeCard, WardrobeItemData } from '@/components/closet/wardrobe-card';
import { SelectionActionBar } from '@/components/closet/selection-action-bar';
import { OutfitCard } from '@/components/closet/outfit-card';
import { ScheduleModal } from '@/components/closet/schedule-modal';
import { CategoryFilterBar } from '@/components/closet/category-filter-bar';
import { ClosetTabs } from '@/components/closet/closet-tabs';
import { OutfitRecommendation } from '@/api/types.gen';
import { prefetchImages } from '@/utils/image-url';
import { EmptyState } from '@/components/ui/empty-state';
import { CapsuleStarterModal } from '@/components/closet/capsule-starter-modal';

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
];

export default function ClosetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedOutfitToSchedule, setSelectedOutfitToSchedule] = useState<{ id: number; title: string } | null>(null);
  const [capsuleModalVisible, setCapsuleModalVisible] = useState(false);

  const bottomTabBarHeight = 72 + insets.bottom;

  const { data: wardrobeData } = useQuery({
    ...getMyWardrobeApiV1ClosetItemsGetOptions(),
    queryKey: closetKeys.items(),
  });

  const { data: myOutfitsData } = useQuery({
    ...getMyOutfitsApiV1ClosetOutfitsGetOptions(),
    queryKey: closetKeys.outfits(),
  });

  useEffect(() => {
    if (wardrobeData && wardrobeData.length > 0) {
      prefetchImages(wardrobeData.map((item) => item.image_url));
    }
  }, [wardrobeData]);

  useEffect(() => {
    if (myOutfitsData && myOutfitsData.length > 0) {
      prefetchImages(
        myOutfitsData.flatMap((o) => [o.image_url, ...(o.items?.map((i) => i.image_url) || [])])
      );
    }
  }, [myOutfitsData]);

  const createOutfitMutation = useMutation({
    ...createCustomOutfitApiV1ClosetOutfitsPostMutation(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: closetKeys.outfits() }),
  });

  const deleteOutfitMutation = useMutation({
    ...deleteCustomOutfitApiV1ClosetOutfitsOutfitIdDeleteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
      if (Platform.OS === 'web') {
        window.alert('Đã xóa outfit thành công!');
      } else {
        Alert.alert('Thành công', 'Đã xóa outfit thành công!');
      }
    },
    onError: (err) => {
      console.error('Delete outfit error:', err);
      if (Platform.OS === 'web') {
        window.alert('Không thể xóa outfit. Vui lòng thử lại.');
      } else {
        Alert.alert('Lỗi', 'Không thể xóa outfit. Vui lòng thử lại.');
      }
    },
  });

  const toggleBookmarkMutation = useMutation({
    ...toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: closetKeys.outfits() }),
  });

  const isWardrobeEmpty = wardrobeData !== undefined && wardrobeData.length === 0;

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
      : isWardrobeEmpty
      ? []
      : DEFAULT_WARDROBE_ITEMS;

  const filteredItems = itemsList.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredOutfits: OutfitRecommendation[] = (myOutfitsData || []).filter((outfit) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (outfit.title?.toLowerCase().includes(q) ?? false) ||
      (outfit.style_type?.toLowerCase().includes(q) ?? false) ||
      (outfit.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
    );
  });

  const toggleSelectionMode = useCallback(() => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedItemIds([]);
    } else {
      setIsSelectionMode(true);
      setActiveTab('items');
    }
  }, [isSelectionMode]);

  const handleConfirmOutfit = async () => {
    const selectedItems = itemsList.filter((item) => selectedItemIds.includes(item.id));
    if (selectedItems.length === 0) return;

    const firstItem = selectedItems[0];
    const outfitTitle =
      selectedItems.length === 1 ? `${firstItem.name} Look` : `${firstItem.name} & ${selectedItems[1].name}`;

    const numericItemIds = selectedItemIds.map((id) => Number(id)).filter((id) => !isNaN(id));
    let createdOutfitId: number | undefined;

    try {
      if (numericItemIds.length > 0) {
        const res = await createOutfitMutation.mutateAsync({
          body: {
            item_ids: numericItemIds,
            style_type: outfitTitle,
          },
        });
        if (res && res.outfit_id) {
          createdOutfitId = res.outfit_id;
        }
      }
    } catch (err) {
      console.log('Create outfit error:', err);
    }

    const categoriesTag = Array.from(new Set(selectedItems.map((i) => i.category))).join(', ');
    const itemNamesList = selectedItems.map((i) => i.name).join(', ');

    setIsSelectionMode(false);
    setSelectedItemIds([]);

    router.push({
      pathname: '/outfit-detail',
      params: {
        outfit_id: createdOutfitId ? String(createdOutfitId) : undefined,
        title: outfitTitle,
        image: firstItem.image,
        tags: `Custom Mix, ${categoriesTag}`,
        description: `A custom outfit composed of ${itemNamesList} selected directly from your closet.`,
        insight: `"Handcrafted power combination tailored from your personal wardrobe selection."`,
        items: JSON.stringify(selectedItems),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30">
        <View className="flex-row items-center gap-2">
          <MapPin size={22} color="#005c55" />
          <Text className="font-sans font-bold text-headline-md text-on-surface">FitCheck AI</Text>
        </View>

        <Pressable
          onPress={toggleSelectionMode}
          className={cn(
            'flex-row items-center gap-1.5 px-4 py-2 rounded-full active:scale-95',
            isSelectionMode ? 'bg-secondary' : 'bg-primary'
          )}
        >
          {isSelectionMode ? (
            <>
              <X size={16} color="#ffffff" />
              <Text className="font-sans font-semibold text-label-md text-white">Huỷ chọn</Text>
            </>
          ) : (
            <>
              <Wand2 size={16} color="#ffffff" />
              <Text className="font-sans font-semibold text-label-md text-white">Tạo Outfit</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Segmented Tab Switcher */}
      <ClosetTabs
        activeTab={activeTab}
        itemsCount={itemsList.length}
        outfitsCount={myOutfitsData?.length || 0}
        onTabChange={setActiveTab}
      />

      {/* Selection Mode Notice Banner */}
      {isSelectionMode && (
        <View className="bg-primary/10 px-margin-mobile py-2.5 flex-row justify-between items-center border-b border-primary/20">
          <Text className="font-sans font-semibold text-label-md text-primary">
            Chạm vào món đồ để chọn ({selectedItemIds.length} đã chọn)
          </Text>
          <Pressable onPress={() => setSelectedItemIds([])}>
            <Text className="font-sans font-bold text-label-sm text-secondary uppercase">Xóa chọn</Text>
          </Pressable>
        </View>
      )}

      {/* Search Input Bar */}
      <View className="px-margin-mobile pt-3 flex-row gap-3 items-center">
        <View className="flex-1 h-12 bg-surface-container-low rounded-xl px-4 flex-row items-center gap-2 border border-outline-variant/20">
          <Search size={20} color="#3e4947" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={activeTab === 'items' ? 'Tìm kiếm món đồ...' : 'Tìm kiếm outfit đã tạo...'}
            placeholderTextColor="#6e7977"
            className="flex-1 font-sans text-body-md text-on-surface"
          />
        </View>
        <Pressable className="h-12 w-12 bg-surface-container-low rounded-xl items-center justify-center border border-outline-variant/20 active:scale-95">
          <SlidersHorizontal size={20} color="#3e4947" />
        </Pressable>
      </View>

      {/* TAB 1: ITEMS VIEW */}
      {activeTab === 'items' && (
        <>
          <CategoryFilterBar
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {isWardrobeEmpty ? (
            <View className="flex-1 px-margin-mobile justify-center">
              <EmptyState
                icon={Shirt}
                badgeText="Tủ đồ chưa có trang phục"
                title="Bắt đầu tủ đồ thông minh của bạn"
                description="Thêm từ 3 món đồ (Áo, Quần, Giày) để AI có thể tự động gợi ý các bản phối chuẩn gu mỗi ngày."
                actionLabel="📷 Quét món đồ đầu tiên bằng AI"
                onAction={() => router.push('/scan')}
                secondaryActionLabel="✨ Thêm nhanh từ Tủ đồ cơ bản (1-chạm)"
                onSecondaryAction={() => setCapsuleModalVisible(true)}
                tipText="💡 Mẹo: Bạn có thể chọn nhanh các món cơ bản có sẵn mà không cần phải đứng dậy chụp ảnh!"
                variant="fullscreen"
              />
            </View>
          ) : filteredItems.length === 0 ? (
            <View className="flex-1 px-margin-mobile justify-center">
              <EmptyState
                icon={Search}
                title="Không tìm thấy món đồ"
                description={`Không có món đồ nào trong danh mục hoặc khớp với từ khóa "${searchQuery}".`}
                actionLabel="Xóa bộ lọc"
                onAction={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                variant="fullscreen"
              />
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
              contentContainerStyle={{
                paddingBottom: bottomTabBarHeight + (isSelectionMode ? 100 : 24),
              }}
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
          )}
        </>
      )}

      {/* TAB 2: OUTFITS VIEW */}
      {activeTab === 'outfits' && (
        <View className="flex-1 px-margin-mobile pt-3">
          {filteredOutfits.length > 0 ? (
            <FlatList
              data={filteredOutfits}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: bottomTabBarHeight + 24 }}
              keyExtractor={(item) => String(item.outfit_id)}
              renderItem={({ item }) => (
                <OutfitCard
                  outfit={item}
                  onPress={() =>
                    router.push({
                      pathname: '/outfit-detail',
                      params: {
                        outfit_id: String(item.outfit_id),
                        title: item.title || item.style_type || `Outfit #${item.outfit_id}`,
                        image: item.image_url || '',
                        description: item.description || '',
                        tags: item.tags ? item.tags.join(',') : '',
                        items: item.items ? JSON.stringify(item.items) : undefined,
                      },
                    })
                  }
                  onSchedule={() => {
                    setSelectedOutfitToSchedule({
                      id: item.outfit_id,
                      title: item.title || item.style_type || `Outfit #${item.outfit_id}`,
                    });
                    setScheduleModalVisible(true);
                  }}
                  onDelete={() => deleteOutfitMutation.mutate({ path: { outfit_id: item.outfit_id } })}
                  onToggleBookmark={() => toggleBookmarkMutation.mutate({ path: { outfit_id: item.outfit_id } })}
                />
              )}
            />
          ) : (
            <EmptyState
              icon={Sparkles}
              badgeText="Chưa có bản phối"
              title="Chưa có Outfit nào được tạo"
              description="Hãy ghép các món đồ trong tủ hoặc nhờ AI Stylist đề xuất công thức mặc đẹp cho bạn."
              actionLabel={itemsList.length > 0 ? '🪄 Tự tạo Outfit ngay' : '✨ Thêm đồ vào tủ trước'}
              onAction={() => {
                if (itemsList.length > 0) {
                  setActiveTab('items');
                  setIsSelectionMode(true);
                } else {
                  setCapsuleModalVisible(true);
                }
              }}
              secondaryActionLabel="💬 Nhờ Stylist AI tư vấn"
              onSecondaryAction={() => router.push('/chat')}
              tipText="💡 Mẹo: Tạo sẵn outfit theo từng dịp (Đi làm, Đi chơi, Hẹn hò) để không mất thời gian mỗi sáng."
              variant="card"
            />
          )}
        </View>
      )}

      {/* Floating Outfit Confirmation Action Bar */}
      {isSelectionMode && (
        <SelectionActionBar
          selectedCount={selectedItemIds.length}
          bottomOffset={bottomTabBarHeight + 16}
          onConfirm={handleConfirmOutfit}
        />
      )}

      {/* Schedule Modal */}
      {selectedOutfitToSchedule && (
        <ScheduleModal
          visible={scheduleModalVisible}
          outfitId={selectedOutfitToSchedule.id}
          outfitTitle={selectedOutfitToSchedule.title}
          onClose={() => {
            setScheduleModalVisible(false);
            setSelectedOutfitToSchedule(null);
          }}
        />
      )}

      {/* Capsule Starter Modal */}
      <CapsuleStarterModal
        visible={capsuleModalVisible}
        onClose={() => setCapsuleModalVisible(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: closetKeys.items() });
          queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
        }}
      />
    </SafeAreaView>
  );
}
