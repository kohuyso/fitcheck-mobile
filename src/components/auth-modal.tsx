import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import {
  loginApiV1AuthLoginPostMutation,
  registerApiV1AuthRegisterPostMutation,
} from "@/api/@tanstack/react-query.gen";
import { api, setStoredToken } from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import Constants from "expo-constants";
import { NativeModules } from "react-native";

// Dynamic type definition for native Google Signin module
type GoogleSigninType = {
  configure?: (config: Record<string, unknown>) => void;
  hasPlayServices?: (options?: Record<string, unknown>) => Promise<boolean>;
  signIn?: () => Promise<{ data?: { idToken?: string }; idToken?: string }>;
} | null;

let GoogleSignin: GoogleSigninType = null;
let statusCodes: Record<string, unknown> = {};
let isErrorWithCode: (error: unknown) => boolean = () => false;

const isExpoGo =
  Constants.appOwnership === "expo" ||
  (Constants as unknown as { executionEnvironment?: string }).executionEnvironment === "storeClient";
const hasNativeGoogleSignin =
  Boolean(NativeModules?.RNGoogleSignin) && !isExpoGo;

if (hasNativeGoogleSignin) {
  try {
    const googleSigninModule = require("@react-native-google-signin/google-signin");
    GoogleSignin = googleSigninModule.GoogleSignin;
    statusCodes = googleSigninModule.statusCodes;
    isErrorWithCode = googleSigninModule.isErrorWithCode;
  } catch (e) {
    console.log("GoogleSignin native module notice:", e);
  }
}

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "802631247188-jl2b8jg7i0qsq2vjonhhlv42n4u789is.apps.googleusercontent.com";

const GoogleLogoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

interface AuthModalProps {
  visible: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({
  visible,
  initialMode = "login",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Configure GoogleSignin on mount safely
  React.useEffect(() => {
    if (GoogleSignin?.configure) {
      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
        });
      } catch (e) {
        console.log("GoogleSignin configuration note:", e);
      }
    }
  }, []);

  // Sync initialMode when modal opens
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, visible]);

  // Mutations
  const { mutateAsync: loginMutate, isPending: isLoggingIn } = useMutation(
    loginApiV1AuthLoginPostMutation(),
  );

  const { mutateAsync: registerMutate, isPending: isRegistering } = useMutation(
    registerApiV1AuthRegisterPostMutation(),
  );

  const isLoading = isLoggingIn || isRegistering;

  // Fallback OAuth Google qua WebBrowser cho môi trường không có Google Play Services (như Expo Go / Emulator không Play Store)
  const handleWebGoogleSignIn = async () => {
    try {
      const redirectUrl =
        Platform.OS === "web"
          ? typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:8081"
          : Linking.createURL("auth/google");

      console.log("Google OAuth Web Fallback Redirect URI:", redirectUrl);

      const nonce = Math.random().toString(36).substring(2);
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `response_type=id_token` +
        `&client_id=${GOOGLE_WEB_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&scope=${encodeURIComponent("openid email profile")}` +
        `&nonce=${nonce}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl,
      );

      if (result.type === "success" && result.url) {
        const match = result.url.match(/[#?&]id_token=([^&]+)/);
        const idToken = match ? decodeURIComponent(match[1]) : null;

        if (idToken) {
          const apiRes = await api.post("/api/v1/auth/google", {
            id_token: idToken,
          });

          if (apiRes.data && apiRes.data.access_token) {
            await setStoredToken(apiRes.data.access_token);
            onSuccess();
            onClose();
            return true;
          }
        }
      }
      return false;
    } catch (err) {
      console.log("Web Google Sign In fallback error:", err);
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    let useFallback = !GoogleSignin?.signIn;

    if (!useFallback) {
      try {
        if (Platform.OS === "android") {
          await GoogleSignin?.hasPlayServices?.({
            showPlayServicesUpdateDialog: true,
          });
        }

        const response = await GoogleSignin?.signIn?.();
        const idToken = response?.data?.idToken || (response as { idToken?: string } | undefined)?.idToken;

        if (!idToken) {
          useFallback = true;
        } else {
          const apiRes = await api.post("/api/v1/auth/google", {
            id_token: idToken,
          });

          if (apiRes.data && apiRes.data.access_token) {
            await setStoredToken(apiRes.data.access_token);
            onSuccess();
            onClose();
            return;
          } else {
            useFallback = true;
          }
        }
      } catch (error) {
        const errObj = error as { code?: unknown };
        if (isErrorWithCode && isErrorWithCode(error)) {
          if (errObj.code === statusCodes?.SIGN_IN_CANCELLED) {
            setIsGoogleLoading(false);
            return;
          }
          if (errObj.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
            useFallback = true;
          }
        } else {
          useFallback = true;
        }
      }
    }

    // Nếu Native Google Sign-In không sẵn sàng (ở trên Expo Go), cảnh báo hoặc dùng Web Browser fallback
    if (useFallback) {
      if (Platform.OS !== "web" && isExpoGo) {
        setErrorMessage(
          "Google Sign-In trên mobile yêu cầu Native Build (npx expo run:ios / run:android). Google chặn OAuth trên WebBrowser của Expo Go.",
        );
      } else {
        const success = await handleWebGoogleSignIn();
        if (!success) {
          setErrorMessage("Đăng nhập bằng Google thất bại hoặc bị hủy.");
        }
      }
    }

    setIsGoogleLoading(false);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    if (mode === "register" && !fullName.trim()) {
      setErrorMessage("Vui lòng nhập Họ và tên.");
      return;
    }

    try {
      if (mode === "login") {
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
            preferred_style: ["Casual"],
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
    } catch (err) {
      const errorObj = err as { response?: { data?: { detail?: unknown } }; message?: string };
      console.log("Auth Error:", errorObj?.response?.data || errorObj?.message || err);
      const detail = errorObj?.response?.data?.detail;
      if (typeof detail === "string") {
        setErrorMessage(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        setErrorMessage((detail[0] as { msg?: string })?.msg || "Thông tin nhập vào không hợp lệ.");
      } else {
        setErrorMessage(
          mode === "login"
            ? "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
            : "Đăng ký thất bại. Email có thể đã được sử dụng."
        );
      }
    }
  };

  const switchMode = (newMode: "login" | "register") => {
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full bg-surface rounded-t-3xl overflow-hidden max-h-[90%]"
        >
          <View className="p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-sans font-bold text-2xl text-on-surface">
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </Text>
              <Pressable
                onPress={onClose}
                className="w-9 h-9 items-center justify-center rounded-full bg-surface-variant/50 active:opacity-70"
              >
                <X size={20} color="#545f73" />
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
              {mode === "register" && (
                <View className="mb-4">
                  <Text className="font-sans font-medium text-xs text-on-surface-variant mb-2">
                    Họ và tên
                  </Text>
                  <View className="flex-row items-center bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 h-12">
                    <View className="mr-3 items-center justify-center">
                      <User size={18} color="#545f73" />
                    </View>
                    <TextInput
                      className="flex-1 h-full font-sans text-on-surface text-base py-0"
                      placeholder="Nhập họ và tên của bạn"
                      placeholderTextColor="#9CA3AF"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      textAlignVertical="center"
                    />
                  </View>
                </View>
              )}

              <View className="mb-4">
                <Text className="font-sans font-medium text-xs text-on-surface-variant mb-2">
                  Email
                </Text>
                <View className="flex-row items-center bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 h-12">
                  <View className="mr-3 items-center justify-center">
                    <Mail size={18} color="#545f73" />
                  </View>
                  <TextInput
                    className="flex-1 h-full font-sans text-on-surface text-base py-0"
                    placeholder="name@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlignVertical="center"
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="font-sans font-medium text-xs text-on-surface-variant mb-2">
                  Mật khẩu
                </Text>
                <View className="flex-row items-center bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 h-12">
                  <View className="mr-3 items-center justify-center">
                    <Lock size={18} color="#545f73" />
                  </View>
                  <TextInput
                    className="flex-1 h-full font-sans text-on-surface text-base py-0"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    textAlignVertical="center"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-1 ml-2 items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#545f73" />
                    ) : (
                      <Eye size={18} color="#545f73" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-primary active:opacity-90 py-4 rounded-xl flex-row items-center justify-center gap-2 mb-2 shadow-md shadow-primary/20"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" className="text-white" />
                ) : (
                  <>
                    <Text className="font-sans font-semibold text-base text-white">
                      {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                    </Text>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </>
                )}
              </Pressable>

              {/* Divider */}
              <View className="flex-row items-center my-3">
                <View className="flex-1 h-[1px] bg-outline-variant/30" />
                <Text className="font-sans text-xs text-on-surface-variant px-3">
                  Hoặc tiếp tục với
                </Text>
                <View className="flex-1 h-[1px] bg-outline-variant/30" />
              </View>

              {/* Google Sign In Button */}
              <Pressable
                onPress={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-surface-variant/40 border border-outline-variant/40 active:opacity-80 py-3 rounded-xl flex-row items-center justify-center gap-2.5 mb-4"
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#4285F4" />
                ) : (
                  <>
                    <GoogleLogoIcon />
                    <Text className="font-sans font-semibold text-base text-on-surface">
                      Đăng nhập bằng Google
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Switch Mode Footer */}
              <View className="flex-row justify-center items-center py-2 mb-4">
                <Text className="font-sans text-xs text-on-surface-variant">
                  {mode === "login"
                    ? "Chưa có tài khoản? "
                    : "Đã có tài khoản? "}
                </Text>
                <Pressable
                  onPress={() =>
                    switchMode(mode === "login" ? "register" : "login")
                  }
                >
                  <Text className="font-sans font-bold text-xs text-primary">
                    {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
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
