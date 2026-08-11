import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  LogOut,
  Palette,
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  changePasswordApiV1AuthChangePasswordPostMutation,
  getColorTheoryGuidesApiV1ExploreColorTheoryGetOptions,
  getFashionTrendsApiV1ExploreTrendsGetOptions,
  getProfileApiV1AuthProfileGetOptions,
  getTrendArticleDetailApiV1ExploreTrendsArticleIdGetOptions,
  logoutApiV1AuthLogoutPostMutation,
  updateProfileApiV1AuthProfilePutMutation,
  uploadAvatarApiV1AuthProfileAvatarPostMutation,
} from "@/api/@tanstack/react-query.gen";
import { authKeys } from "@/api/query-keys";
import { useAuth } from "@/context/auth-context";
import { resolveImageUrl } from "@/utils/image-url";

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );

  const bottomTabBarHeight = 72 + insets.bottom;

  // Fetch Profile API Query
  const { data: profileData } = useQuery(
    getProfileApiV1AuthProfileGetOptions(),
  );

  // Logout Mutation
  const logoutMutation = useMutation(logoutApiV1AuthLogoutPostMutation());

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync({});
    } catch (e) {
      console.log("Logout mutation note:", e);
    } finally {
      await logout();
    }
  };

  // Upload Avatar Mutation
  const uploadAvatarMutation = useMutation({
    ...uploadAvatarApiV1AuthProfileAvatarPostMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation(
    changePasswordApiV1AuthChangePasswordPostMutation(),
  );

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    ...updateProfileApiV1AuthProfilePutMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });

  // Fetch Fashion Trends API Query
  const { data: fashionTrendsResponse } = useQuery(
    getFashionTrendsApiV1ExploreTrendsGetOptions(),
  );

  const fashionTrends = fashionTrendsResponse?.trend_articles || [];

  // Fetch Color Theory Guides API Query
  const { data: colorTheoryResponse } = useQuery(
    getColorTheoryGuidesApiV1ExploreColorTheoryGetOptions(),
  );

  const colorTheoryGuides = colorTheoryResponse?.guides || [];

  // Fetch Article Detail API Query
  const { data: articleDetail, isLoading: isArticleLoading } = useQuery({
    ...getTrendArticleDetailApiV1ExploreTrendsArticleIdGetOptions({
      path: { article_id: selectedArticleId || 1 },
    }),
    enabled: selectedArticleId !== null,
  });

  return (
    <SafeAreaView
      className="flex-1 bg-surface w-full max-w-full overflow-hidden"
      edges={["top"]}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View
          style={{ paddingBottom: bottomTabBarHeight + 24 }}
          className="px-margin-mobile pt-4"
        >
          {/* Header & User Profile Bar */}
          <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border border-primary/20 items-center justify-center">
                {profileData?.avatar_url ? (
                  <Image
                    source={resolveImageUrl(profileData.avatar_url)}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <User size={24} color="#005c55" />
                )}
              </View>
              <View>
                <Text className="font-sans font-bold text-title-lg text-on-surface">
                  {profileData?.full_name || "FitCheck Explorer"}
                </Text>
                <Text className="font-sans text-label-md text-on-surface-variant">
                  {profileData?.preferred_style?.[0] || "Casual Minimalist"}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleLogout}
              className="p-2.5 bg-surface-container-low rounded-full border border-outline-variant/20 active:scale-95"
            >
              <LogOut size={20} color="#ba1a1a" />
            </Pressable>
          </View>

          {/* Section: Fashion Trends */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <TrendingUp size={22} color="#005c55" />
              <Text className="font-sans font-bold text-headline-sm text-on-surface">
                Fashion Trends
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-4"
            >
              {fashionTrends.length > 0 ? (
                fashionTrends.map((trend) => (
                  <Pressable
                    key={trend.id}
                    onPress={() => setSelectedArticleId(trend.id)}
                    className="w-64 bg-white rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm active:scale-98 mr-4"
                  >
                    <View className="h-36 bg-slate-100 relative">
                      <Image
                        source={resolveImageUrl(trend.image_url)}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </View>
                    <View className="p-4">
                      <Text className="font-sans font-bold text-title-md text-on-surface mb-1">
                        {trend.title}
                      </Text>
                      <Text className="font-sans text-body-sm text-on-surface-variant numberOfLines={2}">
                        {trend.content}
                      </Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View className="w-full p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 items-center">
                  <Text className="font-sans text-body-md text-on-surface-variant">
                    Loading trend guides...
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Section: Color Theory & Style Guides */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <Palette size={22} color="#005c55" />
              <Text className="font-sans font-bold text-headline-sm text-on-surface">
                Color Theory & Guides
              </Text>
            </View>

            <View className="flex-col gap-3">
              {colorTheoryGuides.length > 0 ? (
                colorTheoryGuides.map((guide, idx) => (
                  <View
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-outline-variant/30 flex-row items-center gap-4 shadow-sm"
                  >
                    <View className="w-14 h-14 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                      <Sparkles size={24} color="#005c55" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-sans font-bold text-title-md text-on-surface mb-0.5">
                        {guide.harmony_type || "Color Rule"}
                      </Text>
                      <Text className="font-sans text-body-sm text-on-surface-variant">
                        {guide.color_wheel_tip || guide.description}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 items-center">
                  <Text className="font-sans text-body-md text-on-surface-variant">
                    Discovering color theory secrets...
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal
        visible={selectedArticleId !== null}
        animationType="slide"
        onRequestClose={() => setSelectedArticleId(null)}
        statusBarTranslucent
      >
        <View style={{ paddingTop: Math.max(insets.top, 20) }} className="flex-1 bg-surface">
          <View className="flex-row justify-between items-center px-margin-mobile py-3 border-b border-outline-variant/30">
            <Text className="font-sans font-bold text-title-lg text-on-surface">
              Trend Article
            </Text>
            <Pressable
              onPress={() => setSelectedArticleId(null)}
              className="p-2 rounded-full bg-surface-container-low active:scale-95"
            >
              <X size={22} color="#181c1c" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 px-margin-mobile pt-6"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {isArticleLoading ? (
              <ActivityIndicator
                size="large"
                color="#005c55"
                className="my-12"
              />
            ) : (
              <View>
                <Text className="font-sans font-bold text-headline-md text-on-surface mb-3">
                  {articleDetail?.title}
                </Text>
                {articleDetail?.image_url && (
                  <View className="w-full h-56 rounded-2xl overflow-hidden mb-6 bg-slate-100">
                    <Image
                      source={resolveImageUrl(articleDetail.image_url)}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </View>
                )}
                <Text className="font-sans text-body-lg text-on-surface leading-7">
                  {articleDetail?.content}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
