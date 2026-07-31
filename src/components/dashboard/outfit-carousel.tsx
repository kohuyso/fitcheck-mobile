import React, { useState } from 'react';
import { View, Text, FlatList, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { OutfitRecommendation } from '@/api/types.gen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_SPACING = 16;

interface OutfitCarouselProps {
  outfits?: Array<OutfitRecommendation>;
  onIndexChanged?: (index: number) => void;
}

export default function OutfitCarousel({ outfits, onIndexChanged }: OutfitCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Map API recommended outfits to local display format
  const data = (outfits || []).map((item, index) => {
    const mainImage = item.items && item.items.length > 0 ? item.items[0].image_url : '';
    return {
      id: String(item.outfit_id),
      title: item.style_type || 'Custom Outfit',
      tags: [item.style_type || 'Curated', ...(item.items?.map(it => it.name).slice(0, 1) || [])],
      isBestMatch: index === 0,
      image: mainImage,
    };
  });

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
                router.navigate({
                  pathname: '/outfit-detail' as any,
                  params: {
                    id: item.id,
                    title: item.title,
                    image: item.image,
                  },
                });
              }}
              style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}
              className={`bg-white rounded-[2rem] overflow-hidden border border-outline-variant/30 shadow-sm transition-all duration-300 active:scale-95 ${
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
            </Pressable>
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
