import React from 'react';
import { View, Text } from 'react-native';
import { CloudRain } from 'lucide-react-native';

interface WeatherAdviceProps {
  condition?: string;
  temperature?: number;
  recommendation?: string;
}

export default function WeatherAdvice({ condition, temperature, recommendation }: WeatherAdviceProps) {
  const displayCondition = condition ?? 'Rainy Morning';
  const displayTemp = temperature !== undefined ? `${temperature}°C` : '22°C';
  const displayRecommendation = recommendation ?? 'Rain, 22°C. We recommend layers and waterproof shoes today.';

  return (
    <View className="bg-white/85 border border-outline-variant/40 rounded-xl p-4 flex-row items-start gap-4 mb-6 shadow-sm">
      <View className="bg-primary/10 p-3 rounded-xl">
        <CloudRain size={32} color="#005c55" />
      </View>
      <View className="flex-1">
        <Text className="font-sans font-bold text-title-lg text-on-surface">{displayCondition}</Text>
        <Text className="font-sans text-body-md text-on-surface-variant mt-1 leading-relaxed">
          {displayRecommendation}
        </Text>
      </View>
    </View>
  );
}
