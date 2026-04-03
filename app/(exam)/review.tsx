import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { useExamStore } from '@/store/examStore';
import type { AttemptReviewItem } from '@/types/attempt';

function getLocalized(obj: { en: string; local: string }, lang: 'en' | 'local') {
  return lang === 'en' ? obj.en : obj.local;
}

export default function ExamReviewScreen() {
  const router = useRouter();
  const { attemptId } = useLocalSearchParams<{ attemptId?: string }>();
  const { history, lang } = useExamStore();
  const language = lang;

  const [filterWrongOnly, setFilterWrongOnly] = useState(true);

  const attempt = useMemo(
    () => history.find((h) => h.id === attemptId) ?? history[0],
    [history, attemptId],
  );

  const items: AttemptReviewItem[] = attempt?.reviewItems ?? [];

  const displayItems = useMemo(() => {
    if (!filterWrongOnly) return items;
    return items.filter((it) => it.userAnswerId !== it.correctOptionId);
  }, [items, filterWrongOnly]);

  if (!attempt || items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center px-6">
        <Text className="text-zinc-600 dark:text-zinc-300 text-center">
          {language === 'en' ? 'No review data for this attempt.' : 'यस प्रयासको लागि पुनरावलोकन डाटा छैन।'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 px-6 py-3 rounded-xl bg-blue-600">
          <Text className="text-white font-bold">{language === 'en' ? 'Back' : 'फर्कनुहोस्'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <FontAwesome name="chevron-left" size={16} color="#3b82f6" />
          <Text className="text-blue-600 font-bold ml-1">{language === 'en' ? 'Back' : 'फर्कनुहोस्'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilterWrongOnly((v) => !v)}
          className="px-3 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"
        >
          <Text className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {filterWrongOnly
              ? language === 'en'
                ? 'Show all'
                : 'सबै देखाउनुहोस्'
              : language === 'en'
                ? 'Mistakes only'
                : 'गल्ती मात्र'}
          </Text>
        </TouchableOpacity>
        </View>
        <Text className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {language === 'en' ? 'Review answers' : 'उत्तर पुनरावलोकन'}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-2 pb-10" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
          {language === 'en' ? 'Score' : 'अंक'}: {attempt.score}/{attempt.totalQuestions}
        </Text>

        {displayItems.length === 0 ? (
          <View className="items-center justify-center py-12">
            <FontAwesome name="check-circle" size={48} color="#22c55e" />
            <Text className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-4 text-center">
              {language === 'en' ? 'No mistakes in this filter.' : 'यस फिल्टरमा कुनै गल्ती छैन।'}
            </Text>
          </View>
        ) : (
          displayItems.map((it, idx) => {
            const wrong = it.userAnswerId !== it.correctOptionId;
            const userOpt = it.options.find((o) => o.id === it.userAnswerId);
            const correctOpt = it.options.find((o) => o.id === it.correctOptionId);
            return (
              <View
                key={it.questionId}
                className={`mb-6 rounded-2xl p-5 border ${
                  wrong ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                  {it.categoryId} · {language === 'en' ? 'Q' : 'प्रश्न'} {idx + 1}
                </Text>
                <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">{getLocalized(it.question, language)}</Text>
                <View className="space-y-2 mt-2">
                  {it.options.map((opt) => {
                    const isCorrect = opt.id === it.correctOptionId;
                    const isUser = opt.id === it.userAnswerId;
                    return (
                      <View
                        key={opt.id}
                        className={`p-3 rounded-xl border ${
                          isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                            : isUser && wrong
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : 'border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <Text className="text-zinc-800 dark:text-zinc-100 font-medium">
                          {opt.id}. {getLocalized(opt, language)}
                        </Text>
                        {isCorrect && (
                          <Text className="text-green-700 dark:text-green-400 text-xs font-bold mt-1">
                            {language === 'en' ? 'Correct answer' : 'सही उत्तर'}
                          </Text>
                        )}
                        {isUser && wrong && (
                          <Text className="text-red-700 dark:text-red-400 text-xs font-bold mt-1">
                            {language === 'en' ? 'Your answer' : 'तपाईंको उत्तर'}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
                {!it.userAnswerId && (
                  <Text className="text-amber-700 dark:text-amber-400 text-sm mt-2 font-medium">
                    {language === 'en' ? 'Skipped / unanswered' : 'छोडिएको छैन'}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
