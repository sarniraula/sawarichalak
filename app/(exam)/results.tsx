import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useExamStore } from '@/store/examStore';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultsScreen() {
  const router = useRouter();
  const { history, lang } = useExamStore();
  const language = lang;

  const lastResult = history[0];

  const weakCategories =
    lastResult.categoryStats?.slice().sort((a, b) => {
      const ar = a.correct / Math.max(1, a.total);
      const br = b.correct / Math.max(1, b.total);
      return ar - br;
    }) ?? [];

  useEffect(() => {
    if (!lastResult) {
      router.replace('/(tabs)/exam');
    }
  }, [lastResult, router]);

  if (!lastResult) return null;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-10">
        
        <View className="items-center mt-10 mb-12">
          <View className={`w-28 h-28 rounded-full items-center justify-center mb-6 shadow-lg ${lastResult.passed ? 'bg-green-100 shadow-green-500/20' : 'bg-red-100 shadow-red-500/20'}`}>
            <FontAwesome 
              name={lastResult.passed ? "check" : "times"} 
              size={56} 
              color={lastResult.passed ? "#16a34a" : "#dc2626"} 
            />
          </View>
          
          <Text className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 text-center">
            {lastResult.passed 
              ? (language === 'en' ? 'Congratulations!' : 'बधाई छ!') 
              : (language === 'en' ? 'Not Quite There' : 'उत्तीर्ण हुन सकेन')}
          </Text>
          <Text className="text-zinc-500 dark:text-zinc-400 text-lg text-center font-medium">
            {lastResult.passed 
              ? (language === 'en' ? 'You passed the mock exam.' : 'तपाईंले नमुना परीक्षा उत्तीर्ण गर्नुभयो।') 
              : (language === 'en' ? 'You failed the mock exam. Keep practicing!' : 'तपाईंले नमुना परीक्षा अनुत्तीर्ण हुनुभयो। अभ्यास जारी राख्नुहोस्!')}
          </Text>
        </View>

        <View className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50 mb-10">
          <View className="items-center mb-8">
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
              {language === 'en' ? 'Your Score' : 'तपाईंको स्कोर'}
            </Text>
            <Text className={`text-6xl font-black ${lastResult.passed ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {lastResult.score}<Text className="text-3xl text-zinc-400 dark:text-zinc-600">/{lastResult.totalQuestions}</Text>
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
              {language === 'en' ? 'Accuracy' : 'सटीकता'}
            </Text>
            <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{lastResult.accuracyPercent}%</Text>
          </View>

          <View className="mb-2">
            <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
              {language === 'en' ? 'Weak Categories' : 'कमजोर वर्गहरू'}
            </Text>
            <View className="space-y-3">
              {weakCategories.slice(0, 3).map((c) => {
                const pct = Math.round((c.correct / Math.max(1, c.total)) * 100);
                return (
                  <View key={c.categoryId} className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-700/60">
                    <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{c.categoryId}</Text>
                    <View className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-3 overflow-hidden">
                      <View style={{ width: `${pct}%` }} className="h-full bg-red-500/80" />
                    </View>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-bold">{pct}%</Text>
                  </View>
                );
              })}
              {weakCategories.length === 0 && (
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">No category stats yet.</Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <View>
              <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider">Status</Text>
              <Text className={`font-bold ${lastResult.passed ? 'text-green-600' : 'text-red-600'}`}>{lastResult.passed ? 'PASSED' : 'FAILED'}</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider">Date</Text>
              <Text className="font-bold text-zinc-800 dark:text-zinc-200">{new Date(lastResult.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)/exam')}
          className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center shadow-lg shadow-blue-600/30 mb-8"
        >
          <Text className="text-white text-lg font-bold tracking-wide">
            {language === 'en' ? 'Back to Dashboard' : 'ड्यासबोर्डमा फर्कनुहोस्'}
          </Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}
