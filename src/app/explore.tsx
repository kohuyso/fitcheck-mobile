import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Palette,
  Sparkles,
  BookOpen,
  ChevronRight,
  TrendingUp,
  User,
  X,
  Edit3,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import {
  getColorTheoryGuidesApiV1ExploreColorTheoryGetOptions,
  getFashionTrendsApiV1ExploreTrendsGetOptions,
  getProfileApiV1AuthProfileGetOptions,
  updateProfileApiV1AuthProfilePutMutation,
  getTrendArticleDetailApiV1ExploreTrendsArticleIdGetOptions,
  getProfileApiV1AuthProfileGetQueryKey,
  logoutApiV1AuthLogoutPostMutation,
  uploadAvatarApiV1AuthProfileAvatarPostMutation,
  changePasswordApiV1AuthChangePasswordPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { LogOut, Key, Camera } from 'lucide-react-native';

export default function ExploreScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedStyleTag, setSelectedStyleTag] = useState<string>('Casual Minimalist');

  // Fetch Profile API Query
  const { data: profileData } = useQuery(getProfileApiV1AuthProfileGetOptions());

  // Logout Mutation
  const logoutMutation = useMutation({
    ...logoutApiV1AuthLogoutPostMutation(),
    onSuccess: () => {
      queryClient.clear();
      router.replace('/' as any);
    },
  });

  // Upload Avatar Mutation
  const uploadAvatarMutation = useMutation({
    ...uploadAvatarApiV1AuthProfileAvatarPostMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getProfileApiV1AuthProfileGetQueryKey() });
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation(
    changePasswordApiV1AuthChangePasswordPostMutation()
  );

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    ...updateProfileApiV1AuthProfilePutMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getProfileApiV1AuthProfileGetQueryKey() });
      setIsEditingProfile(false);
    },
  });

  // Fetch Trends API Query
  const { data: trendsData } = useQuery(
    getFashionTrendsApiV1ExploreTrendsGetOptions()
  );

  // Fetch Color Theory API Query
  const { data: colorTheoryData } = useQuery(
    getColorTheoryGuidesApiV1ExploreColorTheoryGetOptions()
  );

  // Fetch Selected Article Detail API Query
  const { data: articleDetail, isLoading: isArticleLoading } = useQuery({
    ...getTrendArticleDetailApiV1ExploreTrendsArticleIdGetOptions({
      path: { article_id: selectedArticleId || 1 },
    }),
    enabled: selectedArticleId !== null,
  });

  const articles = trendsData?.trend_articles || [];
  const colorGuides = colorTheoryData?.guides || [];
  const aiColorAdvice = colorTheoryData?.ai_advice || '';

  const handleUpdateStyle = (style: string) => {
    setSelectedStyleTag(style);
    updateProfileMutation.mutate({
      body: {
        preferred_style: style,
      } as any,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30">
        <View className="flex-row items-center gap-2">
          <Compass size={24} className="text-primary" />
          <Text className="font-sans font-bold text-headline-md text-on-surface">Explore & Profile</Text>
        </View>
        <View className="bg-primary/10 px-3 py-1 rounded-full flex-row items-center gap-1">
          <TrendingUp size={14} className="text-primary" />
          <Text className="font-sans font-bold text-label-sm text-primary uppercase">Trending</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-margin-mobile pt-6 pb-28">
          {/* User Profile Card */}
          <View className="bg-gradient-to-r from-primary/10 to-secondary/10 p-5 rounded-3xl border border-primary/20 shadow-sm mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center border border-primary/30">
                <User size={28} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-sans font-bold text-title-lg text-on-surface">
                  {(profileData as any)?.full_name || (profileData as any)?.username || 'FitCheck Member'}
                </Text>
                <Text className="font-sans font-medium text-label-md text-primary mt-0.5">
                  Style: {(profileData as any)?.preferred_style || selectedStyleTag}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setIsEditingProfile(true)}
                className="p-2.5 rounded-full bg-white border border-outline-variant/30 active:scale-95 shadow-sm"
              >
                <Edit3 size={18} className="text-primary" />
              </Pressable>
              <Pressable
                onPress={() => logoutMutation.mutate({})}
                className="p-2.5 rounded-full bg-white border border-outline-variant/30 active:scale-95 shadow-sm"
              >
                <LogOut size={18} className="text-rose-600" />
              </Pressable>
            </View>
          </View>

          {/* AI Color Theory Banner */}
          <View className="bg-white rounded-3xl p-6 border border-primary/20 shadow-sm mb-8 relative overflow-hidden">
            <View className="flex-row items-center gap-2 mb-3">
              <Palette size={22} className="text-primary" />
              <Text className="font-sans font-bold text-title-lg text-on-surface">
                AI Color Theory Guide
              </Text>
            </View>
            <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed mb-4">
              {aiColorAdvice}
            </Text>

            {/* Color Harmony Cards */}
            <View className="gap-3">
              {colorGuides.map((guide, idx) => (
                <View
                  key={idx}
                  className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20"
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-sans font-bold text-body-md text-primary">
                      {guide.harmony_type}
                    </Text>
                    <Text className="font-sans text-label-sm font-semibold text-secondary">
                      {guide.color_wheel_tip}
                    </Text>
                  </View>
                  <Text className="font-sans text-label-md text-on-surface-variant">
                    {guide.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trend Articles Section */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-sans font-bold text-headline-md text-on-surface">
              Latest Trend Insights
            </Text>
            <Pressable className="flex-row items-center gap-1">
              <Text className="font-sans font-semibold text-label-md text-primary">See All</Text>
              <ChevronRight size={16} className="text-primary" />
            </Pressable>
          </View>

          <View className="gap-4">
            {articles.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setSelectedArticleId(Number(item.id))}
                className="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm active:scale-[0.98]"
              >
                <View className="h-48 w-full bg-surface-container-high relative">
                  <Image source={item.image_url} className="w-full h-full" contentFit="cover" />
                  <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                    <Text className="font-sans font-bold text-label-sm text-primary uppercase">
                      {(item as any).category || (item as any).season || 'Seasonal Trends'}
                    </Text>
                  </View>
                </View>
                <View className="p-4">
                  <Text className="font-sans font-bold text-title-lg text-on-surface mb-1">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <BookOpen size={14} className="text-on-surface-variant" />
                    <Text className="font-sans text-label-md text-on-surface-variant">
                      {item.read_time}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal visible={selectedArticleId !== null} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%] border-t border-outline-variant/30">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-sans font-bold text-title-lg text-on-surface flex-1 mr-2">
                {articleDetail?.title || 'Trend Article Detail'}
              </Text>
              <Pressable
                onPress={() => setSelectedArticleId(null)}
                className="p-2 rounded-full bg-surface-container-high"
              >
                <X size={20} className="text-on-surface" />
              </Pressable>
            </View>

            {isArticleLoading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color="#005c55" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {articleDetail?.image_url ? (
                  <View className="h-56 w-full rounded-2xl overflow-hidden mb-4">
                    <Image source={articleDetail.image_url} className="w-full h-full" contentFit="cover" />
                  </View>
                ) : null}
                <Text className="font-sans text-body-md text-on-surface-variant leading-relaxed mb-6">
                  {articleDetail?.content || (articleDetail as any)?.description || 'Explore the latest fashion trends curated by FitCheck AI.'}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={isEditingProfile} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-sans font-bold text-title-lg text-on-surface">Update Preferred Style</Text>
              <Pressable onPress={() => setIsEditingProfile(false)} className="p-1">
                <X size={20} className="text-on-surface-variant" />
              </Pressable>
            </View>

            <Text className="font-sans text-body-md text-on-surface-variant mb-4">
              Choose your main style persona to personalize AI recommendations:
            </Text>

            <View className="gap-2 mb-6">
              {['Casual Minimalist', 'Smart Business', 'Streetwear Vintage', 'Monochrome Chic'].map((st) => (
                <Pressable
                  key={st}
                  onPress={() => handleUpdateStyle(st)}
                  className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
                    selectedStyleTag === st ? 'border-primary bg-primary/10' : 'border-outline-variant/30 bg-surface-container-low'
                  }`}
                >
                  <Text className="font-sans font-semibold text-body-md text-on-surface">{st}</Text>
                  {selectedStyleTag === st && <Sparkles size={16} className="text-primary" />}
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setIsEditingProfile(false)}
              className="w-full py-3.5 bg-primary rounded-xl items-center shadow-md active:scale-95"
            >
              <Text className="font-sans font-bold text-body-lg text-white">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

