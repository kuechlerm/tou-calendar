import type { Meta, StoryObj } from '@storybook/svelte';
import Calendar from './Calendar.svelte';
import StyledCalendar from './StyledCalendar.svelte';

const meta = {
	title: 'Calendar',
	component: Calendar,
	args: {
		selectedDate: undefined
	},
	tags: []
} satisfies Meta<Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Consumed: Story = {
	render: () => ({
		Component: StyledCalendar as any
	})
};
