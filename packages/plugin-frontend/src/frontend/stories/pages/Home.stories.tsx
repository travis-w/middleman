import { Home } from '../../pages/Home';

import type { Meta, StoryObj } from '@storybook/react';
 
const meta: Meta<typeof Home> = {
  component: Home,
};
 
export default meta;
type Story = StoryObj<typeof Home>;
 
export const Primary: Story = {};

export const WithLayout: Story = {
  parameters: {
    layout: true
  }
};