import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';
import { cn } from '@/utils/cn';

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  textClassName,
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: 'h-10 px-4 rounded-lg',
    md: 'h-12 px-5 rounded-xl',
    lg: 'h-14 px-6 rounded-2xl',
  };

  const variantStyles = {
    primary: 'bg-primary shadow-md shadow-primary/20',
    secondary: 'bg-secondary shadow-md shadow-secondary/20',
    outline: 'bg-transparent border border-outline-variant/30',
    ghost: 'bg-transparent',
    emerald: 'bg-emerald-600 shadow-md shadow-emerald-900/20',
  };

  const textVariantStyles = {
    primary: 'text-white font-bold',
    secondary: 'text-white font-bold',
    outline: 'text-on-surface font-bold',
    ghost: 'text-primary font-bold',
    emerald: 'text-white font-bold',
  };

  return (
    <Pressable
      disabled={disabled || isLoading}
      className={cn(
        'flex-row items-center justify-center gap-2 active:scale-95 transition-all',
        sizeStyles[size],
        variantStyles[variant],
        (disabled || isLoading) && 'opacity-60',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#005c55' : '#ffffff'} />
      ) : (
        <>
          {icon}
          <Text className={cn('font-sans text-title-md', textVariantStyles[variant], textClassName)}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
