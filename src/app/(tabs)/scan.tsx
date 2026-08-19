import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { X, Bolt, RotateCcw } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';

import {
  approveAndSaveItemApiV1ClosetSavePostMutation,
  getScanTaskStatusApiV1ClosetScanStatusTaskIdGetOptions,
  scanClothingCameraApiV1ClosetScanPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { closetKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';
import { useAppNavigation } from '@/context/navigation-history';
import { getFallbackImage, resolveImageUrl } from '@/utils/image-url';

import { ScanPermissionView } from '@/components/scan/scan-permission-view';
import { ScanHudOverlay } from '@/components/scan/scan-hud-overlay';
import { ScanControlsDock } from '@/components/scan/scan-controls-dock';
import { ScanResultModal } from '@/components/scan/scan-result-modal';

export default function ScanScreen() {
  const router = useRouter();
  const { goBack } = useAppNavigation();
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'result'>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const scanMutation = useMutation(scanClothingCameraApiV1ClosetScanPostMutation());
  const saveMutation = useMutation(approveAndSaveItemApiV1ClosetSavePostMutation());

  // Reset camera focus & leaving state whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      setIsLeaving(false);
      return () => {
        // optional blur cleanup
      };
    }, [])
  );

  const { data: scanTaskData } = useQuery({
    ...getScanTaskStatusApiV1ClosetScanStatusTaskIdGetOptions({
      path: { task_id: taskId || '' },
    }),
    enabled: !!taskId && scanStep === 'scanning',
    refetchInterval: (query) => {
      if (query.state.data?.status === 'COMPLETED' || query.state.data?.status === 'FAILED') {
        return false;
      }
      return 2000;
    },
  });

  const scanResult = scanTaskData?.result as
    | {
        category?: string;
        color_name?: string;
        color_code?: string;
        style_tag?: string;
        processed_image_url?: string;
      }
    | undefined;

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

  // Animation Shared Values
  const scanLineY = useSharedValue(-120);
  const trackingPulse1 = useSharedValue(0.4);
  const trackingPulse2 = useSharedValue(0.4);
  const trackingPulse3 = useSharedValue(0.4);

  useEffect(() => {
    if (scanStep === 'scanning') {
      scanLineY.value = withRepeat(
        withSequence(withTiming(160, { duration: 1500 }), withTiming(-120, { duration: 1500 })),
        -1,
        false
      );

      trackingPulse1.value = withRepeat(
        withSequence(withTiming(1, { duration: 1000 }), withTiming(0.4, { duration: 1000 })),
        -1,
        true
      );
      trackingPulse2.value = withRepeat(
        withDelay(500, withSequence(withTiming(1, { duration: 1000 }), withTiming(0.4, { duration: 1000 }))),
        -1,
        true
      );
      trackingPulse3.value = withRepeat(
        withDelay(1000, withSequence(withTiming(1, { duration: 1000 }), withTiming(0.4, { duration: 1000 }))),
        -1,
        true
      );
    }
  }, [scanStep, scanLineY, trackingPulse1, trackingPulse2, trackingPulse3]);

  useEffect(() => {
    if (scanStep === 'scanning' && (scanTaskData?.status === 'COMPLETED' || scanTaskData?.status === 'FAILED')) {
      setScanStep('result');
    }
  }, [scanTaskData, scanStep]);

  useEffect(() => {
    if (scanStep === 'scanning') {
      const fallbackTimer = setTimeout(() => setScanStep('result'), 18000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [scanStep]);

  const handleRetake = useCallback(() => {
    setCapturedUri(null);
    setTaskId(null);
    setScanStep('idle');
    setIsSaved(false);
    setIsSaving(false);
  }, []);

  const handleExit = useCallback(() => {
    setIsLeaving(true);
    handleRetake();
    goBack('/');
  }, [goBack, handleRetake]);

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
        fileObj = { uri: imageUri, name: filename, type: mimeType } as unknown as Blob;
      }

      const res = await scanMutation.mutateAsync({ body: { file: fileObj } });
      if (res?.task_id) setTaskId(res.task_id);
    } catch (err) {
      console.log('Scan initiate error:', err);
    }
  };

  const handleCapture = useCallback(async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: false });
        if (photo?.uri) {
          startScanProcess(photo.uri);
          return;
        }
      }
    } catch (err) {
      console.log('Capture error:', err);
    }
    startScanProcess('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800');
  }, []);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        startScanProcess(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Pick image error:', err);
    }
  }, []);

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

      Alert.alert('Success', 'Item successfully added to your closet!', [
        {
          text: 'OK',
          onPress: () => {
            handleRetake();
            router.replace('/closet');
          },
        },
      ]);
    } catch (error) {
      console.log('Save error:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Unable to save item. Please try again.');
    }
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
      <ScanPermissionView
        onRequestPermission={requestPermission}
        onPickImage={handlePickImage}
        onExit={handleExit}
      />
    );
  }

  const shouldShowCamera = isFocused && !isLeaving && scanStep === 'idle';

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" animated />
      {/* Top Header */}
      <SafeAreaView
        className="bg-black flex-row justify-between items-center px-4 py-3 border-b border-white/10"
        edges={['top']}
      >
        <Pressable onPress={handleExit} hitSlop={12} className="active:scale-95 p-2.5 bg-white/10 rounded-full">
          <X size={22} color="#ffffff" />
        </Pressable>
        <Text className="font-sans font-bold text-lg text-white">FitCheck AI</Text>
        {scanStep === 'idle' ? (
          <Pressable
            onPress={() => setFlash((f) => !f)}
            hitSlop={12}
            className={cn('p-2.5 rounded-full border border-white/20 active:scale-95', flash ? 'bg-teal-600 border-teal-500' : 'bg-white/10')}
          >
            <Bolt size={20} color="#ffffff" />
          </Pressable>
        ) : (
          <Pressable onPress={handleRetake} hitSlop={12} className="active:scale-95 p-2.5 bg-white/10 rounded-full">
            <RotateCcw size={20} color="#ffffff" />
          </Pressable>
        )}
      </SafeAreaView>

      {/* Viewfinder View */}
      <View className="flex-1 w-full bg-neutral-950 relative overflow-hidden">
        {shouldShowCamera ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            enableTorch={facing === 'back' ? flash : false}
          />
        ) : (
          <Image source={displayImageSource} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        )}

        <ScanHudOverlay
          scanStep={scanStep}
          scanLineAnimatedStyle={scanLineAnimatedStyle}
          pulseStyle1={pulseStyle1}
          pulseStyle2={pulseStyle2}
          pulseStyle3={pulseStyle3}
        />
      </View>

      {/* Controls Dock */}
      <ScanControlsDock
        scanStep={scanStep}
        onPickImage={handlePickImage}
        onCapture={handleCapture}
        onToggleFacing={() => setFacing((c) => (c === 'back' ? 'front' : 'back'))}
      />

      {/* Classification Result Sheet */}
      {scanStep === 'result' && (
        <ScanResultModal
          categoryResult={categoryResult}
          colorResult={colorResult}
          styleResult={styleResult}
          isSaved={isSaved}
          isSaving={isSaving || saveMutation.isPending}
          onSave={handleSave}
          onRetake={handleRetake}
          onExit={handleExit}
        />
      )}
    </View>
  );
}
