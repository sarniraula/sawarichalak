import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { useProfileStore } from '@/store/profileStore';
import { useQuizStore } from '@/store/quizStore';
import { loadCountryContent } from '@/services/countryContent';
import type { Category } from '@/types/content';

export default function PracticeTabScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { session, startPractice } = useQuizStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!profile) return;
      setLoading(true);
      const content = await loadCountryContent(profile.country);
      if (cancelled) return;
      setCategories(content.categories);
      setLoading(false);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const canResume =
    session && !session.isFinished && session.country === profile?.country && session.licenseType === profile?.licenseType;

  const start = async (categoryId?: string) => {
    if (!profile) return;
    setLoading(true);
    try {
      await startPractice({
        country: profile.country,
        licenseType: profile.licenseType,
        categoryId,
      });
      router.push('/(quiz)/session');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
        <ActivityIndicator />
        <Text className="text-zinc-500 dark:text-zinc-400 mt-2">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-10 pb-10">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Practice</Text>
            <Text className="text-zinc-500 dark:text-zinc-400 mt-2">
              {profile.country[0].toUpperCase()}
              {profile.country.slice(1)} • {profile.licenseType}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={!canResume || loading}
          onPress={() => router.push('/(quiz)/session')}
          className={`mb-6 rounded-2xl p-5 border ${
            canResume ? 'bg-blue-600 border-blue-700' : 'bg-blue-200 dark:bg-blue-950 border-blue-200 opacity-60'
          }`}
        >
          <Text className={`text-white font-bold ${canResume ? '' : 'text-zinc-600 dark:text-zinc-300'}`}>Resume</Text>
          <Text className="text-blue-100 mt-1">Instant feedback MCQ</Text>
        </TouchableOpacity>

        <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
          Start a practice set
        </Text>

        <View className="space-y-4">
          <TouchableOpacity
            disabled={loading}
            onPress={() => start(undefined)}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800/50 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-indigo-500">
                <FontAwesome name="list-ul" size={20} color="white" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">All Categories</Text>
                <Text className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">Shuffle and practice</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          {loading && categories.length === 0 ? (
            <View className="items-center mt-10">
              <ActivityIndicator />
            </View>
          ) : (
            categories.map((cat) => {
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
                  disabled={loading}
                  onPress={() => start(cat.id)}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800/50 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${colorClass}`}>
                      <FontAwesome name={iconName as any} size={20} color="white" />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{cat.title.en}</Text>
                      <Text className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">Practice questions</Text>
                    </View>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

