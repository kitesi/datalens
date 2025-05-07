/**
 * Disk scheduling algorithms implementation
 */

export function FCFS(
	request: number[],
	head: number,
	minVal: number,
	maxVal: number,
	direction = 'left'
) {
	/**
	 * First-Come-First-Served (FCFS) disk scheduling algorithm.
	 * Processes requests in the exact order they arrive, without any optimization.
	 */
	let steps = 0;
	let prev = head;
	const sequence = [head, ...request];

	for (let i = 1; i < sequence.length; i++) {
		const r = sequence[i];
		steps += Math.abs(r - prev);
		prev = r;
	}

	return { steps, sequence };
}

export function SSTF(
	request: number[],
	head: number,
	minVal: number,
	maxVal: number,
	direction = 'left'
) {
	/**
	 * Shortest Seek Time First (SSTF) disk scheduling algorithm.
	 * Always chooses the request that requires the least head movement from current position.
	 */
	if (request.length === 0) {
		return { steps: 0, sequence: [] };
	}

	let steps = 0;
	let prev = head;
	const localRequests = [...request];
	const sequence = [head];

	while (localRequests.length > 0) {
		// Find the closest request to current position
		let closestIndex = 0;
		let minDistance = Math.abs(localRequests[0] - prev);

		for (let i = 1; i < localRequests.length; i++) {
			const distance = Math.abs(localRequests[i] - prev);
			if (distance < minDistance) {
				minDistance = distance;
				closestIndex = i;
			}
		}

		const closest = localRequests[closestIndex];
		steps += Math.abs(closest - prev);
		prev = closest;
		localRequests.splice(closestIndex, 1);
		sequence.push(closest);
	}

	return { steps, sequence };
}

export function SCAN(
	request: number[],
	head: number,
	minVal: number,
	maxVal: number,
	direction = 'left'
) {
	/**
	 * SCAN (Elevator) disk scheduling algorithm.
	 * Moves the head in one direction until reaching the end, then reverses direction.
	 * Always goes to the disk boundaries.
	 */
	let steps = 0;
	const left = [];
	const right = [];

	if (direction === 'left') {
		left.push(minVal);
	} else {
		right.push(maxVal);
	}

	for (const n of request) {
		if (n < head) {
			left.push(n);
		} else if (n > head) {
			right.push(n);
		}
	}

	left.sort((a, b) => a - b);
	right.sort((a, b) => a - b);

	let run = 2;
	let prev = head;
	const sequence = [head];

	// Only run twice since two steps will get everything
	while (run > 0) {
		if (direction === 'left') {
			for (let i = left.length - 1; i >= 0; i--) {
				const curr = left[i];
				sequence.push(curr);
				steps += Math.abs(curr - prev);
				prev = curr;
			}
			direction = 'right';
		} else if (direction === 'right') {
			for (let i = 0; i < right.length; i++) {
				const curr = right[i];
				sequence.push(curr);
				steps += Math.abs(curr - prev);
				prev = curr;
			}
			direction = 'left';
		}
		run -= 1;
	}

	return { steps, sequence };
}

export function CSCAN(
	request: number[],
	head: number,
	minVal: number,
	maxVal: number,
	direction = 'left'
) {
	/**
	 * Circular SCAN (C-SCAN) disk scheduling algorithm.
	 * Similar to SCAN, but when the head reaches one end, it immediately jumps
	 * to the other end and continues scanning in the same direction.
	 */
	let steps = 0;
	const left = [];
	const right = [];

	for (const n of request) {
		if (n < head) {
			left.push(n);
		} else if (n > head) {
			right.push(n);
		}
	}

	left.push(minVal);
	right.push(maxVal);

	if (direction === 'left') {
		left.sort((a, b) => a - b);
		right.sort((a, b) => b - a);
	} else {
		left.sort((a, b) => b - a);
		right.sort((a, b) => a - b);
	}

	let run = 2;
	let prev = head;
	const sequence = [head];

	// Only run twice since two steps will get everything
	while (run > 0) {
		if (direction === 'left') {
			for (let i = left.length - 1; i >= 0; i--) {
				const curr = left[i];
				sequence.push(curr);
				steps += Math.abs(curr - prev);
				prev = curr;
			}
			direction = 'right';
		} else if (direction === 'right') {
			for (let i = 0; i < right.length; i++) {
				const curr = right[i];
				sequence.push(curr);
				steps += Math.abs(curr - prev);
				prev = curr;
			}
			direction = 'left';
		}
		run -= 1;
	}

	return { steps, sequence };
}

export function LOOK(
	request: number[],
	head: number,
	minVal: number,
	maxVal: number,
	direction = 'left'
) {
	/**
	 * LOOK disk scheduling algorithm.
	 * Similar to SCAN, but the head only goes as far as the last request in each direction,
	 * not all the way to the disk boundaries.
	 */
	let steps = 0;
	const left = [];
	const right = [];

	for (const n of request) {
		if (n < head) {
			left.push(n);
		} else if (n > head) {
			right.push(n);
		}
	}

	left.sort((a, b) => a - b);
	right.sort((a, b) => a - b);

	let run = 2;
	let prev = head;
	const sequence = [head];

	// Only run twice since two steps will get everything
	while (run > 0) {
		if (direction === 'left') {
			for (let i = left.length - 1; i >= 0; i--) {
				const curr = left[i];
				sequence.push(curr);
				steps += Math.abs(curr - prev);
				prev = curr;
			}
			direction = 'right';
		} else if (direction === 'right') {
			for (let i = 0; i < right.length; i++) {
				const curr = right[i];
				sequence.push(curr);
				steps += Math.abs(curr - prev);
				prev = curr;
			}
			direction = 'left';
		}
		run -= 1;
	}

	return { steps, sequence };
}

export function CLOOK(
	request: number[],
	head: number,
	minVal: number,
	maxVal: number,
	direction = 'left'
) {
	/**
	 * Circular LOOK (C-LOOK) disk scheduling algorithm.
	 * Similar to LOOK, but when the head reaches the last request in one direction,
	 * it immediately jumps to the furthest request in the opposite direction
	 * and continues in the same initial direction.
	 */
	let steps = 0;
	const left = [];
	const right = [];

	for (const n of request) {
		if (n < head) {
			left.push(n);
		} else if (n > head) {
			right.push(n);
		}
	}

	if (direction === 'left') {
		left.sort((a, b) => a - b);
		right.sort((a, b) => b - a);
	} else {
		left.sort((a, b) => b - a);
		right.sort((a, b) => a - b);
	}

	let run = 2;
	let prev = head;
	const sequence = [head];

	// Only run twice since two steps will get everything
	while (run > 0) {
		if (direction === 'left') {
			for (let i = left.length - 1; i >= 0; i--) {
				const curr = left[i];
				sequence.push(curr);
				steps += Math.abs(curr - prev);
				prev = curr;
			}
			direction = 'right';
		} else if (direction === 'right') {
			for (let i = 0; i < right.length; i++) {
				const curr = right[i];
				sequence.push(curr);
				steps += Math.abs(curr - prev);
				prev = curr;
			}
			direction = 'left';
		}
		run -= 1;
	}

	return { steps, sequence };
}

export function RSS(
	request: number[],
	head: number,
	minVal: number,
	maxVal: number,
	direction = 'left'
) {
	/**
	 * Random Scheduling Strategy (RSS) disk scheduling algorithm.
	 * Processes requests in random order, with no optimization strategy.
	 */
	let steps = 0;
	let prev = head;
	const localRequests = [...request];
	const sequence = [head];

	while (localRequests.length > 0) {
		// Choose randomly
		const randomIndex = Math.floor(Math.random() * localRequests.length);
		const curr = localRequests[randomIndex];
		steps += Math.abs(curr - prev);
		prev = curr;
		localRequests.splice(randomIndex, 1);
		sequence.push(curr);
	}

	return { steps, sequence };
}

export function LIFO(
	request: number[],
	head: number,
	minVal: number,
	maxVal: number,
	direction = 'left'
) {
	/**
	 * Last-In-First-Out (LIFO) disk scheduling algorithm.
	 * Processes requests in reverse order of arrival, handling the most recently arrived request first.
	 */
	let steps = 0;
	let prev = head;
	const sequence = [head];

	for (let i = request.length - 1; i >= 0; i--) {
		const curr = request[i];
		steps += Math.abs(curr - prev);
		prev = curr;
		sequence.push(curr);
	}

	return { steps, sequence };
}

// Export all algorithms as a single object
export const algorithms = {
	FCFS,
	SSTF,
	SCAN,
	CSCAN,
	LOOK,
	CLOOK,
	RSS,
	LIFO
};
