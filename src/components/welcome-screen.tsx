import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Sun, CheckCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { registerApiV1AuthRegisterPostMutation } from '@/api/@tanstack/react-query.gen';
import AuthModal from './auth-modal';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { mutateAsync: registerGuest } = useMutation(registerApiV1AuthRegisterPostMutation());

  const handleGuestGetStarted = async () => {
    try {
      await registerGuest({
        body: {
          email: `guest_${Date.now()}@fitcheck.ai`,
          password: 'guestpassword123',
          full_name: 'Guest User',
          preferred_style: ['Casual'],
        },
      });
    } catch (error) {
      console.log('Registration skipped/failed (offline fallback):', error);
    }
    onGetStarted();
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', alignItems: 'center' }} 
        className="px-margin-mobile py-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content Area */}
        <View className="flex-1 justify-center items-center w-full max-w-md my-6">
          {/* Illustration Container */}
          <View className="w-full relative aspect-square items-center justify-center mb-10">
            {/* Background Decorative Blur */}
            <View className="absolute inset-0 bg-primary-container/5 rounded-full scale-90 blur-3xl" />
            
            {/* Hero Flat-lay Illustration */}
            <View className="relative z-10 w-full h-full bg-white/85 border border-outline-variant/30 rounded-3xl overflow-hidden shadow-lg p-6">
              <Image
                source=""
                className="w-full h-full"
                contentFit="contain"
                transition={500}
              />
            </View>

            {/* Floating Chips */}
            <View className="absolute -top-4 -right-2 bg-white/95 border border-outline-variant/30 px-4 py-2 rounded-full flex-row items-center gap-2 shadow-md z-20">
              <Sun size={18} className="text-primary" />
              <Text className="font-sans font-medium text-label-md text-primary">Sunny 72°F</Text>
            </View>

            <View className="absolute -bottom-2 -left-2 bg-white/95 border border-primary/20 px-4 py-2 rounded-full flex-row items-center gap-2 shadow-md z-20">
              <CheckCircle size={18} className="text-primary" />
              <Text className="font-sans font-medium text-label-md text-primary">Style Match 98%</Text>
            </View>
          </View>

          {/* Copy Text */}
          <View className="items-center space-y-4 px-4">
            <Text className="font-sans font-bold text-[34px] leading-[41px] text-on-surface text-center tracking-tight">
              Your AI Virtual Closet.
            </Text>
            <Text className="font-sans text-body-lg text-on-surface-variant text-center max-w-[280px] leading-relaxed mt-2">
              Perfect outfits tailored to your day, schedule, and weather in less than 30 seconds.
            </Text>
          </View>
        </View>

        {/* Footer Area */}
        <View className="w-full max-w-md items-center mt-auto gap-3">
          {/* Create Account Primary Action */}
          <Pressable
            onPress={() => openAuth('register')}
            className="w-full bg-primary active:scale-[0.98] py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <UserPlus size={20} className="text-white" />
            <Text className="font-sans font-semibold text-headline-md text-white">
              Tạo tài khoản mới
            </Text>
          </Pressable>

          {/* Sign In Secondary Action */}
          <Pressable
            onPress={() => openAuth('login')}
            className="w-full bg-surface-variant/40 border border-outline-variant/40 active:scale-[0.98] py-4 rounded-2xl flex-row items-center justify-center gap-2"
          >
            <LogIn size={20} className="text-on-surface" />
            <Text className="font-sans font-semibold text-headline-md text-on-surface">
              Đăng nhập
            </Text>
          </Pressable>

          {/* Guest Mode */}
          <Pressable onPress={handleGuestGetStarted} className="mt-2 py-2">
            <Text className="font-sans font-medium text-label-md text-on-surface-variant text-center underline">
              Dùng thử chế độ Khách (Guest)
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        initialMode={authMode}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={() => {
          setAuthModalVisible(false);
          onGetStarted();
        }}
      />
    </SafeAreaView>
  );
}

