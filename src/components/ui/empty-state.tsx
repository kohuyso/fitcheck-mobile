import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '@/utils/cn';
import { LucideIcon, Lightbulb } from 'lucide-react-native';

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ size?: number; color?: string; className?: string }>;
  title: string;
  description?: string;
  badgeText?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  tipText?: string;
  variant?: 'fullscreen' | 'card';
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  badgeText,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  tipText,
  variant = 'fullscreen',
  className,
  children,
}: EmptyStateProps) {
  const isCard = variant === 'card';

  return (
    <View
      className={cn(
        'items-center justify-center text-center',
        isCard
          ? 'p-6 bg-surface-container-low/70 rounded-3xl border border-outline-variant/20 my-3'
          : 'flex-1 p-6 my-auto',
        className
      )}
    >
      {badgeText && (
        <View className="bg-primary/10 px-3.5 py-1 rounded-full mb-3.5 border border-primary/20">
          <Text className="font-sans font-semibold text-label-xs text-primary uppercase tracking-wider">
            {badgeText}
          </Text>
        </View>
      )}

      {Icon && (
        <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4 border border-primary/20 shadow-sm shadow-primary/10">
          <Icon size={32} color="#005c55" />
        </View>
      )}

      <Text className="font-sans font-bold text-headline-xs text-on-surface mb-2 text-center">
        {title}
      </Text>

      {description && (
        <Text className="font-sans text-body-md text-on-surface-variant text-center max-w-xs mb-5 leading-relaxed">
          {description}
        </Text>
      )}

      {/* Primary Action Button */}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="w-full max-w-xs h-12 bg-primary rounded-xl flex-row items-center justify-center active:scale-95 shadow-md shadow-primary/25 mb-2.5"
        >
          <Text className="font-sans font-bold text-label-lg text-white">
            {actionLabel}
          </Text>
        </Pressable>
      )}

      {/* Secondary Action Button */}
      {secondaryActionLabel && onSecondaryAction && (
        <Pressable
          onPress={onSecondaryAction}
          className="w-full max-w-xs h-11 bg-surface-container-low rounded-xl flex-row items-center justify-center border border-outline-variant/30 active:scale-95 mb-2"
        >
          <Text className="font-sans font-semibold text-label-md text-primary">
            {secondaryActionLabel}
          </Text>
        </Pressable>
      )}

      {/* Educational Micro-Tip */}
      {tipText && (
        <View className="mt-4 pt-3 border-t border-outline-variant/15 flex-row items-center gap-2 max-w-xs">
          <Lightbulb size={16} color="#005c55" className="shrink-0" />
          <Text className="font-sans text-label-xs text-on-surface-variant flex-1 leading-normal">
            {tipText}
          </Text>
        </View>
      )}

      {children}
    </View>
  );
}
