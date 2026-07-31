import axios from 'axios';
import { Platform } from 'react-native';
import { client } from './client.gen'; // Import generated client
import { getStoredToken } from './storage';

export { setStoredToken, getStoredToken, removeStoredToken } from './storage';

// Xác định IP Backend tùy theo thiết bị chạy thử nghiệm
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return process.env.IP_ADDRESS; 
  }
  return process.env.IP_ADDRESS; 
};

export const api = axios.create({
  baseURL: `${getBaseURL()}/api/v1`,
  timeout: 10000,
});

// Interceptor tự động thêm Bearer token vào Request Header cho mọi API request
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gán instance Axios tùy biến cho Client của Hey API
client.instance = api;




