import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { httpBatchLink, splitLink, unstable_httpSubscriptionLink } from '@trpc/client';
import { Suspense, useState } from 'react';

import { router } from './routes.js';
import { theme } from './styles/theme.js';
import { trpc } from './util/trpc';

export const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          // uses the httpSubscriptionLink for subscriptions
          condition: (op) => op.type === 'subscription',
          true: unstable_httpSubscriptionLink({
            url: __APP_TPC_URL__,
          }),
          false: httpBatchLink({
            url: __APP_TPC_URL__,
          }),
        })
      ],
    }),
  );


  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<>...</>}>
            <RouterProvider router={router} />
          </Suspense>
        </QueryClientProvider>
      </trpc.Provider>
    </MantineProvider>
  );
};