import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				midnight: {
					700: '#30363d',
					800: '#0d1117',
					850: '#0a0b0d',
					900: '#010409'
				},
				'my-green': '#357541',
				'my-red': '#8e3b3b',
				'my-neutral': '#30363d',
				'my-blue': '#295359',
				'my-orange': '#FFCC66'
			}
		}
	},

	plugins: []
} satisfies Config;
