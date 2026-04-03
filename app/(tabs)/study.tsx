import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useExamStore } from '@/store/examStore';
import { useProfileStore } from '@/store/profileStore';
import { loadCountryContent } from '@/services/countryContent';
import type { Category } from '@/types/content';

export default function StudyScreen() {
  const router = useRouter();
  const { lang, setLanguage } = useExamStore();
  const language = lang;
  const { profile } = useProfileStore();

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!profile) return;
      const content = await loadCountryContent(profile.country);
      if (cancelled) return;
      setCategories(content.categories);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'local' : 'en');
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-10">
        
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {language === 'en' ? 'Study Materials' : 'अध्ययन सामग्री'}
          </Text>
          <TouchableOpacity 
            onPress={toggleLanguage}
            className="bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-full"
          >
            <Text className="text-zinc-800 dark:text-zinc-200 font-bold uppercase">{language}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-zinc-500 dark:text-zinc-400 mb-6 text-base font-medium">
          {language === 'en' 
            ? 'Select a category to start preparing for your exam.'
            : 'आफ्नो परीक्षाको तयारी सुरु गर्न एउटा वर्ग छान्नुहोस्।'}
        </Text>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => router.push('/(study)/Bookmarks')}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800/50 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-purple-500">
                <FontAwesome name="bookmark" size={20} color="white" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {language === 'en' ? 'Bookmarks' : 'बुकमार्कहरू'}
                </Text>
                <Text className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
                  {language === 'en' ? 'Saved questions' : 'सेभ गरिएका प्रश्नहरू'}
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          {categories.map((cat) => {
            const colorClass =
              cat.id === 'traffic-rules'
                ? 'bg-red-500'
                : cat.id === 'road-signs'
                  ? 'bg-yellow-500'
                  : cat.id === 'safety'
                    ? 'bg-green-500'
                    : 'bg-blue-500';

            const iconName =
              cat.id === 'traffic-rules'
                ? 'road'
                : cat.id === 'road-signs'
                  ? 'warning'
                  : cat.id === 'safety'
                    ? 'shield'
                    : 'car';

            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => router.push(`/(study)/${cat.id}`)}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800/50 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${colorClass}`}>
                    <FontAwesome name={iconName as any} size={20} color="white" />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                      {language === 'en' ? cat.title.en : cat.title.local}
                    </Text>
                    <Text className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
                      {language === 'en' ? cat.title.local : cat.title.en}
                    </Text>
                  </View>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
