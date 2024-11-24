import { get } from 'svelte/store';
import { COLORS, Grid, Node } from './Grid';
import { stopped } from './stores';

export default class AStar extends Grid {
	open: Node[] = [];
	closed: Node[] = [];
	gScore = new Map<Node, number>();
	fScore = new Map<Node, number>();

	constructor(canvas: HTMLCanvasElement) {
		super(canvas);
	}

	static getMapValueCurry(m: Map<Node, number>, default_v: number) {
		return function (n: Node) {
			const k = m.get(n);
			return k ?? default_v;
		};
	}

	static heuristic(a: Node, b: Node) {
		return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
	}

	solve(ctx: CanvasRenderingContext2D) {
		this.open = [this.start];
		this.closed = [];
		super.solve(ctx);
	}

	solutionIteration(ctx: CanvasRenderingContext2D) {
		if (get(stopped) || !this.start) return;

		if (this.open.length === 0) {
			this.resolveSolution();
			return;
		}

		this.gScore.set(this.start, 0);
		this.fScore.set(this.start, AStar.heuristic(this.start, this.end));

		const getG = AStar.getMapValueCurry(this.gScore, Number.POSITIVE_INFINITY);
		const getF = AStar.getMapValueCurry(this.fScore, Number.POSITIVE_INFINITY);

		let bestIndex = 0;

		for (let i = 0; i < this.open.length; i++) {
			if (getF(this.open[i]) < getF(this.open[bestIndex])) {
				bestIndex = i;
			}

			this.fillColor(ctx, this.open[i], COLORS.open);
		}

		for (const node of this.closed) {
			this.fillColor(ctx, node, COLORS.closed);
		}

		const current = this.open[bestIndex];
		this.animateCurrentPath(ctx, current);

		if (current === this.end) {
			this.resolveSolution();
			return;
		}

		this.open.splice(bestIndex, 1);
		this.closed.push(current);

		for (const neighbor of current.getNeighbors(this.nodes, true, false)) {
			const tentativeGScore = getG(current) + AStar.heuristic(current, neighbor);

			if (tentativeGScore < getG(neighbor)) {
				neighbor.parent = current;
				this.gScore.set(neighbor, tentativeGScore);
				this.fScore.set(neighbor, tentativeGScore + AStar.heuristic(neighbor, this.end));

				if (!this.open.includes(neighbor)) {
					this.open.push(neighbor);
				}
			}
		}

		requestAnimationFrame(() => this.solutionIteration(ctx));
	}
}
