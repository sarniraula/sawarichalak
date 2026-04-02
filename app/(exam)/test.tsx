import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useExamStore } from '@/store/examStore';
import { FontAwesome } from '@expo/vector-icons';

export default function TestScreen() {
  const router = useRouter();
  const { 
    activeTest, 
    language, 
    tickTimer, 
    answerQuestion, 
    nextQuestion, 
    prevQuestion, 
    submitTest, 
    quitTest 
  } = useExamStore();

  useEffect(() => {
    if (!activeTest || activeTest.isFinished) {
      router.replace('/(tabs)/exam');
      return;
    }

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTest?.isFinished, activeTest?.timeLeft]);

  // Navigate to results if test finishes
  useEffect(() => {
    if (activeTest?.isFinished) {
      router.replace('/(exam)/results');
    }
  }, [activeTest?.isFinished]);

  if (!activeTest) return null;

  const currentQ = activeTest.questions[activeTest.currentIndex];
  // Safe fallback if questions array is somehow missing
  if (!currentQ) return null;
  const selectedOption = activeTest.answers[currentQ.id];

  const handleQuit = () => {
    Alert.alert(
      language === 'en' ? 'Quit Test?' : 'परीक्षा छोड्नुहुने हो?',
      language === 'en' ? 'All progress will be lost.' : 'सबै प्रगति मेटिनेछ।',
      [
        { text: language === 'en' ? 'Cancel' : 'रद्द', style: 'cancel' },
        { text: language === 'en' ? 'Quit' : 'छोड्नुहोस्', style: 'destructive', onPress: () => {
          quitTest();
          router.replace('/(tabs)/exam');
        }}
      ]
    );
  };

  const handleSubmit = () => {
    Alert.alert(
      language === 'en' ? 'Submit Test?' : 'परीक्षा बुझाउनुहुने हो?',
      language === 'en' ? 'Are you sure you want to finish?' : 'के तपाइँ परीक्षा समाप्त गर्न चाहनुहुन्छ?',
      [
        { text: language === 'en' ? 'Review' : 'मूल्याङ्कन', style: 'cancel' },
        { text: language === 'en' ? 'Submit' : 'बुझाउनुहोस्', style: 'default', onPress: () => submitTest() }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getLangValue = (obj: any) => obj[language] || obj['en'];

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/50">
        <TouchableOpacity onPress={handleQuit} className="w-10 h-10 items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-full">
          <FontAwesome name="times" size={18} color="#9ca3af" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
            {language === 'en' ? 'Time Left' : 'बाँकी समय'}
          </Text>
          <Text className={`text-xl font-bold ${activeTest.timeLeft < 300 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {formatTime(activeTest.timeLeft)}
          </Text>
        </View>

        <View className="w-10 h-10 items-center justify-center bg-blue-100 dark:bg-blue-900/40 rounded-full border border-blue-200 dark:border-blue-800">
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">
            {activeTest.currentIndex + 1}/{activeTest.questions.length}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-8 pb-32">
        <Text className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-4 ml-1">
          {currentQ.category}
        </Text>
        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 leading-tight">
          {getLangValue(currentQ.question)}
        </Text>

        <View className="space-y-4 mb-20">
          {currentQ.options.map(opt => {
            const isSelected = selectedOption === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => answerQuestion(currentQ.id, opt.id)}
                className={`p-5 rounded-2xl border-2 flex-row items-center shadow-sm ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-zinc-300 dark:border-zinc-600'
                }`}>
                  {isSelected && <FontAwesome name="check" size={10} color="white" />}
                </View>
                <Text className={`text-lg flex-1 ${isSelected ? 'text-blue-700 dark:text-blue-300 font-bold' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                  {getLangValue(opt)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800/80 px-6 py-5 flex-row justify-between items-center pb-8">
        <TouchableOpacity 
          onPress={prevQuestion}
          disabled={activeTest.currentIndex === 0}
          className={`px-6 py-4 rounded-xl flex-row items-center border border-zinc-200 dark:border-zinc-800 ${activeTest.currentIndex === 0 ? 'opacity-50' : 'bg-zinc-50 dark:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700'}`}
        >
          <FontAwesome name="chevron-left" size={16} color="#6b7280" />
        </TouchableOpacity>

        {activeTest.currentIndex === activeTest.questions.length - 1 ? (
          <TouchableOpacity 
            onPress={handleSubmit}
            className="flex-1 bg-green-600 active:bg-green-700 ml-4 py-4 rounded-xl items-center shadow-lg shadow-green-600/30"
          >
            <Text className="text-white font-bold text-lg tracking-wide">{language === 'en' ? 'Submit' : 'बुझाउनुहोस्'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={nextQuestion}
            className="flex-1 bg-blue-600 active:bg-blue-700 ml-4 py-4 rounded-xl items-center shadow-lg shadow-blue-600/30"
          >
            <Text className="text-white font-bold text-lg tracking-wide">{language === 'en' ? 'Next Question' : 'अर्को'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
