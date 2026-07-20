Viewed auth.py:23-50
Ran command: `cd ..`

Dưới đây là hướng dẫn từng bước để bạn tạo và cấu hình một dự án **React Native (Expo)** mới với đầy đủ các thư viện đã thảo luận ở trên, sẵn sàng kết nối với Backend **FitCheck** hiện tại của bạn.

Bạn hãy mở một cửa sổ Terminal mới (hoặc dùng chính Terminal trên máy của bạn tại thư mục chứa code `/Users/Astar/Python`) và chạy các lệnh sau:

---

### Bước 1: Khởi tạo Project Expo mới
Sử dụng template mặc định của Expo (đã cài đặt sẵn **Expo Router** và **TypeScript** giúp tiết kiệm thời gian thiết lập).

```bash
npx create-expo-app@latest fitcheck-mobile
```
*Sau khi chạy lệnh, Expo sẽ tạo thư mục `fitcheck-mobile`. Bạn hãy di chuyển vào thư mục đó:*
```bash
cd fitcheck-mobile
```

---

### Bước 2: Cài đặt các thư viện hệ thống (Expo SDK)
Sử dụng lệnh `npx expo install` để Expo tự động chọn phiên bản thư viện tương thích nhất với phiên bản Expo SDK hiện tại của dự án:

```bash
npx expo install expo-camera expo-image-picker expo-location expo-image expo-secure-store expo-sqlite
```

---

### Bước 3: Cài đặt các thư viện API, State & Giao diện
Cài đặt các gói hỗ trợ kết nối mạng, quản lý form, icons và animations:

```bash
npm install axios @tanstack/react-query @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler react-native-svg lucide-react-native react-hook-form zod
```

---

### Bước 4: Cấu hình NativeWind (Tailwind CSS) cho dự án
Để sử dụng các class Tailwind CSS trong React Native, bạn thực hiện cấu hình **NativeWind v4** như sau:

1. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install nativewind tailwindcss react-native-css-interop
   ```

2. **Khởi tạo file cấu hình Tailwind:**
   ```bash
   npx tailwindcss init
   ```

3. **Cập nhật file `tailwind.config.js`** vừa được tạo ở thư mục gốc:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     // Chỉ định các file sẽ sử dụng Tailwind classes
     content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
     presets: [require("nativewind/preset")],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

4. **Thêm cấu hình plugin vào `babel.config.js`** (nếu dự án sử dụng Babel, thường nằm ở thư mục gốc):
   ```javascript
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: ['nativewind/babel'], // Thêm dòng này
     };
   };
   ```

5. **Tạo file stylesheet toàn cục `global.css`** tại thư mục gốc của dự án và thêm nội dung sau:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

6. **Import file `global.css`** vào file entry point của dự án (thường là `app/_layout.tsx`):
   ```typescript
   import "../global.css";
   ```

---

### Bước 5: Lưu ý cực kỳ quan trọng khi kết nối với Backend Local
Khi chạy ứng dụng trên thiết bị ảo (Emulator) hoặc thiết bị thật, bạn **không thể** gọi trực tiếp đến `http://127.0.0.1:8000` hay `http://localhost:8000` vì thiết bị di động coi `localhost` là chính bản thân nó chứ không phải máy tính của bạn.

Hãy cấu hình file base API Client (`src/api/client.ts` hoặc `app/api.ts`) như sau:

```typescript
import axios from 'axios';
import { Platform } from 'react-native';

// Xác định IP Backend tùy theo thiết bị chạy thử nghiệm
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // Android Emulator kết nối với localhost của máy tính thông qua IP đặc biệt này:
    return 'http://10.0.2.2:8000'; 
  }
  // iOS Simulator hoặc thiết bị thật chạy chung Wi-Fi (Thay bằng IP LAN của máy tính bạn)
  return 'http://localhost:8000'; 
};

export const api = axios.create({
  baseURL: `${getBaseURL()}/api/v1`,
  timeout: 10000,
});
```

---

### Bước 6: Chạy thử dự án
Sau khi hoàn tất, bạn khởi động môi trường dev:
```bash
npm run start
```
*   Bấm **`a`** để mở ứng dụng trên máy ảo Android.
*   Bấm **`i`** để mở ứng dụng trên máy ảo iOS.
*   Hoặc tải app **Expo Go** trên App Store/Google Play về điện thoại thật và quét mã QR hiển thị trên màn hình terminal để chạy thử trực tiếp.