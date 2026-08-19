import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Edit2,
  Heart,
  Tag,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  deleteClothingItemApiV1ClosetItemsItemIdDeleteMutation,
  getItemDetailApiV1ClosetItemsItemIdGetOptions,
  getItemDetailApiV1ClosetItemsItemIdGetQueryKey,
  getItemPairingsApiV1ClosetItemsItemIdPairingsGetOptions,
  toggleFavoriteItemApiV1ClosetItemsItemIdFavoritePostMutation,
  updateClothingItemApiV1ClosetItemsItemIdPutMutation,
  uploadClothingItemImageApiV1ClosetItemsUploadPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { closetKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';
import { useAppNavigation } from '@/context/navigation-history';
import { resolveImageUrl, DEFAULT_BLURHASH } from '@/utils/image-url';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { goBack } = useAppNavigation();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    category?: string;
    color?: string;
    style?: string;
    image?: string;
    from?: string;
    outfit_id?: string;
  }>();

  const handleBack = () => {
    if (params.from === "/outfit-detail" || params.outfit_id) {
      goBack("/outfit-detail");
    } else {
      goBack("/closet");
    }
  };
  const queryClient = useQueryClient();

  const numericId = Number(params.id);
  const insets = useSafeAreaInsets();
  const isValidId = !isNaN(numericId) && numericId > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStyle, setEditStyle] = useState('Casual');

  // Query Backend API for Item Detail
  const { data: itemDetailData } = useQuery({
    ...getItemDetailApiV1ClosetItemsItemIdGetOptions({
      path: { item_id: numericId },
    }),
    enabled: isValidId,
  });

  // Query Backend API for Item Pairings Recommendations
  const { data: pairingsData } = useQuery({
    ...getItemPairingsApiV1ClosetItemsItemIdPairingsGetOptions({
      path: { item_id: numericId },
    }),
    enabled: isValidId,
  });

  // Image Upload Mutation
  const uploadImageMutation = useMutation(
    uploadClothingItemImageApiV1ClosetItemsUploadPostMutation()
  );

  const name = itemDetailData?.name || params.name || 'Clothing Item';
  const category = itemDetailData?.category || params.category || 'Category';
  const color = itemDetailData?.color_name || params.color || 'Color';
  const style = itemDetailData?.style || params.style || 'Style';
  const image = itemDetailData?.image_url || params.image || '';

  const wornCount = itemDetailData?.stats?.worn_count_this_month ?? 0;
  const versatilityScore = itemDetailData?.stats?.versatility_score ?? 0;
  const matchingItemsCount = itemDetailData?.stats?.matching_items_count ?? 0;
  const pairsWellWith = itemDetailData?.pairs_well_with || [];
  const aiStylingNote = itemDetailData?.ai_styling_note || '';

  const [isFavorite, setIsFavorite] = useState(false);

  // Mutations
  const toggleFavoriteMutation = useMutation(
    toggleFavoriteItemApiV1ClosetItemsItemIdFavoritePostMutation()
  );
  const deleteItemMutation = useMutation({
    ...deleteClothingItemApiV1ClosetItemsItemIdDeleteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.items() });
      queryClient.invalidateQueries({ queryKey: closetKeys.summary() });
      router.replace('/closet');
    },
  });

  const updateItemMutation = useMutation({
    ...updateClothingItemApiV1ClosetItemsItemIdPutMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getItemDetailApiV1ClosetItemsItemIdGetQueryKey({ path: { item_id: numericId } }),
      });
      queryClient.invalidateQueries({ queryKey: closetKeys.items() });
      setIsEditing(false);
    },
  });

  const handleFavoriteToggle = async () => {
    setIsFavorite((prev) => !prev);
    if (isValidId) {
      try {
        await toggleFavoriteMutation.mutateAsync({
          path: { item_id: numericId },
        });
      } catch (e) {
        console.log('Favorite toggle error:', e);
      }
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Item', 'Are you sure you want to remove this item from your closet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (isValidId) {
            deleteItemMutation.mutate({ path: { item_id: numericId } });
          } else {
            router.replace('/closet');
          }
        },
      },
    ]);
  };

  const handleSaveEdit = () => {
    if (isValidId && editName.trim()) {
      updateItemMutation.mutate({
        path: { item_id: numericId },
        body: {
          name: editName,
          style_tag: editStyle,
        },
      });
    } else {
      setIsEditing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-margin-mobile py-3 border-b border-outline-variant/30 bg-surface">
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          className="p-2 rounded-full active:scale-95 bg-surface-container-low"
        >
          <ChevronLeft size={22} color="#181c1c" />
        </Pressable>

        <Text className="font-sans font-bold text-title-lg text-on-surface truncate flex-1 mx-4 text-center">
          {name}
        </Text>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={handleFavoriteToggle}
            hitSlop={8}
            className="p-2 rounded-full bg-surface-container-low active:scale-95"
          >
            <Heart size={20} color={isFavorite ? '#ba1a1a' : '#3e4947'} fill={isFavorite ? '#ba1a1a' : 'none'} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            hitSlop={8}
            className="p-2 rounded-full bg-surface-container-low active:scale-95"
          >
            <Trash2 size={20} color="#ba1a1a" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Main Image Banner */}
        <View className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-6 relative border border-outline-variant/20 shadow-sm items-center justify-center p-4">
          <Image
            source={resolveImageUrl(image, category)}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            cachePolicy="memory-disk"
            placeholder={{ blurhash: DEFAULT_BLURHASH }}
            transition={200}
          />
        </View>

        {/* Item Info Summary */}
        <View className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm mb-6">
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="font-sans font-bold text-headline-sm text-on-surface mb-1">{name}</Text>
              <Text className="font-sans font-semibold text-label-md text-primary uppercase tracking-wider">
                {category} • {color}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setEditName(name);
                setEditStyle(style);
                setIsEditing(true);
              }}
              className="p-2 bg-surface-container-low rounded-full active:scale-95 border border-outline-variant/20"
            >
              <Edit2 size={18} color="#005c55" />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2 pt-2 border-t border-outline-variant/20">
            <Tag size={16} color="#707977" />
            <Text className="font-sans text-label-md text-on-surface-variant">Style Tag: </Text>
            <Text className="font-sans font-bold text-label-md text-on-surface">{style}</Text>
          </View>
        </View>

        {/* Stats Bento */}
        <View className="flex-row justify-between gap-3 mb-6">
          <View className="flex-1 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 items-center">
            <Text className="font-sans font-bold text-headline-sm text-primary mb-1">{wornCount}</Text>
            <Text className="font-sans text-label-xs text-on-surface-variant text-center uppercase">
              Worn This Month
            </Text>
          </View>

          <View className="flex-1 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 items-center">
            <Text className="font-sans font-bold text-headline-sm text-emerald-600 mb-1">
              {versatilityScore}%
            </Text>
            <Text className="font-sans text-label-xs text-on-surface-variant text-center uppercase">
              Versatility
            </Text>
          </View>

          <View className="flex-1 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 items-center">
            <Text className="font-sans font-bold text-headline-sm text-secondary mb-1">
              {matchingItemsCount}
            </Text>
            <Text className="font-sans text-label-xs text-on-surface-variant text-center uppercase">
              Matching Items
            </Text>
          </View>
        </View>

        {/* AI Styling Advice Banner */}
        {aiStylingNote ? (
          <View className="bg-primary/10 p-5 rounded-2xl border border-primary/20 mb-6 flex-row items-start gap-3">
            <Sparkles size={22} color="#005c55" fill="#005c55" className="mt-0.5" />
            <View className="flex-1">
              <Text className="font-sans font-bold text-title-md text-primary mb-1">
                AI Styling Note
              </Text>
              <Text className="font-sans text-body-md text-on-surface leading-6">{aiStylingNote}</Text>
            </View>
          </View>
        ) : null}

        {/* Pairs Well With Section */}
        <View className="mb-6">
          <Text className="font-sans font-bold text-headline-xs text-on-surface mb-3">
            Pairs Well With
          </Text>
          {pairsWellWith.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
              {pairsWellWith.map((pair, idx) => (
                <View
                  key={idx}
                  className="w-36 bg-white rounded-xl p-3 border border-outline-variant/20 items-center mr-3 shadow-sm"
                >
                  <View className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden mb-2">
                    <Image
                      source={resolveImageUrl(pair.image_url, pair.category)}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      placeholder={{ blurhash: DEFAULT_BLURHASH }}
                      transition={150}
                    />
                  </View>
                  <Text className="font-sans font-bold text-body-sm text-on-surface truncate text-center w-full">
                    {pair.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 items-center">
              <Text className="font-sans text-body-md text-on-surface-variant">
                Select this item in AI Chat to generate custom outfit pairings.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Item Modal */}
      <Modal visible={isEditing} animationType="slide" onRequestClose={() => setIsEditing(false)} statusBarTranslucent>
        <View style={{ paddingTop: Math.max(insets.top, 20) }} className="flex-1 bg-surface p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-sans font-bold text-headline-sm text-on-surface">Edit Item</Text>
            <Pressable onPress={() => setIsEditing(false)}>
              <X size={24} color="#181c1c" />
            </Pressable>
          </View>

          <View className="space-y-4">
            <View className="mb-4">
              <Text className="font-sans font-semibold text-label-md text-on-surface mb-1.5">
                Item Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="w-full h-12 bg-surface-container-low rounded-xl px-4 font-sans text-body-md border border-outline-variant/30 text-on-surface"
              />
            </View>

            <View className="mb-6">
              <Text className="font-sans font-semibold text-label-md text-on-surface mb-1.5">
                Style Tag
              </Text>
              <TextInput
                value={editStyle}
                onChangeText={setEditStyle}
                className="w-full h-12 bg-surface-container-low rounded-xl px-4 font-sans text-body-md border border-outline-variant/30 text-on-surface"
              />
            </View>

            <Pressable
              onPress={handleSaveEdit}
              className="w-full h-14 bg-primary rounded-xl justify-center items-center active:scale-95 shadow-md"
            >
              <Text className="font-sans font-bold text-title-md text-white">Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
