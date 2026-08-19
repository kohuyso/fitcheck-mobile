import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { client } from './client.gen'; // Import generated client
import { getStoredToken } from './storage';

export { getStoredToken, removeStoredToken, setStoredToken } from './storage';

// Determine Backend IP based on platform & environment
export const getBaseURL = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.IP_ADDRESS;

  // Extract host IP from Expo Metro server (works for physical devices & emulators)
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  const hostIp = debuggerHost ? debuggerHost.split(':')[0] : null;

  if (envUrl) {
    let url = envUrl.trim().replace(/\/+$/, '');
    if (Platform.OS !== 'web' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
      if (Platform.OS === 'android') {
        const replacement = hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1' ? hostIp : '10.0.2.2';
        url = url.replace('localhost', replacement).replace('127.0.0.1', replacement);
      } else if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        url = url.replace('localhost', hostIp).replace('127.0.0.1', hostIp);
      }
    }
    return url;
  }

  // Fallback if no env variable is provided
  if (Platform.OS === 'android') {
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:8000`;
    }
    return 'http://10.0.2.2:8000';
  }

  if (Platform.OS === 'ios') {
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:8000`;
    }
    return 'http://localhost:8000';
  }

  return 'http://localhost:8000';
};

const rawBaseURL = getBaseURL();
console.log('[API Client] Initialized Base URL:', rawBaseURL);

export const api = axios.create({
  baseURL: `${rawBaseURL}/api/v1`,
  timeout: 15000,
});

// Dynamic local device IANA timezone detector (e.g. "Asia/Ho_Chi_Minh", "America/New_York")
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
  } catch {
    return 'Asia/Ho_Chi_Minh';
  }
};

// Interceptor tự động thêm Bearer token & X-Timezone vào Request Header cho mọi API request
api.interceptors.request.use(
  async (config) => {
    try {
      config.headers = config.headers || {};
      
      // Auto attach X-Timezone header for backend date/time synchronization
      const userTimezone = getUserTimezone();
      if (userTimezone) {
        config.headers['X-Timezone'] = userTimezone;
      }

      const token = await getStoredToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API Interceptor] Error setting request headers:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Sync Hey API client with custom axios instance & auth getter
client.setConfig({
  baseURL: rawBaseURL,
  axios: api,
  auth: async () => {
    const token = await getStoredToken();
    return token || undefined;
  },
});
