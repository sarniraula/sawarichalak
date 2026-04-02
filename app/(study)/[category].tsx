import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useExamStore, Question } from '@/store/examStore';
import questionsData from '@/data/questions.json';
import { FontAwesome } from '@expo/vector-icons';

export default function StudyCategoryScreen() {
  const { category } = useLocalSearchParams();
  const { language } = useExamStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [revealedOptions, setRevealedOptions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Filter questions by category
    const filtered = (questionsData as Question[]).filter(q => q.category === category);
    setQuestions(filtered);
  }, [category]);

  const toggleReveal = (id: string) => {
    setRevealedOptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getOptionKey = (obj: any, lang: 'en'|'np') => obj[lang] || obj['en'];

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ title: category as string }} />
      <ScrollView className="flex-1 px-4 py-6">
        {questions.length === 0 ? (
          <Text className="text-zinc-500 dark:text-zinc-400 text-center mt-10 font-medium">
            {language === 'en' ? 'No questions found for this category.' : 'यस वर्गको लागि कुनै प्रश्नहरू भेटिएन।'}
          </Text>
        ) : (
          questions.map((q, index) => {
            const isRevealed = revealedOptions[q.id];
            return (
              <View key={q.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl mb-5 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
                <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-5 leading-tight">
                  <Text className="text-blue-500">{index + 1}. </Text>
                  {getOptionKey(q.question, language)}
                </Text>
                
                <View className="space-y-3 mb-5">
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
                      <View key={opt.id} className={`p-4 rounded-xl border ${bgColor} ${borderColor} flex-row items-center`}>
                        <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${isRevealed && isCorrect ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                          {isRevealed && isCorrect ? (
                             <FontAwesome name="check" size={12} color="white" />
                          ) : (
                            <Text className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{opt.id}</Text>
                          )}
                        </View>
                        <Text className={`flex-1 text-base ${textColor}`}>{getOptionKey(opt, language)}</Text>
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
