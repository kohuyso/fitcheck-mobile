import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ImageIcon, RefreshCw } from 'lucide-react-native';

interface ScanControlsDockProps {
  scanStep: 'idle' | 'scanning' | 'result';
  onPickImage: () => void;
  onCapture: () => void;
  onToggleFacing: () => void;
}

export const ScanControlsDock = React.memo(function ScanControlsDock({
  scanStep,
  onPickImage,
  onCapture,
  onToggleFacing,
}: ScanControlsDockProps) {
  if (scanStep === 'scanning') {
    return (
      <SafeAreaView
        className="bg-black/90 py-4 px-6 border-t border-white/10 flex-row items-center justify-center gap-3"
        edges={['bottom']}
      >
        <ActivityIndicator color="#005c55" size="small" />
        <Text className="text-white font-sans font-semibold text-sm">
          AI is analyzing your clothing photo...
        </Text>
      </SafeAreaView>
    );
  }

  if (scanStep === 'idle') {
    return (
      <SafeAreaView
        className="bg-black py-4 px-8 border-t border-white/10 flex-row justify-around items-center"
        edges={['bottom']}
      >
        <Pressable
          onPress={onPickImage}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/20 justify-center items-center active:scale-95"
        >
          <ImageIcon size={22} color="#ffffff" />
        </Pressable>

        <Pressable
          onPress={onCapture}
          className="w-20 h-20 rounded-full border-4 border-teal-500 justify-center items-center p-1 active:scale-90"
        >
          <View className="w-full h-full rounded-full bg-white justify-center items-center shadow-lg shadow-teal-500/50">
            <Camera size={28} color="#005c55" />
          </View>
        </Pressable>

        <Pressable
          onPress={onToggleFacing}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/20 justify-center items-center active:scale-95"
        >
          <RefreshCw size={22} color="#ffffff" />
        </Pressable>
      </SafeAreaView>
    );
  }

  return null;
});
