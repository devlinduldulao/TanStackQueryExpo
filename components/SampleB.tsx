import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { useDedupeQuery } from '@/state/server/queries/dedupeQueries';
import dedupeService from '@/services/dedupe';
import PulsingDot from './PulsingDot';

export default function SampleB() {
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
      <View className="flex-row items-center p-4">
        <Text className="mb-2 text-xl font-bold">Sample-B Component</Text>
        {myQuery.status === 'pending' && <PulsingDot />}
      </View>
    </View>
  );
}
