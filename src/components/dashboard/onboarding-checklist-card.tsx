import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, X, Sparkles, Shirt, Calendar as CalendarIcon } from 'lucide-react-native';
import { cn } from '@/utils/cn';

interface OnboardingChecklistCardProps {
  wardrobeCount: number;
  outfitsCount: number;
  onOpenCapsuleModal: () => void;
}

export function OnboardingChecklistCard({
  wardrobeCount,
  outfitsCount,
  onOpenCapsuleModal,
}: OnboardingChecklistCardProps) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  // If user has built out their wardrobe (>3 items and >0 outfits) or dismissed, don't show
  if (isDismissed || (wardrobeCount >= 4 && outfitsCount >= 2)) {
    return null;
  }

  const step1Done = true; // Registered & selected initial style
  const step2Done = wardrobeCount > 0;
  const step3Done = outfitsCount > 0;

  const completedCount = [step1Done, step2Done, step3Done].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  return (
    <View className="mb-6 bg-gradient-to-br bg-white p-5 rounded-3xl border border-primary/20 shadow-md shadow-primary/5">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
            <Sparkles size={16} color="#005c55" />
          </View>
          <View>
            <Text className="font-sans font-bold text-title-md text-on-surface">
              Bắt đầu với FitCheck
            </Text>
            <Text className="font-sans text-label-xs text-on-surface-variant">
              Hoàn thành {completedCount}/3 bước để kích hoạt AI tốt nhất
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setIsDismissed(true)}
          className="p-1 rounded-full bg-surface-container-low active:scale-90"
        >
          <X size={16} color="#94a3b8" />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-2 bg-surface-container-low rounded-full mb-4 overflow-hidden">
        <View
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      {/* Step 1: Persona */}
      <View className="flex-row items-center justify-between py-2 border-b border-outline-variant/15">
        <View className="flex-row items-center gap-3">
          <CheckCircle2 size={18} color="#005c55" />
          <Text className="font-sans font-medium text-body-sm text-on-surface line-through opacity-70">
            Khám phá phong cách cá nhân
          </Text>
        </View>
        <Text className="font-sans font-semibold text-label-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Xong
        </Text>
      </View>

      {/* Step 2: Add Item */}
      <Pressable
        onPress={() => {
          if (!step2Done) {
            onOpenCapsuleModal();
          } else {
            router.push('/closet');
          }
        }}
        className="flex-row items-center justify-between py-2.5 border-b border-outline-variant/15 active:opacity-70"
      >
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          {step2Done ? (
            <CheckCircle2 size={18} color="#005c55" />
          ) : (
            <Circle size={18} color="#94a3b8" />
          )}
          <View className="flex-1">
            <Text
              className={cn(
                'font-sans font-medium text-body-sm text-on-surface',
                step2Done && 'line-through opacity-70'
              )}
            >
              Thêm món đồ đầu tiên vào tủ
            </Text>
            {!step2Done && (
              <Text className="font-sans text-label-xs text-primary">
                Chọn tủ cơ bản (1-chạm) hoặc quét camera AI
              </Text>
            )}
          </View>
        </View>

        {!step2Done ? (
          <View className="flex-row items-center gap-1 bg-primary px-2.5 py-1 rounded-full shadow-sm">
            <Shirt size={12} color="#ffffff" />
            <Text className="font-sans font-bold text-label-xs text-white">Thêm ngay</Text>
          </View>
        ) : (
          <Text className="font-sans font-semibold text-label-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {wardrobeCount} món
          </Text>
        )}
      </Pressable>

      {/* Step 3: Schedule outfit */}
      <Pressable
        onPress={() => router.push('/calendar')}
        className="flex-row items-center justify-between py-2.5 active:opacity-70"
      >
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          {step3Done ? (
            <CheckCircle2 size={18} color="#005c55" />
          ) : (
            <Circle size={18} color="#94a3b8" />
          )}
          <View className="flex-1">
            <Text
              className={cn(
                'font-sans font-medium text-body-sm text-on-surface',
                step3Done && 'line-through opacity-70'
              )}
            >
              Lên lịch phối đồ cho ngày mai
            </Text>
            {!step3Done && (
              <Text className="font-sans text-label-xs text-on-surface-variant">
                Tiết kiệm thời gian chuẩn bị trang phục mỗi sáng
              </Text>
            )}
          </View>
        </View>

        {!step3Done ? (
          <View className="flex-row items-center gap-1 bg-surface-container-low border border-outline-variant/30 px-2.5 py-1 rounded-full">
            <CalendarIcon size={12} color="#005c55" />
            <Text className="font-sans font-bold text-label-xs text-primary">Lên lịch</Text>
          </View>
        ) : (
          <Text className="font-sans font-semibold text-label-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Đã có
          </Text>
        )}
      </Pressable>
    </View>
  );
}
