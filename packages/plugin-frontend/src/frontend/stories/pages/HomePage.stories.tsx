import { HomePage } from '../../pages/HomePage';

import type { Meta, StoryObj } from '@storybook/react';
 
const meta: Meta<typeof HomePage> = {
  component: HomePage,
};
 
export default meta;
type Story = StoryObj<typeof HomePage>;
 
export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
};