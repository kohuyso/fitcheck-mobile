import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles, Check, Image as ImageIcon, Send, X } from 'lucide-react-native';
import {
  getSwapAlternativesApiV1DashboardSwapAlternativesGetOptions,
  swapOutfitItemApiV1DashboardOutfitOutfitIdSwapPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { SwapOutfitItemRequest } from '@/api/types.gen';
import { resolveImageUrl } from '@/utils/image-url';

interface SwapItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  outfitId?: number;
  currentItemId?: number;
}

export default function SwapItemSheet({
  isOpen,
  onClose,
  outfitId = 1,
  currentItemId = 1,
}: SwapItemSheetProps) {
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

  const handleConfirm = async () => {
    if (selectedAltId) {
      try {
        const bodyPayload: SwapOutfitItemRequest = {
          old_item_id: currentItemId,
          new_item_id: Number(selectedAltId),
        };
        await swapItemMutation.mutateAsync({
          path: { outfit_id: outfitId },
          body: bodyPayload,
        });
      } catch (err) {
        console.log('Swap item error:', err);
      }
    }
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full bg-white rounded-t-[32px] overflow-hidden max-h-[85%] shadow-2xl"
          >
            {/* Grab Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-12 h-1.5 bg-outline-variant/40 rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-3 border-b border-outline-variant/20">
              <View>
                <Text className="font-sans font-bold text-xl text-on-surface">Swap an Item</Text>
                <Text className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Recommended alternatives for footwear
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 items-center justify-center rounded-full bg-surface-container-high active:opacity-70"
              >
                <X size={18} className="text-on-surface-variant" />
              </Pressable>
            </View>

            <ScrollView
              className="px-6 pt-4"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {/* Reasoning Chip */}
              <View className="mb-5 p-4 bg-primary-container/10 border border-primary-container/20 rounded-2xl flex-row gap-3 items-start">
                <View className="p-2 bg-primary/10 rounded-xl">
                  <Sparkles size={18} className="text-primary" />
                </View>
                <Text className="flex-1 font-sans text-xs text-on-surface leading-relaxed mt-0.5">
                  AI suggests leather options for better moisture protection and a sharper evening silhouette.
                </Text>
              </View>

              {/* Alternatives Grid */}
              <View className="flex-row flex-wrap gap-3 pb-4">
                {/* Current Active Item */}
                <View className="w-[48%] bg-surface-container-lowest rounded-2xl overflow-hidden border-2 border-primary relative shadow-sm">
                  <Image
                    source=""
                    className="aspect-square w-full bg-surface-container-low"
                    contentFit="cover"
                  />
                  <View className="p-3">
                    <Text className="font-sans font-bold text-[10px] text-primary uppercase tracking-wider">
                      Current
                    </Text>
                    <Text className="font-sans font-bold text-sm text-on-surface leading-tight mt-0.5" numberOfLines={1}>
                      Canvas Sneaker
                    </Text>
                    <Text className="font-sans text-xs text-on-surface-variant mt-0.5" numberOfLines={1}>
                      Everlane • White
                    </Text>
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
                      className={`w-[48%] bg-surface-container-lowest rounded-2xl overflow-hidden border shadow-sm active:scale-95 ${
                        isSelected ? 'border-primary border-2' : 'border-outline-variant/30'
                      }`}
                    >
                      <Image
                        source={resolveImageUrl(alt.image)}
                        style={{ width: '100%', height: '100%' }}
                        className="aspect-square bg-surface-container-low"
                        contentFit="cover"
                      />
                      <View className="p-3">
                        <Text className="font-sans font-bold text-[10px] text-tertiary uppercase tracking-wider">
                          {alt.type}
                        </Text>
                        <Text className="font-sans font-bold text-sm text-on-surface leading-tight mt-0.5" numberOfLines={1}>
                          {alt.title}
                        </Text>
                        <Text className="font-sans text-xs text-on-surface-variant mt-0.5" numberOfLines={1}>
                          {alt.brand}
                        </Text>
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
            <View className="px-6 pt-3 pb-8 border-t border-outline-variant/20 bg-white">
              <View className="flex-row items-center gap-2 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2 mb-3">
                <ImageIcon size={18} className="text-on-surface-variant" />
                <TextInput
                  placeholder="Chat with AI to refine..."
                  placeholderTextColor="#6e7977"
                  className="flex-1 font-sans text-sm text-on-surface py-1"
                />
                <Pressable className="p-1.5 bg-primary/10 rounded-lg">
                  <Send size={16} className="text-primary" />
                </Pressable>
              </View>

              <Pressable
                onPress={handleConfirm}
                disabled={swapItemMutation.isPending}
                className="w-full bg-on-background active:opacity-90 py-3.5 rounded-xl items-center shadow-md mb-2"
              >
                <Text className="font-sans font-bold text-base text-white">
                  {swapItemMutation.isPending ? 'Swapping...' : 'Confirm Selection'}
                </Text>
              </Pressable>

              <Pressable onPress={onClose} className="w-full py-2 items-center">
                <Text className="font-sans font-medium text-xs text-on-surface-variant">Cancel</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

