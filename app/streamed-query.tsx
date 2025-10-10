/**
 * TanStack Query streamedQuery demo - Real-time streaming with AsyncIterable for React Native
 * Uses experimental_streamedQuery with queryFn (newer API) instead of streamFn
 * Perfect for conference demos showing streaming data patterns
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
const SERVER_URL = 'http://localhost:3001'; // Change to your IP if testing on device

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
   * TanStack Query options using experimental streamedQuery
   *
   * Note: The current implementation uses `queryFn` parameter within streamedQuery.
   * This may be an older or custom version of the API. The official docs mention `streamFn`,
   * but this working implementation demonstrates the core streaming concepts.
   *
   * Key Streaming Concepts Demonstrated:
   * - AsyncIterable generator functions for progressive data loading
   * - XMLHttpRequest for React Native streaming compatibility
   * - Real-time chunk processing and yielding
   * - Proper error handling and cancellation support
   * - Multiple refetch modes for different streaming behaviors
   *
   * Official streamedQuery API Options (per docs):
   * - streamFn: (context) => Promise<AsyncIterable<TData>> - Main streaming function
   * - refetchMode: 'append' | 'reset' | 'replace' - How refetches are handled
   * - reducer: (accumulator, chunk) => TData - Custom chunk processing
   * - initialValue: TData - Initial data while first chunk loads
   *
   * @type {QueryOptions} chatQueryOptions - Configuration for the streaming query
   */
  const chatQueryOptions = queryOptions({
    queryKey: ['chat-stream', currentPrompt],
    queryFn: streamedQuery({
      /**
       * Main streaming generator function
       *
       * This async generator implements the AsyncIterable pattern for progressive
       * data yielding. Each `yield` statement sends a new chunk to the query cache,
       * allowing the UI to update in real-time as data streams in.
       *
       * Key Implementation Details:
       * - Uses XMLHttpRequest for React Native streaming compatibility
       * - Implements polling pattern to yield chunks as they arrive
       * - Handles network errors and query cancellation gracefully
       * - Optimized delays to prevent busy waiting
       *
       * @async
       * @generator
       * @function queryFn
       * @param {QueryFunctionContext} context - TanStack Query context with signal
       * @yields {string} - Individual text chunks as they arrive from server
       * @throws {Error} - Network errors or cancellation errors
       */
      queryFn: async function* (context) {
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
       * Refetch mode configuration (per official API)
       * - 'reset': Clears data and goes to pending on refetch (default)
       * - 'append': Appends new data to existing data
       * - 'replace': Replaces all data when stream ends
       */
      refetchMode: refetchMode,

      /**
       * Default behavior:
       * - reducer: Appends each chunk to array (automatic for string[] type)
       * - initialValue: Empty array (automatic for array types)
       *
       * Custom options could be:
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
      className="bg-codemotion-gray-50 flex-1">
      {/* Header */}
      <View className="bg-codemotion-navy px-6 pb-6 pt-6">
        <View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-codemotion-white text-3xl font-bold">Streamed Query</Text>
              <Text className="text-codemotion-gray-50">TanStack Query AsyncIterable</Text>
            </View>
            <View className="items-center">
              <View
                className={`h-3 w-3 rounded-full ${
                  serverStatus === 'online'
                    ? 'bg-codemotion-green'
                    : serverStatus === 'offline'
                      ? 'bg-codemotion-red'
                      : 'bg-codemotion-yellow'
                }`}
              />
              <Text className="text-codemotion-white mt-1 text-xs font-medium">
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
        <View className="border-codemotion-red mx-4 mt-4 rounded-lg border bg-red-100 p-3">
          <Text className="text-codemotion-red text-sm font-semibold">⚠️ Server Offline</Text>
          <Text className="text-codemotion-red mt-1 text-xs">
            Please run: node simple-server.js
          </Text>
        </View>
      )}
      ){/* Refetch Mode Selector */}
      <View className="border-codemotion-gray-50 bg-codemotion-white mx-4 mt-4 rounded-lg border p-3 shadow-sm">
        <Text className="text-codemotion-navy mb-2 text-sm font-semibold">Refetch Mode:</Text>
        <View className="flex-row justify-around">
          {(['reset', 'append', 'replace'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setRefetchMode(mode)}
              className={`rounded-lg px-3 py-2 ${
                refetchMode === mode
                  ? 'bg-codemotion-blue'
                  : 'border-codemotion-gray-50 bg-codemotion-gray-50 border'
              }`}>
              <Text
                className={`text-xs font-semibold ${
                  refetchMode === mode ? 'text-codemotion-white' : 'text-codemotion-navy'
                }`}>
                {mode.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-codemotion-gray-200 mt-2 text-xs">
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
            <Text className="text-codemotion-navy mb-3 text-sm font-semibold">
              Try these examples:
            </Text>
            {samplePrompts.map((sample, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSamplePrompt(sample.text)}
                disabled={serverStatus !== 'online'}
                className={`mb-2 flex-row items-center rounded-xl border ${
                  serverStatus === 'online'
                    ? 'border-codemotion-blue bg-codemotion-white'
                    : 'border-codemotion-gray-100 bg-codemotion-gray-50'
                } p-3 shadow-sm`}>
                <Text className="mr-3 text-2xl">{sample.icon}</Text>
                <Text
                  className={`flex-1 ${
                    serverStatus === 'online' ? 'text-codemotion-navy' : 'text-codemotion-gray-200'
                  }`}>
                  {sample.text}
                </Text>
                <Ionicons
                  name="arrow-forward-circle"
                  size={20}
                  color={serverStatus === 'online' ? '#0555fa' : '#9e9e9e'}
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
                  <View className="bg-codemotion-blue max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3">
                    <Text className="text-codemotion-white font-medium">{message.content}</Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row">
                  <View className="border-codemotion-orange bg-codemotion-yellow mr-2 h-8 w-8 items-center justify-center rounded-full border">
                    <FontAwesome name="magic" size={16} color="#ff5c00" />
                  </View>
                  <View className="flex-1">
                    <View className="border-codemotion-gray-50 bg-codemotion-white max-w-[90%] rounded-2xl rounded-tl-sm border p-4 shadow-sm">
                      {Array.isArray(message.content)
                        ? message.content
                            .filter((chunk) => chunk.trim() !== '') // Filter out empty chunks
                            .map((chunk, chunkIndex, filteredArray) => (
                              <Text
                                key={chunkIndex}
                                className="text-codemotion-navy leading-relaxed">
                                {chunk}
                                {chunkIndex < filteredArray.length - 1 ? ' ' : ''}
                              </Text>
                            ))
                        : message.content.trim() && (
                            <Text className="text-codemotion-navy leading-relaxed">
                              {message.content}
                            </Text>
                          )}

                      {/* Typing Indicator */}
                      {message.streaming && (
                        <View className="mt-2 flex-row">
                          <View className="bg-codemotion-orange mr-1 h-2 w-2 rounded-full" />
                          <View className="bg-codemotion-orange mr-1 h-2 w-2 rounded-full" />
                          <View className="bg-codemotion-orange h-2 w-2 rounded-full" />
                        </View>
                      )}
                    </View>

                    {/* Stream Status */}
                    <View className="mt-2 flex-row items-center justify-between px-2">
                      <Text className="text-codemotion-gray-200 text-xs">
                        {message.streaming
                          ? `Streaming... (${Array.isArray(message.content) ? message.content.length : 0} chunks)`
                          : `Complete (${Array.isArray(message.content) ? message.content.length : 0} chunks)`}
                      </Text>
                      {!message.streaming && index === messages.length - 1 && (
                        <TouchableOpacity onPress={handleRefetch}>
                          <Text className="text-codemotion-blue text-xs font-semibold">
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
              <ActivityIndicator size="large" color="#0555fa" />
              <Text className="text-codemotion-navy mt-2 font-medium">
                Waiting for first chunk...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Input Section */}
      <View className="border-codemotion-gray-50 bg-codemotion-white border-t p-4">
        <View className="flex-row items-center">
          <TextInput
            value={userInput}
            onChangeText={setUserInput}
            placeholder={serverStatus === 'online' ? 'Ask me anything...' : 'Server offline'}
            placeholderTextColor="#9e9e9e"
            className="border-codemotion-gray-50 text-codemotion-navy mr-2 flex-1 rounded-full border bg-gray-50 px-4 py-3"
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
              className={`rounded-full p-3 ${
                userInput.trim() &&
                chatQuery.fetchStatus !== 'fetching' &&
                serverStatus === 'online'
                  ? 'bg-codemotion-orange'
                  : 'bg-codemotion-gray-100'
              }`}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={resetChat}
              className="bg-codemotion-gray-100 rounded-full p-3">
              <MaterialIcons name="refresh" size={20} color="#0e1e30" />
            </TouchableOpacity>
          )}
        </View>

        {/* Technical Info */}
        <View className="border-codemotion-deepNavy bg-codemotion-deepNavy mt-3 rounded-lg border p-3">
          <Text className="text-codemotion-yellow mb-1 text-xs font-semibold">📊 Query Status</Text>
          <Text className="text-codemotion-gray-50 text-xs">
            Status: {chatQuery.status} | Fetch: {chatQuery.fetchStatus}
          </Text>
          <Text className="text-codemotion-gray-50 text-xs">
            Data: {chatQuery.data ? `${chatQuery.data.length} chunks` : 'none'}
          </Text>
          <Text className="text-codemotion-blue text-xs font-medium">
            Connection: {connectionStatus}
          </Text>
          {chatQuery.error && (
            <Text className="text-codemotion-red mt-1 text-xs font-medium">
              Error: {chatQuery.error.message}
            </Text>
          )}
          <Text className="text-codemotion-gray-50 mt-1 text-xs">
            Mode: {refetchMode} | Server: {serverStatus}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
