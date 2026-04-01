import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExamStore } from '@/store/examStore';

export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage, history } = useExamStore();

  const totalTests = history.length;
  const passedTests = history.filter(h => h.passed).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-zinc-900">
      <ScrollView className="px-6 pt-4 flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'en' ? 'Dashboard' : 'ड्यासबोर्ड'}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-1">
              {language === 'en' ? 'Nepal Driving License Exam' : 'नेपाल ड्राइभिङ लाइसेन्स परीक्षा'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setLanguage(language === 'en' ? 'np' : 'en')}
            className="bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-full"
          >
            <Text className="text-blue-700 dark:text-blue-300 font-semibold uppercase">
              {language}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm mb-8">
          <Text className="text-gray-500 dark:text-gray-400 font-medium mb-4">
            {language === 'en' ? 'Your Progress' : 'तपाईंको प्रगति'}
          </Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">{totalTests}</Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {language === 'en' ? 'Tests Taken' : 'दिएको परीक्षा'}
              </Text>
            </View>
            <View>
              <Text className="text-3xl font-bold text-green-600 dark:text-green-400">{passedTests}</Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {language === 'en' ? 'Tests Passed' : 'उत्तीर्ण परीक्षा'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {language === 'en' ? 'Quick Actions' : 'कारबाहीहरू'}
        </Text>
        
        <View className="flex-row flex-wrap justify-between mb-8">
          <TouchableOpacity 
            onPress={() => router.push('/exam')}
            className="w-[48%] bg-blue-600 p-4 rounded-2xl shadow-sm"
          >
            <Text className="text-white font-bold text-lg mb-1">
              {language === 'en' ? 'Mock Test' : 'नমুনা परीक्षा'}
            </Text>
            <Text className="text-blue-100 text-sm">
              {language === 'en' ? 'Take a 20q exam' : '२० प्रश्नको परीक्षा'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/study')}
            className="w-[48%] bg-purple-600 p-4 rounded-2xl shadow-sm"
          >
            <Text className="text-white font-bold text-lg mb-1">
              {language === 'en' ? 'Study' : 'अध्ययन'}
            </Text>
            <Text className="text-purple-100 text-sm">
              {language === 'en' ? 'View questions' : 'प्रश्नहरू हेर्नुहोस्'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
