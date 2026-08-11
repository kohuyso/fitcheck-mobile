import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  X,
  Bolt,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Camera,
  ImageIcon,
  RotateCcw,
} from 'lucide-react-native';

import {
  approveAndSaveItemApiV1ClosetSavePostMutation,
  getScanTaskStatusApiV1ClosetScanStatusTaskIdGetOptions,
  scanClothingCameraApiV1ClosetScanPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { closetKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';
import { useAppNavigation } from '@/context/navigation-history';
import { getFallbackImage, resolveImageUrl } from '@/utils/image-url';

export default function ScanScreen() {
  const router = useRouter();
  const { goBack } = useAppNavigation();
  const queryClient = useQueryClient();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'result'>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  // Scan Camera Mutation
  const scanMutation = useMutation(scanClothingCameraApiV1ClosetScanPostMutation());

  // AI Scanner Status Query with 2s Polling
  const { data: scanTaskData } = useQuery({
    ...getScanTaskStatusApiV1ClosetScanStatusTaskIdGetOptions({
      path: { task_id: taskId || '' },
    }),
    enabled: !!taskId && scanStep === 'scanning',
    refetchInterval: (query) => {
      if (
        query.state.data?.status === 'COMPLETED' ||
        query.state.data?.status === 'FAILED'
      ) {
        return false;
      }
      return 2000;
    },
  });

  // AI Scanner Save Mutation
  const saveMutation = useMutation(approveAndSaveItemApiV1ClosetSavePostMutation());

  // Extracted Scan AI Result
  const scanResult = scanTaskData?.result as {
    category?: string;
    color_name?: string;
    color_code?: string;
    style_tag?: string;
    processed_image_url?: string;
  } | undefined;

  const categoryResult = scanResult?.category || 'Top';
  const colorResult = scanResult?.color_name || scanResult?.color_code || 'Black';
  const colorCodeResult = scanResult?.color_code || '#000000';
  const styleResult = scanResult?.style_tag || 'Casual';

  const displayImageRaw =
    capturedUri ||
    (scanResult?.processed_image_url && !scanResult.processed_image_url.includes('storage.fitcheck.ai')
      ? scanResult.processed_image_url
      : null) ||
    getFallbackImage(categoryResult);

  const displayImageSource = resolveImageUrl(displayImageRaw, categoryResult);

  const imageUrlResult =
    (scanResult?.processed_image_url && !scanResult.processed_image_url.includes('storage.fitcheck.ai')
      ? scanResult.processed_image_url
      : null) ||
    capturedUri ||
    getFallbackImage(categoryResult);

  // Animation Values
  const scanLineY = useSharedValue(-120);
  const trackingPulse1 = useSharedValue(0.4);
  const trackingPulse2 = useSharedValue(0.4);
  const trackingPulse3 = useSharedValue(0.4);

  useEffect(() => {
    if (scanStep === 'scanning') {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(160, { duration: 1500 }),
          withTiming(-120, { duration: 1500 })
        ),
        -1,
        false
      );

      trackingPulse1.value = withRepeat(
        withSequence(withTiming(1, { duration: 1000 }), withTiming(0.4, { duration: 1000 })),
        -1,
        true
      );
      trackingPulse2.value = withRepeat(
        withDelay(
          500,
          withSequence(withTiming(1, { duration: 1000 }), withTiming(0.4, { duration: 1000 }))
        ),
        -1,
        true
      );
      trackingPulse3.value = withRepeat(
        withDelay(
          1000,
          withSequence(withTiming(1, { duration: 1000 }), withTiming(0.4, { duration: 1000 }))
        ),
        -1,
        true
      );
    }
  }, [scanStep]);

  useEffect(() => {
    if (
      scanStep === 'scanning' &&
      (scanTaskData?.status === 'COMPLETED' || scanTaskData?.status === 'FAILED')
    ) {
      setScanStep('result');
    }
  }, [scanTaskData, scanStep]);

  useEffect(() => {
    if (scanStep === 'scanning') {
      const fallbackTimer = setTimeout(() => {
        setScanStep('result');
      }, 18000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [scanStep]);

  const handleExit = () => {
    goBack('/');
  };

  const startScanProcess = async (imageUri: string) => {
    setCapturedUri(imageUri);
    setScanStep('scanning');
    try {
      const filename = imageUri.split('/').pop()?.split('?')[0] || 'scan.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      let fileObj: Blob;
      try {
        const response = await fetch(imageUri);
        fileObj = await response.blob();
      } catch {
        fileObj = {
          uri: imageUri,
          name: filename,
          type: mimeType,
        } as unknown as Blob;
      }

      const res = await scanMutation.mutateAsync({
        body: {
          file: fileObj,
        },
      });
      if (res?.task_id) {
        setTaskId(res.task_id);
      }
    } catch (err) {
      console.log('Initiate camera scan error:', err);
    }
  };

  const handleCapture = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        if (photo?.uri) {
          startScanProcess(photo.uri);
          return;
        }
      }
    } catch (err) {
      console.log('Capture photo error:', err);
    }

    const fallbackUri = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
    startScanProcess(fallbackUri);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        startScanProcess(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Pick image error:', err);
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setTaskId(null);
    setScanStep('idle');
  };

  const scanLineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const pulseStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: trackingPulse1.value * 2 }],
    opacity: 1 - trackingPulse1.value,
  }));
  const pulseStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: trackingPulse2.value * 2 }],
    opacity: 1 - trackingPulse2.value,
  }));
  const pulseStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: trackingPulse3.value * 2 }],
    opacity: 1 - trackingPulse3.value,
  }));

  const handleSave = async () => {
    if (isSaving || saveMutation.isPending || isSaved) return;
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync({
        body: {
          category: categoryResult,
          color_name: colorResult,
          color_code: colorCodeResult,
          style_tag: styleResult,
          image_url: imageUrlResult,
          is_ai_fixed: true,
        },
      });

      queryClient.invalidateQueries({ queryKey: closetKeys.items() });
      queryClient.invalidateQueries({ queryKey: closetKeys.summary() });

      setIsSaved(true);
      setIsSaving(false);

      Alert.alert(
        'Success',
        'Item successfully added to your closet!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/closet');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.log('Approve & Save error:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Unable to save item. Please try again.');
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => !current);
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#005c55" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-neutral-950">
        <SafeAreaView className="bg-neutral-950 flex-row justify-between items-center px-4 py-3 border-b border-white/10" edges={['top']}>
          <Pressable
            onPress={handleExit}
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
            onPress={requestPermission}
            className="w-full h-14 bg-teal-600 rounded-2xl justify-center items-center mb-4 active:scale-[0.98] shadow-lg shadow-teal-900/40"
          >
            <Text className="text-white font-sans font-bold text-lg">
              Grant Camera Permission
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePickImage}
            className="w-full h-14 bg-white/10 border border-white/15 rounded-2xl flex-row justify-center items-center gap-2 active:scale-[0.98] mb-4"
          >
            <ImageIcon size={20} color="#ffffff" />
            <Text className="text-white font-sans font-bold text-base">
              Upload from Photos
            </Text>
          </Pressable>

          <Pressable onPress={handleExit} className="py-3">
            <Text className="text-neutral-400 font-sans font-medium text-sm underline">
              Cancel and Go Back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" animated />
      {/* Top Header */}
      <SafeAreaView className="bg-black flex-row justify-between items-center px-4 py-3 border-b border-white/10" edges={['top']}>
        <Pressable
          onPress={handleExit}
          hitSlop={12}
          className="active:scale-95 p-2.5 bg-white/10 rounded-full"
        >
          <X size={22} color="#ffffff" />
        </Pressable>

        <Text className="font-sans font-bold text-lg text-white">FitCheck AI</Text>

        {scanStep === 'idle' ? (
          <Pressable
            onPress={toggleFlash}
            hitSlop={12}
            className={cn(
              'p-2.5 rounded-full border border-white/20 active:scale-95',
              flash ? 'bg-teal-600 border-teal-500' : 'bg-white/10'
            )}
          >
            <Bolt size={20} color="#ffffff" />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleRetake}
            hitSlop={12}
            className="active:scale-95 p-2.5 bg-white/10 rounded-full"
          >
            <RotateCcw size={20} color="#ffffff" />
          </Pressable>
        )}
      </SafeAreaView>

      {/* Viewfinder Area */}
      <View className="flex-1 w-full bg-neutral-950 relative overflow-hidden">
        {scanStep === 'idle' ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            enableTorch={facing === 'back' ? flash : false}
          />
        ) : (
          <Image
            source={displayImageSource}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
        )}

        {/* Bounding Box HUD Overlay */}
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

        {/* Scanning HUD Overlay */}
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
      </View>

      {/* Controls Dock (IDLE mode) */}
      {scanStep === 'idle' && (
        <SafeAreaView className="bg-black py-4 px-8 border-t border-white/10 flex-row justify-around items-center" edges={['bottom']}>
          <Pressable
            onPress={handlePickImage}
            className="w-12 h-12 rounded-full bg-white/10 border border-white/20 justify-center items-center active:scale-95"
          >
            <ImageIcon size={22} color="#ffffff" />
          </Pressable>

          <Pressable
            onPress={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-teal-500 justify-center items-center p-1 active:scale-90"
          >
            <View className="w-full h-full rounded-full bg-white justify-center items-center shadow-lg shadow-teal-500/50">
              <Camera size={28} color="#005c55" />
            </View>
          </Pressable>

          <Pressable
            onPress={toggleFacing}
            className="w-12 h-12 rounded-full bg-white/10 border border-white/20 justify-center items-center active:scale-95"
          >
            <RefreshCw size={22} color="#ffffff" />
          </Pressable>
        </SafeAreaView>
      )}

      {/* Scanning status banner */}
      {scanStep === 'scanning' && (
        <SafeAreaView className="bg-black/90 py-4 px-6 border-t border-white/10 flex-row items-center justify-center gap-3" edges={['bottom']}>
          <ActivityIndicator color="#005c55" size="small" />
          <Text className="text-white font-sans font-semibold text-sm">
            AI is analyzing your clothing photo...
          </Text>
        </SafeAreaView>
      )}

      {/* AI Classification Results Sheet */}
      {scanStep === 'result' && (
        <View className="bg-neutral-900 border-t border-white/10 rounded-t-3xl shadow-2xl px-5 pt-4 pb-8">
          <View className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-5" />

          <View className="flex-col gap-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Sparkles size={20} color="#005c55" fill="#005c55" />
                <Text className="font-sans font-bold text-xl text-white">AI Classification</Text>
              </View>

              <Pressable
                onPress={handleRetake}
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
                onPress={handleSave}
                disabled={isSaved || isSaving || saveMutation.isPending}
                className={cn(
                  'flex-1 h-14 rounded-2xl flex-row items-center justify-center gap-2 active:scale-[0.98] shadow-md transition-all',
                  isSaved
                    ? 'bg-emerald-600 opacity-90'
                    : isSaving || saveMutation.isPending
                    ? 'bg-teal-700 opacity-70'
                    : 'bg-teal-600 shadow-teal-900/30'
                )}
              >
                {isSaving || saveMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <CheckCircle2 size={20} color="#ffffff" />
                )}
                <Text className="font-sans font-bold text-base text-white">
                  {isSaving || saveMutation.isPending
                    ? 'Saving...'
                    : isSaved
                    ? 'Saved!'
                    : 'Approve & Save'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleExit}
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
      )}
    </View>
  );
}
