import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Shirt, ChevronRight } from 'lucide-react-native';
import { ClothingItemFlat } from '@/api/types.gen';
import { resolveImageUrl, DEFAULT_BLURHASH } from '@/utils/image-url';

interface OutfitItemGridProps {
  items: ClothingItemFlat[];
  onItemPress: (item: ClothingItemFlat) => void;
}

export const OutfitItemGrid = React.memo(function OutfitItemGrid({
  items,
  onItemPress,
}: OutfitItemGridProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Shirt size={20} color="#005c55" />
          <Text className="font-sans font-bold text-headline-xs text-on-surface">
            Món đồ trong Outfit này ({items.length})
          </Text>
        </View>
      </View>

      {items.length > 0 ? (
        <View className="gap-3">
          {items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onItemPress(item)}
              className="flex-row items-center justify-between bg-white p-3.5 rounded-2xl border border-outline-variant/20 shadow-sm active:scale-98"
            >
              <View className="flex-row items-center gap-3.5 flex-1">
                <View className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <Image
                    source={resolveImageUrl(item.image_url, item.category)}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    placeholder={{ blurhash: DEFAULT_BLURHASH }}
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-sans font-bold text-body-lg text-on-surface mb-0.5 truncate">
                    {item.name}
                  </Text>

                  <View className="flex-row items-center gap-2">
                    <View className="px-2 py-0.5 bg-surface-container-high rounded border border-outline-variant/20">
                      <Text className="font-sans font-semibold text-label-xs text-on-surface-variant">
                        {item.category}
                      </Text>
                    </View>

                    {item.color_code ? (
                      <View className="flex-row items-center gap-1">
                        <View
                          style={{ backgroundColor: item.color_code }}
                          className="w-3 h-3 rounded-full border border-slate-300"
                        />
                        <Text className="font-sans font-semibold text-label-xs text-on-surface-variant">
                          {item.color_name || 'Màu sắc'}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>

              <ChevronRight size={20} color="#94a3b8" />
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 items-center">
          <Text className="font-sans text-body-md text-on-surface-variant">
            Chưa có thông tin danh sách món đồ cụ thể cho Outfit này.
          </Text>
        </View>
      )}
    </View>
  );
});
