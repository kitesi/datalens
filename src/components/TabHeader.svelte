<script lang="ts">
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	const links = [
		{ name: 'Home', href: '/' },
		{ name: 'Linear Regression', href: '/linear-regression' },
		{ name: 'K-means Clustering', href: '/kmeans' },
		{ name: "Conway's Game of Life", href: '/conways' }
		// { name: 'Pathfinding (BFS, DFS, A*)', href: '/pathfinding' }
	];

	let currentPath = get(page).url.pathname;
	$: currentPath = $page.url.pathname;
</script>

<nav class="border-b-[1px] border-b-midnight-700 bg-midnight-800">
	<ul class="flex overflow-x-auto">
		{#each links as { name, href }}
			<li
				class={`flex items-center border-r-[1px] border-midnight-700 ${currentPath === href ? 'bg-midnight-900' : ''}`}
			>
				<a
					{href}
					class={`block border-t-2 border-midnight-700 p-4 font-medium ${currentPath === href ? 'border-t-my-orange text-white' : 'border-t-transparent text-gray-400'}`}
				>
					{name}
				</a>
			</li>
		{/each}
	</ul>
</nav>
