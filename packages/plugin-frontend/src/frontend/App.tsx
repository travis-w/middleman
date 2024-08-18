import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { RouterProvider } from '@tanstack/react-router';
import { Suspense } from 'react';

import { router } from './routes.js';
import { theme } from './styles/theme.js';

export const App = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Suspense fallback={<>...</>}>
        <RouterProvider router={router} />
      </Suspense>
    </MantineProvider>
  );
};