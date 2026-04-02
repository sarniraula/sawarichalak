import { Stack } from 'expo-router';

export default function ExamLayout() {
  return (
    <Stack>
      <Stack.Screen name="test" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="results" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}
