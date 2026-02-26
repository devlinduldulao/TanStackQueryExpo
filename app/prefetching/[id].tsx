import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, Stack } from 'expo-router';
import reportService from '@/services/report';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const reportQuery = useQuery({
    queryKey: ["report", id],
    queryFn: () => reportService.getReportById(id),
    enabled: Number(id) > 0, // Only fetch if ID is valid
  });

  return (
    <View className="flex-1 p-4">
      <Stack.Screen
        options={{
          title: `Report ${id}`,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      {reportQuery.isPending && (
        <Text className="text-base">
          Loading. Please wait. <Text className="text-pink-700">(one-time only)</Text>
        </Text>
      )}

      {reportQuery.isError && (
        <Text className="text-red-400">Error: {reportQuery.error?.message}</Text>
      )}

      {reportQuery.data && (
        <View className="flex flex-row items-start gap-6">
          <View className="flex flex-col flex-wrap justify-start">
            <View className="flex flex-wrap gap-10">
              <Text>{JSON.stringify(reportQuery.data, null, 2)}</Text>
            </View>
          </View>
        </View>
      )}

      <View className="mt-4 items-center justify-center">
        {reportQuery.isFetching && !reportQuery.isPending && (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#4630EB" />
            <Text className="ml-2 text-indigo-700">Fetching in the background</Text>
          </View>
        )}
      </View>
    </View>
  );
}
