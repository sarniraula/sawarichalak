import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import { useExamStore } from '@/store/examStore';
import { useProfileStore } from '@/store/profileStore';
import { loadCountryContent } from '@/services/countryContent';
import type { StudyMaterial } from '@/types/content';

export default function StudyMaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useProfileStore();
  const { lang } = useExamStore();
  const language = lang;

  const [material, setMaterial] = useState<StudyMaterial | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!profile || !id) return;
      const content = await loadCountryContent(profile.country);
      if (cancelled) return;
      const found = content.studyMaterials.find((m) => m.id === id) ?? null;
      setMaterial(found);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [profile, id]);

  const t = (obj: { en: string; local: string }) => (language === 'en' ? obj.en : obj.local);

  if (!material) {
    return (
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center px-6">
        <Stack.Screen options={{ title: language === 'en' ? 'Reading' : 'पढाइ' }} />
        <Text className="text-zinc-500 dark:text-zinc-400 text-center">
          {language === 'en' ? 'Loading or not found…' : 'लोड हुँदै वा भेटिएन…'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ title: t(material.title) }} />
      <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-4">{t(material.title)}</Text>
        {material.image?.url ? (
          <View className="mb-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Image source={{ uri: material.image.url }} style={{ width: '100%', height: 192 }} resizeMode="cover" />
            {material.image.caption && (
              <Text className="text-xs text-zinc-500 dark:text-zinc-400 p-3 bg-zinc-100 dark:bg-zinc-900">
                {t(material.image.caption)}
              </Text>
            )}
          </View>
        ) : null}
        <Text className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200 mb-6">{t(material.body)}</Text>
        {material.keyRules && material.keyRules.length > 0 ? (
          <View>
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
              {language === 'en' ? 'Key points' : 'मुख्य बुँदाहरू'}
            </Text>
            {material.keyRules.map((rule, i) => (
              <View key={i} className="mb-3 pl-3 border-l-4 border-blue-500">
                <Text className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{t(rule)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
