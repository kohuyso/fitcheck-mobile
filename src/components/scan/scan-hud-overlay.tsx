import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface ScanHudOverlayProps {
  scanStep: 'idle' | 'scanning' | 'result';
  progressMessage?: string | null;
  scanLineAnimatedStyle: any;
  pulseStyle1: any;
  pulseStyle2: any;
  pulseStyle3: any;
}

export const ScanHudOverlay = React.memo(function ScanHudOverlay({
  scanStep,
  progressMessage,
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
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-teal-400 rounded-tl-sm" />
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
            {/* Viewfinder Corner Brackets */}
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-sm" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-sm" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-sm" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-sm" />

            {/* Laser Scan Beam with Glow */}
            <View className="absolute inset-0 overflow-hidden rounded-lg">
              <Animated.View style={scanLineAnimatedStyle} className="w-full">
                <View className="w-full h-0.5 bg-teal-300 shadow-md shadow-teal-400" />
                <View className="w-full h-10 bg-teal-400/15" />
              </Animated.View>
            </View>

            {/* Dynamic Status Pill */}
            <View className="absolute -top-16 inset-x-0 items-center">
              <View className="flex-row items-center gap-2 bg-black/85 px-4 py-2 rounded-full border border-teal-500/40 max-w-[90%] shadow-xl">
                <View className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <Text className="text-white font-sans text-xs font-semibold text-center" numberOfLines={1}>
                  {progressMessage || 'AI Segmentation & Style Classification...'}
                </Text>
              </View>
            </View>

            {/* Keypoint Tracking Nodes */}
            <View className="absolute top-1/4 left-1/4 w-4 h-4 justify-center items-center">
              <Animated.View style={pulseStyle1} className="w-8 h-8 rounded-full bg-teal-400/40 absolute" />
              <View className="w-2 h-2 rounded-full bg-teal-300 shadow-sm shadow-teal-400" />
            </View>
            <View className="absolute top-1/2 right-1/4 w-4 h-4 justify-center items-center">
              <Animated.View style={pulseStyle2} className="w-8 h-8 rounded-full bg-teal-400/40 absolute" />
              <View className="w-2 h-2 rounded-full bg-teal-300 shadow-sm shadow-teal-400" />
            </View>
            <View className="absolute bottom-1/4 left-1/2 w-4 h-4 justify-center items-center">
              <Animated.View style={pulseStyle3} className="w-8 h-8 rounded-full bg-teal-400/40 absolute" />
              <View className="w-2 h-2 rounded-full bg-teal-300 shadow-sm shadow-teal-400" />
            </View>
          </View>
        </View>
      )}
    </>
  );
});
