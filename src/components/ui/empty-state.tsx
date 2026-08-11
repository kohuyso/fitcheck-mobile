import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react-native';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center p-6 text-center', className)}>
      {Icon && (
        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4 border border-primary/20">
          <Icon size={32} className="text-primary" color="#005c55" />
        </View>
      )}
      <Text className="font-sans font-bold text-headline-xs text-on-surface mb-1 text-center">
        {title}
      </Text>
      {description && (
        <Text className="font-sans text-body-md text-on-surface-variant text-center max-w-xs mb-6">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="px-6 py-3 bg-primary rounded-xl active:scale-95 shadow-md shadow-primary/20"
        >
          <Text className="font-sans font-bold text-label-lg text-white">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
