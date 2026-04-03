import { auth, storage } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { useExamStore } from '@/store/examStore';
import { useProfileStore } from '@/store/profileStore';
import { useRegionStore, type CanadaRegionKey } from '@/store/regionStore';
import { useThemeStore } from '@/store/themeStore';
import type { CountryKey, LicenseType } from '@/types/content';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore();
  const { history, lang, setLanguage } = useExamStore();
  const { profile, initialized, loadProfile, setCountry, setLicenseType } = useProfileStore();
  const { themePreference, setThemePreference } = useThemeStore();
  const { canadaRegionKey, setCanadaRegionKey } = useRegionStore();
  const language = lang;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [updatingPrefs, setUpdatingPrefs] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  useEffect(() => {
    if (!profile) loadProfile().catch(() => {});
  }, [profile, loadProfile]);

  const isBusyText = useMemo(() => {
    return profile ? `${profile.country} • ${profile.licenseType}` : '';
  }, [profile]);

  // Statistics calculations
  const totalExams = history.length;
  const passedExams = history.filter(h => h.passed).length;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      let photoURL = user?.photoURL || '';

      // If a new image was selected, upload it
      if (selectedImage && selectedImage !== user?.photoURL) {
        const uid = auth.currentUser.uid;
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        // Store under a user-owned folder so Storage Rules can be strict.
        const imageRef = ref(storage, `profiles/${uid}/avatar.jpg`);
        await uploadBytes(imageRef, blob);
        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL,
      });

      updateUser({ displayName, photoURL });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() }
    ]);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'local' : 'en');
  };

  const handleCountryPress = async (next: CountryKey) => {
    try {
      setUpdatingPrefs(true);
      await setCountry(next);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update country.');
    } finally {
      setUpdatingPrefs(false);
    }
  };

  const handleLicensePress = async (next: LicenseType) => {
    try {
      setUpdatingPrefs(true);
      await setLicenseType(next);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update license type.');
    } finally {
      setUpdatingPrefs(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header Section */}
          <View className="px-6 pt-8 pb-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Profile</Text>
              <TouchableOpacity onPress={handleLogout} className="p-2 rounded-full bg-red-50 dark:bg-red-950/30">
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View className="items-center">
              <TouchableOpacity onPress={handlePickImage} className="relative rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-800 shadow-lg" style={{ elevation: 8 }}>
                <Image
                  source={{ uri: selectedImage || user?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                  style={{ width: 120, height: 120 }}
                  contentFit="cover"
                />
                <View className="absolute bottom-0 w-full bg-black/50 py-1.5 items-center">
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-4">{user?.displayName || 'User'}</Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{user?.email}</Text>
            </View>
          </View>

          <View className="px-6 mt-6 space-y-6">

            {/* Statistics Section */}
            <View>
              <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider ml-1">Your Progress</Text>
              <View className="flex-row gap-4">
                <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 items-center justify-center mb-2">
                    <Ionicons name="document-text" size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalExams}</Text>
                  <Text className="text-xs text-zinc-500 dark:text-zinc-400 text-center">Tests Taken</Text>
                </View>

                <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm items-center">
                  <View className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/30 items-center justify-center mb-2">
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  </View>
                  <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{passRate}%</Text>
                  <Text className="text-xs text-zinc-500 dark:text-zinc-400 text-center">Pass Rate</Text>
                </View>
              </View>
            </View>

            {/* Personal Info Section */}
            <View>
              <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider ml-1 mt-6">Personal Details</Text>
              <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <View className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex-row items-center">
                  <Ionicons name="mail-outline" size={20} color="#6b7280" className="mr-3" />
                  <View className="ml-3 flex-1">
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Email</Text>
                    <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</Text>
                  </View>
                </View>

                <View className="p-4 flex-row items-center">
                  <Ionicons name="person-outline" size={20} color="#6b7280" className="mr-3" />
                  <View className="ml-3 flex-1">
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Display Name</Text>
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Enter your name"
                      placeholderTextColor="#9ca3af"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100 py-2 border-b border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={saveProfile}
                disabled={loading}
                className="mt-4 bg-zinc-900 dark:bg-white rounded-xl py-3.5 flex-row justify-center items-center shadow-lg shadow-zinc-900/20"
              >
                {loading ? (
                  <ActivityIndicator color={Platform.OS === 'ios' ? 'white' : 'black'} />
                ) : (
                  <Text className="text-white dark:text-zinc-900 font-bold text-sm tracking-wide">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* App Settings Section */}
            <View>
              <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider ml-1 mt-6">App Settings</Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 ml-1">
                {profile ? isBusyText : initialized ? 'Profile unavailable.' : 'Loading...'}
              </Text>

              {!profile ? (
                <TouchableOpacity
                  onPress={() => loadProfile().catch(() => {})}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 items-center"
                >
                  <Text className="text-blue-600 font-bold">{initialized ? 'Retry load profile' : 'Loading profile...'}</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">Country</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {COUNTRY_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.key}
                          disabled={updatingPrefs}
                          onPress={() => handleCountryPress(opt.key)}
                          className={`px-4 py-2 rounded-xl border ${
                            profile.country === opt.key
                              ? 'bg-blue-600 border-blue-700'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/50'
                          }`}
                        >
                          <Text
                            className={
                              profile.country === opt.key ? 'text-white font-bold' : 'text-zinc-800 dark:text-zinc-100 font-bold'
                            }
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">License type</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {LICENSE_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.key}
                          disabled={updatingPrefs}
                          onPress={() => handleLicensePress(opt.key)}
                          className={`px-4 py-2 rounded-xl border ${
                            profile.licenseType === opt.key
                              ? 'bg-purple-600 border-purple-700'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/50'
                          }`}
                        >
                          <Text
                            className={
                              profile.licenseType === opt.key ? 'text-white font-bold' : 'text-zinc-800 dark:text-zinc-100 font-bold'
                            }
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {profile.country === 'canada' && (
                    <View className="mb-4">
                      <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">Province variant</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {(['ON', 'BC', 'QC'] as CanadaRegionKey[]).map((key) => (
                          <TouchableOpacity
                            key={key}
                            disabled={updatingPrefs}
                            onPress={() => setCanadaRegionKey(key)}
                            className={`px-4 py-2 rounded-xl border ${
                              canadaRegionKey === key
                                ? 'bg-emerald-600 border-emerald-700'
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/50'
                            }`}
                          >
                            <Text
                              className={
                                canadaRegionKey === key ? 'text-white font-bold' : 'text-zinc-800 dark:text-zinc-100 font-bold'
                              }
                            >
                              {key}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-4">
                    <TouchableOpacity
                      onPress={toggleLanguage}
                      className="p-4 flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="language-outline" size={20} color="#6b7280" />
                        <Text className="ml-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">Language</Text>
                      </View>
                      <View className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                        <Text className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {language === 'en' ? 'English' : 'Nepali'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View className="p-4">
                      <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Appearance</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {(['system', 'light', 'dark'] as const).map((mode) => (
                          <TouchableOpacity
                            key={mode}
                            onPress={() => setThemePreference(mode)}
                            className={`px-4 py-2 rounded-xl border ${
                              themePreference === mode
                                ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white'
                                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            <Text
                              className={`font-bold capitalize ${
                                themePreference === mode ? 'text-white dark:text-zinc-900' : 'text-zinc-800 dark:text-zinc-100'
                              }`}
                            >
                              {mode}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
