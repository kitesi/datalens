import { get } from 'svelte/store';
import { COLORS, Grid, Node } from './Grid';
import { stopped } from './stores';

export default class BFS extends Grid {
	open: Node[] = [];
	discovered: Set<Node> = new Set();

	solve(ctx: CanvasRenderingContext2D) {
		this.open = [];
		this.discovered = new Set();
		this.open.push(this.start);
		super.solve(ctx);
	}

	solutionIteration(ctx: CanvasRenderingContext2D): void {
		if (get(stopped) || !this.start) return;

		if (this.open.length === 0) {
			this.resolveSolution();
			return;
		}

		for (const node of this.discovered) {
			this.fillColor(ctx, node, COLORS.closed);
		}

		for (let i = 0; i < this.open.length; i++) {
			this.fillColor(ctx, this.open[i], COLORS.open);
		}

		const current = this.open.pop()!;
		this.animateCurrentPath(ctx, current);

		if (current === this.end) {
			this.resolveSolution();
			return;
		}

		if (!this.discovered.has(current)) {
			this.discovered.add(current);

			for (const neighbor of current.getNeighbors(this.nodes, false, false)) {
				if (!this.discovered.has(neighbor)) {
					this.open.push(neighbor);
					neighbor.parent = current;
				}
			}
		}

		requestAnimationFrame(() => this.solutionIteration(ctx));
	}
}
