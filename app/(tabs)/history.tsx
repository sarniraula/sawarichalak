import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExamStore } from '@/store/examStore';
import { FontAwesome } from '@expo/vector-icons';

export default function HistoryScreen() {
  const router = useRouter();
  const { history, clearHistory, lang } = useExamStore();
  const language = lang;

  const handleClearHistory = () => {
    if (history.length === 0) return;
    Alert.alert(
      language === 'en' ? 'Clear History' : 'इतिहास मेटाउनुहोस्',
      language === 'en' ? 'Are you sure you want to delete all exam records?' : 'के तपाइँ निश्चित रूपमा सबै परीक्षा रेकर्डहरू मेटाउन चाहनुहुन्छ?',
      [
        { text: language === 'en' ? 'Cancel' : 'रद्द', style: 'cancel' },
        { 
          text: language === 'en' ? 'Clear' : 'मेटाउनुहोस्', 
          style: 'destructive', 
          onPress: () => clearHistory() 
        }
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const totalExams = history.length;
  const passedExams = history.filter(h => h.passed).length;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="px-6 pt-10 pb-6 flex-row justify-between items-center">
        <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {language === 'en' ? 'History' : 'इतिहास'}
        </Text>
        <TouchableOpacity 
          onPress={handleClearHistory}
          disabled={history.length === 0}
          className={`p-2 rounded-full ${history.length === 0 ? 'opacity-50' : 'bg-red-50 dark:bg-red-950/30'}`}
        >
          <FontAwesome name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Summary Stats */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm items-center">
            <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalExams}</Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
              {language === 'en' ? 'Exams Taken' : 'कुल परीक्षाहरू'}
            </Text>
          </View>
          <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm items-center">
            <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{passRate}%</Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
              {language === 'en' ? 'Pass Rate' : 'उत्तीर्ण दर'}
            </Text>
          </View>
        </View>

        {history.length === 0 ? (
          <View className="items-center justify-center mt-12">
            <View className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full items-center justify-center mb-4">
              <FontAwesome name="history" size={32} color="#9ca3af" />
            </View>
            <Text className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
              {language === 'en' ? 'No History Yet' : 'अहिलेसम्म कुनै इतिहास छैन'}
            </Text>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center max-w-[250px]">
              {language === 'en' ? 'Take a mock exam to see your reports and progress here.' : 'आफ्नो रिपोर्ट र प्रगति हेर्न नमुना परीक्षा दिनुहोस्।'}
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {history.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => router.push(`/(exam)/review?attemptId=${item.id}`)}
                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl flex-row items-center justify-between border border-zinc-100 dark:border-zinc-800/50 shadow-sm mb-4"
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <FontAwesome 
                      name={item.passed ? "check" : "times"} 
                      size={20} 
                      color={item.passed ? "#16a34a" : "#dc2626"} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-lg font-bold ${item.passed ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                      {item.passed ? (language === 'en' ? 'Passed' : 'उत्तीर्ण') : (language === 'en' ? 'Failed' : 'अनुत्तीर्ण')}
                    </Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>

                <View className="items-end bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-xl">
                  <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px] mb-1">Score</Text>
                  <Text className={`text-xl font-black ${item.passed ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {item.score}<Text className="text-sm font-bold text-zinc-400 dark:text-zinc-500">/{item.totalQuestions}</Text>
                  </Text>
                  <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-1">
                    {item.accuracyPercent}% Accuracy
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
