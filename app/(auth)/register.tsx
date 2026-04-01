import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validates at least 8 chars, 1 uppercase, 1 number, 1 symbol
  const isStrongPassword = (pass: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(pass);
  };

  const handleRegister = async () => {
    if (!username || !email || !password) return Alert.alert('Error', 'Please fill all required fields');
    
    if (!isStrongPassword(password)) {
      return Alert.alert(
        'Weak Password', 
        'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol.'
      );
    }
    try {
      // Firebase standard registration (Username typically stored in Firestore separately, skipping for now)
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  const handleGoogleSignup = () => {
    Alert.alert('Google Auth', 'Google Auth logic belongs here once setup is complete in Firebase Console.');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-8 pt-6" keyboardShouldPersistTaps="handled">
          
          {/* Header */}
          <View className="mb-8 items-center">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              Join us to track your driving license progress
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Password</Text>
              <View className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-1 flex-row items-center justify-between">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="flex-1 py-2 text-gray-900 dark:text-white"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                  <FontAwesome 
                    name={showPassword ? "eye" : "eye-slash"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-400 text-xs mt-2 ml-1">Must contain 8+ chars, 1 uppercase, 1 number, & 1 symbol.</Text>
            </View>

            <TouchableOpacity 
              onPress={handleRegister}
              className="w-full bg-blue-600 rounded-xl py-4 items-center shadow-sm"
            >
              <Text className="text-white font-bold text-lg">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <Text className="mx-4 text-gray-400 font-medium">OR</Text>
            <View className="flex-1 h-[1px] bg-gray-200 dark:bg-zinc-700" />
          </View>

          {/* Google Auth Button */}
          <TouchableOpacity 
            onPress={handleGoogleSignup}
            className="w-full flex-row items-center justify-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl py-4 mb-8"
          >
            <FontAwesome name="google" size={20} color="#DB4437" />
            <Text className="ml-3 text-gray-700 dark:text-gray-200 font-bold text-lg">
              Sign up with Google
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row justify-center pb-8">
            <Text className="text-gray-500 dark:text-gray-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-blue-600 dark:text-blue-400 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
