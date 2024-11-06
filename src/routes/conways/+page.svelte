<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	class Cell {
		alive: boolean;

		constructor(alive = false) {
			this.alive = alive;
		}

		setAlive(status: boolean) {
			this.alive = status;
		}

		getAlive() {
			return this.alive;
		}

		updateState(aliveNeighbors: number) {
			if (this.alive) {
				this.alive = aliveNeighbors === 2 || aliveNeighbors === 3;
			} else {
				this.alive = aliveNeighbors === 3;
			}
		}
	}

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	const gridSize = 50;
	const cellSize = 10;
	let cells: Cell[][] = [];
	let animationFrame: number;
	let running = false;

	let density = 0.2;
	let animationSpeed = 50;

	function initializeGrid() {
		cells = Array.from({ length: gridSize }, () =>
			Array.from({ length: gridSize }, () => new Cell(Math.random() < density))
		);
	}

	function countAliveNeighbors(x: number, y: number): number {
		const directions = [
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, -1],
			[0, 1],
			[1, -1],
			[1, 0],
			[1, 1]
		];
		return directions.reduce((count, [dx, dy]) => {
			const nx = x + dx;
			const ny = y + dy;
			return count + (cells[nx]?.[ny]?.getAlive() ? 1 : 0);
		}, 0);
	}

	function updateGrid() {
		const newCells = cells.map((row, x) =>
			row.map((cell, y) => {
				const newCell = new Cell(cell.getAlive());
				const aliveNeighbors = countAliveNeighbors(x, y);
				newCell.updateState(aliveNeighbors);
				return newCell;
			})
		);
		cells = newCells;
	}

	function drawCells() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		cells.forEach((row, x) => {
			row.forEach((cell, y) => {
				ctx.fillStyle = cell.getAlive() ? '#FF5733' : '#333333';
				ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
			});
		});
	}

	async function animate() {
		if (running) {
			updateGrid();
			drawCells();
			await new Promise((resolve) => setTimeout(resolve, animationSpeed));
			animationFrame = requestAnimationFrame(animate);
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		canvas.width = gridSize * cellSize;
		canvas.height = gridSize * cellSize;
		initializeGrid();
		drawCells();
	});

	onDestroy(() => {
		// cancelAnimationFrame(animationFrame);
	});

	function toggleGame() {
		running = !running;
		if (running) {
			animate();
		} else {
			cancelAnimationFrame(animationFrame);
		}
	}

	function resetGrid() {
		initializeGrid();
		drawCells();
		running = false;
	}
</script>

<div class="m-4 mx-auto flex max-w-7xl flex-col items-center rounded-lg py-4">
	<h2 class="mb-4 text-3xl font-bold lg:text-5xl">Conway's Game of Life</h2>
	<p class="mb-8 max-w-[80ch] text-center text-lg text-gray-200">
		Conway's Game of Life is a cellular automaton where each cell can be "alive" or "dead". Cells
		evolve based on the states of their neighbors, creating complex patterns over time. Any live
		cell with fewer than two live neighbours or more than three live neighbours dies. Any dead cell
		with exactly three live neighbours becomes a live cell. All other live cells remain alive, and
		all other dead cells remain dead.
	</p>

	<div class="mb-8 flex gap-4">
		<button
			on:click={toggleGame}
			class={`${running ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'} rounded px-4 py-2 font-semibold`}
		>
			{running ? 'Pause' : 'Start'}
		</button>
		<button
			on:click={resetGrid}
			class="rounded border border-midnight-700 px-4 py-2 text-white hover:bg-midnight-700"
		>
			Reset
		</button>
	</div>

	<div class="mb-4 flex flex-col gap-4 md:flex-row">
		<label class="flex items-center gap-2">
			<span>Density:</span>
			<input type="range" min="0.1" max="0.9" step="0.1" bind:value={density} />
			<span>{Math.round(density * 100)}%</span>
		</label>
		<label class="flex items-center gap-2">
			<span>Animation Speed:</span>
			<input type="range" min="50" max="1000" step="50" bind:value={animationSpeed} />
			<span>{animationSpeed} ms</span>
		</label>
	</div>

	<canvas bind:this={canvas} class="border border-midnight-700 bg-midnight-800"></canvas>
</div>

<style>
	canvas {
		width: 100%;
		max-width: 500px;
		height: auto;
	}
</style>
