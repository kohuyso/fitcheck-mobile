import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, Bookmark, Trash2 } from 'lucide-react-native';

interface OutfitHeaderBarProps {
  title: string;
  isBookmarked: boolean;
  onBack: () => void;
  onToggleBookmark: () => void;
  onDelete: () => void;
}

export const OutfitHeaderBar = React.memo(function OutfitHeaderBar({
  title,
  isBookmarked,
  onBack,
  onToggleBookmark,
  onDelete,
}: OutfitHeaderBarProps) {
  return (
    <View className="flex-row items-center justify-between px-margin-mobile py-3 border-b border-outline-variant/30 bg-surface">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        className="p-2 rounded-full active:scale-95 bg-surface-container-low"
      >
        <ChevronLeft size={22} color="#181c1c" />
      </Pressable>

      <Text className="font-sans font-bold text-title-lg text-on-surface truncate flex-1 mx-4 text-center">
        {title}
      </Text>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onToggleBookmark}
          hitSlop={8}
          className="p-2 rounded-full bg-surface-container-low active:scale-95"
        >
          <Bookmark size={20} color="#005c55" fill={isBookmarked ? '#005c55' : 'none'} />
        </Pressable>

        <Pressable
          onPress={onDelete}
          hitSlop={8}
          className="p-2 rounded-full bg-red-50 active:scale-95"
        >
          <Trash2 size={20} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
});
