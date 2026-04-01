import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/authStore';
import { updateProfile } from 'firebase/auth';
import { auth, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        // Fetch the file from the uri
        const response = await fetch(selectedImage);
        const blob = await response.blob();

        // Create a reference in Firebase Storage
        const imageRef = ref(storage, `profiles/${user?.uid}`);
        await uploadBytes(imageRef, blob);

        // Get the download URL
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

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-10">Profile</Text>

        <View className="items-center mb-10">
          <TouchableOpacity onPress={handlePickImage} className="relative rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-xl" style={{ elevation: 10 }}>
            <Image
              source={{ uri: selectedImage || user?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
              style={{ width: 140, height: 140 }}
              contentFit="cover"
            />
            <View className="absolute bottom-0 w-full bg-black/60 py-2 items-center pb-3">
              <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Edit</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="space-y-6 mb-10">
          <View>
            <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider ml-1">Email</Text>
            <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
              <Text className="text-base font-medium text-zinc-500 dark:text-zinc-400">{user?.email}</Text>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider ml-1">Display Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              className="text-base font-medium text-zinc-900 dark:text-zinc-100 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm focus:border-blue-500 dark:focus:border-blue-500"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={saveProfile}
          disabled={loading}
          className="bg-blue-600 active:bg-blue-700 rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-blue-600/30 mb-8"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg tracking-wide">Save Changes</Text>
          )}
        </TouchableOpacity>

        <View className="flex-1" />

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl py-4 flex-row justify-center items-center mb-6 active:bg-red-100 dark:active:bg-red-900/40"
        >
          <Text className="text-red-600 dark:text-red-500 font-bold text-base tracking-wide">Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
