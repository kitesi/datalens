import { get } from 'svelte/store';
import { currentManualNode, solutionSolved, solutionStarted, stopped } from './stores';

export const COLORS = {
	bg: '#000000',
	wall: '#000000',
	open: '#006E51',
	closed: '#6B5B95',
	start: '#DD4132',
	end: '#0083FF',
	default: '#262e36',
	path: '#E5A227'
};

export abstract class Grid {
	rows: number = 20;
	columns: number = 20;
	ts: number = 25;

	mouseDown: boolean = false;

	start!: Node;
	end!: Node;
	nodes!: Node[][];

	constructor(canvas: HTMLCanvasElement) {
		canvas.width = this.ts * this.columns;
		canvas.height = this.ts * this.rows;

		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Canvas context not found');
		}

		this.init(canvas, ctx);
	}

	init(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		currentManualNode.set('');
		solutionSolved.set(false);
		solutionStarted.set(false);
		stopped.set(false);

		ctx.fillStyle = COLORS.default;
		ctx.lineWidth = 4;
		ctx.strokeStyle = COLORS.bg;

		ctx.fillRect(0, 0, canvas.width, canvas.height);
		this.nodes = [];

		for (let i = 0; i < this.rows; i++) {
			this.nodes[i] = [];

			for (let j = 0; j < this.columns; j++) {
				const x = j * this.ts;
				const y = i * this.ts;

				//new instance each time, maybe not the best idea, tried to just
				//make it fillColor and set it to regular square if it already existed but didn't work
				this.nodes[i][j] = new Node(i, j);
				ctx.strokeRect(x, y, this.ts, this.ts);
			}
		}

		this.setStart(ctx, 0, 0);
		this.setEnd(ctx, this.rows - 1, this.columns - 1);
		this.addWalls(ctx, 20);
	}

	addWalls(ctx: CanvasRenderingContext2D, wallPercentage: number) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.columns; j++) {
				const node = this.nodes[i][j];
				const isWall = Math.random() < wallPercentage / 100;

				if (node === this.start || node === this.end) {
					continue;
				}

				if (isWall && !node.wall) {
					node.wall = true;
					this.fillColor(ctx, node, COLORS.wall);
				} else if (!isWall && node.wall) {
					node.wall = false;
					this.fillColor(ctx, node, COLORS.default);
				}
			}
		}
	}

	setStart(ctx: CanvasRenderingContext2D, i: number, j: number) {
		if (this.end && this.end.i === i && this.end.j === j) return;

		if (this.start) {
			this.fillColor(ctx, this.start, COLORS.default);
		}

		this.start = this.nodes[i][j];
		this.start.wall = false;
		this.fillColor(ctx, this.start, COLORS.start);
	}

	setEnd(ctx: CanvasRenderingContext2D, i: number, j: number) {
		if (this.start && this.start.i === i && this.start.j === j) return;

		if (this.end) {
			this.fillColor(ctx, this.end, COLORS.default);
		}

		this.end = this.nodes[i][j];
		this.end.wall = false;
		this.fillColor(ctx, this.end, COLORS.end);
	}

	fillColor(ctx: CanvasRenderingContext2D, node: Node, color: string) {
		if (ctx.fillStyle !== color) {
			ctx.fillStyle = color;
		}

		const x = node.j * this.ts;
		const y = node.i * this.ts;

		ctx.fillRect(x, y, this.ts, this.ts);
		ctx.strokeRect(x, y, this.ts, this.ts);
	}

	manuallyDrawNode(ev: MouseEvent, ctx: CanvasRenderingContext2D) {
		const currentManualNode_ = get(currentManualNode);
		if (!currentManualNode || !this.mouseDown || get(solutionStarted)) return;

		const { top, left } = (ev.target as HTMLElement).getBoundingClientRect();

		const i = Math.floor((ev.clientY - top) / this.ts);
		const j = Math.floor((ev.clientX - left) / this.ts);

		const node = this.nodes[i][j];

		if (currentManualNode_ === 'start') {
			this.setStart(ctx, i, j);
		} else if (currentManualNode_ === 'end') {
			this.setEnd(ctx, i, j);
		} else if (currentManualNode_ === 'wall' && !ev.shiftKey) {
			if (!node.wall) {
				node.wall = true;
				this.fillColor(ctx, node, COLORS.wall);
			}
		} else if (
			currentManualNode_ === 'remove-wall' ||
			(currentManualNode_ === 'wall' && ev.shiftKey)
		) {
			if (node.wall) {
				node.wall = false;
				this.fillColor(ctx, node, COLORS.default);
			}
		}
	}

	solve(ctx: CanvasRenderingContext2D) {
		currentManualNode.set('');
		solutionStarted.set(true);
		this.solutionIteration(ctx);
	}

	stopSolution() {
		stopped.set(true);
	}

	resumeSolution(ctx: CanvasRenderingContext2D) {
		stopped.set(false);
		this.solutionIteration(ctx);
	}

	resolveSolution() {
		stopped.set(false);
		solutionSolved.set(true);
	}

	abstract solutionIteration(ctx: CanvasRenderingContext2D): void;

	animateCurrentPath(ctx: CanvasRenderingContext2D, path: Node) {
		let temp: Node | undefined = path;

		while (temp) {
			this.fillColor(ctx, temp, COLORS.path);
			temp = temp.parent;
		}
	}

	heuristic(a: Node, b: Node) {
		return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
	}
}

export class Node {
	i: number;
	j: number;
	wall: boolean;
	siblings?: Node[];
	parent?: Node;

	constructor(i: number, j: number) {
		this.i = i;
		this.j = j;
		this.wall = false;
	}

	getSiblings(grid: Node[][], checkDiagonals: boolean, checkCornerDiagonals: boolean) {
		if (this.siblings) return this.siblings;

		const siblings: Node[] = [];
		const { i, j } = this;

		function getRelativeNode(changeI: number, changeJ: number) {
			const row = grid[i + changeI];
			return row && row[j + changeJ];
		}

		function trySibling(changeI: number, changeJ: number, cornerWallChecks?: number[][]) {
			const node = getRelativeNode(changeI, changeJ);

			if (node && !node.wall) {
				if (!checkCornerDiagonals && cornerWallChecks) {
					let walls = 0;

					for (const adjacentNodeChanges of cornerWallChecks) {
						const adjacaentNode = getRelativeNode(adjacentNodeChanges[0], adjacentNodeChanges[1]);

						if (adjacaentNode && adjacaentNode.wall) {
							walls++;
						}
					}

					if (walls === 2) {
						return;
					}
				}

				siblings.push(node);
			}
		}

		trySibling(-1, 0);
		trySibling(1, 0);
		trySibling(0, -1);
		trySibling(0, 1);

		if (checkDiagonals) {
			//the third argument here is an array of two transformations you need to do
			//to check if there are corner walls, the first array is an array of the transformations
			//you need to do for the first adjacent node and the second array is an array of the
			//transformations you need to do for the second adjacaent node
			//note: adjacent from the current node and to the next possible node

			trySibling(-1, 1, [
				[-1, 0],
				[0, 1]
			]);

			trySibling(1, 1, [
				[1, 0],
				[0, 1]
			]);

			trySibling(1, -1, [
				[0, -1],
				[1, 0]
			]);

			trySibling(-1, -1, [
				[-1, 0],
				[0, -1]
			]);
		}

		this.siblings = siblings;
		return siblings;
	}

	// public LinkedList<Cell> getNeighbors(Cell c) {
	//     LinkedList<Cell> cells = new LinkedList<Cell>();
	//     int[][] steps = new int[][] { { -1, 0 }, { 1, 0 }, { 0, 1 }, { 0, -1 } };
	//     // int[][] steps = new int[][] { { -1, 0 }, { 1, 0 }, { 0, 1 }, { 0, -1 },
	//     // { 1, 1 }, { 1, -1 }, { -1, 1 }, { -1, -1 } };
	//     for (int[] step : steps) {
	//         int nextRow = c.getRow() + step[0];
	//         int nextCol = c.getCol() + step[1];
	//         if (nextRow >= 0 && nextRow < getRows() && nextCol >= 0 && nextCol < getCols()
	//                 && get(nextRow, nextCol).getType() != CellType.OBSTACLE)
	//             cells.addLast(get(nextRow, nextCol));
	//     }
	//     return cells;
	// }
}
