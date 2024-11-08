<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Grid, COLORS } from './Grid';
	import AStar from './AStar';

	import { currentManualNode, solutionSolved, solutionStarted, stopped } from './stores';
	import { get } from 'svelte/store';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let grid: Grid | undefined = undefined;

	onMount(() => {
		if (!canvas) {
			alert('Canvas not found?');
		}

		ctx = canvas.getContext('2d')!;
		grid = new AStar(canvas);
		grid.addWalls(ctx, 30);
		document.body.addEventListener('mouseup', () => {
			if (grid) grid.mouseDown = false;
		});
	});

	function resetGrid() {
		setCurrentManualNode('');
		grid?.init(canvas, ctx);
	}

	function setCurrentManualNode(type: string) {
		currentManualNode.set(type);
	}

	function handleRunStop() {
		if (!grid) return;

		if (!get(solutionStarted)) {
			grid.solve(ctx);
		} else if (get(stopped)) {
			grid.resumeSolution(ctx);
		} else {
			grid.stopSolution();
		}
	}
</script>

<div class="m-4 mx-auto flex max-w-7xl flex-col items-center rounded-lg py-4">
	<h2 class="mb-4 text-3xl font-bold lg:text-5xl">Pathfinding Visualizer</h2>
	<p class="mb-8 max-w-[80ch] text-center text-lg text-gray-200">
		(In Progess!) Select a start and end point, then draw walls to create obstacles. Run pathfinding algorithms to
		visualize how they find the shortest path between start and end points.
	</p>

	<div class="mb-8 flex flex-wrap justify-center gap-4">
		<button
			on:click={handleRunStop}
			disabled={$solutionSolved}
			class="rounded border border-midnight-700 px-4 py-2  hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through"
		>
			{$stopped || !$solutionStarted ? 'Run' : 'Stop'}
		</button>
		<button
			on:click={resetGrid}
			class="rounded border border-midnight-700 px-4 py-2  hover:bg-midnight-700"
		>
			Reset Grid
		</button>

		<button
			on:click={() => setCurrentManualNode('start')}
			class={`rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700  disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${$currentManualNode === 'start' ? `bg-purple-100 text-purple-700 underline hover:bg-purple-100` : ''}`}
			disabled={$solutionStarted}
		>
			Set Start
		</button>
		<button
			on:click={() => setCurrentManualNode('end')}
			disabled={$solutionStarted}
			class={`rounded border border-midnight-700 px-4 py-2  hover:bg-midnight-700  disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${$currentManualNode === 'end' ? `bg-purple-100 text-purple-700 underline hover:bg-purple-100` : ''}`}
		>
			Set End
		</button>
		<button
			on:click={() => grid?.addWalls(ctx, 30)}
			disabled={$solutionStarted}
			class="rounded border border-midnight-700 px-4 py-2  hover:bg-midnight-700  disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through"
		>
			Add Walls Randomly
		</button>
		<button
			on:click={() => setCurrentManualNode('wall')}
			disabled={$solutionStarted}
			class={`rounded border border-midnight-700 px-4 py-2  hover:bg-midnight-700  disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${$currentManualNode === 'wall' ? 'bg-purple-100 text-purple-700 underline hover:bg-purple-100' : ''}`}
		>
			Add Walls Manually
		</button>
		<button
			on:click={() => setCurrentManualNode('remove-wall')}
			disabled={$solutionStarted}
			class={`rounded border border-midnight-700 px-4 py-2  hover:bg-midnight-700  disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${$currentManualNode === 'remove-wall' ? 'bg-purple-100 text-purple-700 underline hover:bg-purple-100' : ''}`}
		>
			Remove Walls Manually
		</button>
		<button
			on:click={() => setCurrentManualNode('')}
			disabled={$currentManualNode === '' || $solutionStarted}
			class={`rounded border border-midnight-700 px-4 py-2  hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through`}
		>
			Stop Selection
		</button>
	</div>

	<canvas
		bind:this={canvas}
		on:mousedown={() => {
			if (grid) grid.mouseDown = true;
		}}
		on:mousemove={(ev) => grid?.manuallyDrawNode(ev, ctx)}
		class="border border-midnight-700"
	></canvas>
</div>

<style>
	canvas {
		width: 100%;
		max-width: 500px;
		height: auto;
	}
</style>
