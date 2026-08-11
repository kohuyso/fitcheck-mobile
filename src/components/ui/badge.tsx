import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

export interface BadgeProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'surface' | 'emerald';
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export function Badge({
  variant = 'surface',
  children,
  className,
  textClassName,
  ...props
}: BadgeProps) {
  const containerVariants = {
    primary: 'bg-primary border-primary',
    secondary: 'bg-secondary border-secondary',
    outline: 'bg-transparent border-outline-variant/30',
    surface: 'bg-surface-container-low border-outline-variant/20',
    emerald: 'bg-emerald-50 border-emerald-200',
  };

  const textVariants = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-on-surface-variant font-medium',
    surface: 'text-on-surface font-medium',
    emerald: 'text-emerald-700 font-bold',
  };

  return (
    <View
      className={cn(
        'px-3 py-1 rounded-full border flex-row items-center gap-1',
        containerVariants[variant],
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={cn('font-sans text-label-sm', textVariants[variant], textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
