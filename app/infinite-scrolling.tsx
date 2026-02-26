import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewabilityConfig,
  ViewToken,
} from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import commodityService from '@/services/commodity';
import { Commodity } from '@/models';
import { useIsFocused } from '@react-navigation/native';

export default function InfiniteScrollingScreen() {
  const ITEMS_PER_PAGE = 7;
  const flatListRef = useRef<FlatList>(null);

  // To track the last visible item before pagination
  const [lastVisibleItemId, setLastVisibleItemId] = useState<string | null>(null);

  // Flag to prevent multiple pagination calls
  const isLoadingMoreRef = useRef(false);

  // Get screen dimensions for item sizing
  const screenHeight = Dimensions.get('window').height;
  const itemHeight = screenHeight / 4.5;

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    status,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['commodities'],
    queryFn: async ({ pageParam }) => {
      return await commodityService.getCommodities(pageParam, ITEMS_PER_PAGE);
    },
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => firstPage.prev ?? undefined,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    maxPages: 3, // Limiting to 3 pages for memory efficiency
    refetchOnMount: 'always',
    subscribed: useIsFocused(),
  });

  // Extract all items from all pages
  const allItems = data?.pages.flatMap((page) => page.data) || [];

  // Handle manual loading of previous items with better position management
  const handleLoadPrevious = useCallback(() => {
    if (hasPreviousPage && !isFetchingPreviousPage && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;

      // If we have items, remember the first one to maintain position
      if (allItems.length > 0) {
        setLastVisibleItemId(allItems[0].id);
      }

      fetchPreviousPage().finally(() => {
        isLoadingMoreRef.current = false;
      });
    }
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage, allItems]);

  // Load more when reaching the bottom
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;

      // Remember the last item currently in view to maintain position
      if (allItems.length > 0) {
        // Get the last visible item's id from viewability callback
        const lastIdx = allItems.length - 1;
        setLastVisibleItemId(allItems[lastIdx].id);
      }

      fetchNextPage().finally(() => {
        isLoadingMoreRef.current = false;
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, allItems]);

  // Restore scroll position after data loads
  useEffect(() => {
    if (
      !isFetchingNextPage &&
      !isFetchingPreviousPage &&
      lastVisibleItemId &&
      flatListRef.current
    ) {
      // Find the index of the remembered item
      const itemIndex = allItems.findIndex((item) => item.id === lastVisibleItemId);

      if (itemIndex !== -1) {
        // Small delay to ensure rendering is complete
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: itemIndex,
            animated: false,
            viewPosition: 0.5, // Position in middle of viewport
          });
          setLastVisibleItemId(null); // Reset after restoring position
        }, 50);
      }
    }
  }, [isFetchingNextPage, isFetchingPreviousPage, lastVisibleItemId, allItems]);

  // Handle viewability tracking with proper types
  const handleViewableItemsChanged = useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      if (info.viewableItems && info.viewableItems.length > 0) {
        // Track visible items if needed
        const visibleItem = info.viewableItems[0].item as Commodity;
        if (visibleItem && visibleItem.id) {
          // We can use this to update current visible item if needed
        }
      }
    },
    []
  );

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
  });

  // Handle scroll failure gracefully
  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number }) => {
      console.log('Scroll to index failed:', info);
      // Try again with a delay and adjusted index
      setTimeout(() => {
        if (flatListRef.current && allItems.length > 0) {
          const fallbackIndex = Math.min(info.index, allItems.length - 1);
          flatListRef.current.scrollToIndex({
            index: Math.max(0, fallbackIndex),
            animated: false,
          });
        }
      }, 100);
    },
    [allItems]
  );

  // Item renderer
  const renderItem = ({ item }: { item: Commodity }) => (
    <View
      className="mx-3 mb-4 overflow-hidden rounded-xl bg-expo-deepNavy p-4 shadow-md"
      style={{
        height: itemHeight,
        shadowColor: '#4630EB',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
      }}>
      <Text className="mb-2 text-2xl font-bold text-expo-orange">{item.name}</Text>

      <View className="flex-1 justify-between">
        <View className="flex-row justify-between">
          <View className="w-[48%] rounded-lg bg-expo-blue/20 p-3">
            <Text className="text-center font-medium text-expo-blue">
              Price: ${item.price.toFixed(2)}
            </Text>
          </View>

          <View className="w-[48%] rounded-lg bg-expo-yellow/20 p-3">
            <Text className="text-center font-medium text-expo-yellow">
              Quantity: {item.quantity}
            </Text>
          </View>
        </View>

        <View className="mt-2 rounded-lg bg-expo-navy/60 p-2">
          <Text className="text-center text-expo-white">ID: {item.id}</Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View className="py-4">
      <Text className="mb-4 text-center text-sm text-expo-blue">In Stocks</Text>

      {isFetchingPreviousPage ? (
        <View className="items-center p-3">
          <ActivityIndicator size="small" color="#4630EB" />
          <Text className="mt-2 text-expo-orange">Loading previous items...</Text>
        </View>
      ) : (
        !hasPreviousPage && (
          <View className="items-center p-3">
            <Text className="text-expo-white">You're at the beginning 🎉</Text>
          </View>
        )
      )}
    </View>
  );

  const renderFooter = () => (
    <View className="py-4">
      {isFetchingNextPage ? (
        <View className="items-center p-3">
          <ActivityIndicator size="small" color="#4630EB" />
          <Text className="mt-2 text-expo-orange">Loading more items...</Text>
        </View>
      ) : hasNextPage ? (
        <View className="items-center p-3">
          <Text className="font-semibold text-expo-blue">Scroll to load more</Text>
        </View>
      ) : (
        <View className="items-center p-3">
          <Text className="text-expo-white">You've reached the end 🏁</Text>
        </View>
      )}
    </View>
  );

  if (status === 'pending') {
    return (
      <View className="flex-1 items-center justify-center bg-expo-navy">
        <ActivityIndicator size="large" color="#4630EB" />
        <Text className="mt-4 font-medium text-expo-orange">Loading... Please wait...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className="flex-1 items-center justify-center bg-expo-navy p-4">
        <Text className="mb-3 text-xl text-red-400">Error loading data</Text>
        <Text className="mb-6 text-center text-red-300">
          {(error as Error)?.message || 'Unknown error'}
        </Text>
        <TouchableOpacity
          className="rounded-lg bg-expo-orange px-6 py-3"
          onPress={() => refetch()}>
          <Text className="text-center font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-expo-navy">
      <FlatList
        ref={flatListRef}
        data={allItems}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        onStartReached={handleLoadPrevious}
        onStartReachedThreshold={0.3}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingVertical: 10 }}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={false}
      />
    </View>
  );
}
