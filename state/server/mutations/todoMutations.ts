import { useMutation, useQueryClient } from '@tanstack/react-query';
import todoService from '@/services/todo';

// reusable mutation
export function useTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['todos', 'add'],
    mutationFn: (variables: string) => todoService.postTodo(variables),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate and refetch, but not needed because we already have a polling query in the main todo list screen
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      console.error('Failed to add todo:', error);
    },
  });
}
