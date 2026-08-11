import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Bookmark, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { OutfitRecommendation } from '@/api/types.gen';
import { cn } from '@/utils/cn';
import { resolveImageUrl } from '@/utils/image-url';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  suggestedOutfit?: OutfitRecommendation | null;
}

export interface ChatBubbleProps {
  message: ChatMessage;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onToggleBookmark?: (outfitId: number) => void;
  onOutfitPress?: (outfit: OutfitRecommendation) => void;
}

export function ChatBubble({
  message,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onDislike,
  onToggleBookmark,
  onOutfitPress,
}: ChatBubbleProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <View
      className={cn(
        'mb-4 flex-col max-w-[85%]',
        isAssistant ? 'self-start' : 'self-end'
      )}
    >
      <View
        className={cn(
          'px-4 py-3 rounded-2xl shadow-sm',
          isAssistant
            ? 'bg-white border border-outline-variant/30 rounded-tl-sm'
            : 'bg-primary rounded-tr-sm'
        )}
      >
        <Text
          className={cn(
            'font-sans text-body-md leading-6',
            isAssistant ? 'text-on-surface' : 'text-white font-medium'
          )}
        >
          {message.text}
        </Text>

        {/* AI Suggested Outfit Card inline */}
        {isAssistant && message.suggestedOutfit && (
          <Pressable
            onPress={() => message.suggestedOutfit && onOutfitPress?.(message.suggestedOutfit)}
            className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex-row gap-3 active:scale-95"
          >
            <View className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100">
              <Image
                source={resolveImageUrl(message.suggestedOutfit.image_url)}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>

            <View className="flex-1 justify-between py-0.5">
              <View>
                <View className="flex-row items-center gap-1 mb-1">
                  <Sparkles size={12} color="#005c55" fill="#005c55" />
                  <Text className="font-sans font-bold text-label-xs text-primary uppercase">
                    AI Suggested
                  </Text>
                </View>
                <Text className="font-sans font-bold text-body-md text-on-surface truncate">
                  {message.suggestedOutfit.title || 'Outfit Recommendation'}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="font-sans text-label-sm text-on-surface-variant">
                  {message.suggestedOutfit.items?.length || 3} items
                </Text>
                {message.suggestedOutfit.outfit_id && (
                  <Pressable
                    onPress={() =>
                      message.suggestedOutfit?.outfit_id &&
                      onToggleBookmark?.(message.suggestedOutfit.outfit_id)
                    }
                    hitSlop={8}
                  >
                    <Bookmark
                      size={18}
                      color="#005c55"
                      fill={isBookmarked ? '#005c55' : 'none'}
                    />
                  </Pressable>
                )}
              </View>
            </View>
          </Pressable>
        )}
      </View>

      {/* Meta Footer */}
      <View
        className={cn(
          'flex-row items-center gap-2 mt-1 px-1',
          isAssistant ? 'justify-start' : 'justify-end'
        )}
      >
        <Text className="font-sans text-[10px] text-outline">{message.time}</Text>

        {isAssistant && (
          <View className="flex-row items-center gap-2 ml-2">
            <Pressable onPress={() => onLike?.(message.id)} hitSlop={6}>
              <ThumbsUp size={12} color={isLiked ? '#005c55' : '#707977'} />
            </Pressable>
            <Pressable onPress={() => onDislike?.(message.id)} hitSlop={6}>
              <ThumbsDown size={12} color="#707977" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
