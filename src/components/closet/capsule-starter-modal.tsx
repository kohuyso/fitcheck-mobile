import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { X, Check, Sparkles, Shirt } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveAndSaveItemApiV1ClosetSavePostMutation } from '@/api/@tanstack/react-query.gen';
import { closetKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';

interface CapsuleStarterModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StarterItemTemplate {
  id: string;
  name: string;
  category: string;
  colorName: string;
  colorCode: string;
  styleTag: string;
  image: string;
}

const STARTER_TEMPLATES: StarterItemTemplate[] = [
  {
    id: 'starter-1',
    name: 'Áo thun trắng Basic',
    category: 'Shirts',
    colorName: 'WHITE',
    colorCode: '#FFFFFF',
    styleTag: 'Casual',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
  },
  {
    id: 'starter-2',
    name: 'Quần Jeans Slim Xanh',
    category: 'Pants',
    colorName: 'BLUE',
    colorCode: '#2B4C7E',
    styleTag: 'Casual',
    image: 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=500&q=80',
  },
  {
    id: 'starter-3',
    name: 'Quần tây đen Smart',
    category: 'Pants',
    colorName: 'BLACK',
    colorCode: '#1A1A1A',
    styleTag: 'Formal',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80',
  },
  {
    id: 'starter-4',
    name: 'Sneaker trắng Minimal',
    category: 'Shoes',
    colorName: 'WHITE',
    colorCode: '#F5F5F5',
    styleTag: 'Minimalist',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
  },
  {
    id: 'starter-5',
    name: 'Áo Blazer đen Classic',
    category: 'Jackets',
    colorName: 'BLACK',
    colorCode: '#202020',
    styleTag: 'Smart Casual',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80',
  },
  {
    id: 'starter-6',
    name: 'Áo sơ mi Oxford Xanh',
    category: 'Shirts',
    colorName: 'LIGHT_BLUE',
    colorCode: '#A7C7E7',
    styleTag: 'Formal',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
  },
];

export function CapsuleStarterModal({
  visible,
  onClose,
  onSuccess,
}: CapsuleStarterModalProps) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>(['starter-1', 'starter-2', 'starter-4']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveMutation = useMutation(approveAndSaveItemApiV1ClosetSavePostMutation());

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === STARTER_TEMPLATES.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(STARTER_TEMPLATES.map((t) => t.id));
    }
  };

  const handleConfirmAdd = async () => {
    const selectedItems = STARTER_TEMPLATES.filter((t) => selectedIds.includes(t.id));
    if (selectedItems.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng chọn ít nhất 1 món đồ.');
      } else {
        Alert.alert('Chưa chọn món đồ', 'Vui lòng chọn ít nhất 1 món đồ để thêm vào tủ.');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Save items sequentially using the approveAndSave endpoint
      for (const item of selectedItems) {
        await saveMutation.mutateAsync({
          body: {
            image_url: item.image,
            category: item.category,
            color_name: item.colorName,
            color_code: item.colorCode,
            style_tag: item.styleTag,
            is_ai_fixed: true,
          },
        });
      }

      await queryClient.invalidateQueries({ queryKey: closetKeys.items() });
      await queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });

      if (Platform.OS === 'web') {
        window.alert(`Đã thêm thành công ${selectedItems.length} món đồ vào tủ!`);
      } else {
        Alert.alert(
          'Thành công! 🎉',
          `Đã thêm ${selectedItems.length} món đồ kinh điển vào tủ đồ của bạn.`
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.log('Error adding capsule starter items:', err);
      if (Platform.OS === 'web') {
        window.alert('Có lỗi xảy ra khi lưu món đồ. Vui lòng thử lại.');
      } else {
        Alert.alert('Thông báo', 'Không thể hoàn tất việc thêm đồ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-surface rounded-t-3xl max-h-[85%] border-t border-outline-variant/30 flex-col overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 pt-5 pb-3 border-b border-outline-variant/20">
            <View className="flex-row items-center gap-2">
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Sparkles size={18} color="#005c55" />
              </View>
              <View>
                <Text className="font-sans font-bold text-title-lg text-on-surface">
                  Tủ Đồ Cơ Bản (Capsule)
                </Text>
                <Text className="font-sans text-label-sm text-on-surface-variant">
                  Chọn những món đồ bạn đã có sẵn ở nhà
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-full bg-surface-container-low active:scale-95"
            >
              <X size={20} color="#6e7977" />
            </Pressable>
          </View>

          {/* Quick Controls */}
          <View className="flex-row justify-between items-center px-6 py-2.5 bg-surface-container-low/60 border-b border-outline-variant/15">
            <Text className="font-sans font-semibold text-label-sm text-on-surface-variant">
              Đã chọn: {selectedIds.length}/{STARTER_TEMPLATES.length} món
            </Text>
            <Pressable onPress={handleSelectAll} disabled={isSubmitting}>
              <Text className="font-sans font-bold text-label-sm text-primary">
                {selectedIds.length === STARTER_TEMPLATES.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Text>
            </Pressable>
          </View>

          {/* Grid Selection */}
          <ScrollView
            className="px-6 py-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View className="flex-row flex-wrap justify-between">
              {STARTER_TEMPLATES.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleItem(item.id)}
                    disabled={isSubmitting}
                    className={cn(
                      'w-[48%] bg-white rounded-2xl p-3 mb-4 border transition-all active:scale-95 shadow-sm',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-outline-variant/25'
                    )}
                  >
                    {/* Item Image */}
                    <View className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                      />
                      {/* Checkbox badge */}
                      <View
                        className={cn(
                          'absolute top-2 right-2 w-6 h-6 rounded-full items-center justify-center shadow-md',
                          isSelected ? 'bg-primary' : 'bg-black/30 border border-white/60'
                        )}
                      >
                        {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                      </View>
                    </View>

                    {/* Meta info */}
                    <Text
                      className="font-sans font-bold text-body-sm text-on-surface mb-0.5"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <View
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: item.colorCode }}
                      />
                      <Text className="font-sans text-label-xs text-on-surface-variant">
                        {item.category} • {item.styleTag}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View className="px-6 py-4 border-t border-outline-variant/20 bg-surface">
            <Pressable
              onPress={handleConfirmAdd}
              disabled={isSubmitting || selectedIds.length === 0}
              className={cn(
                'w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 active:scale-95 shadow-md shadow-primary/25',
                selectedIds.length === 0 || isSubmitting
                  ? 'bg-slate-300'
                  : 'bg-primary'
              )}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="font-sans font-bold text-title-md text-white">
                    Đang thêm vào tủ đồ...
                  </Text>
                </>
              ) : (
                <>
                  <Shirt size={20} color="#ffffff" />
                  <Text className="font-sans font-bold text-title-md text-white">
                    Thêm {selectedIds.length} món vào Tủ Đồ
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
