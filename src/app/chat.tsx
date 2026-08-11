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
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  Sparkles,
  Zap,
  Camera,
  Send,
  Trash2,
} from 'lucide-react-native';

import {
  chatAndModifyOutfitApiV1AiChatPostMutation,
  getChatHistoryApiV1AiChatHistoryGetOptions,
  clearChatHistoryApiV1AiChatHistoryDeleteMutation,
  toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation,
  testAiConnectionApiV1AiTestConnectionGetOptions,
  submitChatFeedbackApiV1AiChatFeedbackPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { OutfitRecommendation } from '@/api/types.gen';
import { chatKeys, closetKeys } from '@/api/query-keys';
import { cn } from '@/utils/cn';
import { useAppNavigation } from '@/context/navigation-history';
import { ChatBubble, ChatMessage } from '@/components/chat/chat-bubble';

const QUICK_SUGGESTIONS = [
  'Need outfit for job interview',
  'Casual Friday at office',
  'Rainy day styling tips',
  'Match my leather jacket',
];

export default function ChatScreen() {
  const router = useRouter();
  const { goBack } = useAppNavigation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bookmarkedOutfitIds, setBookmarkedOutfitIds] = useState<number[]>([]);
  const [likedMessageIds, setLikedMessageIds] = useState<string[]>([]);

  // Test AI Connection Query
  const { data: aiConnectionData } = useQuery(
    testAiConnectionApiV1AiTestConnectionGetOptions()
  );

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
          text: 'Chat history cleared. What outfit shall we curate today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
    },
  });

  // Toggle Bookmark Outfit Mutation
  const toggleBookmarkMutation = useMutation({
    ...toggleBookmarkOutfitApiV1ClosetOutfitsOutfitIdBookmarkPostMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
    },
  });

  // Sync server history with UI messages state
  useEffect(() => {
    if (historyData && historyData.length > 0) {
      const serverMessages: ChatMessage[] = historyData.map((msg) => {
        const dateObj = msg.created_at ? new Date(msg.created_at) : new Date();
        const timeStr = isNaN(dateObj.getTime())
          ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: String(msg.id),
          role: (msg.role as 'user' | 'assistant') || 'assistant',
          text: msg.content || '',
          time: timeStr,
          suggestedOutfit: null,
        };
      });
      setMessages(serverMessages);
    } else {
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          text: 'Hello! I am your AI FitCheck Stylist. How can I help you assemble your look today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [historyData]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages]);

  // Chat Mutation
  const chatMutation = useMutation(chatAndModifyOutfitApiV1AiChatPostMutation());

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || chatMutation.isPending) return;

    const userMsgId = `user-${Date.now()}`;
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: query,
      time: userTime,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    if (!textToSend) setInputText('');

    try {
      const res = await chatMutation.mutateAsync({
        body: {
          message: query,
        },
      });

      const assistantMsgId = `ast-${Date.now()}`;
      const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newAssistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        text: res.reply || res.reply_text || 'Here is your styled recommendation!',
        time: assistantTime,
        suggestedOutfit: res.suggested_outfit || null,
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
    } catch (err) {
      console.log('AI Chat Error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I am having trouble connecting to AI services right now. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleClearHistory = () => {
    Alert.alert('Clear History', 'Are you sure you want to clear chat history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => clearHistoryMutation.mutate({}),
      },
    ]);
  };

  const handleToggleBookmark = async (outfitId: number) => {
    setBookmarkedOutfitIds((prev) =>
      prev.includes(outfitId) ? prev.filter((id) => id !== outfitId) : [...prev, outfitId]
    );

    try {
      await toggleBookmarkMutation.mutateAsync({
        path: { outfit_id: outfitId },
      });
    } catch (err) {
      console.log('Bookmark error:', err);
    }
  };

  const handleLike = (msgId: string) => {
    setLikedMessageIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
    try {
      feedbackMutation.mutate({
        body: {
          message_id: Number(msgId) || 1,
          rating: 'THUMBS_UP',
        },
      });
    } catch (e) {}
  };

  const handleDislike = (msgId: string) => {
    try {
      feedbackMutation.mutate({
        body: {
          message_id: Number(msgId) || 1,
          rating: 'THUMBS_DOWN',
        },
      });
    } catch (e) {}
  };

  const handleOutfitPress = (outfit: OutfitRecommendation) => {
    router.push({
      pathname: '/outfit-detail',
      params: {
        outfit_id: outfit.outfit_id ? String(outfit.outfit_id) : undefined,
        title: outfit.title || 'AI Recommendation',
        image: outfit.image_url || '',
        description: outfit.description || '',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Top Header */}
        <View className="flex-row items-center justify-between px-margin-mobile py-3 border-b border-outline-variant/30 bg-surface">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => goBack('/')}
              hitSlop={12}
              className="p-2 rounded-full active:scale-95 bg-surface-container-low"
            >
              <ChevronLeft size={22} color="#181c1c" />
            </Pressable>

            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                <Sparkles size={20} color="#005c55" fill="#005c55" />
              </View>
              <View>
                <Text className="font-sans font-bold text-title-md text-on-surface">FitCheck AI</Text>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-emerald-500" />
                  <Text className="font-sans font-medium text-label-xs text-outline">
                    Stylist Online
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleClearHistory}
            hitSlop={12}
            className="p-2 rounded-full active:scale-95 bg-surface-container-low"
          >
            <Trash2 size={20} color="#3e4947" />
          </Pressable>
        </View>

        {/* Message Scroll View */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-margin-mobile pt-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {isHistoryLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="small" color="#005c55" />
              <Text className="font-sans text-label-md text-outline mt-2">Loading chat history...</Text>
            </View>
          ) : (
            messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isLiked={likedMessageIds.includes(msg.id)}
                isBookmarked={
                  msg.suggestedOutfit?.outfit_id
                    ? bookmarkedOutfitIds.includes(msg.suggestedOutfit.outfit_id)
                    : false
                }
                onLike={handleLike}
                onDislike={handleDislike}
                onToggleBookmark={handleToggleBookmark}
                onOutfitPress={handleOutfitPress}
              />
            ))
          )}

          {chatMutation.isPending && (
            <View className="self-start mb-4 p-4 bg-white rounded-2xl rounded-tl-sm border border-outline-variant/30 flex-row items-center gap-3">
              <ActivityIndicator size="small" color="#005c55" />
              <Text className="font-sans text-body-md text-on-surface-variant">
                AI is styling your outfit...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestions Chips */}
        <View className="py-2 px-margin-mobile">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => handleSend(suggestion)}
                className="px-3.5 py-2 bg-surface-container-low rounded-full border border-outline-variant/20 flex-row items-center gap-1.5 active:scale-95 mr-2"
              >
                <Zap size={14} color="#005c55" />
                <Text className="font-sans font-medium text-label-sm text-on-surface">
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="p-4 bg-surface border-t border-outline-variant/30 flex-row items-center gap-3"
        >
          <Pressable
            onPress={() => router.push('/scan')}
            className="w-12 h-12 rounded-xl bg-surface-container-low items-center justify-center border border-outline-variant/20 active:scale-95"
          >
            <Camera size={20} color="#3e4947" />
          </Pressable>

          <View className="flex-1 min-h-12 max-h-24 bg-surface-container-low rounded-xl px-4 flex-row items-center border border-outline-variant/20">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask AI for outfit advice..."
              placeholderTextColor="#6e7977"
              multiline
              className="flex-1 font-sans text-body-md text-on-surface py-2.5 max-h-20"
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
            />
          </View>

          <Pressable
            disabled={!inputText.trim() || chatMutation.isPending}
            onPress={() => handleSend()}
            className={cn(
              'w-12 h-12 rounded-xl items-center justify-center active:scale-95 transition-all shadow-md',
              inputText.trim() && !chatMutation.isPending
                ? 'bg-primary shadow-primary/20'
                : 'bg-surface-container-high opacity-50'
            )}
          >
            <Send size={20} color="#ffffff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
