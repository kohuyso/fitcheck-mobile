import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Sparkles, RotateCcw, CheckCircle2, X } from 'lucide-react-native';
import { cn } from '@/utils/cn';

interface ScanResultModalProps {
  categoryResult: string;
  colorResult: string;
  styleResult: string;
  isSaved: boolean;
  isSaving: boolean;
  onSave: () => void;
  onRetake: () => void;
  onExit: () => void;
}

export const ScanResultModal = React.memo(function ScanResultModal({
  categoryResult,
  colorResult,
  styleResult,
  isSaved,
  isSaving,
  onSave,
  onRetake,
  onExit,
}: ScanResultModalProps) {
  return (
    <View className="bg-neutral-900 border-t border-white/10 rounded-t-3xl shadow-2xl px-5 pt-4 pb-8">
      <View className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-5" />

      <View className="flex-col gap-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Sparkles size={20} color="#005c55" fill="#005c55" />
            <Text className="font-sans font-bold text-xl text-white">AI Classification</Text>
          </View>

          <Pressable
            onPress={onRetake}
            className="flex-row items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full active:scale-95"
          >
            <RotateCcw size={14} color="#ffffff" />
            <Text className="text-white font-sans font-semibold text-xs">Retake</Text>
          </Pressable>
        </View>

        {/* Chips row */}
        <View className="flex-row justify-between gap-3">
          <View className="flex-1 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
            <Text className="font-sans font-bold text-xs text-teal-400 uppercase mb-1">Category</Text>
            <Text className="font-sans font-bold text-base text-white">{categoryResult}</Text>
          </View>

          <View className="flex-1 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Text className="font-sans font-bold text-xs text-indigo-400 uppercase mb-1">Color</Text>
            <Text className="font-sans font-bold text-base text-white">{colorResult}</Text>
          </View>

          <View className="flex-1 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Text className="font-sans font-bold text-xs text-purple-400 uppercase mb-1">Style</Text>
            <Text className="font-sans font-bold text-base text-white">{styleResult}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={onSave}
            disabled={isSaved || isSaving}
            className={cn(
              'flex-1 h-14 rounded-2xl flex-row items-center justify-center gap-2 active:scale-[0.98] shadow-md',
              isSaved
                ? 'bg-emerald-600 opacity-90'
                : isSaving
                ? 'bg-teal-700 opacity-70'
                : 'bg-teal-600 shadow-teal-900/30'
            )}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <CheckCircle2 size={20} color="#ffffff" />
            )}
            <Text className="font-sans font-bold text-base text-white">
              {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Approve & Save'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onExit}
            className="w-14 h-14 bg-white/10 border border-white/15 rounded-2xl justify-center items-center active:scale-[0.98]"
          >
            <X size={22} color="#ffffff" />
          </Pressable>
        </View>

        <Text className="text-center font-sans font-medium text-xs text-neutral-400">
          Added to your <Text className="font-bold text-white">Work Wardrobe</Text> collection.
        </Text>
      </View>
    </View>
  );
});
