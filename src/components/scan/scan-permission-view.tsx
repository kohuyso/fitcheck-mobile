import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, ImageIcon } from 'lucide-react-native';

interface ScanPermissionViewProps {
  onRequestPermission: () => void;
  onPickImage: () => void;
  onExit: () => void;
}

export const ScanPermissionView = React.memo(function ScanPermissionView({
  onRequestPermission,
  onPickImage,
  onExit,
}: ScanPermissionViewProps) {
  return (
    <View className="flex-1 bg-neutral-950">
      <SafeAreaView
        className="bg-neutral-950 flex-row justify-between items-center px-4 py-3 border-b border-white/10"
        edges={['top']}
      >
        <Pressable
          onPress={onExit}
          hitSlop={12}
          className="p-2.5 bg-white/10 rounded-full active:scale-95"
        >
          <X size={22} color="#ffffff" />
        </Pressable>
        <Text className="font-sans font-bold text-lg text-white">FitCheck AI</Text>
        <View className="w-10 h-10" />
      </SafeAreaView>

      <View className="flex-1 justify-center items-center px-6 text-center">
        <View className="w-20 h-20 rounded-full bg-teal-500/10 justify-center items-center mb-6 border border-teal-500/20">
          <Camera size={36} color="#005c55" />
        </View>

        <Text className="text-white font-sans font-bold text-2xl mb-2 text-center">
          Camera Access Required
        </Text>

        <Text className="text-neutral-400 font-sans text-base text-center mb-8 leading-6">
          FitCheck AI needs camera permission to scan, analyze, and automatically add items to your digital wardrobe.
        </Text>

        <Pressable
          onPress={onRequestPermission}
          className="w-full h-14 bg-teal-600 rounded-2xl justify-center items-center mb-4 active:scale-[0.98] shadow-lg shadow-teal-900/40"
        >
          <Text className="text-white font-sans font-bold text-lg">
            Grant Camera Permission
          </Text>
        </Pressable>

        <Pressable
          onPress={onPickImage}
          className="w-full h-14 bg-white/10 border border-white/15 rounded-2xl flex-row justify-center items-center gap-2 active:scale-[0.98] mb-4"
        >
          <ImageIcon size={20} color="#ffffff" />
          <Text className="text-white font-sans font-bold text-base">
            Upload from Photos
          </Text>
        </Pressable>

        <Pressable onPress={onExit} className="py-3">
          <Text className="text-neutral-400 font-sans font-medium text-sm underline">
            Cancel and Go Back
          </Text>
        </Pressable>
      </View>
    </View>
  );
});
