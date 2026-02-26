import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Platform } from 'react-native';

const ReactQueryDevTools = () => {
  if (Platform.OS == 'web') {
    return <ReactQueryDevtools initialIsOpen={false} />;
  }

  return null;
};

export default ReactQueryDevTools;
