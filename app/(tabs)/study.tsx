import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useExamStore } from '@/store/examStore';

const CATEGORIES = [
  { id: 'Traffic Rules', titleEn: 'Traffic Rules', titleNp: 'ट्राफिक नियम', icon: 'traffic-light', color: 'bg-red-500' },
  { id: 'Technical', titleEn: 'Technical', titleNp: 'प्राविधिक', icon: 'cogs', color: 'bg-blue-500' },
  { id: 'Safety', titleEn: 'Safety', titleNp: 'सुरक्षा', icon: 'shield', color: 'bg-green-500' },
  { id: 'Traffic signs', titleEn: 'Traffic Signs', titleNp: 'ट्राफिक संकेत', icon: 'warning', color: 'bg-yellow-500' }
];

export default function StudyScreen() {
  const router = useRouter();
  const { language, setLanguage } = useExamStore();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'np' : 'en');
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
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => router.push(`/(study)/${cat.id}`)}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800/50 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${cat.color}`}>
                  <FontAwesome name={cat.icon as any} size={20} color="white" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    {language === 'en' ? cat.titleEn : cat.titleNp}
                  </Text>
                  <Text className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
                    {language === 'en' ? cat.titleNp : cat.titleEn}
                  </Text>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
