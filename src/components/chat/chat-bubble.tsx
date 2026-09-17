import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Markdown from 'react-native-markdown-display';
import { ArrowRight, Bookmark, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react-native';
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
        {isAssistant ? (
          <Markdown
            style={{
              body: {
                color: '#191c1d',
                fontSize: 15,
                lineHeight: 22,
              },
              heading1: {
                color: '#005c55',
                fontSize: 18,
                fontWeight: '700',
                marginVertical: 4,
              },
              heading2: {
                color: '#005c55',
                fontSize: 16,
                fontWeight: '700',
                marginVertical: 4,
              },
              heading3: {
                color: '#191c1d',
                fontSize: 15,
                fontWeight: '700',
                marginVertical: 3,
              },
              paragraph: {
                marginTop: 0,
                marginBottom: 6,
              },
              strong: {
                fontWeight: '700',
                color: '#005c55',
              },
              bullet_list: {
                marginTop: 2,
                marginBottom: 4,
              },
              ordered_list: {
                marginTop: 2,
                marginBottom: 4,
              },
              list_item: {
                marginVertical: 2,
              },
              code_inline: {
                backgroundColor: '#e6ecea',
                color: '#005c55',
                borderRadius: 4,
                paddingHorizontal: 4,
                fontSize: 13,
              },
            }}
          >
            {message.text}
          </Markdown>
        ) : (
          <Text className="font-sans text-body-md leading-6 text-white font-medium">
            {message.text}
          </Text>
        )}

        {/* AI Suggested Outfit Card inline */}
        {isAssistant && message.suggestedOutfit && (
          <View className="mt-3 p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm">
            {/* Card Header: AI Badge + Bookmark */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                <Sparkles size={13} color="#005c55" />
                <Text className="font-sans font-bold text-[11px] text-primary uppercase tracking-wider">
                  AI Curated Outfit
                </Text>
              </View>

              {message.suggestedOutfit.outfit_id && (
                <Pressable
                  onPress={() =>
                    message.suggestedOutfit?.outfit_id &&
                    onToggleBookmark?.(message.suggestedOutfit.outfit_id)
                  }
                  hitSlop={8}
                  className="p-1 rounded-full active:scale-90"
                >
                  <Bookmark
                    size={18}
                    color="#005c55"
                    fill={isBookmarked ? '#005c55' : 'none'}
                  />
                </Pressable>
              )}
            </View>

            {/* Style Type / Title */}
            <Text className="font-sans font-bold text-base text-on-surface mb-1">
              {message.suggestedOutfit.style_type || message.suggestedOutfit.title || 'Outfit Recommendation'}
            </Text>

            {/* Tags Row */}
            {message.suggestedOutfit.tags && message.suggestedOutfit.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mb-2.5">
                {message.suggestedOutfit.tags.map((tag, idx) => (
                  <View key={idx} className="bg-surface-container-high px-2 py-0.5 rounded-md border border-outline-variant/20">
                    <Text className="font-sans text-[11px] font-medium text-on-surface-variant">
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Items Row / List */}
            {message.suggestedOutfit.items && message.suggestedOutfit.items.length > 0 ? (
              <View className="flex-col gap-2 mb-3">
                {message.suggestedOutfit.items.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center gap-2.5 p-2 bg-white rounded-xl border border-outline-variant/20 shadow-xs"
                  >
                    <View className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container">
                      <Image
                        source={resolveImageUrl(item.image_url, item.category)}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-sans font-semibold text-xs text-on-surface" numberOfLines={1}>
                        {item.name || item.category}
                      </Text>
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <View
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: item.color_code || '#000000' }}
                        />
                        <Text className="font-sans text-[11px] text-on-surface-variant">
                          {item.color_name || item.category}
                        </Text>
                        {item.style && (
                          <Text className="font-sans text-[10px] text-outline">
                            • {item.style}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : message.suggestedOutfit.image_url ? (
              <View className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 mb-3">
                <Image
                  source={resolveImageUrl(message.suggestedOutfit.image_url)}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </View>
            ) : null}

            {/* View Details Action Button */}
            <Pressable
              onPress={() => message.suggestedOutfit && onOutfitPress?.(message.suggestedOutfit)}
              className="w-full py-2.5 px-3 bg-primary rounded-xl flex-row items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <Text className="font-sans font-bold text-xs text-white">
                Xem chi tiết ({message.suggestedOutfit.items?.length || 0} món)
              </Text>
              <ArrowRight size={14} color="#ffffff" />
            </Pressable>
          </View>
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
