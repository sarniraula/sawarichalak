import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function OptionButton(props: {
  idLabel: string;
  text: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  revealed?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
}) {
  const { selected, revealed, isCorrect, isWrong } = props;

  let borderClass = 'border-zinc-200 dark:border-zinc-800';
  let bgClass = 'bg-white dark:bg-zinc-900';
  let textClass = 'text-zinc-800 dark:text-zinc-100 font-medium';

  if (revealed) {
    if (isCorrect) {
      borderClass = 'border-green-500 dark:border-green-500';
      bgClass = 'bg-green-50 dark:bg-green-900/20';
      textClass = 'text-green-700 dark:text-green-400 font-bold';
    } else if (isWrong) {
      borderClass = 'border-red-500 dark:border-red-500';
      bgClass = 'bg-red-50 dark:bg-red-900/20';
      textClass = 'text-red-700 dark:text-red-400 font-bold';
    }
  } else if (selected) {
    borderClass = 'border-blue-500';
    bgClass = 'bg-blue-50 dark:bg-blue-900/20';
    textClass = 'text-blue-700 dark:text-blue-300 font-bold';
  }

  return (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={props.disabled}
      className={`p-4 rounded-2xl border-2 flex-row items-center ${borderClass} ${bgClass}`}
    >
      <View className="w-7 h-7 rounded-full items-center justify-center mr-3 border border-transparent">
        {revealed ? (
          isCorrect ? (
            <FontAwesome name="check" size={12} color="green" />
          ) : isWrong ? (
            <FontAwesome name="times" size={12} color="red" />
          ) : (
            <Text className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{props.idLabel}</Text>
          )
        ) : selected ? (
          <FontAwesome name="check" size={12} color="white" />
        ) : (
          <Text className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{props.idLabel}</Text>
        )}
      </View>

      <Text className={`flex-1 ${textClass}`}>
        {props.idLabel}. {props.text}
      </Text>
    </TouchableOpacity>
  );
}

