import React from 'react';
import { View, type ViewStyle } from 'react-native';

export default function ProgressBar(props: { percent: number; style?: ViewStyle }) {
  const percent = Math.min(100, Math.max(0, props.percent));
  return (
    <View style={[{ height: 12, backgroundColor: '#e4e4e7', borderRadius: 999, overflow: 'hidden' }, props.style]}>
      <View style={{ width: `${percent}%`, height: '100%', backgroundColor: '#2563eb' }} />
    </View>
  );
}

