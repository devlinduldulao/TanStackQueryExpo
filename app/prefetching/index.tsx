import { View, Text } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Stack } from 'expo-router';
import reportService from '@/services/report';
import { Report } from '@/models';
import { LegendList } from '@legendapp/list';

export default function ReportsScreen() {
  // injectQuery in Angular, createQuery in Svelte
  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.getReports(),
    staleTime: Infinity, // Reports won't be considered stale
    gcTime: Infinity, // Reports won't be garbage collected
  });

  const queryClient = useQueryClient();

  const handlePreFetch = async (reportId: string) => {
    /* When you know or suspect that a certain piece of data will be needed,
  you can use prefetching to populate the cache ahead of time,
  leading to a faster experience for the user. */
    await queryClient.prefetchQuery({
      queryKey: ['report', reportId],
      queryFn: () => reportService.getReportById(reportId),
      staleTime: Infinity,
      gcTime: Infinity,
    });
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <Link
      href={{
        pathname: '/prefetching/[id]',
        params: { id: item.id },
      }}
      onLayout={() => {
        if (Number(item.id) < 15) handlePreFetch(item.id);
      }}
      className="border-b border-gray-200 py-3">
      <Text className="text-lg text-blue-700">{item.title}</Text>
    </Link>
  );

  return (
    <View className="flex-1 p-4">
      <Stack.Screen
        options={{
          title: 'Reports',
        }}
      />

      {reportsQuery.isPending && <Text>Loading reports...</Text>}

      {reportsQuery.isError && (
        <Text className="text-red-500">Error loading reports: {reportsQuery.error?.message}</Text>
      )}

      {reportsQuery.data && (
        <LegendList
          data={reportsQuery.data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReportItem}
          className="w-full"
        />
      )}
    </View>
  );
}
