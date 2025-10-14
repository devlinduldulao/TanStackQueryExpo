import { useMutation, useQueryClient } from '@tanstack/react-query';
import todoService from '@/services/todo';

// reusable mutation
export function useTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['todos', 'add'],
    mutationFn: (variables: string) => todoService.postTodo(variables),
    onSuccess: (data, variables, onMutateResult, context) => {
      // commented out because we are using polling to refetch the data for demo purposes
      // queryClient.setQueryData<Todo[]>([names.todos], (cache: any) => {
      //   return cache ? [...cache, data] : [data];
      // });
      // or we could invalidate the query to refetch
      // queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      console.error('Failed to add todo:', error);
    },
  });
}
