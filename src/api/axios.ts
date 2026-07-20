import axios from 'axios';
import { Platform } from 'react-native';
import { client } from './client.gen'; // Import generated client

// Xác định IP Backend tùy theo thiết bị chạy thử nghiệm
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // Android Emulator kết nối với localhost của máy tính thông qua IP đặc biệt này:
    return process.env.IP_ADDRESS; 
  }
  // iOS Simulator hoặc thiết bị thật chạy chung Wi-Fi (Thay bằng IP LAN của máy tính bạn)
  return process.env.IP_ADDRESS; 
};

export const api = axios.create({
  baseURL: `${getBaseURL()}/api/v1`,
  timeout: 10000,
});

// Gán instance Axios tùy biến cho Client của Hey API
client.instance = api;

