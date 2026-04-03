import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function ResultCard(props: {
  title: string;
  subtitle?: string;
  score: string;
  status: 'passed' | 'failed' | 'neutral';
  onBack?: () => void;
  backLabel?: string;
}) {
  const statusStyles =
    props.status === 'passed'
      ? { bg: 'bg-green-100', tint: '#16a34a', circle: 'shadow-green-500/20' }
      : props.status === 'failed'
        ? { bg: 'bg-red-100', tint: '#dc2626', circle: 'shadow-red-500/20' }
        : { bg: 'bg-blue-100', tint: '#2563eb', circle: 'shadow-blue-500/20' };

  return (
    <View className="items-center">
      <View className={`w-28 h-28 rounded-full items-center justify-center mb-6 shadow-lg ${statusStyles.bg} ${statusStyles.circle}`}>
        <FontAwesome name={props.status === 'passed' ? 'check' : props.status === 'failed' ? 'times' : 'info'} size={56} color={statusStyles.tint} />
      </View>

      <Text className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 text-center">{props.title}</Text>

      {!!props.subtitle && <Text className="text-zinc-500 dark:text-zinc-400 text-lg text-center font-medium">{props.subtitle}</Text>}

      <Text className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-6">{props.score}</Text>
    </View>
  );
}

