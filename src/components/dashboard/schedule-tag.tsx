import React from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'lucide-react-native';

interface ScheduleTagProps {
  schedule?: string;
}

export default function ScheduleTag({ schedule }: ScheduleTagProps) {
  const displaySchedule = schedule ?? "Today's Schedule: Office Meeting";

  return (
    <View className="bg-secondary-container rounded-full px-4 py-3 flex-row items-center gap-2 mb-8">
      <Calendar size={18} className="text-on-secondary-container" />
      <Text className="font-sans font-medium text-label-md text-on-secondary-container">
        {displaySchedule}
      </Text>
    </View>
  );
}
