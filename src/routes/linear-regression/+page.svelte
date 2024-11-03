<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as d3 from 'd3';
	import { create, all } from 'mathjs';
	import ChooseData from '../../components/ChooseData.svelte';
	import { generatePolynomialDataset } from '$lib/generate';
	import { currentDataset } from '$lib/store';

	const math = create(all);

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let coefficients: number[] = [];
	let animationFrame: number;

	let msse = 0;
	let rSquared = 0;

	let xMin = 0,
		xMax = 0,
		yMin = 0,
		yMax = 0,
		xScale = 1,
		yScale = 1;

	const canvasHeight = 600;
	let data = generatePolynomialDataset(40, 1);

	function calculatePolynomialRegression() {
		const p = (document.getElementById('degree') as HTMLInputElement)!.valueAsNumber;

		const X = data.map((d) => Array.from({ length: p + 1 }, (_, i) => d.x ** i));
		const Y = data.map((d) => d.y);

		const XT = math.transpose(X);
		const XTX = math.multiply(XT, X);
		const XTY = math.multiply(XT, Y);
		coefficients = math.lusolve(XTX, XTY).map((v: any) => v[0]);

		msse = d3.mean(data, (d) => Math.pow(d.y - polynomialFunction(d.x), 2))!;

		const yMean = d3.mean(data, (d) => d.y)!;
		const ssTotal = d3.sum(data, (d) => Math.pow(d.y - yMean, 2));
		const ssResidual = d3.sum(data, (d) => Math.pow(d.y - polynomialFunction(d.x), 2));
		rSquared = 1 - ssResidual / ssTotal;
	}

	function polynomialFunction(x: number): number {
		return coefficients.reduce((sum, coef, i) => sum + coef * x ** i, 0);
	}

	function calculateScales() {
		xMin = d3.min(data, (d) => d.x)!;
		xMax = d3.max(data, (d) => d.x)!;
		yMin = d3.min(data, (d) => d.y)!;
		yMax = d3.max(data, (d) => d.y)!;

		const padding = 0.5;
		xMin -= padding;
		xMax += padding;
		yMin -= padding;
		yMax += padding;

		xScale = canvas.width / (xMax - xMin);
		yScale = canvasHeight / (yMax - yMin);
	}

	function drawDataPoints() {
		ctx.clearRect(0, 0, canvas.width, canvasHeight);

		ctx.fillStyle = 'white';
		data.forEach(({ x, y }) => {
			ctx.beginPath();
			ctx.arc((x - xMin) * xScale, canvasHeight - (y - yMin) * yScale, 5, 0, Math.PI * 2);
			ctx.fill();
		});
	}

	function drawPolynomialLine() {
		ctx.strokeStyle = '#FF5733';
		ctx.lineWidth = 2;
		ctx.beginPath();

		const step = 0.01;
		for (let x = xMin; x <= xMax; x += step) {
			const y = polynomialFunction(x);
			ctx.lineTo((x - xMin) * xScale, canvasHeight - (y - yMin) * yScale);
		}
		ctx.stroke();
	}

	function animatePolynomial() {
		drawDataPoints();
		drawPolynomialLine();

		if (canvas) {
			animationFrame = requestAnimationFrame(animatePolynomial);
		}
	}

	function resizeCanvas() {
		if (canvas) {
			canvas.width = canvas.clientWidth;
			canvas.height = canvasHeight;
			calculateScales();
			calculatePolynomialRegression();
		}
	}

	onMount(() => {
		resizeCanvas();
		ctx = canvas.getContext('2d')!;
		calculateScales();
		calculatePolynomialRegression();
		animatePolynomial();
		window.addEventListener('resize', resizeCanvas);
	});

	function updateDataset(value: string) {
		if (value === 'linear') {
			data = generatePolynomialDataset(40, 1);
		} else if (value === 'quadratic') {
			data = generatePolynomialDataset(40, 2);
		} else if (value === 'cubic') {
			data = generatePolynomialDataset(40, 3);
		}

		if (canvas) {
			calculateScales();
			calculatePolynomialRegression();
		}
	}

	currentDataset.subscribe(updateDataset);

	onDestroy(() => {
		// cancelAnimationFrame(animationFrame);
	});
</script>

<div class="m-4 mx-auto flex max-w-7xl flex-col items-center rounded-lg py-4">
	<h2 class="mb-4 text-3xl font-bold lg:text-5xl">Linear / Polynomial Regression</h2>
	<p class="mb-4 max-w-[80ch] text-center text-lg text-gray-200">
		Linear regression aims to model the relationship between two variables by fitting a linear
		equation to the observed data. Polynomial regression extends this by fitting a polynomial
		equation, allowing for more complex relationships between the independent and dependent
		variables.
	</p>
	<ChooseData on:generate-new={(e) => updateDataset(e.detail)}>
		<div>
			<label for="degree" class="mr-2 text-lg">Polynomial Degree:</label>
			<input
				id="degree"
				type="number"
				min="1"
				max="30"
				value="1"
				class="rounded-md bg-midnight-700 p-2 shadow"
				on:change={calculatePolynomialRegression}
			/>
		</div>
	</ChooseData>

	<canvas bind:this={canvas} class="w-full rounded-md border border-midnight-700 bg-midnight-800"
	></canvas>

	<div class="mt-4 text-center">
		<p class="text-lg">MSSE: <span class="font-semibold">{msse.toFixed(3)}</span></p>
		<p class="text-lg">R²: <span class="font-semibold">{rSquared.toFixed(3)}</span></p>
	</div>
</div>
