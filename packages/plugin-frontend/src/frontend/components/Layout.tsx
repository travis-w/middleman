import { AppShell, Burger, Flex, NavLink, Title } from '@mantine/core';
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
        <Flex h="100%" align="center" gap="sm" p="sm">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <Title size="1.5rem">Hijacker</Title>
        </Flex>
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