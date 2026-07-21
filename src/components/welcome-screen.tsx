import React from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Sun, CheckCircle, ArrowRight } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { registerApiV1AuthRegisterPostMutation } from '@/api/@tanstack/react-query.gen';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const { mutateAsync: registerGuest } = useMutation(registerApiV1AuthRegisterPostMutation());

  const handleGetStarted = async () => {
    try {
      await registerGuest({
        body: {
          email: `guest_${Date.now()}@fitcheck.ai`,
          password: 'guestpassword123',
        },
      });
    } catch (error) {
      console.log('Registration skipped/failed (offline fallback):', error);
    }
    onGetStarted();
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
                source="https://lh3.googleusercontent.com/aida-public/AB6AXuAs2HLU_r_ny5EEJkf3HL9eVueLsT4WdyMBEe08ZnhB9CuDSNopB4to0DPYgpP5-nXsiTIAKbEmGGUvh1nZKEEJPcCRUL-I6u2iII3TKD1vM_oDiZ4mauC17A-WctJVwy2erTrQC1NOv8tR7UioWiIYmasWMY5qXO4VjiV8GfMuzLk2jfW3VYgDm5c9UjQkwi7YOUmKCsKXPa1Fswyt81zx6bG5ETsJBtPvGF_LnVFTx-_BoyK5gJezEDwaEca75BUrsNK1yGRyNBM"
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
        <View className="w-full max-w-md items-center mt-auto">
          <Pressable
            onPress={handleGetStarted}
            className="w-full bg-primary-container active:scale-[0.98] py-5 rounded-2xl flex-row items-center justify-center gap-3 shadow-lg shadow-primary-container/20"
          >

            <Text className="font-sans font-semibold text-headline-md text-white">
              Get Started
            </Text>
            <ArrowRight size={22} className="text-white" />
          </Pressable>

          <Pressable className="mt-6">
            <Text className="font-sans font-medium text-label-md text-on-surface-variant hover:text-primary active:opacity-75">
              Already have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
