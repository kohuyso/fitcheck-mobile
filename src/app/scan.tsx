import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useMutation } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { X, Bolt, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react-native';

import { approveAndSaveItemApiV1ClosetSavePostMutation } from '@/api/@tanstack/react-query.gen';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<'scanning' | 'result'>('scanning');

  // AI Scanner Save Mutation
  const saveMutation = useMutation(approveAndSaveItemApiV1ClosetSavePostMutation());

  // Animation Values
  const scanLineY = useSharedValue(-120);
  const trackingPulse1 = useSharedValue(0.4);
  const trackingPulse2 = useSharedValue(0.4);
  const trackingPulse3 = useSharedValue(0.4);

  useEffect(() => {
    // Continuous scanline animation
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(160, { duration: 1500 }),
        withTiming(-120, { duration: 1500 })
      ),
      -1,
      false
    );

    // Pulse animations for point tracking markers
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

    // Simulate AI scanning and backend analysis (3 seconds)
    const scanTimer = setTimeout(() => {
      setScanStep('result');
    }, 3000);

    return () => clearTimeout(scanTimer);
  }, []);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

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
    try {
      await saveMutation.mutateAsync({
        body: {
          category: 'Blazer',
          color_code: 'Navy',
          style_tag: 'Formal',
          image_url:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA_GivKnsrCtAHAeE8kYAgZm_M0bQl1L0gzabDowTYLhQ1704Gs9kT28E3YOM3ww-AS7RV7ucRkwB_NjWBncPfCMZSiDLhT7VdSbO467L2Xj4aSQs3zmCMVHd1zf-GzwuwdfcNq2es9SAItSti9z9_jLejKSkq-glySn29ZkNPmlCpLuT8aIs-0u9O1gG8NCiaUUAcNk5ObNx0gdEX8hwFkr3Vd48cevsaG4-Kz2HeLy_oLrQq1iPhubEeDOLs-pOiPR7A9IfheSxE',
        },
      });
    } catch (error) {
      console.log('Approve & Save skipped/failed (offline fallback):', error);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      router.replace('/');
    }, 2000);
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => !current);
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#9cf2e8" />
      </View>
    );
  }

  // Determine if we need to show camera fallback (e.g. simulator, web, or permission denied)
  const showCamera = permission.granted && Platform.OS !== 'web';

  return (
    <View className="flex-1 bg-black">
      {/* Top App Bar Header */}
      <SafeAreaView className="bg-black flex-row justify-between items-center px-margin-mobile py-3 border-b border-white/5" edges={['top']}>
        <Pressable onPress={() => router.replace('/')} className="active:scale-95 p-2 bg-white/10 rounded-full">
          <X size={22} className="text-white" />
        </Pressable>
        <Text className="font-sans font-bold text-headline-sm text-white">FitCheck AI</Text>
        {scanStep === 'result' ? (
          <Pressable onPress={() => setScanStep('scanning')} className="active:scale-95 p-2 bg-white/10 rounded-full">
            <RefreshCw size={22} className="text-white" />
          </Pressable>
        ) : (
          <View className="w-10 h-10" />
        )}
      </SafeAreaView>

      {/* Viewfinder Area */}
      <View className="flex-1 w-full bg-neutral-950 relative overflow-hidden">
        {showCamera ? (
          <CameraView
            className="flex-1 w-full h-full"
            facing={facing}
            enableTorch={flash}
          />
        ) : (
          /* Live Camera Simulator Fallback */
          <Image
            source="https://lh3.googleusercontent.com/aida-public/AB6AXu_GivKnsrCtAHAeE8kYAgZm_M0bQl1L0gzabDowTYLhQ1704Gs9kT28E3YOM3ww-AS7RV7ucRkwB_NjWBncPfCMZSiDLhT7VdSbO467L2Xj4aSQs3zmCMVHd1zf-GzwuwdfcNq2es9SAItSti9z9_jLejKSkq-glySn29ZkNPmlCpLuT8aIs-0u9O1gG8NCiaUUAcNk5ObNx0gdEX8hwFkr3Vd48cevsaG4-Kz2HeLy_oLrQq1iPhubEeDOLs-pOiPR7A9IfheSxE"
            className="flex-1 w-full h-full"
            contentFit="cover"
          />
        )}

        {/* Bounding Box HUD Overlay */}
        {scanStep === 'scanning' && (
          <View className="absolute inset-0 justify-center items-center pointer-events-none">
            <View className="w-[80%] aspect-[3/4] max-w-sm relative">
              {/* Bounding corners */}
              <View className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-primary-fixed" />
              <View className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-primary-fixed" />
              <View className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-primary-fixed" />
              <View className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-primary-fixed" />

              {/* Scan Line */}
              <Animated.View
                style={scanLineAnimatedStyle}
                className="absolute inset-x-0 h-1 bg-primary-fixed shadow-[0_0_15px_#9cf2e8] opacity-75"
              />

              {/* Status chips */}
              <View className="absolute -top-14 left-0 space-y-2">
                <View className="flex-row items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-primary-fixed" />
                  <Text className="text-white font-sans text-label-md">Removing Background...</Text>
                </View>
                <View className="flex-row items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full mt-1.5">
                  <View className="w-2 h-2 rounded-full bg-primary-fixed-dim" />
                  <Text className="text-white font-sans text-label-md">Detecting Style...</Text>
                </View>
              </View>

              {/* Point Tracking Pulsing Markers */}
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

        {/* Flash & Rotate Floating controls */}
        {scanStep === 'scanning' && (
          <View className="absolute right-margin-mobile top-4 gap-4">
            <Pressable
              onPress={toggleFlash}
              className={`w-12 h-12 rounded-full justify-center items-center border border-white/10 ${
                flash ? 'bg-primary-container' : 'bg-black/40'
              }`}
            >
              <Bolt size={22} className="text-white" />
            </Pressable>
            {showCamera && (
              <Pressable
                onPress={toggleFacing}
                className="w-12 h-12 rounded-full bg-black/40 justify-center items-center border border-white/10"
              >
                <RefreshCw size={22} className="text-white" />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Bottom Sheet - AI Classification Results */}
      {scanStep === 'result' && (
        <View className="bg-white rounded-t-3xl shadow-2xl px-margin-mobile pt-5 pb-8">
          <View className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6" />

          <View className="flex-col gap-6">
            <View className="flex-row items-center gap-2">
              <Sparkles size={20} className="text-primary fill-primary" />
              <Text className="font-sans font-bold text-title-lg text-on-surface">AI Classification</Text>
            </View>

            {/* Chips row */}
            <View className="flex-row justify-between gap-3">
              <View className="flex-1 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                <Text className="font-sans font-bold text-label-sm text-primary uppercase mb-1">Category</Text>
                <Text className="font-sans font-bold text-body-lg text-on-surface">Blazer</Text>
              </View>

              <View className="flex-1 p-3 bg-secondary-container/30 border border-secondary-container/50 rounded-xl">
                <Text className="font-sans font-bold text-on-secondary-container uppercase mb-1">Color</Text>
                <Text className="font-sans font-bold text-body-lg text-on-surface">Navy</Text>
              </View>

              <View className="flex-1 p-3 bg-tertiary-fixed/20 border border-tertiary-fixed/30 rounded-xl">
                <Text className="font-sans font-bold text-label-sm text-on-tertiary-fixed-variant uppercase mb-1">Style</Text>
                <Text className="font-sans font-bold text-body-lg text-on-surface">Formal</Text>
              </View>
            </View>

            {/* Action Button */}
            <Pressable
              onPress={handleSave}
              disabled={isSaved}
              className={`w-full h-14 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-md ${
                isSaved ? 'bg-emerald-600' : 'bg-primary-container shadow-primary/20'
              }`}
            >
              <CheckCircle2 size={20} className="text-white" />
              <Text className="font-sans font-bold text-title-lg text-white">
                {isSaved ? 'Saved!' : 'Approve & Save'}
              </Text>
            </Pressable>

            <Text className="text-center font-sans font-medium text-label-md text-on-surface-variant">
              Added to your <Text className="font-bold">Work Wardrobe</Text> collection.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
