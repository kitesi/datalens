<script lang="ts">
	import { onMount } from 'svelte';
	import { Grid, COLORS } from './Grid';
	import AStar from './AStar';
	import BFS from './BFS';
	import DFS from './DFS';

	import { currentManualNode, solutionSolved, solutionStarted, stopped } from './stores';
	import { get } from 'svelte/store';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let grid: Grid | undefined = undefined;

	let selectedAlgorithm: string = 'DFS';
	let wallPercentage: number = 20;

	onMount(() => {
		if (!canvas) {
			alert('Canvas not found?');
		}

		ctx = canvas.getContext('2d')!;
		updateGrid();
		document.body.addEventListener('mouseup', () => {
			if (grid) grid.mouseDown = false;
		});
	});

	function resetGrid() {
		setCurrentManualNode('');
		grid?.stopSolution();
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

	/* we coulddd just have the abstract Grid class most of the solve algorithm logic
	and then have DFS, BFS, A* have static methods so we don't have to initialize them
	every time we change the algorithm, but for the sake of writing each algorithm
	fully on its own, I'll do this. Plus for future algorithms they might not have as similar structure. */
	function updateGrid() {
		switch (selectedAlgorithm) {
			case 'DFS':
				grid = new DFS(canvas);
				break;
			case 'BFS':
				grid = new BFS(canvas);
				break;
			case 'A*':
				grid = new AStar(canvas);
				break;
		}
		resetGrid();
	}
</script>

<div class="m-4 mx-auto flex max-w-7xl flex-col items-center rounded-lg py-4">
	<h2 class="mb-4 text-3xl font-bold lg:text-5xl">Pathfinding Visualizer</h2>
	<p class="mb-8 max-w-[80ch] text-center text-lg text-gray-200">
		Select a start and end point, then draw walls to create obstacles. Run pathfinding algorithms to
		visualize how they find the shortest path between start and end points.
		<br />
	</p>
	<ul class="max-w-[80ch] space-y-4 text-center text-lg">
		<li>
			<strong>Breadth-First Search (BFS):</strong> Explores all of the neighbor nodes at the present
			depth prior to moving on to the nodes at the next depth level. Gurantees the shortest path. In
			this visualization, we do not count diagonal neighbors as neighbors.
		</li>

		<li>
			<strong>Depth-First Search (DFS):</strong> Explores as far as possible along each branch before
			backtracking. Does not gurantee the shortest path. In this visualization, we do not count diagonal
			neighbors as neighbors.
		</li>

		<li>
			<strong>A* Search:</strong> Uses a heuristic to estimate the cost of the cheapest path. Gurantees
			the shortest path
		</li>
	</ul>

	<hr class="my-8 w-full max-w-[80ch] border border-midnight-700" />

	<div class="mb-8 flex flex-wrap justify-center gap-4">
		<div class="flex flex-col items-start">
			<label for="algorithm" class="mb-2 text-white">Select Algorithm:</label>
			<select
				id="algorithm"
				bind:value={selectedAlgorithm}
				on:change={updateGrid}
				class="rounded border border-midnight-700 bg-midnight-800 px-4 py-2 text-white hover:bg-midnight-700"
			>
				<option value="DFS">DFS</option>
				<option value="BFS">BFS</option>
				<option value="A*">A*</option>
			</select>
		</div>

		<div class="flex flex-col items-start">
			<label for="walls-slider" class="mb-2 text-white">Diagonal Walls (%):</label>
			<div class="flex items-center gap-2">
				<input
					id="walls-slider"
					type="range"
					min="0"
					max="80"
					step="5"
					bind:value={wallPercentage}
					class="h-[5px] w-[150px] cursor-pointer appearance-none rounded bg-[#3b82f6] outline-none"
				/>
				<span class="text-white">{wallPercentage}%</span>
			</div>
		</div>
	</div>

	<!-- Second row: Action buttons -->
	<div class="mb-8 flex max-w-3xl flex-wrap justify-center gap-4">
		<button
			on:click={handleRunStop}
			disabled={$solutionSolved}
			class="rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through"
		>
			{$stopped || !$solutionStarted ? 'Run' : 'Stop'}
		</button>
		<button
			on:click={resetGrid}
			class="rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through"
			disabled={$solutionStarted && !($solutionSolved || $stopped)}
		>
			Reset Grid
		</button>
		<button
			on:click={() => setCurrentManualNode('start')}
			class={`rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${$currentManualNode === 'start' ? `bg-purple-100 text-purple-700 underline hover:bg-purple-100` : ''}`}
			disabled={$solutionStarted}
		>
			Set Start
		</button>
		<button
			on:click={() => setCurrentManualNode('end')}
			disabled={$solutionStarted}
			class={`rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${$currentManualNode === 'end' ? `bg-purple-100 text-purple-700 underline hover:bg-purple-100` : ''}`}
		>
			Set End
		</button>
		<button
			on:click={() => grid?.addWalls(ctx, 30)}
			disabled={$solutionStarted}
			class="rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through"
		>
			Add Walls Randomly
		</button>
		<button
			on:click={() => setCurrentManualNode('wall')}
			disabled={$solutionStarted}
			class={`rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${$currentManualNode === 'wall' ? 'bg-purple-100 text-purple-700 underline hover:bg-purple-100' : ''}`}
		>
			Add Walls Manually
		</button>
		<button
			on:click={() => setCurrentManualNode('remove-wall')}
			disabled={$solutionStarted}
			class={`rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${$currentManualNode === 'remove-wall' ? 'bg-purple-100 text-purple-700 underline hover:bg-purple-100' : ''}`}
		>
			Remove Walls Manually
		</button>
		<button
			on:click={() => setCurrentManualNode('')}
			disabled={$currentManualNode === '' || $solutionStarted}
			class="rounded border border-midnight-700 px-4 py-2 hover:bg-midnight-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through"
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
