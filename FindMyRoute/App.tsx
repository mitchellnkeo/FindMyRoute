import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold text-blue-600">FindMyRoute</Text>
      <Text className="mt-2">Discover safe running routes in your area</Text>
      <StatusBar style="auto" />
    </View>
  );
}
