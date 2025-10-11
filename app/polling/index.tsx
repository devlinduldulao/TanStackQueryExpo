import { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/utilities/style';
import todoService from '@/services/todo';
import { LegendList } from '@legendapp/list';

export default function PollingScreen() {
  const [intervalMs, setIntervalMs] = useState(10000);
  const [inputValue, setInputValue] = useState(String(10000));
  const [isValidInput, setIsValidInput] = useState(true);

  const todoListQuery = useQuery({
    queryKey: ['todos'],
    queryFn: todoService.getTodos,
    refetchInterval: Number(inputValue),
  });

  const handleIntervalChange = (value: string) => {
    setInputValue(value);
    const newValue = Number(value);

    if (!isNaN(newValue) && newValue >= 1000 && newValue <= 10000) {
      setIntervalMs(newValue);
      setIsValidInput(true);
    } else {
      setIsValidInput(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Stack.Screen
        options={{
          title: 'List of To Dos',
        }}
      />
      <Text className="mb-4 text-lg font-bold">
        Auto Refetch with polling interval set to {intervalMs} ms
      </Text>

      <View className="mb-5 flex-row items-center">
        <Text className="mr-2">Query Interval speed (ms):</Text>
        <TextInput
          value={inputValue}
          onChangeText={handleIntervalChange}
          keyboardType="numeric"
          className={`border ${isValidInput ? 'bg-white' : 'bg-red-200'} w-20 rounded border-gray-300 px-2 py-1 text-black`}
        />
      </View>

      {!isValidInput && (
        <Text className="mb-2 text-xs text-red-500">Enter a value between 1000-10000 ms</Text>
      )}

      <View
        className={cn(
          'mb-2 ml-2.5 h-2.5 w-2.5 rounded-full',
          todoListQuery.isFetching ? 'bg-green-500' : 'bg-transparent'
        )}
      />

      <Text className="mb-4 mt-2 text-lg font-bold">Todo List</Text>

      <LegendList
        data={todoListQuery?.data || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <Text className="py-1">
            {index + 1}. {item.title}
          </Text>
        )}
      />

      {/* Floating Action Button */}
      <Link href="/polling/new-todo" asChild>
        <TouchableOpacity
          className="elevation-5 absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}>
          <AntDesign name="plus-circle" size={24} color="white" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}
