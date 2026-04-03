import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExamStore } from '@/store/examStore';
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { user } = useAuthStore();
  const { lang, setLanguage, history } = useExamStore();

  // Temporary alias to keep existing UI conditions working.
  const language = lang;

  const totalTests = history.length;
  const passedTests = history.filter(h => h.passed).length;

  const greetingName = user?.displayName?.trim() || user?.email?.split('@')[0] || (lang === 'en' ? 'there' : 'यहाँ');

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-zinc-900">
      <ScrollView className="px-6 pt-4 flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              {lang === 'en' ? `Hi, ${greetingName}` : `नमस्ते, ${greetingName}`}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-1">
              {profile
                ? `${profile.country[0].toUpperCase()}${profile.country.slice(1)} • ${profile.licenseType}`
                : lang === 'en'
                  ? 'Loading profile...'
                  : 'प्रोफाइल लोड हुँदैछ...'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setLanguage(lang === 'en' ? 'local' : 'en')}
            className="bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-full"
          >
            <Text className="text-blue-700 dark:text-blue-300 font-semibold uppercase">
              {lang === 'en' ? 'EN' : 'LOCAL'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm mb-8">
          <Text className="text-gray-500 dark:text-gray-400 font-medium mb-4">
            {lang === 'en' ? 'Your Progress' : 'तपाईंको प्रगति'}
          </Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">{totalTests}</Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {lang === 'en' ? 'Mock Attempts' : 'नमुना प्रयास'}
              </Text>
            </View>
            <View>
              <Text className="text-3xl font-bold text-green-600 dark:text-green-400">{passedTests}</Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {lang === 'en' ? 'Passed' : 'उत्तीर्ण परीक्षा'}
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
