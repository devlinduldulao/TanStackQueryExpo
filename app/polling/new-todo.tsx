import { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { useTodoMutation } from '@/state/server/mutations/todoMutations';

export default function NewTodoScreen() {
  const [todoValue, setTodoValue] = useState('');
  const addTodoMutation = useTodoMutation();

  return (
    <View className="flex-1 bg-expo-navy p-4">
      <Stack.Screen
        options={{
          title: 'Create a new todo',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <View className="space-y-3">
        <TextInput
          className="rounded border border-expo-gray-100 bg-expo-deepNavy p-2 text-expo-white"
          value={todoValue}
          onChangeText={setTodoValue}
          placeholderTextColor="#9e9e9e"
          onEndEditing={() => {
            if (todoValue.trim()) {
              addTodoMutation.mutate(todoValue);
              setTodoValue('');
            }
          }}
          placeholder="Enter todo"
        />
      </View>
    </View>
  );
}
