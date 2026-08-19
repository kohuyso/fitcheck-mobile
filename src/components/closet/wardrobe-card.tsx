import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Check, Sparkles } from 'lucide-react-native';
import { cn } from '@/utils/cn';
import { resolveImageUrl, DEFAULT_BLURHASH } from '@/utils/image-url';

export interface WardrobeItemData {
  id: string;
  name: string;
  category: string;
  color: string;
  colorHex: string;
  style: string;
  image: string;
  isAiFixed?: boolean;
}

export interface WardrobeCardProps {
  item: WardrobeItemData;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onPress: () => void;
}

export function WardrobeCard({
  item,
  isSelectionMode = false,
  isSelected = false,
  onPress,
}: WardrobeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'w-[47%] bg-white rounded-2xl overflow-hidden border mb-4 shadow-sm active:scale-98 relative',
        isSelectionMode && isSelected
          ? 'border-2 border-primary bg-primary/5'
          : 'border-slate-200'
      )}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <View
          className={cn(
            'absolute top-2 left-2 z-20 w-6 h-6 rounded-full items-center justify-center border shadow-sm',
            isSelected
              ? 'bg-primary border-primary'
              : 'bg-white/90 border-outline-variant/50'
          )}
        >
          {isSelected && <Check size={14} color="#ffffff" />}
        </View>
      )}

      {/* Image Viewfinder Container */}
      <View className="relative aspect-[4/5] bg-slate-100 items-center justify-center p-4">
        <Image
          source={resolveImageUrl(item.image, item.category)}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          cachePolicy="memory-disk"
          placeholder={{ blurhash: DEFAULT_BLURHASH }}
          transition={150}
        />
        {item.isAiFixed && !isSelectionMode && (
          <View className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full border border-black/5">
            <Sparkles size={14} color="#005c55" fill="#005c55" />
          </View>
        )}
      </View>

      {/* Card Info */}
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
            className={cn(
              'px-2 py-0.5 rounded',
              item.style === 'Formal' ? 'bg-emerald-50' : 'bg-surface-container-high'
            )}
          >
            <Text
              className={cn(
                'font-sans font-bold text-[10px] uppercase',
                item.style === 'Formal' ? 'text-primary' : 'text-secondary'
              )}
            >
              {item.style}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
