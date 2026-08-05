import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  Sparkles,
  Zap,
  Bookmark,
  Shirt,
  PlusCircle,
  Camera,
  Send,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react-native';

import {
  chatAndModifyOutfitApiV1AiChatPostMutation,
  getChatHistoryApiV1AiChatHistoryGetOptions,
  clearChatHistoryApiV1AiChatHistoryDeleteMutation,
  toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation,
  getChatHistoryApiV1AiChatHistoryGetQueryKey,
  testAiConnectionApiV1AiTestConnectionGetOptions,
  submitChatFeedbackApiV1AiChatFeedbackPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { OutfitRecommendation } from '@/api/types.gen';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  suggestedOutfit?: OutfitRecommendation | null;
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [bookmarkedOutfitIds, setBookmarkedOutfitIds] = useState<number[]>([]);
  const [likedMessageIds, setLikedMessageIds] = useState<string[]>([]);

  // Test AI Connection Query
  const { data: aiConnectionData } = useQuery(testAiConnectionApiV1AiTestConnectionGetOptions());

  // Chat Feedback Mutation
  const feedbackMutation = useMutation(submitChatFeedbackApiV1AiChatFeedbackPostMutation());

  // Fetch Chat History API Query
  const { data: historyData, isLoading: isHistoryLoading } = useQuery(
    getChatHistoryApiV1AiChatHistoryGetOptions()
  );

  // Clear Chat History Mutation
  const clearHistoryMutation = useMutation({
    ...clearChatHistoryApiV1AiChatHistoryDeleteMutation(),
    onSuccess: () => {
      setMessages([
        {
          id: 'init-1',
          role: 'assistant',
          text: 'Lịch sử trò chuyện đã được xóa. Bạn cần tôi gợi ý trang phục nào hôm nay?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      queryClient.invalidateQueries({ queryKey: getChatHistoryApiV1AiChatHistoryGetQueryKey() });
    },
  });

  // Toggle Bookmark Outfit Mutation
  const toggleBookmarkMutation = useMutation(
    toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation()
  );

  // Sync server history with UI messages state
  useEffect(() => {
    if (historyData && historyData.length > 0) {
      const serverMessages: MessageItem[] = historyData.map((msg) => {
        const dateObj = msg.created_at ? new Date(msg.created_at) : new Date();
        const timeStr = isNaN(dateObj.getTime())
          ? ''
          : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: String(msg.id),
          role: msg.role === 'user' ? 'user' : 'assistant',
          text: msg.content,
          time: timeStr,
        };
      });
      setMessages(serverMessages);
    } else if (!isHistoryLoading && messages.length === 0) {
      setMessages([
        {
          id: 'init-1',
          role: 'assistant',
          text: 'Chào bạn! Bạn đang tìm kiếm trang phục nào cho hôm nay, hay muốn tôi gợi ý theo lịch trình?',
          time: '10:00 AM',
        },
      ]);
    }
  }, [historyData, isHistoryLoading]);

  const chatMutation = useMutation(chatAndModifyOutfitApiV1AiChatPostMutation());

  const handleClearHistory = () => {
    Alert.alert(
      'Xóa lịch sử chat',
      'Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện với AI Stylist?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => clearHistoryMutation.mutate({}),
        },
      ]
    );
  };

  const handleToggleBookmark = async (outfitId?: number) => {
    if (!outfitId) return;
    try {
      await toggleBookmarkMutation.mutateAsync({
        path: { outfit_id: outfitId },
      });
      setBookmarkedOutfitIds((prev) =>
        prev.includes(outfitId) ? prev.filter((id) => id !== outfitId) : [...prev, outfitId]
      );
    } catch (err) {
      console.log('Bookmark outfit error:', err);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || chatMutation.isPending) return;

    const userText = inputText.trim();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const res = await chatMutation.mutateAsync({
        body: {
          message: userText,
        },
      });

      const replyContent = res.reply || res.reply_text || 'Tôi đã phân tích tủ đồ của bạn và tạo một gợi ý phù hợp.';
      const suggestedOutfit = res.suggested_outfit || (res.recommended_outfit as any);

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: replyContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedOutfit: suggestedOutfit || null,
      };

      setMessages((prev) => [...prev, aiMsg]);
      queryClient.invalidateQueries({ queryKey: getChatHistoryApiV1AiChatHistoryGetQueryKey() });
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.log('AI Chat Error:', err);
      const errorMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: 'Xin lỗi, không thể kết nối tới trợ lý AI lúc này. Vui lòng thử lại sau.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface w-full max-w-full overflow-hidden" edges={['top']}>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/30 bg-surface">
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="p-1 -ml-1 active:scale-95">
            <ChevronLeft size={24} className="text-primary" />
          </Pressable>
          <Text className="font-sans font-bold text-title-lg text-primary tracking-tight">
            Style Assistant
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={handleClearHistory}
            disabled={clearHistoryMutation.isPending}
            className="p-2 rounded-full bg-surface-container-high active:scale-90"
          >
            <Trash2 size={18} className="text-on-surface-variant" />
          </Pressable>
          <View className="w-8 h-8 rounded-full bg-primary-container items-center justify-center overflow-hidden border border-primary/10">
            <Image source="" className="w-full h-full" contentFit="cover" />
          </View>
        </View>
      </View>

      {/* Chat Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isHistoryLoading && (
          <View className="py-4 items-center justify-center">
            <ActivityIndicator size="small" color="#005c55" />
            <Text className="font-sans text-label-md text-on-surface-variant mt-2">
              Đang tải lịch sử trò chuyện...
            </Text>
          </View>
        )}

        {messages.map((item) => {
          if (item.role === 'user') {
            return (
              <View key={item.id} className="items-end gap-2 ml-auto max-w-[85%]">
                <View className="bg-primary p-md rounded-t-2xl rounded-l-2xl rounded-br-sm shadow-md">
                  <Text className="font-sans text-body-md text-white leading-relaxed">
                    {item.text}
                  </Text>
                </View>
                {item.time ? (
                  <Text className="font-sans text-label-sm text-on-surface-variant mr-1">
                    {item.time}
                  </Text>
                ) : null}
              </View>
            );
          }

          const outfitId = item.suggestedOutfit?.outfit_id;
          const isBookmarked = outfitId ? bookmarkedOutfitIds.includes(outfitId) : false;

          return (
            <View key={item.id} className="items-start gap-3 max-w-[95%]">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                  <Sparkles size={12} className="text-white" />
                </View>
                <Text className="font-sans font-semibold text-label-sm text-on-surface-variant">
                  FITCHECK AI
                </Text>
              </View>

              <View className="bg-surface-container-lowest border border-outline-variant/30 p-md rounded-t-2xl rounded-r-2xl rounded-bl-sm shadow-sm">
                <Text className="font-sans text-body-md text-on-surface leading-relaxed">
                  {item.text}
                </Text>
                <View className="flex-row items-center gap-3 mt-2 pt-2 border-t border-outline-variant/10">
                  <Pressable
                    onPress={() => {
                      setLikedMessageIds((prev) => [...prev, item.id]);
                      feedbackMutation.mutate({
                        body: {
                          message_id: Number(item.id.replace(/\D/g, '')) || 1,
                          rating: 'like',
                        } as any,
                      });
                    }}
                    className="p-1"
                  >
                    <ThumbsUp
                      size={14}
                      className={likedMessageIds.includes(item.id) ? 'text-primary fill-primary' : 'text-on-surface-variant/60'}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      feedbackMutation.mutate({
                        body: {
                          message_id: Number(item.id.replace(/\D/g, '')) || 1,
                          rating: 'dislike',
                        } as any,
                      });
                    }}
                    className="p-1"
                  >
                    <ThumbsDown size={14} className="text-on-surface-variant/60" />
                  </Pressable>
                </View>
              </View>

              {/* Render Outfit Card if AI returns a suggested outfit */}
              {item.suggestedOutfit && (
                <View className="w-full bg-white rounded-2xl overflow-hidden border border-outline-variant/30 shadow-lg mt-2">
                  <View className="relative h-64 w-full bg-surface-container-low">
                    <View className="absolute top-4 left-4 z-10 bg-primary-container/90 px-3 py-1 rounded-full flex-row items-center gap-1.5 border border-primary/20">
                      <Zap size={12} className="text-on-primary-container fill-on-primary-container" />
                      <Text className="font-sans font-semibold text-label-sm text-on-primary-container">
                        BEST MATCH
                      </Text>
                    </View>
                    <Image
                      source={item.suggestedOutfit.items?.[0]?.image_url || ''}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  </View>
                  <View className="p-md">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 pr-2">
                        <Text className="font-sans font-bold text-headline-md text-on-surface tracking-tight">
                          {item.suggestedOutfit.style_type || 'Curated Outfit'}
                        </Text>
                        <Text className="font-sans text-label-md text-on-surface-variant uppercase tracking-wider mt-0.5">
                          Smart Style Recommendation
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleToggleBookmark(outfitId)}
                        className="bg-surface-container p-2 rounded-full active:scale-90"
                      >
                        <Bookmark
                          size={20}
                          className={isBookmarked ? 'text-primary fill-primary' : 'text-primary'}
                        />
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={() => {
                        router.navigate({
                          pathname: '/outfit-detail' as any,
                          params: {
                            title: item.suggestedOutfit?.style_type || 'Curated Outfit',
                            image: item.suggestedOutfit?.items?.[0]?.image_url,
                          },
                        });
                      }}
                      className="w-full py-4 bg-slate-800 rounded-xl flex-row items-center justify-center gap-2 active:scale-95 shadow-md"
                    >
                      <Shirt size={18} className="text-white" />
                      <Text className="font-sans font-bold text-label-md text-white tracking-widest uppercase">
                        PREVIEW OUTFIT
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {chatMutation.isPending && (
          <View className="items-start gap-2 max-w-[85%]">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </View>
              <Text className="font-sans font-semibold text-label-sm text-on-surface-variant">
                FITCHECK AI
              </Text>
            </View>
            <View className="bg-surface-container-lowest border border-outline-variant/30 p-md rounded-2xl flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#005c55" />
              <Text className="font-sans text-body-md text-on-surface-variant">Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Message Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="border-t border-outline-variant/30 bg-surface/90 px-margin-mobile pt-4"
      >
        <View className="flex-row items-end gap-3">
          <View className="flex-1 bg-surface-container-low rounded-[24px] border border-outline-variant/40 flex-row items-end p-1 shadow-inner">
            <Pressable className="p-3 text-on-surface-variant active:scale-90">
              <PlusCircle size={22} className="text-on-surface-variant" />
            </Pressable>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              multiline
              placeholder="Ask anything..."
              placeholderTextColor="#6e7977"
              className="flex-1 font-sans text-body-md py-3 px-2 max-h-32 text-on-surface"
              style={{ textAlignVertical: 'bottom' }}
            />
            <Pressable className="p-3 text-on-surface-variant active:scale-90">
              <Camera size={22} className="text-on-surface-variant" />
            </Pressable>
          </View>
          <Pressable
            onPress={handleSend}
            disabled={chatMutation.isPending}
            className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full items-center justify-center shadow-md active:scale-90"
          >
            <Send size={20} className="text-on-primary-container fill-on-primary-container" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


