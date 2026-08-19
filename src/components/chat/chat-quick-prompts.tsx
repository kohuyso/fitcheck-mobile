import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Zap } from 'lucide-react-native';

interface ChatQuickPromptsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export const ChatQuickPrompts = React.memo(function ChatQuickPrompts({
  suggestions,
  onSelectSuggestion,
}: ChatQuickPromptsProps) {
  return (
    <View className="py-2 px-margin-mobile">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => onSelectSuggestion(suggestion)}
            className="px-3.5 py-2 bg-surface-container-low rounded-full border border-outline-variant/20 flex-row items-center gap-1.5 active:scale-95 mr-2"
          >
            <Zap size={14} color="#005c55" />
            <Text className="font-sans font-medium text-label-sm text-on-surface">
              {suggestion}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});
