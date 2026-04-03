import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { useExamStore } from '@/store/examStore';
import { useQuizStore } from '@/store/quizStore';
import type { Question } from '@/types/content';

function getLocalizedText(obj: { en: string; local: string }, lang: 'en' | 'local') {
  return lang === 'en' ? obj.en : obj.local;
}

export default function QuizSessionScreen() {
  const router = useRouter();
  const { lang, setLanguage } = useExamStore();
  const { session, selectOption, nextQuestion, prevQuestion, finish, quit } = useQuizStore();

  const currentQ: Question | undefined = session ? session.questions[session.currentIndex] : undefined;
  const selectedOption = currentQ ? session.answers[currentQ.id] : undefined;
  const isRevealed = currentQ ? !!session.revealed[currentQ.id] : false;

  const toggleLanguage = () => setLanguage(lang === 'en' ? 'local' : 'en');

  const results = useMemo(() => {
    if (!session || !session.isFinished) return null;
    let score = 0;
    const statsByCategory: Record<string, { correct: number; total: number }> = {};

    for (const q of session.questions) {
      const given = session.answers[q.id];
      const isCorrect = given === q.correctOptionId;
      if (isCorrect) score++;
      const stat = (statsByCategory[q.categoryId] ??= { correct: 0, total: 0 });
      stat.total += 1;
      if (isCorrect) stat.correct += 1;
    }

    const totalQuestions = session.questions.length;
    const accuracyPercent = Math.round((score / Math.max(1, totalQuestions)) * 100);
    const categoryStats = Object.entries(statsByCategory)
      .map(([categoryId, v]) => ({ categoryId, correct: v.correct, total: v.total }))
      .sort((a, b) => (a.total === b.total ? a.correct - b.correct : b.total - a.total));

    return { score, totalQuestions, accuracyPercent, categoryStats };
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
        <Text className="text-zinc-500 dark:text-zinc-400">Loading practice...</Text>
      </SafeAreaView>
    );
  }

  const handleQuit = () => {
    Alert.alert('Quit Practice?', 'Your session will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Quit',
        style: 'destructive',
        onPress: () => {
          quit();
          router.replace('/practice');
        },
      },
    ]);
  };

  if (session.isFinished && results) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <ScrollView className="flex-1 px-6 pt-10 pb-10">
          <View className="items-center mt-2 mb-8">
            <FontAwesome name="check-double" size={54} color="#3b82f6" />
            <Text className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-4">
              {results.accuracyPercent}%
            </Text>
            <Text className="text-zinc-500 dark:text-zinc-400 mt-2">
              Score {results.score}/{results.totalQuestions}
            </Text>
          </View>

          <View className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800/50 mb-8">
            <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Weakest Categories
            </Text>
            <View className="mt-4 space-y-3">
              {results.categoryStats.slice(0, 3).map((s) => {
                const pct = Math.round((s.correct / Math.max(1, s.total)) * 100);
                return (
                  <View key={s.categoryId} className="flex-row items-center justify-between">
                    <Text className="text-zinc-800 dark:text-zinc-100 font-bold">{s.categoryId}</Text>
                    <Text className="text-zinc-600 dark:text-zinc-300 font-bold">{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              quit();
              router.replace('/practice');
            }}
            className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center shadow-sm shadow-blue-600/30"
          >
            <Text className="text-white font-bold text-lg">Back to Practice</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!currentQ) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
        <Text className="text-zinc-500 dark:text-zinc-400">No question found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
        <TouchableOpacity onPress={handleQuit} className="w-10 h-10 items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-full">
          <FontAwesome name="times" size={18} color="#6b7280" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
            {lang === 'en' ? 'Question' : 'प्रश्न'}
          </Text>
          <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {session.currentIndex + 1}/{session.questions.length}
          </Text>
        </View>

        <TouchableOpacity onPress={toggleLanguage} className="bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
          <Text className="text-zinc-800 dark:text-zinc-200 font-bold uppercase">{lang === 'en' ? 'EN' : 'LOCAL'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-2 pb-24">
        <Text className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
          {currentQ.categoryId}
        </Text>

        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight mb-6">
          {getLocalizedText(currentQ.question, lang)}
        </Text>

        <View className="space-y-3 mb-10">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === currentQ.correctOptionId;

            let borderClass = 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900';
            let textClass = 'text-zinc-800 dark:text-zinc-100';

            if (isRevealed) {
              if (isCorrect) borderClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
              if (isSelected && !isCorrect) borderClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
            } else if (isSelected) {
              borderClass = 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
            }

            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => selectOption({ questionId: currentQ.id, optionId: opt.id })}
                disabled={isRevealed}
                className={`p-4 rounded-2xl border ${borderClass}`}
              >
                <Text className={`font-bold ${textClass}`}>
                  {opt.id}. {getLocalizedText(opt, lang)}
                </Text>
                {isRevealed && isCorrect && (
                  <Text className="text-green-700 dark:text-green-400 font-bold mt-2">Correct</Text>
                )}
                {isRevealed && isSelected && !isCorrect && (
                  <Text className="text-red-700 dark:text-red-400 font-bold mt-2">Incorrect</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isRevealed && (
          <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800/50 mb-8">
            <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Explanation' : 'व्याख्या'}
            </Text>
            <Text className="text-zinc-800 dark:text-zinc-100 leading-relaxed">{getLocalizedText(currentQ.explanation, lang)}</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800/80 px-6 py-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={prevQuestion}
            disabled={session.currentIndex === 0}
            className={`w-12 h-12 items-center justify-center rounded-xl border ${
              session.currentIndex === 0 ? 'opacity-50 border-zinc-200 dark:border-zinc-800' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800'
            }`}
          >
            <FontAwesome name="chevron-left" size={16} color="#6b7280" />
          </TouchableOpacity>

          {session.currentIndex === session.questions.length - 1 ? (
            <TouchableOpacity
              onPress={() => finish()}
              disabled={!isRevealed}
              className={`flex-1 ml-4 py-4 rounded-xl items-center ${
                isRevealed ? 'bg-green-600 active:bg-green-700' : 'bg-green-300 opacity-60'
              }`}
            >
              <Text className="text-white font-bold text-lg">Finish</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => nextQuestion()}
              disabled={!isRevealed}
              className={`flex-1 ml-4 py-4 rounded-xl items-center ${
                isRevealed ? 'bg-blue-600 active:bg-blue-700' : 'bg-blue-300 opacity-60'
              }`}
            >
              <Text className="text-white font-bold text-lg">{lang === 'en' ? 'Next' : 'अर्को'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

