import { AppShell, Burger, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Home"
          component={Link}
          to="/"
        />
        <NavLink
          label="History"
          component={Link}
          to="/history"
        />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};