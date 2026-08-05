import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useMutation, useQuery } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Sparkles, Check, Image as ImageIcon, Send } from 'lucide-react-native';
import {
  getSwapAlternativesApiV1DashboardSwapAlternativesGetOptions,
  swapOutfitItemApiV1DashboardOutfitOutfitIdSwapPostMutation,
} from '@/api/@tanstack/react-query.gen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwapItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  outfitId?: number;
}

export default function SwapItemSheet({ isOpen, onClose, outfitId = 1 }: SwapItemSheetProps) {
  const [selectedAltId, setSelectedAltId] = useState<string | null>(null);

  // Fetch Swap Alternatives from API
  const { data: alternativesData } = useQuery(
    getSwapAlternativesApiV1DashboardSwapAlternativesGetOptions({
      query: { category: 'footwear' },
    })
  );

  // Swap Outfit Item Mutation
  const swapItemMutation = useMutation(
    swapOutfitItemApiV1DashboardOutfitOutfitIdSwapPostMutation()
  );

  // Animation values
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      sheetTranslateY.value = withSpring(0, { damping: 15 });
      backdropOpacity.value = withTiming(0.4, { duration: 300 });
    } else {
      sheetTranslateY.value = withSpring(SCREEN_HEIGHT, { damping: 15 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isOpen) return null;

  // Map API data to display alternatives
  const displayAlternatives = (alternativesData || []).map((item) => {
    return {
      id: String(item.id),
      type: item.style_tag || 'Alternative',
      title: item.name,
      brand: item.category || 'Wardrobe Item',
      image: item.image_url || '',
    };
  });

  return (
    <View className="absolute inset-0 z-50">
      {/* Backdrop overlay */}
      <Animated.View
        style={backdropAnimatedStyle}
        className="absolute inset-0 bg-on-background"
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Sheet Container */}
      <Animated.View
        style={[sheetAnimatedStyle]}
        className="absolute inset-x-0 bottom-0 bg-white/95 rounded-t-[32px] border-t border-outline-variant/30 shadow-2xl pt-3 pb-8"
      >
        {/* Grab Handle */}
        <View className="items-center pb-4">
          <View className="w-10 h-1.5 bg-outline-variant/40 rounded-full" />
        </View>

        {/* Sheet Header */}
        <View className="px-margin-mobile pb-4">
          <Text className="font-sans font-bold text-headline-lg text-on-surface">Swap an Item</Text>
          <Text className="font-sans text-body-md text-on-surface-variant mt-0.5">
            Recommended alternatives for footwear
          </Text>
        </View>

        <ScrollView className="max-h-[380px] px-margin-mobile" showsVerticalScrollIndicator={false}>
          {/* Reasoning Chip */}
          <View className="mb-6 p-4 bg-primary-container/10 border border-primary-container/20 rounded-xl flex-row gap-3">
            <Sparkles size={20} className="text-primary mt-0.5" />
            <Text className="flex-1 font-sans text-body-md text-on-primary-fixed-variant leading-relaxed">
              AI suggests leather options for better moisture protection and a sharper evening silhouette.
            </Text>
          </View>

          {/* Alternatives Grid */}
          <View className="flex-row flex-wrap gap-3 pb-6">
            {/* Active Item */}
            <View className="w-[47%] bg-white rounded-xl overflow-hidden border-2 border-primary relative shadow-sm">
              <Image
                source=""
                className="aspect-square w-full bg-surface-container-low"
                contentFit="cover"
              />
              <View className="p-3">
                <Text className="font-sans font-bold text-label-sm text-primary uppercase">Current</Text>
                <Text className="font-sans font-bold text-body-lg leading-tight mt-0.5">Canvas Sneaker</Text>
                <Text className="font-sans text-label-md text-on-surface-variant mt-0.5">Everlane • White</Text>
              </View>
              <View className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow-sm">
                <Check size={12} className="text-white" />
              </View>
            </View>

            {/* Alternative items */}
            {displayAlternatives.map((alt) => {
              const isSelected = selectedAltId === alt.id;
              return (
                <Pressable
                  key={alt.id}
                  onPress={() => setSelectedAltId(isSelected ? null : alt.id)}
                  className={`w-[47%] bg-white rounded-xl overflow-hidden border shadow-sm active:scale-95 ${
                    isSelected ? 'border-primary border-2' : 'border-outline-variant/30'
                  }`}
                >
                  <Image
                    source={alt.image}
                    className="aspect-square w-full bg-surface-container-low"
                    contentFit="cover"
                  />
                  <View className="p-3">
                    <Text className="font-sans font-bold text-label-sm text-tertiary uppercase">{alt.type}</Text>
                    <Text className="font-sans font-bold text-body-lg leading-tight mt-0.5">{alt.title}</Text>
                    <Text className="font-sans text-label-md text-on-surface-variant mt-0.5">{alt.brand}</Text>
                  </View>
                  {isSelected && (
                    <View className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow-sm">
                      <Check size={12} className="text-white" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="px-margin-mobile pt-3 border-t border-outline-variant/20 bg-white"
        >
          <View className="flex-row items-center gap-2 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 mb-3">
            <ImageIcon size={20} className="text-on-surface-variant" />
            <TextInput
              placeholder="Chat with AI to refine..."
              placeholderTextColor="#6e7977"
              className="flex-1 font-sans text-body-md text-on-surface py-1"
            />
            <Send size={18} className="text-primary" />
          </View>

          <Pressable
            onPress={async () => {
              if (selectedAltId) {
                try {
                  await swapItemMutation.mutateAsync({
                    path: { outfit_id: outfitId },
                    body: { new_item_id: Number(selectedAltId) } as any,
                  });
                } catch (err) {
                  console.log('Swap item error:', err);
                }
              }
              onClose();
            }}
            disabled={swapItemMutation.isPending}
            className="w-full bg-on-background active:scale-[0.98] py-4 rounded-xl items-center shadow-md mb-2"
          >
            <Text className="font-sans font-bold text-title-lg text-white">
              {swapItemMutation.isPending ? 'Swapping...' : 'Confirm Selection'}
            </Text>
          </Pressable>

          <Pressable onPress={onClose} className="w-full py-2 items-center">
            <Text className="font-sans font-medium text-label-md text-on-surface-variant">Cancel</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}
