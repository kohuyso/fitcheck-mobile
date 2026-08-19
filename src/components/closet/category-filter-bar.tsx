import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '@/utils/cn';

interface CategoryFilterBarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilterBar = React.memo(function CategoryFilterBar({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryFilterBarProps) {
  return (
    <View className="py-3 px-margin-mobile flex-row flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <Pressable
            key={cat}
            onPress={() => onSelectCategory(cat)}
            className={cn(
              'px-4 py-1.5 rounded-full active:scale-95 border',
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
  );
});
