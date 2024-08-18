// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';

import { useEffect } from 'react';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import {
  MantineProvider,
  useMantineColorScheme,
} from '@mantine/core';
// theme.ts file from previous step
import { theme } from '../styles/theme';
import type { Decorator } from '@storybook/react';
import { Layout } from '../components/Layout';
import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';

const channel = addons.getChannel();

// Decorator to toggle between light and Dark
const ColorSchemeWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setColorScheme } = useMantineColorScheme();
  const handleColorScheme = (value: boolean) =>
    setColorScheme(value ? 'dark' : 'light');

  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
    return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
  }, [channel]);

  return <>{children}</>;
}

// Decorator to allow stories to be rendered with or without layout
const layoutDecorator: Decorator = (Story, { parameters }) => {
  if (parameters?.layout) {
    return <Layout><Story /></Layout>;
  }

  return <Story />;
}

// Decorator to provide the router context (https://github.com/TanStack/router/discussions/952#discussioncomment-9952059)
const withRouter: Decorator = (Story) => {
  return <RouterProvider router={createRouter({
    history: createMemoryHistory(),
    routeTree: createRootRoute({
      component: Story
    })
  })} />
}

export const decorators = [
  layoutDecorator,
  withRouter,
  (renderStory: any) => (
    <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>
  ),
  (renderStory: any) => (
    <MantineProvider theme={theme}>{renderStory()}</MantineProvider>
  )
];