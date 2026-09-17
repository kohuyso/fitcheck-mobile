import React from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Bookmark, Calendar as CalendarIcon, Trash2, Sparkles, ChevronRight } from 'lucide-react-native';
import { OutfitRecommendation } from '@/api/types.gen';
import { cn } from '@/utils/cn';
import { resolveImageUrl, DEFAULT_BLURHASH } from '@/utils/image-url';

export interface OutfitCardProps {
  outfit: OutfitRecommendation;
  onPress: () => void;
  onSchedule?: () => void;
  onDelete?: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
}

export function OutfitCard({
  outfit,
  onPress,
  onSchedule,
  onDelete,
  onToggleBookmark,
  isBookmarked = false,
}: OutfitCardProps) {
  const items = outfit.items || [];
  const heroImage = outfit.image_url || (items.length > 0 ? items[0].image_url : '');
  const title = outfit.title || outfit.style_type || `Outfit #${outfit.outfit_id}`;

  const handleDeletePress = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa outfit "${title}" khỏi danh sách?`);
      if (confirmed) {
        onDelete && onDelete();
      }
      return;
    }

    Alert.alert(
      'Xóa Outfit',
      `Bạn có chắc chắn muốn xóa outfit "${title}" khỏi danh sách?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDelete && onDelete(),
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={onPress}
      className="w-full bg-white rounded-2xl overflow-hidden border border-outline-variant/30 mb-4 shadow-sm active:scale-98"
    >
      {/* Top Banner / Hero Image Preview & Quick Actions */}
      <View className="relative w-full aspect-[16/9] bg-surface-container-low overflow-hidden">
        {heroImage ? (
          <Image
            source={resolveImageUrl(heroImage)}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={{ blurhash: DEFAULT_BLURHASH }}
            transition={150}
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-emerald-50">
            <Sparkles size={32} color="#005c55" />
          </View>
        )}

        {/* Style Tag Overlay */}
        <View className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <Text className="font-sans font-bold text-label-xs text-white uppercase tracking-wider">
            {outfit.style_type || 'Custom Style'}
          </Text>
        </View>

        {/* Action Buttons Top Right */}
        <View className="absolute top-3 right-3 flex-row gap-2">
          {onToggleBookmark && (
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                onToggleBookmark();
              }}
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center shadow-md active:scale-90"
            >
              <Bookmark size={18} color="#005c55" fill={isBookmarked ? '#005c55' : 'none'} />
            </Pressable>
          )}

          {onDelete && (
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                handleDeletePress();
              }}
              className="w-9 h-9 rounded-full bg-red-500/90 items-center justify-center shadow-md active:scale-90"
            >
              <Trash2 size={18} color="#ffffff" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Outfit Body Info */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-sans font-bold text-title-md text-on-surface truncate flex-1 mr-2">
            {title}
          </Text>
          <View className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <Text className="font-sans font-semibold text-label-xs text-primary">
              {items.length} Món đồ
            </Text>
          </View>
        </View>

        {outfit.description ? (
          <Text className="font-sans text-body-sm text-on-surface-variant line-clamp-2 mb-3" numberOfLines={2}>
            {outfit.description}
          </Text>
        ) : null}

        {/* Included Items Avatars Grid */}
        {items.length > 0 && (
          <View className="flex-row items-center gap-2 my-2 py-2 border-t border-b border-outline-variant/20">
            {items.slice(0, 4).map((item, idx) => (
              <View
                key={item.id || idx}
                className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
              >
                <Image
                  source={resolveImageUrl(item.image_url, item.category)}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  placeholder={{ blurhash: DEFAULT_BLURHASH }}
                  transition={150}
                />
              </View>
            ))}
            {items.length > 4 && (
              <View className="w-10 h-10 rounded-lg bg-surface-container-high items-center justify-center border border-outline-variant/20">
                <Text className="font-sans font-bold text-label-xs text-on-surface-variant">
                  +{items.length - 4}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer Actions */}
        <View className="flex-row items-center justify-between pt-2">
          {onSchedule ? (
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                onSchedule();
              }}
              className="flex-row items-center gap-1.5 px-3 py-2 bg-primary/10 rounded-xl border border-primary/20 active:scale-95"
            >
              <CalendarIcon size={16} color="#005c55" />
              <Text className="font-sans font-semibold text-label-md text-primary">
                Set lịch mặc
              </Text>
            </Pressable>
          ) : (
            <View />
          )}

          <View className="flex-row items-center gap-1">
            <Text className="font-sans font-semibold text-label-md text-primary">
              Xem chi tiết
            </Text>
            <ChevronRight size={16} color="#005c55" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
