import { History } from '../../pages/History';

import type { Meta, StoryObj } from '@storybook/react';
 
const meta: Meta<typeof History> = {
  component: History,
};
 
export default meta;
type Story = StoryObj<typeof History>;
 
export const Primary: Story = {};

export const WithLayout: Story = {
  parameters: {
    layout: true
  }
};