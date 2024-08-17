import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { Suspense } from 'react';

import { theme } from './styles/theme.js';

export const App = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Suspense fallback={<>...</>}>
        testing123
      </Suspense>
    </MantineProvider>
  );
};