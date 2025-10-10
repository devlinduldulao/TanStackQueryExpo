import { Text, View } from 'react-native';
import { useEffect } from 'react';
import SampleA from '@/components/SampleA';
import SampleB from '@/components/SampleB';
import Spinner from '@/components/Spinner';
import { useDedupeQuery } from '@/state/server/queries/dedupeQueries';
import dedupeService from '@/services/dedupe';

export default function DedupingScreen() {
  // Reusable query - TanStack Query handles deduplication automatically
  const myQuery = useDedupeQuery();

  useEffect(() => {
    const fetchUsers = async () => {
      await dedupeService.getUsers();
    };
    fetchUsers();
  }, []);

  return (
    <View className="flex-1">
      <View className="flex-row items-center p-4">
        <Text className="text-xl font-bold">HTTP Requests in Screen</Text>
        {myQuery.status === 'pending' && <Spinner />}
        {myQuery.isSuccess && <Text className="ml-4 text-3xl">🇮🇹</Text>}
      </View>
      <SampleA />
      <SampleB />
    </View>
  );
}
