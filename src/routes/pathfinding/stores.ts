import { writable } from 'svelte/store';

export const currentManualNode = writable('');
export const solutionStarted = writable(false);
export const solutionSolved = writable(false);
export const stopped = writable(false);
