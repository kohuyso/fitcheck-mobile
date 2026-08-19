import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, Sparkles, Trash2 } from 'lucide-react-native';

interface ChatHeaderProps {
  onBack: () => void;
  onClearHistory: () => void;
}

export const ChatHeader = React.memo(function ChatHeader({
  onBack,
  onClearHistory,
}: ChatHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-margin-mobile py-3 border-b border-outline-variant/30 bg-surface">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="p-2 rounded-full active:scale-95 bg-surface-container-low"
        >
          <ChevronLeft size={22} color="#181c1c" />
        </Pressable>

        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
            <Sparkles size={20} color="#005c55" fill="#005c55" />
          </View>
          <View>
            <Text className="font-sans font-bold text-title-md text-on-surface">FitCheck AI</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="font-sans font-medium text-label-xs text-outline">
                Stylist Online
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onClearHistory}
        hitSlop={12}
        className="p-2 rounded-full active:scale-95 bg-surface-container-low"
      >
        <Trash2 size={20} color="#3e4947" />
      </Pressable>
    </View>
  );
});
