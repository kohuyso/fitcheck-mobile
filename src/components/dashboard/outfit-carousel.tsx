import React, { useState } from 'react';
import { View, Text, FlatList, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { OutfitRecommendation, ClothingItemFlat } from '@/api/types.gen';
import { resolveImageUrl, DEFAULT_BLURHASH } from '@/utils/image-url';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_SPACING = 16;

interface OutfitCarouselProps {
  outfits?: Array<OutfitRecommendation>;
  onIndexChanged?: (index: number) => void;
}

interface CarouselItem {
  id: string;
  title: string;
  tags: string[];
  isBestMatch: boolean;
  image: string;
  rawItems?: ClothingItemFlat[];
}

const DEFAULT_OUTFITS: CarouselItem[] = [
  {
    id: 'demo-outfit-1',
    title: 'Smart Business Casual',
    tags: ['Work', 'Minimalist'],
    isBestMatch: true,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    rawItems: undefined,
  },
  {
    id: 'demo-outfit-2',
    title: 'Weekend Streetwear',
    tags: ['Casual', 'Denim'],
    isBestMatch: false,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    rawItems: undefined,
  },
  {
    id: 'demo-outfit-3',
    title: 'Monochrome Modern',
    tags: ['Chill', 'Classic'],
    isBestMatch: false,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    rawItems: undefined,
  },
];

export default function OutfitCarousel({ outfits, onIndexChanged }: OutfitCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Map API recommended outfits or fallback to high quality demo outfits
  const data: CarouselItem[] =
    outfits && outfits.length > 0
      ? outfits.map((item, index) => {
          const mainImage = item.items && item.items.length > 0 ? item.items[0].image_url : '';
          return {
            id: `outfit-${item.outfit_id || index}-${index}`,
            title: item.style_type || 'Custom Outfit',
            tags: [item.style_type || 'Curated', ...(item.items?.map((it) => it.name).slice(0, 1) || [])],
            isBestMatch: index === 0,
            image: mainImage,
            rawItems: item.items,
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
            <Pressable
              onPress={() => {
                router.push({
                  pathname: '/outfit-detail',
                  params: {
                    outfit_id: String(item.id),
                    id: String(item.id),
                    title: item.title,
                    image: typeof item.image === 'string' ? item.image : '',
                    items: item.rawItems ? JSON.stringify(item.rawItems) : undefined,
                  },
                });
              }}
              style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}
              className={`bg-white rounded-[2rem] overflow-hidden border border-outline-variant/30 shadow-sm active:scale-95 ${
                isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-[0.97]'
              }`}
            >
              <View className="h-96 relative bg-surface-container-high">
                <Image
                  source={resolveImageUrl(item.image, 'Shirts')}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  placeholder={{ blurhash: DEFAULT_BLURHASH }}
                  transition={150}
                />
                {item.isBestMatch && (
                  <View className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full flex-row items-center gap-1.5 shadow-sm">
                    <Sparkles size={14} color="#005c55" fill="#005c55" />
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
            </Pressable>
          );
        }}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />

      {/* Dots Indicators */}
      <View className="flex-row justify-center gap-1.5 mt-4 mb-4">
        {data.map((_, index) => (
          <View
            key={index}
            className={`h-1.5 rounded-full ${
              index === activeIndex ? 'w-6 bg-primary' : 'w-1.5 bg-outline-variant'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
