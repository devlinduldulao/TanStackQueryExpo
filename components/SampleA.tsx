import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { useDedupeQuery } from '@/state/server/queries/dedupeQueries';
import dedupeService from '@/services/dedupe';
import PulsingDot from './PulsingDot';

export default function SampleA() {
  // TanStack Query for deduplication
  const myQuery = useDedupeQuery();

  useEffect(() => {
    const fetchUsers = async () => {
      await dedupeService.getUsers();
    };
    fetchUsers();
  }, []);

  return (
    <View className="p-4">
      <View className="flex-row items-center rounded-xl bg-expo-deepNavy p-4">
        <Text className="mb-2 text-xl font-bold text-expo-white">Sample-A Component</Text>
        {myQuery.status === 'pending' && <PulsingDot />}
      </View>
    </View>
  );
}
