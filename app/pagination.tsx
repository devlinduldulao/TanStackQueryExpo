import { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { LegendList } from '@legendapp/list/react-native';
import { cssInterop } from 'nativewind';

cssInterop(LegendList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import commodityService from '@/services/commodity';
import PulsingDot from '@/components/PulsingDot';
import { Commodity } from '@/models';
export default function PaginationScreen() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isRefetching, isFetching, isError, error } = useQuery({
    queryKey: ['commodities', page, pageSize],
    queryFn: () => commodityService.getCommodities(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  const handleSetPage = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
  };

  const renderItem = ({ item }: { item: Commodity }) => (
    <View className="mb-3 overflow-hidden rounded-lg bg-expo-deepNavy p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-expo-orange">{item.name}</Text>
        <View className="rounded-full bg-expo-blue/20 px-2 py-1">
          <Text className="text-xs font-medium text-expo-blue">ID: {item.id}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="rounded-md bg-expo-yellow/20 px-3 py-1">
          <Text className="text-expo-yellow">${item.price.toFixed(2)}</Text>
        </View>
        <View className="rounded-md bg-expo-blue/20 px-3 py-1">
          <Text className="text-expo-blue">Quantity: {item.quantity}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-10">
      <MaterialCommunityIcons name="tray" size={48} color="#4630EB" />
      <Text className="mt-4 text-center text-expo-white">No items to display</Text>
    </View>
  );

  const renderPagination = () => (
    <View className="mb-6 mt-4 flex-row items-center justify-between">
      <TouchableOpacity
        className="flex-row items-center rounded-lg bg-expo-orange px-4 py-2"
        onPress={() => handleSetPage(page - 1)}
        disabled={page === 1 || isFetching}>
        {!(page === 1 || isFetching) && <Octicons name="chevron-left" size={16} color="#ffffff" />}
        <Text className="ml-1 text-white">Previous</Text>
      </TouchableOpacity>

      <View className="items-center">
        <Text className="text-base font-medium text-expo-white">
          Page {page} {data?.next ? 'of many' : ''}
        </Text>
        <Text className="text-sm text-expo-blue">Showing {data?.data.length || 0} items</Text>
      </View>

      <TouchableOpacity
        className="flex-row items-center rounded-lg bg-expo-orange px-4 py-2"
        onPress={() => handleSetPage(page + 1)}
        disabled={!data?.next || isFetching}>
        <Text className="mr-1 text-white">Next</Text>
        {!(!data?.next || isFetching) && (
          <Octicons name="chevron-right" size={16} color="#ffffff" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-expo-navy p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-expo-white">Page {page}</Text>
        {(isFetching || isRefetching) && <PulsingDot />}
      </View>

      {isError && (
        <View className="mb-4 rounded-lg bg-red-900/30 p-3">
          <Text className="text-red-400">
            Error: {error instanceof Error ? error.message : 'Failed to load data'}
          </Text>
        </View>
      )}

      <LegendList
        data={data?.data || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmptyState()}
        // @ts-expect-error - className is added by cssInterop
        className="w-full flex-1"
        contentContainerClassName="pb-4"
      />

      {renderPagination()}
    </View>
  );
}
