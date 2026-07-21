import React from 'react';
import { View, Text } from 'react-native';
import { Lightbulb } from 'lucide-react-native';

export default function StyleInsightBento() {
  return (
    <View className="mt-12 flex-row flex-wrap gap-4">
      <View className="w-full bg-white/80 border-l-4 border-primary/40 border border-outline-variant/30 p-5 rounded-2xl">
        <View className="flex-row items-center gap-3 mb-2">
          <Lightbulb size={20} className="text-primary" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">AI Style Insight</Text>
        </View>
        <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed">
          {"Since your last meeting with this client, they've shifted to a more casual dress code. This outfit balances that shift perfectly."}
        </Text>
      </View>

      <View className="flex-1 min-w-[45%] bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
        <Text className="font-sans font-bold text-label-sm text-secondary uppercase tracking-widest mb-1">
          Humidity
        </Text>
        <Text className="font-sans font-bold text-headline-md text-on-surface">88%</Text>
      </View>

      <View className="flex-1 min-w-[45%] bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
        <Text className="font-sans font-bold text-label-sm text-secondary uppercase tracking-widest mb-1">
          Wardrobe Use
        </Text>
        <Text className="font-sans font-bold text-headline-md text-on-surface">12%</Text>
      </View>
    </View>
  );
}
