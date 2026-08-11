---
name: "Mobile Form Validation & Input UX"
description: "Building robust forms, input validation schemas, and smooth mobile keyboard interaction using React Hook Form, Zod, and React Native input primitives."
---

# Mobile Form Validation & Input UX Skill

This skill provides instructions for constructing forms, managing input state, enforcing validation schemas with Zod, and delivering seamless keyboard UX on iOS and Android.

## 1. Stack & Architecture
- **Form Controller**: `react-hook-form` (`useForm`, `<Controller>`).
- **Validation Resolver**: `@hookform/resolvers/zod`.
- **Validation Schemas**: `zod` (`z.object({...})`).

## 2. Zod Schema Definition
Define explicit schema contracts with human-readable error messages:
```typescript
import { z } from 'zod';

export const itemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100),
  category: z.string().min(1, 'Please select a category'),
  color: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
```

## 3. React Hook Form Setup with Controller
Always use `<Controller>` from `react-hook-form` to wrap React Native `TextInput` elements:

```tsx
import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemFormSchema, ItemFormValues } from './schema';
import { cn } from '@/utils/cn';

export function ItemForm({ onSubmit }: { onSubmit: (data: ItemFormValues) => void }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      category: '',
      color: '',
    },
  });

  return (
    <View className="space-y-4 p-4">
      {/* Item Name Field */}
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Item Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={cn(
                "w-full px-4 py-3 bg-gray-100 rounded-xl border text-gray-900",
                errors.name ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-primary-500"
              )}
              placeholder="e.g. Vintage Leather Jacket"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          )}
        />
        {errors.name && (
          <Text className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</Text>
        )}
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className={cn(
          "w-full py-3.5 bg-primary-600 rounded-xl items-center justify-center active:opacity-80",
          isSubmitting && "opacity-50"
        )}
      >
        <Text className="text-white font-semibold text-base">
          {isSubmitting ? 'Saving...' : 'Save Item'}
        </Text>
      </Pressable>
    </View>
  );
}
```

## 4. Mobile Keyboard & UX Best Practices
- **KeyboardAvoidingView**: Wrap forms in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">`.
- **Dismiss Keyboard**: Wrap outer container in `<TouchableWithoutFeedback onPress={Keyboard.dismiss}>`.
- **Input Properties**:
  - `keyboardType`: Set correctly (`'default'`, `'email-address'`, `'numeric'`, `'phone-pad'`).
  - `autoCapitalize`: Use `'none'` for emails/usernames, `'words'` for names, `'sentences'` for text fields.
  - `secureTextEntry`: Set for passwords with toggle eye icon.
