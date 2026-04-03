import React from 'react';
import { View, Text } from 'react-native';

export default function QuestionCard(props: { categoryLabel?: string; questionText: string; children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800/50">
      {!!props.categoryLabel && (
        <Text className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-3">{props.categoryLabel}</Text>
      )}
      <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight mb-6">{props.questionText}</Text>
      {props.children}
    </View>
  );
}

