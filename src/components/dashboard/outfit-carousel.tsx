import React, { useState } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Sparkles } from 'lucide-react-native';
import { OutfitRecommendation } from '@/api/types.gen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_SPACING = 16;

const DEFAULT_OUTFITS = [
  {
    id: '1',
    title: 'The Modern Executive',
    tags: ['Business Casual', 'Water-Repellent'],
    isBestMatch: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAas6k2Ruo9sNokepikpvlr4fcqEObNt0b0MMTdxfQ7hDafVofFkolCDh6eCptu9BYdWDdBomn-M4c5zP7vsfDPGKe33nAbpy1YlyGimOBDM6weAi17hOrgD0_lQdTc8noqfD49VW1w7C4JnXSfApeWjeE1CoN-G1ZJVfd7UUZSVT8dyhUUrPHtAzUoLZUcAAEyNebcBdV3ZhN0t7BcQRfQ4fVnf5l5U8FW-QxN8CGKadx68e_m6C6gMN3A71R3EGSxLPfegLQl87k',
  },
  {
    id: '2',
    title: 'Classic Layers',
    tags: ['Casual', 'Layered'],
    isBestMatch: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8S3OaPRBwXAGddqKF8kMC4UEGMSrwDPLRANQ1avpKErlVsXEzE3aIgpNSGzzVEehqse2ie-25UDXVwwkW8SU98qV6yaPo4t9olbr7TQ5NwGFd18zxFYJpeR13rvve3zfR8dEaODFrwI6cDEWoOd0xssvagiKj8QZIwMA5Nt1prU91yOWYm8lu2f7dzibG6K5DLOPsYAEzaNIeoSyNWEKLJCfAeK3yvCxt48itkWBov2eOKqlSLqXtjJOlxzmjWwTC1DstcokISt0',
  },
  {
    id: '3',
    title: 'Urban Earth Tones',
    tags: ['Smart Casual', 'Earthy'],
    isBestMatch: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC9no3Gc5cSQ295WB-9PZnM3MjWeSEomQF1bLO1Cjw1oTl43Iu4T6PF3w50f11dWZSAFCsOC53t4RPtE9FYyfZFlji0WMJ7B4nJrNKp3gvfQCSyiN8IY_AA3R2HlBrBKCYZQQPrXWitzCc5R5Q7SQf-gCyFGZKx1zsSDppvGf-CqavdO63K1YqaeELVTgOefVbD7UAeFHDuuYAf7rLsDlz-MJCEupcqbMmgpFtBmo_ZT-Y-zD771h46WJSADALCM3GSOszebvH6I94',
  },
];

interface OutfitCarouselProps {
  outfits?: Array<OutfitRecommendation>;
  onIndexChanged?: (index: number) => void;
}

export default function OutfitCarousel({ outfits, onIndexChanged }: OutfitCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Map API recommended outfits to local display format
  const data = outfits && outfits.length > 0
    ? outfits.map((item, index) => {
        // Fallback to local image index if API doesn't provide images or first item image
        const fallbackImg = DEFAULT_OUTFITS[index % DEFAULT_OUTFITS.length].image;
        const mainImage = item.items && item.items.length > 0 ? item.items[0].image_url : fallbackImg;
        return {
          id: String(item.outfit_id),
          title: item.style_type || 'Custom Outfit',
          tags: [item.style_type || 'Curated', ...(item.items?.map(it => it.name).slice(0, 1) || [])],
          isBestMatch: index === 0,
          image: mainImage,
        };
      })
    : DEFAULT_OUTFITS;

  return (
    <View className="mb-4">
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: SCREEN_WIDTH - CARD_WIDTH - 20 }}
        onScroll={(e) => {
          const slide = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
          if (slide !== activeIndex && slide >= 0 && slide < data.length) {
            setActiveIndex(slide);
            if (onIndexChanged) {
              onIndexChanged(slide);
            }
          }
        }}
        renderItem={({ item, index }) => {
          const isActive = index === activeIndex;
          return (
            <View
              style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}
              className={`bg-white rounded-[2rem] overflow-hidden border border-outline-variant/30 shadow-sm transition-all duration-300 ${
                isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-[0.97]'
              }`}
            >
              <View className="h-96 relative bg-surface-container-high">
                <Image
                  source={item.image}
                  className="w-full h-full"
                  contentFit="cover"
                />
                {item.isBestMatch && (
                  <View className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full flex-row items-center gap-1.5 shadow-sm">
                    <Sparkles size={14} className="text-primary fill-primary" />
                    <Text className="font-sans font-bold text-[11px] text-primary">BEST MATCH</Text>
                  </View>
                )}
              </View>
              <View className="p-6">
                <View className="flex-row items-center gap-2 mb-2">
                  {item.tags.map((tag, tIdx) => (
                    <View
                      key={tIdx}
                      className={`px-2.5 py-1 rounded-full ${
                        tIdx === 0 ? 'bg-primary/5' : 'bg-secondary/5'
                      }`}
                    >
                      <Text
                        className={`font-sans font-semibold text-label-sm ${
                          tIdx === 0 ? 'text-primary' : 'text-secondary'
                        }`}
                      >
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text className="font-sans font-bold text-title-lg text-on-surface text-ellipsis" numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Dots Indicators */}
      <View className="flex-row justify-center gap-1.5 mt-4 mb-4">
        {data.map((_, index) => (
          <View
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'w-6 bg-primary' : 'w-1.5 bg-outline-variant'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
