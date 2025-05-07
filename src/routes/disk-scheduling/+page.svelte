<script lang="ts">
	import { onMount } from 'svelte';
	import { algorithms } from './algorithms';

	// Canvas and visualization setup
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	const canvasWidth = 900;
	const initialCanvasHeight = 400;
	let canvasHeight = initialCanvasHeight;
	
	// Algorithm state
	let requests: number[] = []; // Disk requests
	let headPosition = 50; // Starting head position
	let selectedAlgorithm = 'FCFS'; // Default algorithm
	let initialDirection = 'left'; // Default direction
	let numRequests = 10; // Default number of requests
	let animationSpeed = 500; // Animation speed in ms
	let minPos = 0; // Min disk position
	let maxPos = 200; // Max disk position
	
	// Animation state
	let isAnimating = false;
	let animationStep = 0;
	let animationSequence: number[] = [];
	let totalSteps = 0;
	let maxArrowDepth = 0; // Tracks the maximum depth of arrows
	
	// Custom request input
	let customRequestsInput = ''; // User input for custom requests
	
	// Example request positions from the uploaded image
	const exampleRequests = [82, 170, 43, 140, 24, 16, 190];

	// Parse custom requests from string input
	function parseCustomRequests(input: string): number[] {
		if (!input.trim()) return [];
		
		// Split by commas, spaces, or other common separators
		const values = input.split(/[,;\s]+/);
		const parsed = [];
		
		for (const val of values) {
			const num = parseInt(val.trim(), 10);
			if (!isNaN(num) && num >= minPos && num <= maxPos) {
				parsed.push(num);
			}
		}
		
		return parsed;
	}

	// Generate random requests
	function generateRequests() {
		requests = Array.from({ length: numRequests }, () => 
			Math.floor(Math.random() * (maxPos - minPos)) + minPos
		);
		// Update custom requests input field to match
		customRequestsInput = requests.join(', ');
		drawInitialState();
	}
	
	// Use example requests
	function useExampleRequests() {
		requests = [...exampleRequests];
		customRequestsInput = requests.join(', ');
		drawInitialState();
	}
	
	// Use custom requests from input
	function useCustomRequests() {
		const parsedRequests = parseCustomRequests(customRequestsInput);
		if (parsedRequests.length > 0) {
			requests = parsedRequests;
			drawInitialState();
		}
	}

	// Run the selected algorithm
	function runAlgorithm() {
		// First ensure we're using the latest custom requests
		useCustomRequests();
		
		if (requests.length === 0) {
			alert('Please enter at least one valid request position.');
			return;
		}
		
		// Reset the canvas height
		canvasHeight = initialCanvasHeight;
		canvas.height = canvasHeight;
		
		const algorithm = algorithms[selectedAlgorithm as keyof typeof algorithms];
		const result = algorithm(requests, headPosition, minPos, maxPos, initialDirection);
		animationSequence = result.sequence;
		totalSteps = result.steps;
		
		// Reset animation state
		animationStep = 0;
		isAnimating = true;
		maxArrowDepth = 0;
		
		// Start animation
		animate();
	}

	// Animation function
	function animate() {
		if (!isAnimating || animationStep >= animationSequence.length) {
			isAnimating = false;
			return;
		}
		
		drawDiskState(animationStep);
		animationStep++;
		
		setTimeout(animate, animationSpeed);
	}

	// Draw initial disk state
	function drawInitialState() {
		// Clear canvas
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		// Draw the disk track
		const trackY = 100; // Fixed position from top
		drawTrack(trackY);
		
		// Draw initial head position
		const headX = scaleToCanvas(headPosition);
		drawHeadTriangle(headX, trackY, '#FF5733');
		
		// Draw disk positions as tick marks, not as blue dots
		for (const request of requests) {
			const x = scaleToCanvas(request);
			// Draw a tick mark on the track
			ctx.strokeStyle = '#888';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x, trackY - 10);
			ctx.lineTo(x, trackY + 10);
			ctx.stroke();
			
			// Draw small position label above the track for reference
			ctx.fillStyle = '#AAA';
			ctx.font = '12px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(String(request), x, trackY - 15);
		}
	}

	// Draw the disk track with position markers
	function drawTrack(trackY: number) {
		// Draw the main track line
		ctx.strokeStyle = '#CCC';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(50, trackY);
		ctx.lineTo(canvasWidth - 50, trackY);
		ctx.stroke();
		
		// Draw tick marks at regular intervals
		const trackPositions = [0, 50, 100, 150, maxPos];
		
		for (const pos of trackPositions) {
			const x = scaleToCanvas(pos);
			
			// Draw tick
			ctx.beginPath();
			ctx.moveTo(x, trackY - 10);
			ctx.lineTo(x, trackY + 10);
			ctx.stroke();
			
			// Draw position label
			ctx.fillStyle = '#FFF';
			ctx.font = '12px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(String(pos), x, trackY - 20);
		}
	}

	// Draw triangle representing the disk head
	function drawHeadTriangle(x: number, y: number, color: string) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(x, y - 15);
		ctx.lineTo(x - 10, y - 30);
		ctx.lineTo(x + 10, y - 30);
		ctx.closePath();
		ctx.fill();	
	}

	// Draw arrow between two points
	function drawArrow(fromX: number, toX: number, fromY: number, stepIndex: number) {
		const arrowSize = 8;
		
		// Use straight lines with increasing depths below the track line
		// Each arrow will go deeper than the previous one
		const baseDepth = 60; // Increased minimum depth
		const depthStep = 60; // Increased additional depth per step
        const distance = Math.abs(toX - fromX);
		
		// Calculate a depth that increases with each step
		const arrowDepth = baseDepth + distance * 0.1;
		
		// Calculate the Y position for the arrow (below the track with positive Y)
		const arrowY = fromY + arrowDepth;
		
		// Update max arrow depth to track required canvas size
		maxArrowDepth = Math.max(maxArrowDepth, arrowY + 50); // Add padding
		
		// Calculate the direction for arrow head
		const direction = fromX < toX ? 1 : -1;
		
		// Draw the arrow line as straight segments
		ctx.strokeStyle = '#4CAF50';
		ctx.fillStyle = '#4CAF50';
		ctx.lineWidth = 2;
		ctx.beginPath();
		
		// Draw from the track to the depth point
		ctx.moveTo(fromX, fromY);
		// Draw up to the destination on the track
		ctx.lineTo(toX, arrowY);
		ctx.stroke();
		
		// Draw the arrow head
		ctx.beginPath();
		ctx.moveTo(toX, arrowY);
		ctx.lineTo(toX - direction * arrowSize, arrowY - arrowSize);
		ctx.lineTo(toX - direction * arrowSize, arrowY + arrowSize);
		ctx.closePath();
		ctx.fill();
		
		// Add label showing the position value at the arrow end
		ctx.fillStyle = '#ffffff';
		ctx.font = '14px Arial';
		ctx.textAlign = 'center';
		// Position the text near the arrow end point, offset more to avoid overlap
		const labelOffset = direction > 0 ? -35 : 35; // Increased offset based on direction
		const verticalOffset = 5; // Slight vertical offset
		const positionValue = animationSequence[stepIndex + 1]; // The destination position
		ctx.fillText(String(positionValue), toX + labelOffset, arrowY + verticalOffset);

		return arrowY;
	}

	// Draw disk state at specific animation step
	function drawDiskState(step: number) {
		// Reset max arrow depth for this frame
		maxArrowDepth = 0;
		
		// Check if we need to resize the canvas based on number of steps
		const estimatedHeight = initialCanvasHeight + (step * 60);
		if (estimatedHeight > canvasHeight) {
			canvasHeight = estimatedHeight;
			canvas.height = canvasHeight;
		}
		
		// Clear canvas
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		// Position the track at a fixed position from the top
		const trackY = 100; // Fixed position from top
		
		// Draw the disk track
		drawTrack(trackY);
		
		// Draw disk positions as tick marks, not as blue dots
		for (const request of requests) {
			const x = scaleToCanvas(request);
			// Draw a tick mark on the track
			ctx.strokeStyle = '#888';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x, trackY - 10);
			ctx.lineTo(x, trackY + 10);
			ctx.stroke();
			
			// Draw small position label above the track for reference
			ctx.fillStyle = '#AAA';
			ctx.font = '12px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(String(request), x, trackY - 15);
		}
		
		// Draw the path arrows between consecutive positions up to current step
		if (step > 0) {
            let fromY = trackY;
			for (let i = 0; i < step; i++) {
				const fromX = scaleToCanvas(animationSequence[i]);
				const toX = scaleToCanvas(animationSequence[i+1]);
				fromY = drawArrow(fromX, toX, fromY, i);
			}
			
			// After drawing all arrows, check if we need to resize the canvas again
			if (maxArrowDepth > canvasHeight) {
				canvasHeight = maxArrowDepth;
				canvas.height = canvasHeight;
				// Redraw everything with the new canvas size
				drawDiskState(step);
				return;
			}
		}
		
		// Draw current head position
		if (step < animationSequence.length) {
			const headX = scaleToCanvas(animationSequence[step]);
			drawHeadTriangle(headX, trackY, '#FF5733');
			
			// Add label for current head position
			ctx.fillStyle = '#FF5733';
			ctx.font = 'bold 14px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(`Head: ${animationSequence[step]}`, headX, trackY - 35);
		}
	}

	// Reset animation and canvas
	function resetAnimation() {
		isAnimating = false;
		canvasHeight = initialCanvasHeight;
		canvas.height = canvasHeight;
		drawInitialState();
	}

	// Scale disk position to canvas coordinates
	function scaleToCanvas(position: number) {
		return 50 + (position / maxPos) * (canvasWidth - 100);
	}

	// Initialize on mount
	onMount(() => {
		ctx = canvas.getContext('2d')!;
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		generateRequests(); // Generate initial random requests
	});
</script>

<div class="m-4 mx-auto max-w-7xl rounded-lg py-4 text-white">
	<h2 class="mb-3 text-3xl font-bold text-center lg:text-4xl">Disk Scheduling Algorithms</h2>
	<p class="mb-6 max-w-[80ch] mx-auto text-center text-gray-300">
		Disk scheduling algorithms determine the order in which disk I/O requests are serviced. These algorithms 
		aim to minimize seek time, which occurs when the disk head needs to move to different positions on the disk. 
		This visualization demonstrates various disk scheduling algorithms and their efficiency in handling different request patterns.
	</p>

	<!-- Two column layout with controls and visualization -->
	<div class="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
		<!-- Left column for controls on larger screens -->
		<div class="lg:w-1/3 w-full">
			<div class="bg-gray-800/50 rounded-xl p-5 shadow-lg mb-6">
				<div class="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
					<label class="flex flex-col">
						<span class="mb-1 text-gray-300 text-sm font-medium">Algorithm:</span>
						<select bind:value={selectedAlgorithm} class="rounded-md px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
							<option value="FCFS">First-Come-First-Served (FCFS)</option>
							<option value="SSTF">Shortest Seek Time First (SSTF)</option>
							<option value="SCAN">SCAN (Elevator)</option>
							<option value="CSCAN">Circular SCAN (C-SCAN)</option>
							<option value="LOOK">LOOK</option>
							<option value="CLOOK">Circular LOOK (C-LOOK)</option>
							<option value="RSS">Random Scheduling Strategy (RSS)</option>
							<option value="LIFO">Last-In-First-Out (LIFO)</option>
						</select>
					</label>
					<label class="flex flex-col">
						<span class="mb-1 text-gray-300 text-sm font-medium">Initial Direction:</span>
						<select bind:value={initialDirection} class="rounded-md px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
							<option value="left">Left</option>
							<option value="right">Right</option>
						</select>
					</label>
				</div>
				
				<div class="mb-5 grid grid-cols-2 gap-4">
					<label class="flex flex-col">
						<span class="mb-1 text-gray-300 text-sm font-medium">Head Position:</span>
						<input 
							type="number" 
							bind:value={headPosition} 
							min={minPos} 
							max={maxPos} 
							class="no-spinner rounded-md px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
						/>
					</label>
					<label class="flex flex-col">
						<span class="mb-1 text-gray-300 text-sm font-medium">Disk Size:</span>
						<input 
							type="number" 
							bind:value={maxPos} 
							min="50" 
							max="500" 
							class="no-spinner rounded-md px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
						/>
					</label>
				</div>
				
				<div class="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
					<label class="flex flex-col">
						<div class="flex justify-between mb-1">
							<span class="text-gray-300 text-sm font-medium">Animation Speed:</span>
							<span class="text-gray-400 text-sm">{animationSpeed} ms</span>
						</div>
						<input 
							type="range" 
							bind:value={animationSpeed} 
							min="100" 
							max="1000" 
							step="100" 
							class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
						/>
					</label>
					<label class="flex flex-col">
						<span class="mb-1 text-gray-300 text-sm font-medium"># of Random Requests:</span>
						<input 
							type="number" 
							bind:value={numRequests} 
							min="1" 
							max="20" 
							class="no-spinner rounded-md px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
						/>
					</label>
				</div>
				
				<!-- Custom requests input area -->
				<div class="mb-5">
					<label class="flex flex-col">
						<span class="mb-1 text-gray-300 text-sm font-medium">Custom Requests (comma or space separated):</span>
						<input 
							type="text"
							bind:value={customRequestsInput} 
							placeholder="Enter disk request positions (e.g., 23, 45, 67, 89)" 
							class="rounded-md px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
						/>
					</label>
				</div>

				<div class="flex flex-wrap gap-3">
					<button
						on:click={generateRequests}
						class="min-w-[160px] text-center rounded border border-midnight-700 px-4 py-2 font-semibold text-white hover:bg-midnight-700"
					>
						Generate Random Requests
					</button>
					<button
						on:click={runAlgorithm}
						class="min-w-[160px] text-center rounded px-4 py-2 font-semibold bg-green-200 hover:bg-green-300 text-green-800"
						disabled={isAnimating}
					>
						{isAnimating ? 'Running...' : 'Run Algorithm'}
					</button>
				</div>
			</div>
			
			<!-- Algorithm Descriptions -->
			<div class="bg-gray-800/50 rounded-xl p-5 shadow-lg text-gray-300">
				<h3 class="text-xl font-bold mb-4 text-white">Algorithm Descriptions</h3>
				
				<div class="space-y-4">
					<div class="p-3 bg-gray-800/80 rounded-lg">
						<h4 class="font-bold text-blue-400">First-Come-First-Served (FCFS)</h4>
						<p class="text-sm text-gray-300">Processes requests in the exact order they arrive, without any optimization.</p>
					</div>
					
					<div class="p-3 bg-gray-800/80 rounded-lg">
						<h4 class="font-bold text-blue-400">Shortest Seek Time First (SSTF)</h4>
						<p class="text-sm text-gray-300">Always chooses the request that requires the least head movement from current position.</p>
					</div>
					
					<div class="p-3 bg-gray-800/80 rounded-lg">
						<h4 class="font-bold text-blue-400">SCAN (Elevator)</h4>
						<p class="text-sm text-gray-300">Moves the head in one direction until reaching the end, then reverses direction. Always goes to the disk boundaries.</p>
					</div>
					
					<div class="p-3 bg-gray-800/80 rounded-lg">
						<h4 class="font-bold text-blue-400">C-SCAN</h4>
						<p class="text-sm text-gray-300">Similar to SCAN, but when the head reaches one end, it immediately jumps to the other end and continues scanning in the same direction.</p>
					</div>
					
					<div class="p-3 bg-gray-800/80 rounded-lg">
						<h4 class="font-bold text-blue-400">LOOK</h4>
						<p class="text-sm text-gray-300">Similar to SCAN, but the head only goes as far as the last request in each direction, not all the way to the disk boundaries.</p>
					</div>
					
					<div class="p-3 bg-gray-800/80 rounded-lg">
						<h4 class="font-bold text-blue-400">C-LOOK</h4>
						<p class="text-sm text-gray-300">Similar to LOOK, but when the head reaches the last request in one direction, it immediately jumps to the furthest request in the opposite direction and continues in the same initial direction.</p>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Right column for visualization on larger screens -->
		<div class="lg:w-2/3 w-full">
			<!-- Information display area outside of canvas -->
			<div class="mb-4 w-full flex flex-col gap-3">
				<div class="bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 shadow-lg">
					<div class="flex justify-between items-center">
						<div>
							<span class="font-medium text-gray-300">Step:</span> <span class="font-bold text-white">{animationStep}/{animationSequence.length}</span>
						</div>
						<div>
							<span class="font-medium text-gray-300">Total Seek Operations:</span> <span class="font-bold text-white">{totalSteps}</span>
						</div>
					</div>
				</div>
				
				<!-- Request sequence display -->
				<div class="bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 shadow-lg">
					<div>
						<span class="font-medium text-gray-300">Request Sequence:</span> 
						<span class="font-mono text-white">{requests.join(', ')}</span>
					</div>
					{#if animationSequence.length > 0}
						<div class="mt-3">
							<span class="font-medium text-gray-300">Processing Sequence:</span> 
							<span class="font-mono text-white">{animationSequence.join(', ')}</span>
						</div>
					{/if}
				</div>
			</div>

			<div class="bg-gray-800/80 p-0 rounded-xl w-full border border-gray-700/50 overflow-hidden shadow-lg">
				<canvas bind:this={canvas} class="w-full h-auto bg-gray-900"></canvas>
			</div>
		</div>
	</div>
</div>

<style>
	canvas {
		width: 100%;
		max-width: 100%;
		height: auto; /* Allow canvas to adjust height based on content */
		min-height: 400px; /* Minimum height */
		display: block; /* Remove default inline spacing */
	}

	/* Remove arrows/spinners from number inputs */
	.no-spinner::-webkit-inner-spin-button, 
	.no-spinner::-webkit-outer-spin-button { 
		-webkit-appearance: none; 
		margin: 0; 
	}
	.no-spinner {
		-moz-appearance: textfield; /* Firefox */
	}

	input[type="range"] {
		height: 6px;
		outline: none;
	}
	
	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		border: 2px solid #1e3a8a;
	}
	
	input[type="range"]::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		border: 2px solid #1e3a8a;
	}
	
	
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
