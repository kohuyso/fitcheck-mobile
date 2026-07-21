import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Compass, Palette } from 'lucide-react-native';

export default function StyleDiscovery() {
  return (
    <View className="mt-8">
      <Text className="font-sans font-bold text-headline-md text-on-surface tracking-tight mb-4">
        Style Discovery
      </Text>
      <View className="flex-row gap-4">
        <Pressable className="flex-1 bg-surface-container-high p-4 rounded-2xl flex-col gap-3 active:bg-surface-variant">
          <Compass size={24} className="text-primary" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">New Trends</Text>
        </Pressable>
        <Pressable className="flex-1 bg-surface-container-high p-4 rounded-2xl flex-col gap-3 active:bg-surface-variant">
          <Palette size={24} className="text-primary" />
          <Text className="font-sans font-bold text-title-lg text-on-surface">Color Theory</Text>
        </Pressable>
      </View>
    </View>
  );
}
