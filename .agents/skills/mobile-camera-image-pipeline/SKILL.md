---
name: "Mobile Camera & Image Pipeline"
description: "Handling native camera capture, gallery picking, permission handling, image compression, and FormData uploads for AI intake and closet features using Expo Camera and Expo Image Picker."
---

# Mobile Camera & Image Pipeline Skill

This skill details patterns for taking photos via `expo-camera`, selecting images via `expo-image-picker`, compressing/resizing before upload, and uploading via `FormData` to backend endpoints in `fitcheck-mobile`.

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
Select single or multiple photos from the system image library with quality tuning:

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

## 3. Expo Camera Capture Workflow
Configure `CameraView` with photo options:

```tsx
import React, { useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Pressable, Text } from 'react-native';

export function CameraCaptureScreen({ onPhotoCaptured }: { onPhotoCaptured: (uri: string) => void }) {
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (photo?.uri) {
        onPhotoCaptured(photo.uri);
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} className="flex-1" facing="back">
        <View className="flex-1 justify-end items-center pb-10">
          <Pressable
            onPress={takePicture}
            className="w-20 h-20 rounded-full border-4 border-white bg-white/30 items-center justify-center active:scale-95"
          >
            <View className="w-14 h-14 rounded-full bg-white" />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}
```

## 4. Constructing Multipart `FormData` Uploads
Format local URIs into `FormData` for React Native fetch or Axios endpoints:

```typescript
export function createPhotoFormData(imageUri: string, fieldName = 'file', extraData: Record<string, any> = {}) {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || `upload_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // React Native dynamic blob object format
  formData.append(fieldName, {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  // Append extra metadata fields
  Object.entries(extraData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });

  return formData;
}
```

## 5. Performance & Memory Guidelines
- **Compression**: Always set image quality between `0.7` and `0.85` to avoid sending 15MB raw photos over cellular data.
- **Cleanup**: Dismiss camera view controller when navigate away to free native hardware camera resources.
- **Preview Optimization**: Use `expo-image` for displaying captured image thumbnails in UI grids.
