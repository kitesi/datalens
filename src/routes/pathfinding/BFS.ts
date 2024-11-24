import { get } from 'svelte/store';
import { COLORS, Grid, Node } from './Grid';
import { stopped } from './stores';

export default class BFS extends Grid {
	open: Node[] = [];
	explored: Set<Node> = new Set();

	solve(ctx: CanvasRenderingContext2D) {
		this.open = [this.start];
		this.explored = new Set();
		this.explored.add(this.start);
		super.solve(ctx);
	}

	solutionIteration(ctx: CanvasRenderingContext2D): void {
		if (get(stopped) || !this.start) return;

		if (this.open.length === 0) {
			this.resolveSolution();
			return;
		}

		for (const node of this.explored) {
			this.fillColor(ctx, node, COLORS.closed);
		}

		for (let i = 0; i < this.open.length; i++) {
			this.fillColor(ctx, this.open[i], COLORS.open);
		}

		const current = this.open.shift()!;
		this.animateCurrentPath(ctx, current);

		if (current === this.end) {
			this.resolveSolution();
			return;
		}

		for (const neighbor of current.getNeighbors(this.nodes, false, false)) {
			if (!this.explored.has(neighbor)) {
				this.explored.add(neighbor);
				this.open.push(neighbor);
				neighbor.parent = current;
			}
		}

		requestAnimationFrame(() => this.solutionIteration(ctx));
	}
}
