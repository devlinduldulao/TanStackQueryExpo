import { View, Text } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Stack } from 'expo-router';
import reportService from '@/services/report';
import { Report } from '@/models';
import { LegendList } from '@legendapp/list/react-native';
import { cssInterop } from 'nativewind';

cssInterop(LegendList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

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
      className="border-b border-expo-gray-50 py-3">
      <Text className="text-lg text-expo-white">{item.title}</Text>
    </Link>
  );

  return (
    <View className="flex-1 bg-expo-navy p-4">
      <Stack.Screen
        options={{
          title: 'Reports',
        }}
      />

      {reportsQuery.isPending && <Text className="text-expo-gray-50">Loading reports...</Text>}

      {reportsQuery.isError && (
        <Text className="text-red-400">Error loading reports: {reportsQuery.error?.message}</Text>
      )}

      {reportsQuery.data && (
        <LegendList
          data={reportsQuery.data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReportItem}
          // @ts-expect-error - className is added by cssInterop
          className="w-full"
        />
      )}
    </View>
  );
}
