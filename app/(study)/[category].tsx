import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useExamStore } from '@/store/examStore';
import { useProfileStore } from '@/store/profileStore';
import { loadCountryContent } from '@/services/countryContent';
import type { Question } from '@/types/content';
import { FontAwesome } from '@expo/vector-icons';

export default function StudyCategoryScreen() {
  const { category } = useLocalSearchParams();
  const { profile } = useProfileStore();
  const { lang, toggleBookmark, bookmarkedKeys } = useExamStore();
  const language = lang;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [revealedOptions, setRevealedOptions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!profile || !category) return;
      const content = await loadCountryContent(profile.country);
      if (cancelled) return;

      if (category === 'Bookmarks') {
        const prefix = `${profile.country}::${profile.licenseType}::`;
        const bookmarkedQuestionIds = new Set(
          bookmarkedKeys.filter((k) => k.startsWith(prefix)).map((k) => k.split('::')[2]),
        );
        const filtered = content.questions.filter(
          (q) => q.licenseTypes.includes(profile.licenseType) && bookmarkedQuestionIds.has(q.id),
        );
        setQuestions(filtered);
      } else {
        const filtered = content.questions.filter(
          (q) => q.licenseTypes.includes(profile.licenseType) && q.categoryId === category,
        );
        setQuestions(filtered);
      }

      setRevealedOptions({});
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [category, profile, bookmarkedKeys]);

  const toggleReveal = (id: string) => {
    setRevealedOptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getOptionKey = (obj: { en: string; local: string }) => (lang === 'en' ? obj.en : obj.local);

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen 
        options={{ 
          title: category === 'Bookmarks' 
            ? (language === 'en' ? 'Bookmarks' : 'बुकमार्कहरू') 
            : category as string 
        }} 
      />
      <ScrollView className="flex-1 px-4 py-6">
        {questions.length === 0 ? (
          <View className="items-center mt-10">
            <FontAwesome name="folder-open-o" size={48} color="#d1d5db" />
            <Text className="text-zinc-500 dark:text-zinc-400 text-center mt-4 font-medium text-lg">
              {language === 'en' ? 'No questions found.' : 'कुनै प्रश्नहरू भेटिएन।'}
            </Text>
          </View>
        ) : (
          questions.map((q, index) => {
            const isRevealed = revealedOptions[q.id];
            const isBookmarked = profile
              ? bookmarkedKeys.includes(`${profile.country}::${profile.licenseType}::${q.id}`)
              : false;

            return (
              <View key={q.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl mb-5 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
                <View className="flex-row justify-between items-start mb-5">
                  <Text className="flex-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight pr-4">
                    <Text className="text-blue-500">{index + 1}. </Text>
                    {getOptionKey(q.question)}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      profile &&
                      toggleBookmark({
                        country: profile.country,
                        licenseType: profile.licenseType,
                        questionId: q.id,
                      })
                    }
                    className="p-1"
                  >
                    <FontAwesome 
                      name={isBookmarked ? "bookmark" : "bookmark-o"} 
                      size={24} 
                      color={isBookmarked ? "#8b5cf6" : "#9ca3af"} 
                    />
                  </TouchableOpacity>
                </View>
                
                <View className="mb-5">
                  {q.options.map((opt) => {
                    const isCorrect = opt.id === q.correctOptionId;
                    let bgColor = "bg-zinc-50 dark:bg-zinc-800/50";
                    let textColor = "text-zinc-700 dark:text-zinc-300 font-medium";
                    let borderColor = "border-zinc-200 dark:border-zinc-700";

                    if (isRevealed && isCorrect) {
                      bgColor = "bg-green-50 dark:bg-green-900/20";
                      textColor = "text-green-700 dark:text-green-400 font-bold";
                      borderColor = "border-green-300 dark:border-green-800";
                    }

                    return (
                      <View key={opt.id} className={`p-4 mb-3 rounded-xl border ${bgColor} ${borderColor} flex-row items-center`}>
                        <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${isRevealed && isCorrect ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                          {isRevealed && isCorrect ? (
                             <FontAwesome name="check" size={12} color="white" />
                          ) : (
                            <Text className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{opt.id}</Text>
                          )}
                        </View>
                        <Text className={`flex-1 text-base leading-snug ${textColor}`}>{getOptionKey(opt)}</Text>
                      </View>
                    );
                  })}
                </View>
                
                <TouchableOpacity 
                  onPress={() => toggleReveal(q.id)}
                  className="bg-blue-50 dark:bg-blue-900/20 py-3.5 rounded-xl items-center border border-blue-100 dark:border-blue-900/30 active:bg-blue-100 dark:active:bg-blue-900/40"
                >
                  <Text className="text-blue-600 dark:text-blue-400 font-bold tracking-wide">
                    {isRevealed 
                      ? (language === 'en' ? 'Hide Answer' : 'उत्तर लुकाउनुहोस्') 
                      : (language === 'en' ? 'Show Answer' : 'उत्तर देखाउनुहोस्')
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
