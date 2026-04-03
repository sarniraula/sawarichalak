import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { useExamStore } from '@/store/examStore';
import { useFlashcardStore } from '@/store/flashcardStore';

function getLocalized(obj: { en: string; local: string }, lang: 'en' | 'local') {
  return lang === 'en' ? obj.en : obj.local;
}

export default function FlashcardsScreen() {
  const router = useRouter();
  const { lang } = useExamStore();
  const { session, flip, next, prev, quit } = useFlashcardStore();

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
        <Text className="text-zinc-500 dark:text-zinc-400">No flashcard session.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-3 rounded-xl bg-blue-600">
          <Text className="text-white font-bold">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const q = session.questions[session.currentIndex];
  const correct = q.options.find((o) => o.id === q.correctOptionId);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => quit()} className="w-10 h-10 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
          <FontAwesome name="times" size={18} color="#6b7280" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
          {session.currentIndex + 1}/{session.questions.length}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={flip}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 min-h-[320px] justify-center"
        >
          {!session.showBack ? (
            <>
              <Text className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">{q.categoryId}</Text>
              <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight mb-4">
                {getLocalized(q.question, lang)}
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-sm">Tap to reveal answer</Text>
            </>
          ) : (
            <>
              <Text className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-2">Correct</Text>
              <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {correct ? `${correct.id}. ${getLocalized(correct, lang)}` : '—'}
              </Text>
              <Text className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mt-2">
                {getLocalized(q.explanation, lang)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={prev}
            disabled={session.currentIndex === 0}
            className={`w-12 h-12 items-center justify-center rounded-xl border ${
              session.currentIndex === 0 ? 'opacity-40 border-zinc-200 dark:border-zinc-800' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800'
            }`}
          >
            <FontAwesome name="chevron-left" size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={flip} className="px-6 py-3 rounded-xl bg-indigo-600">
            <Text className="text-white font-bold">{session.showBack ? 'Show question' : 'Show answer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={next}
            disabled={session.currentIndex >= session.questions.length - 1}
            className={`w-12 h-12 items-center justify-center rounded-xl border ${
              session.currentIndex >= session.questions.length - 1
                ? 'opacity-40 border-zinc-200 dark:border-zinc-800'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800'
            }`}
          >
            <FontAwesome name="chevron-right" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
