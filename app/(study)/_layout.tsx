import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function StudyLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen 
        name="[category]" 
        options={{ 
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#09090b' : '#fafafa' },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="px-2">
               <FontAwesome name="chevron-left" size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          )
        }} 
      />
    </Stack>
  );
}
