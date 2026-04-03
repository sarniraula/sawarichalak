import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExamStore } from '@/store/examStore';
import { useProfileStore } from '@/store/profileStore';
import { useRegionStore, type CanadaRegionKey } from '@/store/regionStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

import type { CountryKey, LicenseType } from '@/types/content';

const COUNTRY_OPTIONS: { key: CountryKey; label: string }[] = [
  { key: 'nepal', label: 'Nepal' },
  { key: 'uk', label: 'UK' },
  { key: 'canada', label: 'Canada' },
  { key: 'australia', label: 'Australia' },
];

const LICENSE_OPTIONS: { key: LicenseType; label: string }[] = [
  { key: 'Bike', label: 'Bike' },
  { key: 'Car', label: 'Car' },
  { key: 'Heavy Vehicle', label: 'Heavy Vehicle' },
];

export default function SettingsScreen() {
  const { profile, initialized, loadProfile, setCountry, setLicenseType } = useProfileStore();
  const { logout } = useAuthStore();
  const { themePreference, setThemePreference } = useThemeStore();
  const { canadaRegionKey, setCanadaRegionKey } = useRegionStore();

  // Optional: keep language toggle here so users can switch quickly.
  const { lang, setLanguage } = useExamStore();

  const isBusyText = useMemo(() => {
    return profile ? `${profile.country} • ${profile.licenseType}` : '';
  }, [profile]);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!profile) {
      loadProfile().catch(() => {});
    }
  }, [profile, loadProfile]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const toggleDarkMode = () => {
    setThemePreference(themePreference === 'dark' ? 'light' : 'dark');
  };

  const handleCountryPress = async (next: CountryKey) => {
    try {
      setUpdating(true);
      await setCountry(next);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update country.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLicensePress = async (next: LicenseType) => {
    try {
      setUpdating(true);
      await setLicenseType(next);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update license type.');
    } finally {
      setUpdating(false);
    }
  };

  const currentThemeLabel = themePreference === 'system' ? 'System' : themePreference === 'dark' ? 'Dark' : 'Light';

  const languageLabel = lang === 'en' ? 'English' : 'Local';

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-10 pb-10">
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Settings</Text>
          <Text className="text-zinc-500 dark:text-zinc-400 mt-2">{profile ? isBusyText : 'Loading profile...'}</Text>
        </View>

        {!profile ? (
          <View className="items-center mt-20">
            <ActivityIndicator />
            <Text className="text-zinc-500 dark:text-zinc-400 mt-2">
              {initialized ? 'Could not load profile.' : 'Please wait...'}
            </Text>
            {initialized && (
              <TouchableOpacity
                onPress={() => loadProfile().catch(() => {})}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600"
              >
                <Text className="text-white font-bold">Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Country */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Country</Text>
              <View className="flex-row flex-wrap gap-2">
                {COUNTRY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    disabled={updating}
                    onPress={() => handleCountryPress(opt.key)}
                    className={`px-4 py-2 rounded-xl border ${
                      profile.country === opt.key
                        ? 'bg-blue-600 border-blue-700'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/50'
                    }`}
                  >
                    <Text className={profile.country === opt.key ? 'text-white font-bold' : 'text-zinc-800 dark:text-zinc-100 font-bold'}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* License type */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">License Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {LICENSE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    disabled={updating}
                    onPress={() => handleLicensePress(opt.key)}
                    className={`px-4 py-2 rounded-xl border ${
                      profile.licenseType === opt.key
                        ? 'bg-purple-600 border-purple-700'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/50'
                    }`}
                  >
                    <Text className={profile.licenseType === opt.key ? 'text-white font-bold' : 'text-zinc-800 dark:text-zinc-100 font-bold'}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Canada region variant */}
            {profile.country === 'canada' && (
              <View className="mb-6">
                <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Province Variant</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(['ON', 'BC', 'QC'] as CanadaRegionKey[]).map((key) => (
                    <TouchableOpacity
                      key={key}
                      disabled={updating}
                      onPress={() => setCanadaRegionKey(key)}
                      className={`px-4 py-2 rounded-xl border ${
                        canadaRegionKey === key
                          ? 'bg-emerald-600 border-emerald-700'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/50'
                      }`}
                    >
                      <Text className={canadaRegionKey === key ? 'text-white font-bold' : 'text-zinc-800 dark:text-zinc-100 font-bold'}>
                        {key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Language */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Language</Text>
              <TouchableOpacity
                onPress={() => setLanguage(lang === 'en' ? 'local' : 'en')}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-4 flex-row items-center justify-between"
              >
                <Text className="text-zinc-800 dark:text-zinc-100 font-medium">Display</Text>
                <Text className="text-zinc-700 dark:text-zinc-200 font-bold">{languageLabel}</Text>
              </TouchableOpacity>
            </View>

            {/* Theme */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Appearance</Text>
              <TouchableOpacity
                onPress={toggleDarkMode}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-4 flex-row items-center justify-between"
              >
                <Text className="text-zinc-800 dark:text-zinc-100 font-medium">Theme</Text>
                <Text className="text-zinc-700 dark:text-zinc-200 font-bold">{currentThemeLabel}</Text>
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={handleLogout}
                disabled={updating}
                className="bg-red-600 active:bg-red-700 rounded-2xl p-4 flex-row items-center justify-center"
              >
                <Text className="text-white font-bold">{updating ? 'Updating...' : 'Logout'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

