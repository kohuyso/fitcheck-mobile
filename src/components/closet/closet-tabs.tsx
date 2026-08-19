import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Shirt, Layers } from 'lucide-react-native';
import { cn } from '@/utils/cn';

interface ClosetTabsProps {
  activeTab: 'items' | 'outfits';
  itemsCount: number;
  outfitsCount: number;
  onTabChange: (tab: 'items' | 'outfits') => void;
}

export const ClosetTabs = React.memo(function ClosetTabs({
  activeTab,
  itemsCount,
  outfitsCount,
  onTabChange,
}: ClosetTabsProps) {
  return (
    <View className="px-margin-mobile pt-3 pb-1">
      <View className="flex-row bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/20">
        <Pressable
          onPress={() => onTabChange('items')}
          className={cn(
            'flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl',
            activeTab === 'items' ? 'bg-primary' : 'bg-transparent'
          )}
        >
          <Shirt size={18} color={activeTab === 'items' ? '#ffffff' : '#3e4947'} />
          <Text
            className={cn(
              'font-sans font-bold text-label-lg',
              activeTab === 'items' ? 'text-white' : 'text-on-surface-variant'
            )}
          >
            Món đồ ({itemsCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onTabChange('outfits')}
          className={cn(
            'flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl',
            activeTab === 'outfits' ? 'bg-primary' : 'bg-transparent'
          )}
        >
          <Layers size={18} color={activeTab === 'outfits' ? '#ffffff' : '#3e4947'} />
          <Text
            className={cn(
              'font-sans font-bold text-label-lg',
              activeTab === 'outfits' ? 'text-white' : 'text-on-surface-variant'
            )}
          >
            Outfit đã tạo ({outfitsCount})
          </Text>
        </Pressable>
      </View>
    </View>
  );
});
