/**
 * TanStack Query streamedQuery Demo - Real-time Streaming with AsyncIterable
 *
 * Demonstrates the official experimental_streamedQuery API for React Native.
 *
 * Official API Usage:
 * - streamFn: async generator function that yields data chunks
 * - refetchMode: 'reset' | 'append' | 'replace' (configurable via UI)
 * - automatic reducer & initialValue for array types
 *
 * Key Features:
 * - Real-time streaming using AsyncIterable generators
 * - XMLHttpRequest for React Native streaming compatibility
 * - Interactive refetch mode switching (reset/append/replace)
 * - Server health monitoring and connection status
 * - Clean chat UI with typing indicators
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useQueryClient, queryOptions } from '@tanstack/react-query';
import { experimental_streamedQuery as streamedQuery } from '@tanstack/react-query';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Server configuration
const SERVER_URL = Platform.OS == 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

// Check if streaming server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Sample prompts for quick demo testing
const samplePrompts = [
  { icon: '💻', text: 'Explain React Native architecture', type: 'technical' },
  { icon: '🎨', text: 'Create a story about a coding adventure', type: 'creative' },
  { icon: '🤔', text: 'What makes a great mobile app?', type: 'general' },
  { icon: '🚀', text: 'How does TanStack Query work?', type: 'technical' },
];

// Chat message type
type ChatMessage = {
  id: string;
  type: 'user' | 'assistant';
  content: string | string[];
  timestamp: Date;
  streaming?: boolean;
};

// Main component - demonstrates TanStack Query streamedQuery with real-time streaming
export default function StreamedQueryScreen() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [refetchMode, setRefetchMode] = useState<'reset' | 'append' | 'replace'>('reset');
  const [connectionStatus, setConnectionStatus] = useState<string>('idle');

  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  // Cleanup streaming queries on unmount
  useEffect(() => {
    return () => {
      queryClient.cancelQueries({ queryKey: ['chat-stream'] });
    };
  }, [queryClient]);

  // Monitor server health every 5 seconds
  useEffect(() => {
    const abortController = new AbortController();
    let intervalId: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const isHealthy = await checkServerHealth();
        if (!abortController.signal.aborted) {
          setServerStatus(isHealthy ? 'online' : 'offline');
        }
      } catch (error) {
        console.error('Error checking server health:', error);
        if (!abortController.signal.aborted) {
          setServerStatus('offline');
        }
      }
    };

    checkHealth();
    intervalId = setInterval(checkHealth, 5000);

    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, []);
  /**
   * TanStack Query options using experimental streamedQuery (Official API)
   *
   * This implementation follows the official streamedQuery API from TanStack Query.
   * The streamedQuery helper is wrapped in queryFn as part of queryOptions pattern.
   *
   * Key Streaming Concepts Demonstrated:
   * - AsyncIterable generator functions for progressive data loading
   * - XMLHttpRequest for React Native streaming compatibility (fetch doesn't support streaming)
   * - Real-time chunk processing and yielding for immediate UI updates
   * - Proper error handling and cancellation support via AbortSignal
   * - Multiple refetch modes for different streaming behaviors
   *
   * Official streamedQuery API Options (all implemented here):
   * - streamFn: (context) => Promise<AsyncIterable<TData>> - Main streaming function (REQUIRED)
   * - refetchMode: 'append' | 'reset' | 'replace' - How refetches are handled (default: 'reset')
   * - reducer: (accumulator, chunk) => TData - Custom chunk processing (auto for arrays)
   * - initialValue: TData - Initial data while first chunk loads (auto: empty array)
   *
   * @type {QueryOptions} chatQueryOptions - Configuration for the streaming query
   */
  const chatQueryOptions = queryOptions({
    queryKey: ['chat-stream', currentPrompt],
    queryFn: streamedQuery({
      /**
       * streamFn: Main streaming generator function (REQUIRED)
       *
       * Returns a Promise of an AsyncIterable that yields data chunks progressively.
       * This async generator implements the AsyncIterable pattern required by streamedQuery.
       * Each `yield` statement sends a new chunk to the query cache, allowing real-time UI updates.
       *
       * Implementation Strategy:
       * - Uses XMLHttpRequest for React Native compatibility (fetch lacks streaming support)
       * - Implements polling pattern to yield chunks as they arrive from the server
       * - Handles network errors and query cancellation (via context.signal) gracefully
       * - Optimized delays (50ms) to prevent busy waiting while maintaining responsiveness
       *
       * Data Flow:
       * 1. XHR sends request and receives chunks via onreadystatechange
       * 2. Chunks accumulate in accumulatedChunks array
       * 3. Generator polls for new chunks and yields them individually
       * 4. Query state updates from 'pending' → 'success' after first chunk
       * 5. fetchStatus stays 'fetching' until stream completes
       *
       * @async
       * @generator
       * @function streamFn
       * @param {QueryFunctionContext} context - TanStack Query context with signal for cancellation
       * @yields {string} - Individual text chunks as they arrive from server
       * @throws {Error} - Network errors or cancellation errors (AbortError)
       */
      streamFn: async function* (context) {
        console.log('🚀 Starting streaming for:', currentPrompt);

        try {
          // Streaming implementation using XMLHttpRequest for React Native compatibility
          let accumulatedChunks: string[] = [];
          let lastYieldedIndex = 0;

          /**
           * Promise-based streaming using XMLHttpRequest
           * Required for React Native as fetch doesn't support true streaming
           */
          const streamPromise = new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let lastResponseLength = 0;
            let buffer = '';

            // Configure XMLHttpRequest for streaming
            xhr.open('POST', `${SERVER_URL}/stream-chat`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            /**
             * Handle streaming response data
             * Processes chunks as they arrive from the server
             */
            xhr.onreadystatechange = () => {
              if (
                xhr.readyState === XMLHttpRequest.LOADING ||
                xhr.readyState === XMLHttpRequest.DONE
              ) {
                const currentResponse = xhr.responseText;
                const newData = currentResponse.slice(lastResponseLength);
                lastResponseLength = currentResponse.length;

                if (newData) {
                  buffer += newData;
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || ''; // Keep incomplete line

                  // Process complete JSON lines
                  for (const line of lines) {
                    if (line.trim()) {
                      try {
                        const parsed = JSON.parse(line.trim());
                        if (parsed.chunk) {
                          accumulatedChunks.push(parsed.chunk);
                          console.log('📤 Chunk received:', parsed.chunk.slice(0, 30) + '...');
                        }
                      } catch (e) {
                        // Ignore parsing errors for incomplete lines
                        console.warn('⚠️ JSON parse error:', e);
                      }
                    }
                  }
                }
              }
            };

            xhr.onload = () => {
              console.log('✅ Stream completed, total chunks:', accumulatedChunks.length);
              resolve();
            };

            xhr.onerror = () => reject(new Error('Network error'));

            // Handle query cancellation
            context.signal.addEventListener('abort', () => {
              xhr.abort();
              reject(new Error('Request aborted'));
            });

            // Start the request
            xhr.send(JSON.stringify({ prompt: currentPrompt }));
          });

          /**
           * Generator function to yield new chunks as they become available
           * Implements polling pattern for progressive data yielding
           */
          const pollForNewChunks = function* () {
            while (lastYieldedIndex < accumulatedChunks.length) {
              yield accumulatedChunks[lastYieldedIndex];
              lastYieldedIndex++;
            }
          };

          // Main streaming loop - yield chunks as they arrive
          let streamComplete = false;
          streamPromise
            .then(() => {
              streamComplete = true;
            })
            .catch(() => {
              streamComplete = true;
            });

          while (!streamComplete || lastYieldedIndex < accumulatedChunks.length) {
            yield* pollForNewChunks();
            if (!streamComplete) {
              // Small delay to prevent busy waiting - optimized for mobile performance
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
          }

          // Final poll to catch any remaining chunks
          yield* pollForNewChunks();
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('🛑 Stream aborted by user');
            throw error;
          }
          console.error('❌ Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          yield `❌ Error: ${errorMessage}. Make sure the server is running on ${SERVER_URL}`;
        }
      },
      /**
       * refetchMode: Controls how refetches behave (OPTIONAL, default: 'reset')
       * - 'reset': Clears all data and query goes back to 'pending' state on refetch
       * - 'append': New streamed data is appended to existing data array
       * - 'replace': All data is written to cache only when stream ends (not progressive)
       */
      refetchMode: refetchMode,

      /**
       * reducer & initialValue: Automatic for array types (OPTIONAL)
       *
       * Since TData is string[] (array type), streamedQuery automatically:
       * - reducer: Appends each chunk to the end of the accumulator
       * - initialValue: Uses empty array [] as initial value
       *
       * For custom types (non-array), you must provide:
       * reducer: (accumulator: TData, chunk: TQueryFnData) => TData,
       * initialValue: TData
       *
       * Example for custom reducer:
       * reducer: (accumulator: string[], chunk: string) => [...accumulator, chunk],
       * initialValue: [] as string[]
       */
    }),
    enabled: currentPrompt.length > 0 && serverStatus === 'online',
    staleTime: Infinity, // Don't auto-refetch streaming data
    retry: false, // Don't retry streaming requests
    gcTime: 0, // Don't cache streaming data
  });

  const chatQuery = useQuery(chatQueryOptions);

  // Update chat messages when streaming data changes
  const updateMessages = useCallback((data: string[], prompt: string, isFetching: boolean) => {
    setConnectionStatus(`Received ${data.length} chunks`);
    setMessages((prev) => {
      const messageId = `msg-${prompt}`;
      const existingMessageIndex = prev.findIndex((m) => m.id === messageId);

      if (existingMessageIndex >= 0) {
        const newMessages = [...prev];
        newMessages[existingMessageIndex] = {
          ...newMessages[existingMessageIndex],
          content: data,
          streaming: isFetching,
        };
        return newMessages;
      } else {
        return [
          ...prev,
          {
            id: messageId,
            type: 'assistant' as const,
            content: data,
            timestamp: new Date(),
            streaming: isFetching,
          },
        ];
      }
    });
  }, []);

  // Auto-scroll chat when new data arrives
  useEffect(() => {
    if (chatQuery.data && currentPrompt) {
      updateMessages(chatQuery.data, currentPrompt, chatQuery.fetchStatus === 'fetching');
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [chatQuery.data, chatQuery.fetchStatus, currentPrompt, updateMessages]);

  // Human-readable connection status
  const connectionStatusText = useMemo(() => {
    if (chatQuery.status === 'pending') return 'Connecting...';
    if (chatQuery.fetchStatus === 'fetching') return 'Streaming...';
    if (chatQuery.error) return `Error: ${chatQuery.error.message}`;
    if (chatQuery.data) return `Complete - ${chatQuery.data.length} chunks`;
    return 'idle';
  }, [chatQuery.status, chatQuery.fetchStatus, chatQuery.error, chatQuery.data]);

  useEffect(() => {
    setConnectionStatus(connectionStatusText);
  }, [connectionStatusText]);

  const handleSendMessage = () => {
    if (userInput.trim() && serverStatus === 'online') {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: userInput,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setCurrentPrompt(userInput);
      setUserInput('');
    }
  };

  const handleSamplePrompt = (prompt: string) => {
    setUserInput(prompt);
  };

  const handleRefetch = () => {
    if (currentPrompt) {
      chatQuery.refetch();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentPrompt('');
    setUserInput('');
    queryClient.removeQueries({ queryKey: ['chat-stream'] });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-expo-navy">
      {/* Header */}
      <View className="bg-expo-navy px-6 pb-6 pt-6">
        <View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-expo-white">Streamed Query</Text>
              <Text className="text-expo-gray-50">TanStack Query AsyncIterable</Text>
            </View>
            <View className="items-center">
              <View
                className={`h-3 w-3 rounded-full ${serverStatus === 'online'
                    ? 'bg-expo-green'
                    : serverStatus === 'offline'
                      ? 'bg-expo-red'
                      : 'bg-expo-yellow'
                  }`}
              />
              <Text className="mt-1 text-xs font-medium text-expo-white">
                {serverStatus === 'online'
                  ? 'Online'
                  : serverStatus === 'offline'
                    ? 'Offline'
                    : 'Checking...'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {/* Server Status Alert */}
      {serverStatus === 'offline' && (
        <View className="mx-4 mt-4 rounded-lg border border-expo-red bg-red-100 p-3">
          <Text className="text-sm font-semibold text-expo-red">⚠️ Server Offline</Text>
          <Text className="mt-1 text-xs text-expo-red">
            Please run: node simple-server.js
          </Text>
        </View>
      )}

      {/* Refetch Mode Selector */}
      <View className="mx-4 mt-4 rounded-lg border border-expo-gray-50 bg-expo-deepNavy p-3 shadow-sm">
        <Text className="mb-2 text-sm font-semibold text-expo-white">Refetch Mode:</Text>
        <View className="flex-row justify-around">
          {(['reset', 'append', 'replace'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setRefetchMode(mode)}
              className={`rounded-lg px-3 py-2 ${refetchMode === mode
                  ? 'bg-expo-blue'
                  : 'border border-expo-gray-50 bg-expo-navy'
                }`}>
              <Text
                className={`text-xs font-semibold ${refetchMode === mode ? 'text-expo-white' : 'text-expo-white'
                  }`}>
                {mode.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="mt-2 text-xs text-expo-gray-100">
          {refetchMode === 'reset' && '🔄 Clears data and goes to pending on refetch'}
          {refetchMode === 'append' && '➕ Appends new data to existing'}
          {refetchMode === 'replace' && '🔁 Replaces all data when stream ends'}
        </Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}>
        {/* Sample Prompts */}
        {messages.length === 0 && (
          <View className="p-4">
            <Text className="mb-3 text-sm font-semibold text-expo-white">
              Try these examples:
            </Text>
            {samplePrompts.map((sample, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSamplePrompt(sample.text)}
                disabled={serverStatus !== 'online'}
                className={`mb-2 flex-row items-center rounded-xl border ${serverStatus === 'online'
                    ? 'border-expo-blue bg-expo-deepNavy'
                    : 'border-expo-gray-100 bg-expo-navy'
                  } p-3 shadow-sm`}>
                <Text className="mr-3 text-2xl">{sample.icon}</Text>
                <Text
                  className={`flex-1 ${serverStatus === 'online' ? 'text-expo-white' : 'text-expo-gray-100'
                    }`}>
                  {sample.text}
                </Text>
                <Ionicons
                  name="arrow-forward-circle"
                  size={20}
                  color={serverStatus === 'online' ? '#4630EB' : '#9e9e9e'}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Chat Messages */}
        <View className="p-4">
          {messages.map((message, index) => (
            <View key={message.id} className="mb-4">
              {message.type === 'user' ? (
                <View className="flex-row justify-end">
                  <View className="max-w-[80%] rounded-2xl rounded-tr-sm bg-expo-blue px-4 py-3">
                    <Text className="font-medium text-expo-white">{message.content}</Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full border border-expo-orange bg-expo-yellow">
                    <FontAwesome name="magic" size={16} color="#4630EB" />
                  </View>
                  <View className="flex-1">
                    <View className="max-w-[90%] rounded-2xl rounded-tl-sm border border-expo-gray-50 bg-expo-deepNavy p-4 shadow-sm">
                      {Array.isArray(message.content)
                        ? message.content
                          .filter((chunk) => chunk.trim() !== '') // Filter out empty chunks
                          .map((chunk, chunkIndex, filteredArray) => (
                            <Text
                              key={chunkIndex}
                              className="leading-relaxed text-expo-white">
                              {chunk}
                              {chunkIndex < filteredArray.length - 1 ? ' ' : ''}
                            </Text>
                          ))
                        : message.content.trim() && (
                          <Text className="leading-relaxed text-expo-white">
                            {message.content}
                          </Text>
                        )}

                      {/* Typing Indicator */}
                      {message.streaming && (
                        <View className="mt-2 flex-row">
                          <View className="mr-1 h-2 w-2 rounded-full bg-expo-orange" />
                          <View className="mr-1 h-2 w-2 rounded-full bg-expo-orange" />
                          <View className="h-2 w-2 rounded-full bg-expo-orange" />
                        </View>
                      )}
                    </View>

                    {/* Stream Status */}
                    <View className="mt-2 flex-row items-center justify-between px-2">
                      <Text className="text-xs text-expo-gray-100">
                        {message.streaming
                          ? `Streaming... (${Array.isArray(message.content) ? message.content.length : 0} chunks)`
                          : `Complete (${Array.isArray(message.content) ? message.content.length : 0} chunks)`}
                      </Text>
                      {!message.streaming && index === messages.length - 1 && (
                        <TouchableOpacity onPress={handleRefetch}>
                          <Text className="text-xs font-semibold text-expo-blue">
                            Refetch
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Loading State */}
          {chatQuery.status === 'pending' && currentPrompt && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#4630EB" />
              <Text className="mt-2 font-medium text-expo-white">
                Waiting for first chunk...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Input Section */}
      <View className="border-t border-expo-gray-50 bg-expo-deepNavy p-4">
        <View className="flex-row items-center">
          <TextInput
            value={userInput}
            onChangeText={setUserInput}
            placeholder={serverStatus === 'online' ? 'Ask me anything...' : 'Server offline'}
            placeholderTextColor="#9e9e9e"
            className="mr-2 flex-1 rounded-full border border-expo-gray-50 bg-expo-navy px-4 py-3 text-expo-white"
            editable={chatQuery.fetchStatus !== 'fetching' && serverStatus === 'online'}
            onSubmitEditing={handleSendMessage}
          />

          {userInput.trim() ? (
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={
                !userInput.trim() ||
                chatQuery.fetchStatus === 'fetching' ||
                serverStatus !== 'online'
              }
              className={`rounded-full p-3 ${userInput.trim() &&
                  chatQuery.fetchStatus !== 'fetching' &&
                  serverStatus === 'online'
                  ? 'bg-expo-orange'
                  : 'bg-expo-gray-100'
                }`}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={resetChat}
              className="rounded-full bg-expo-gray-100 p-3">
              <MaterialIcons name="refresh" size={20} color="#000020" />
            </TouchableOpacity>
          )}
        </View>

        {/* Technical Info */}
        <View className="mt-3 rounded-lg border border-expo-deepNavy bg-expo-deepNavy p-3">
          <Text className="mb-1 text-xs font-semibold text-expo-yellow">📊 Query Status</Text>
          <Text className="text-xs text-expo-gray-50">
            Status: {chatQuery.status} | Fetch: {chatQuery.fetchStatus}
          </Text>
          <Text className="text-xs text-expo-gray-50">
            Data: {chatQuery.data ? `${chatQuery.data.length} chunks` : 'none'}
          </Text>
          <Text className="text-xs font-medium text-expo-blue">
            Connection: {connectionStatus}
          </Text>
          {chatQuery.error && (
            <Text className="mt-1 text-xs font-medium text-expo-red">
              Error: {chatQuery.error.message}
            </Text>
          )}
          <Text className="mt-1 text-xs text-expo-gray-50">
            Mode: {refetchMode} | Server: {serverStatus}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
