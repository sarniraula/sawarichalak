import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { useExamStore } from '@/store/examStore';
import { useProfileStore } from '@/store/profileStore';
import { loadCountryContent } from '@/services/countryContent';
import type { Category, ReadingLink, StudyMaterial } from '@/types/content';

export default function StudyScreen() {
  const router = useRouter();
  const { lang, setLanguage } = useExamStore();
  const language = lang;
  const { profile } = useProfileStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [readingLinks, setReadingLinks] = useState<ReadingLink[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!profile) return;
      const content = await loadCountryContent(profile.country);
      if (cancelled) return;
      setCategories(content.categories);
      setMaterials(content.studyMaterials);
      setReadingLinks(content.readingLinks ?? []);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'local' : 'en');
  };

  const t = (obj: { en: string; local: string }) => (language === 'en' ? obj.en : obj.local);

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Error', 'Cannot open this link.');
    } catch {
      Alert.alert('Error', 'Cannot open this link.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-10">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {language === 'en' ? 'Study' : 'अध्ययन'}
          </Text>
          <TouchableOpacity onPress={toggleLanguage} className="bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
            <Text className="text-zinc-800 dark:text-zinc-200 font-bold uppercase">{language}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-zinc-500 dark:text-zinc-400 mb-8 text-base font-medium leading-relaxed">
          {language === 'en'
            ? 'Read guides and trusted articles, then practice questions by category.'
            : 'मार्गदर्शन र विश्वसनीय लेख पढ्नुहोस्, अनि वर्गअनुसार प्रश्न अभ्यास गर्नुहोस्।'}
        </Text>

        <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
          {language === 'en' ? 'Reading guides' : 'पढाइ मार्गदर्शन'}
        </Text>
        <View className="space-y-3 mb-10">
          {materials.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => router.push(`/(study)/material/${m.id}`)}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/50 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 pr-3">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-emerald-500">
                  <FontAwesome name="file-text-o" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">{t(m.title)}</Text>
                  <Text className="text-zinc-400 dark:text-zinc-500 text-xs font-medium">{m.categoryId}</Text>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {readingLinks.length > 0 && (
          <>
            <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
              {language === 'en' ? 'Articles & official resources' : 'लेख र आधिकारिक स्रोतहरू'}
            </Text>
            <View className="space-y-3 mb-10">
              {readingLinks.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  onPress={() => openLink(link.url)}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/50"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">{t(link.title)}</Text>
                      {link.description ? (
                        <Text className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{t(link.description)}</Text>
                      ) : null}
                      <Text className="text-blue-600 dark:text-blue-400 text-xs mt-2" numberOfLines={1}>
                        {link.url}
                      </Text>
                    </View>
                    <FontAwesome name="external-link" size={18} color="#3b82f6" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
          {language === 'en' ? 'Question bank' : 'प्रश्न बैंक'}
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(study)/Bookmarks')}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800/50 flex-row items-center justify-between mb-4"
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

        <View className="space-y-4 pb-8">
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
              cat.id === 'traffic-rules' ? 'road' : cat.id === 'road-signs' ? 'warning' : cat.id === 'safety' ? 'shield' : 'car';

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
                    <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{t(cat.title)}</Text>
                    <Text className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
                      {language === 'en' ? 'Practice questions' : 'अभ्यास प्रश्नहरू'}
                    </Text>
                  </View>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
