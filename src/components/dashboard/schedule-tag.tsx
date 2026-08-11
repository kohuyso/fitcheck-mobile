import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar, Briefcase, Heart, PartyPopper, Dumbbell, Coffee, Sparkles } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { getOutfitByEventApiV1AiOutfitByEventPostMutation } from '@/api/@tanstack/react-query.gen';

interface ScheduleTagProps {
  schedule?: string;
  onEventOutfitGenerated?: (outfit: any) => void;
}

const EVENTS = [
  { id: 'work', label: 'Đi làm', icon: Briefcase },
  { id: 'date', label: 'Hẹn hò', icon: Heart },
  { id: 'party', label: 'Dự tiệc', icon: PartyPopper },
  { id: 'gym', label: 'Tập gym', icon: Dumbbell },
  { id: 'casual', label: 'Dạo phố', icon: Coffee },
];

export default function ScheduleTag({ schedule, onEventOutfitGenerated }: ScheduleTagProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>('work');

  // Outfit by Event Mutation
  const outfitByEventMutation = useMutation(
    getOutfitByEventApiV1AiOutfitByEventPostMutation()
  );

  const handleSelectEvent = async (eventId: string) => {
    setSelectedEvent(eventId);
    try {
      const res = await outfitByEventMutation.mutateAsync({
        body: {
          event_type: eventId as any,
          weather_condition: 'Cool & Sunny',
        },
      });
      if (res && onEventOutfitGenerated) {
        onEventOutfitGenerated(res);
      }
    } catch (err) {
      console.log('Outfit by event error:', err);
    }
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2.5 min-h-[28px]">
        <View className="flex-row items-center gap-2">
          <Calendar size={18} color="#005c55" />
          <Text className="font-sans font-bold text-label-md text-on-surface">
            Hôm nay bạn làm gì?
          </Text>
        </View>
        {outfitByEventMutation.isPending && (
          <View className="flex-row items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
            <ActivityIndicator size="small" color="#005c55" />
            <Text className="font-sans text-label-sm text-primary font-bold">AI Styling...</Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {EVENTS.map((evt) => {
          const IconComp = evt.icon;
          const isSelected = selectedEvent === evt.id;
          return (
            <Pressable
              key={evt.id}
              onPress={() => handleSelectEvent(evt.id)}
              className={`flex-row items-center gap-2 px-3.5 py-2.5 rounded-full mr-2 border active:opacity-80 ${
                isSelected
                  ? 'bg-primary border-primary shadow-sm'
                  : 'bg-surface-container-low border-outline-variant/30'
              }`}
            >
              <IconComp size={15} color={isSelected ? '#ffffff' : '#3e4947'} />
              <Text
                className={`font-sans font-bold text-label-md ${
                  isSelected ? 'text-white' : 'text-on-surface'
                }`}
              >
                {evt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
