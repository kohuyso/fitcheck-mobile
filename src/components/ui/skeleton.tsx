import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends ViewProps {
  className?: string;
}

export function Skeleton({ className, style, ...props }: SkeletonProps) {
  return (
    <View
      className={cn('animate-pulse rounded-xl bg-surface-container-high/60', className)}
      style={style}
      {...props}
    />
  );
}
