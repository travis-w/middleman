import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';

import { Layout } from './components/Layout';
import { History } from './pages/History';
import { Home } from './pages/Home';

const rootRoute = createRootRoute({
  component: () => (
    <Layout><Outlet /></Layout>
  )
});

const homePage = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const historyPage = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: History
});

const routeTree = rootRoute.addChildren([homePage, historyPage]);

export const router = createRouter({
  routeTree
});