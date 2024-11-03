export function generatePolynomialDataset(n: number, p: number): { x: number; y: number }[] {
	const noiseBase = 1.5;
	const coefficients = Array.from(
		{ length: p + 1 },
		(_, i) => Math.random() * (2 - i / (p + 1)) * (Math.random() > 0.5 ? 1 : -1)
	);

	return Array.from({ length: n }, () => {
		const x = Math.random() * 10 - 5;
		let y = coefficients.reduce((sum, coef, i) => sum + coef * Math.pow(x, i), 0);

		const noise = (Math.random() * 2 - 1) * (noiseBase + p * 0.3);
		y += noise;

		return { x, y };
	});
}
