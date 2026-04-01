import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-bold dark:text-white">Study Materials</Text>
      </View>
    </SafeAreaView>
  );
}
