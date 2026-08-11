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

// Interceptor tự động thêm Bearer token vào Request Header cho mọi API request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStoredToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API Interceptor] Error retrieving auth token:', error);
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
