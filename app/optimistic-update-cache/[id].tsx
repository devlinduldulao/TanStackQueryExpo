import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, Link, Stack } from 'expo-router';
import movieService from '@/services/movie';
import { Movie } from '@/models';

export default function MovieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const movieQuery = useQuery<Movie, Error>({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovieById(id),
    enabled: Number(id) > 0, // Only fetch if ID is valid
  });

  if (movieQuery.status === 'pending') {
    return (
      <View className="flex-1 items-center justify-center bg-expo-navy p-4">
        <Text className="text-expo-white">
          Loading. Please wait. <Text className="text-expo-yellow">(one-time only)</Text>
        </Text>
      </View>
    );
  }

  if (movieQuery.status === 'error') {
    return (
      <View className="flex-1 items-center justify-center bg-expo-navy p-4">
        <Text className="text-red-400">Error: {movieQuery.error.message}</Text>
      </View>
    );
  }

  const movie = movieQuery.data;

  if (!movie) {
    return null;
  }

  return (
    <View className="flex-1 bg-expo-navy p-4">
      <Stack.Screen
        options={{
          title: `Movie ${movie.title}`,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <View className="flex-row items-start gap-6">
        <Image source={{ uri: movie.imageUrl }} className="h-[300px] w-[200px]" alt={movie.title} />
        <View className="flex-1 flex-wrap justify-start">
          <View className="flex-wrap gap-10">
            <Link href={{ pathname: '/optimistic-update-cache/[id]', params: { id: movie.id } }}>
              <Text className="text-lg font-bold text-expo-white">
                {movie.title} ({movie.year})
              </Text>
            </Link>
          </View>
          <View>
            <Text className="text-expo-yellow">rating: {movie.rate}/10</Text>
          </View>
          <View>
            <Text className="text-expo-gray-50">{movie.description}</Text>
          </View>
          <View>
            <Text className="text-expo-gray-50">Director: {movie.director}</Text>
          </View>
          <View>
            <Text className="text-expo-gray-50">Duration: {movie.duration}</Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex items-center justify-center">
        {movieQuery.isFetching && (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#4630EB" />
            <Text className="ml-2 text-expo-white">Fetching in the background</Text>
          </View>
        )}
      </View>
    </View>
  );
}
