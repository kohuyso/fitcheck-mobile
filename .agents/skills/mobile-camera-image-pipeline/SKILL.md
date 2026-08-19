---
name: "Mobile Camera & Image Pipeline"
description: "Handling native camera capture, gallery picking, permission handling, image compression, and FormData uploads for AI intake and closet features using Expo Camera and Expo Image Picker."
---

# Mobile Camera & Image Pipeline Skill

This skill details patterns for taking photos via `expo-camera`, selecting images via `expo-image-picker`, compressing/resizing before upload, and uploading via `FormData` to backend AI scanning endpoints in `fitcheck-mobile`.

## 1. Permission Management & Hooks
Always request permissions gracefully before launching camera or library views:

```tsx
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export function useMediaPermissions() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [libraryPermissionResponse, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  const ensureCameraPermission = async () => {
    if (cameraPermission?.granted) return true;
    const res = await requestCameraPermission();
    return res.granted;
  };

  const ensureLibraryPermission = async () => {
    if (libraryPermissionResponse?.granted) return true;
    const res = await requestLibraryPermission();
    return res.granted;
  };

  return {
    ensureCameraPermission,
    ensureLibraryPermission,
  };
}
```

## 2. Image Picker Workflow
Select single or multiple photos from the system image library with quality compression (0.7 - 0.85):

```tsx
import * as ImagePicker from 'expo-image-picker';

export async function pickOutfitPhotos(allowsMultiple = false) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: allowsMultiple,
    quality: 0.8,
    exif: false,
  });

  if (!result.canceled && result.assets) {
    return result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.fileName || `photo_${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    }));
  }
  return [];
}
```

## 3. Constructing Multipart `FormData` Uploads (`src/app/scan.tsx`)
Format local URIs into `FormData` for React Native fetch or Axios endpoints:

```typescript
export function createPhotoFormData(imageUri: string, fieldName = 'file', extraData: Record<string, any> = {}) {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || `upload_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append(fieldName, {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  Object.entries(extraData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });

  return formData;
}
```

## 4. Expo Image & Network Optimization
- Always process network image URLs using `getImageUrl()` from `@/utils/image-url`.
- Use `expo-image` with contentFit, recycling key, and placeholder to ensure fast render times in image grids.
