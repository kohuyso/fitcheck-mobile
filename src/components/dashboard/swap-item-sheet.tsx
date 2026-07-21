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
import { useQuery } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Sparkles, Check, Image as ImageIcon, Send } from 'lucide-react-native';
import { getSwapAlternativesApiV1DashboardSwapAlternativesGetOptions } from '@/api/@tanstack/react-query.gen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ALTERNATIVES = [
  {
    id: 'alt-1',
    type: 'Upgrade',
    title: 'Leather Boot',
    brand: 'Thursday • Brown',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_IyDvNgaUfYGpxZ4nTYOVt_yfIQUQqJmMRKeDNiRnK5YhpSkn5FxUCr11TQKBfNSWoFnwtnVZy9TdHf1dq0nCn02-SrJHKOu2f6WClwYiwVUbbWrRbjTTBzCrWGaIijtA526V-6pvI2xu0XNcV8YwvQcOpyAw8jJUgLnAp5PbuJ93eRQPZwwJALRJfFBM4i3W6-Z39Zt555Xq4PQ_s63_1bLbKvxr_hHYEvoC9pmy9cXKjG1j980VKRC5SQ08CWKRHnVtrUIzhJ0',
  },
  {
    id: 'alt-2',
    type: 'Formal',
    title: 'Penny Loafer',
    brand: 'G.H. Bass • Black',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6-iVVrNBl_SiUGdnd1J7TP4bflA97PqRmAa9VS0O-8IkgO8nGgeAsNv1Zo7XEtgWjObH0jyfikErcHOghzQBNDEV3YTix_5n15rCFuGfiIMg70o90P_eq1h6qLxuD22lMDvUlB8WITan2NoY9_aqQdL4qNf_JP4mhtOhpGtqoUztvabwQxQpd4bUG6wAGLJ_km8_tMgv6zQFI7nQA7kI0isrRIO6_oHgKEvxPtxt-PJaHtvQAy7RUFTKGvcNATS0Y9qxWa7ej8ys',
  },
  {
    id: 'alt-3',
    type: 'Comfort',
    title: 'Tech Runner',
    brand: 'On • Slate',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCuqwIy6pIezO_4lMAAFvG4cuAwGBwjludncYoCfNZ-fVt-fFIGhv1Qp7C431j8szMAn76klmiGAXGHqMWy_sf_jaueUuxaqWy11b4x-ito7G4MN8Dl--V3hMTuxr-Af_560AluXIQmcNDJVStiZTR8htuylsnFPqWLTq5bbxbehEcHIpTGvWEUs93MC2mQIB2eBFfF_AXodlc0BIIPem2M8SlgCgMNiroiCoj4rDB35pscsoDT5Er7Cpj0CtUlDpOfafxjBfTr6-g',
  },
];

interface SwapItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SwapItemSheet({ isOpen, onClose }: SwapItemSheetProps) {
  const [selectedAltId, setSelectedAltId] = useState<string | null>(null);

  // Fetch Swap Alternatives from API
  const { data: alternativesData } = useQuery(
    getSwapAlternativesApiV1DashboardSwapAlternativesGetOptions({
      query: { category: 'footwear' },
    })
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
  const displayAlternatives = alternativesData && alternativesData.length > 0
    ? alternativesData.map((item, index) => {
        const fallbackAlt = ALTERNATIVES[index % ALTERNATIVES.length];
        return {
          id: String(item.id),
          type: fallbackAlt.type,
          title: item.name,
          brand: fallbackAlt.brand,
          image: item.image_url || fallbackAlt.image,
        };
      })
    : ALTERNATIVES;

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
                source="https://lh3.googleusercontent.com/aida-public/AB6AXuCOObeb0AMlawtyLiyyA9221k1YV1Q99YO0j_pqNArnqqBzxCQjnCfiwkuhg989X7tJxfxyDnBp3uJEq9zHccWvnhFZPJGpLxZM7HZsq_QK-WAvKHIkHKKanFfQ8-BtueqjDumxdReKlngQF4hNeK2TN_ncVc8meDCYNPGnUpg2yankorqAMdp0dJctAnBv8XZV2lgqzaQrceYdKOiqaqJJb_zvstn0fJ-9ZHccHMoL-7_gI_9Dy4yPWq_dT1bLWKZW6YOTi5gv2Iw"
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
            onPress={onClose}
            className="w-full bg-on-background active:scale-[0.98] py-4 rounded-xl items-center shadow-md mb-2"
          >
            <Text className="font-sans font-bold text-title-lg text-white">Confirm Selection</Text>
          </Pressable>

          <Pressable onPress={onClose} className="w-full py-2 items-center">
            <Text className="font-sans font-medium text-label-md text-on-surface-variant">Cancel</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}
