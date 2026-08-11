import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { cn } from '@/utils/cn';

export interface SelectionActionBarProps {
  selectedCount: number;
  bottomOffset: number;
  onConfirm: () => void;
}

export function SelectionActionBar({
  selectedCount,
  bottomOffset,
  onConfirm,
}: SelectionActionBarProps) {
  return (
    <View
      style={{ bottom: bottomOffset }}
      className="absolute left-5 right-5 bg-white p-4 rounded-2xl border border-primary/20 shadow-2xl z-[150] flex-row items-center justify-between gap-3"
    >
      <View className="flex-1">
        <Text className="font-sans font-bold text-body-lg text-on-surface">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </Text>
        <Text className="font-sans text-label-md text-on-surface-variant">
          {selectedCount === 0 ? 'Select items above' : 'Ready to create outfit'}
        </Text>
      </View>

      <Pressable
        disabled={selectedCount === 0}
        onPress={onConfirm}
        className={cn(
          'px-5 py-3 rounded-xl flex-row items-center gap-2 active:scale-95 shadow-md',
          selectedCount > 0 ? 'bg-primary' : 'bg-surface-container-high opacity-50'
        )}
      >
        <CheckCircle size={18} color="#ffffff" />
        <Text className="font-sans font-bold text-label-md text-white">Create Outfit</Text>
      </Pressable>
    </View>
  );
}
