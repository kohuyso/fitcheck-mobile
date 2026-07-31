import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import {
  loginApiV1AuthLoginPostMutation,
  registerApiV1AuthRegisterPostMutation,
} from '@/api/@tanstack/react-query.gen';
import { setStoredToken } from '@/api/axios';

interface AuthModalProps {
  visible: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({
  visible,
  initialMode = 'login',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initialMode when modal opens
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, visible]);

  // Mutations
  const { mutateAsync: loginMutate, isPending: isLoggingIn } = useMutation(
    loginApiV1AuthLoginPostMutation()
  );

  const { mutateAsync: registerMutate, isPending: isRegistering } = useMutation(
    registerApiV1AuthRegisterPostMutation()
  );

  const isLoading = isLoggingIn || isRegistering;

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và tên.');
      return;
    }

    try {
      if (mode === 'login') {
        // FastAPI OAuth2PasswordRequestForm expects username (used as email) and password
        const res = await loginMutate({
          body: {
            username: email.trim(),
            password: password,
          },
        });
        if (res && res.access_token) {
          await setStoredToken(res.access_token);
        }
      } else {
        await registerMutate({
          body: {
            email: email.trim(),
            password: password,
            full_name: fullName.trim(),
            preferred_style: ['Casual'],
          },
        });
        // Tự động đăng nhập sau khi đăng ký thành công
        const res = await loginMutate({
          body: {
            username: email.trim(),
            password: password,
          },
        });
        if (res && res.access_token) {
          await setStoredToken(res.access_token);
        }
      }
      // On success
      onSuccess();
      onClose();
    } catch (err: any) {
      console.log('Auth Error:', err?.response?.data || err?.message || err);
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        setErrorMessage(detail[0]?.msg || 'Thông tin nhập vào không hợp lệ.');
      } else {
        setErrorMessage(
          mode === 'login'
            ? 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.'
            : 'Đăng ký thất bại. Email có thể đã được sử dụng.'
        );
      }
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="w-full bg-surface rounded-t-3xl overflow-hidden max-h-[90%]"
        >
          <View className="p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-sans font-bold text-2xl text-on-surface">
                {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
              </Text>
              <Pressable
                onPress={onClose}
                className="w-9 h-9 items-center justify-center rounded-full bg-surface-variant/50 active:opacity-70"
              >
                <X size={20} className="text-on-surface-variant" />
              </Pressable>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Error Banner */}
              {errorMessage ? (
                <View className="bg-error/10 border border-error/20 p-3 rounded-xl mb-4">
                  <Text className="font-sans text-xs text-error font-medium">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Form Fields */}
              {mode === 'register' && (
                <View className="mb-4">
                  <Text className="font-sans font-medium text-xs text-on-surface-variant mb-2">
                    Họ và tên
                  </Text>
                  <View className="flex-row items-center bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-3.5 h-12">
                    <User size={18} className="text-on-surface-variant mr-2.5" />
                    <TextInput
                      className="flex-1 font-sans text-on-surface text-base h-full"
                      placeholder="Nhập họ và tên của bạn"
                      placeholderTextColor="#9CA3AF"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              <View className="mb-4">
                <Text className="font-sans font-medium text-xs text-on-surface-variant mb-2">
                  Email
                </Text>
                <View className="flex-row items-center bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-3.5 h-12">
                  <Mail size={18} className="text-on-surface-variant mr-2.5" />
                  <TextInput
                    className="flex-1 font-sans text-on-surface text-base h-full"
                    placeholder="name@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="font-sans font-medium text-xs text-on-surface-variant mb-2">
                  Mật khẩu
                </Text>
                <View className="flex-row items-center bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-3.5 h-12">
                  <Lock size={18} className="text-on-surface-variant mr-2.5" />
                  <TextInput
                    className="flex-1 font-sans text-on-surface text-base h-full"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={18} className="text-on-surface-variant" />
                    ) : (
                      <Eye size={18} className="text-on-surface-variant" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isLoading}
                className="w-full bg-primary active:opacity-90 py-4 rounded-xl flex-row items-center justify-center gap-2 mb-4 shadow-md shadow-primary/20"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text className="font-sans font-semibold text-base text-white">
                      {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                    </Text>
                    <ArrowRight size={18} className="text-white" />
                  </>
                )}
              </Pressable>

              {/* Switch Mode Footer */}
              <View className="flex-row justify-center items-center py-2 mb-4">
                <Text className="font-sans text-xs text-on-surface-variant">
                  {mode === 'login'
                    ? 'Chưa có tài khoản? '
                    : 'Đã có tài khoản? '}
                </Text>
                <Pressable
                  onPress={() =>
                    switchMode(mode === 'login' ? 'register' : 'login')
                  }
                >
                  <Text className="font-sans font-bold text-xs text-primary">
                    {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
