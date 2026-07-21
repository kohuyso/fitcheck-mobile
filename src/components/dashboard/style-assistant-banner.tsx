import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MessageSquare, ChevronRight } from 'lucide-react-native';

export default function StyleAssistantBanner() {
  return (
    <Pressable className="bg-primary active:scale-[0.98] rounded-2xl p-5 shadow-lg flex-row items-center justify-between mb-8">
      <View className="flex-row items-center gap-4">
        <View className="bg-white/20 p-3 rounded-xl">
          <MessageSquare size={32} className="text-white" />
        </View>
        <View>
          <Text className="font-sans font-bold text-title-lg text-white">Style Assistant</Text>
          <Text className="font-sans text-label-md text-white/90">Ask for outfit advice or trends</Text>
        </View>
      </View>
      <ChevronRight size={20} className="text-white" />
    </Pressable>
  );
}
