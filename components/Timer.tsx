import React from 'react';
import { Text } from 'react-native';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Timer(props: { timeSeconds: number; className?: string }) {
  return <Text className={props.className}>{formatTime(props.timeSeconds)}</Text>;
}

