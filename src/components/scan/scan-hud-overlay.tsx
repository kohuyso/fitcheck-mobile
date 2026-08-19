import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface ScanHudOverlayProps {
  scanStep: 'idle' | 'scanning' | 'result';
  scanLineAnimatedStyle: StyleProp<ViewStyle>;
  pulseStyle1: StyleProp<ViewStyle>;
  pulseStyle2: StyleProp<ViewStyle>;
  pulseStyle3: StyleProp<ViewStyle>;
}

export const ScanHudOverlay = React.memo(function ScanHudOverlay({
  scanStep,
  scanLineAnimatedStyle,
  pulseStyle1,
  pulseStyle2,
  pulseStyle3,
}: ScanHudOverlayProps) {
  if (scanStep === 'result') return null;

  return (
    <>
      {scanStep === 'idle' && (
        <View className="absolute inset-0 justify-center items-center pointer-events-none">
          <View className="w-[80%] aspect-[3/4] max-w-sm relative">
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-sm" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-sm" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-sm" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-sm" />

            <View className="absolute top-4 inset-x-0 items-center">
              <View className="bg-black/60 px-4 py-2 rounded-full border border-white/15">
                <Text className="text-white font-sans text-xs font-semibold text-center">
                  Align item inside frame & tap shutter
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {scanStep === 'scanning' && (
        <View className="absolute inset-0 justify-center items-center pointer-events-none bg-black/30">
          <View className="w-[80%] aspect-[3/4] max-w-sm relative">
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-sm" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-sm" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-sm" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-sm" />

            <Animated.View
              style={scanLineAnimatedStyle}
              className="absolute inset-x-0 h-1 bg-teal-300 shadow-md opacity-85"
            />

            <View className="absolute -top-14 left-0 space-y-2">
              <View className="flex-row items-center gap-2 bg-black/70 px-3 py-1.5 rounded-full border border-white/10">
                <View className="w-2 h-2 rounded-full bg-teal-400" />
                <Text className="text-white font-sans text-xs font-semibold">Removing Background...</Text>
              </View>
              <View className="flex-row items-center gap-2 bg-black/70 px-3 py-1.5 rounded-full border border-white/10 mt-1.5">
                <View className="w-2 h-2 rounded-full bg-emerald-400" />
                <Text className="text-white font-sans text-xs font-semibold">Detecting Style...</Text>
              </View>
            </View>

            <View className="absolute top-1/4 left-1/3 w-3 h-3 justify-center items-center">
              <Animated.View style={pulseStyle1} className="w-6 h-6 rounded-full bg-white absolute" />
              <View className="w-2 h-2 rounded-full bg-white" />
            </View>
            <View className="absolute bottom-1/3 right-1/4 w-3 h-3 justify-center items-center">
              <Animated.View style={pulseStyle2} className="w-6 h-6 rounded-full bg-white absolute" />
              <View className="w-2 h-2 rounded-full bg-white" />
            </View>
            <View className="absolute top-2/3 left-1/2 w-3 h-3 justify-center items-center">
              <Animated.View style={pulseStyle3} className="w-6 h-6 rounded-full bg-white absolute" />
              <View className="w-2 h-2 rounded-full bg-white" />
            </View>
          </View>
        </View>
      )}
    </>
  );
});
