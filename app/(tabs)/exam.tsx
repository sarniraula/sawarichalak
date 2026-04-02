import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useExamStore } from '@/store/examStore';

export default function ExamScreen() {
  const router = useRouter();
  const { language, setLanguage, startTest, activeTest } = useExamStore();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'np' : 'en');
  };

  const handleStartTest = () => {
    startTest();
    router.push('/(exam)/test');
  };

  const handleResumeTest = () => {
    router.push('/(exam)/test');
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-10">
        <View className="flex-row justify-between items-center mb-10">
          <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {language === 'en' ? 'Mock Exam' : 'नमुना परीक्षा'}
          </Text>
          <TouchableOpacity 
            onPress={toggleLanguage}
            className="bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-full"
          >
            <Text className="text-zinc-800 dark:text-zinc-200 font-bold uppercase">{language}</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800/50 mb-8">
          <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl items-center justify-center mb-6">
            <FontAwesome name="file-text" size={28} color="#3b82f6" />
          </View>
          
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {language === 'en' ? 'Driving License Exam' : 'सवारी चालक अनुमतिपत्र परीक्षा'}
          </Text>
          <Text className="text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed font-medium">
            {language === 'en' 
              ? 'Evaluate your knowledge with a realistic mock exam based on the official syllabus.'
              : 'आधिकारिक पाठ्यक्रममा आधारित यथार्थवादी नमुना परीक्षाको साथ आफ्नो ज्ञानको मूल्याङ्कन गर्नुहोस्।'}
          </Text>

          <View className="space-y-4 mb-8">
            <View className="flex-row items-center">
              <View className="w-6 items-center"><FontAwesome name="list-ol" size={16} color="#9ca3af" /></View>
              <Text className="text-zinc-700 dark:text-zinc-300 font-medium ml-3">
                {language === 'en' ? '20 Questions' : '२० प्रश्नहरू'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-6 items-center"><FontAwesome name="clock-o" size={16} color="#9ca3af" /></View>
              <Text className="text-zinc-700 dark:text-zinc-300 font-medium ml-3">
                {language === 'en' ? '30 Minutes' : '३० मिनेट'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-6 items-center"><FontAwesome name="check-circle" size={16} color="#9ca3af" /></View>
              <Text className="text-zinc-700 dark:text-zinc-300 font-medium ml-3">
                {language === 'en' ? 'Pass Mark: 10/20' : 'उत्तीर्ण अंक: १०/२०'}
              </Text>
            </View>
          </View>

          {activeTest && !activeTest.isFinished ? (
            <TouchableOpacity 
              onPress={handleResumeTest}
              className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center shadow-lg shadow-blue-600/30"
            >
              <Text className="text-white text-lg font-bold tracking-wide">
                {language === 'en' ? 'Resume Test' : 'परीक्षा सुचारु गर्नुहोस्'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleStartTest}
              className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center shadow-lg shadow-blue-600/30"
            >
              <Text className="text-white text-lg font-bold tracking-wide">
                {language === 'en' ? 'Start Test' : 'परीक्षा सुरु गर्नुहोस्'}
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
