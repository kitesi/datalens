<script lang="ts">
	import { currentDataset } from '$lib/store';
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';

	function switchDataset(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		currentDataset.set(value);
	}

	const dispatch = createEventDispatcher();

	function generateRandomDataset() {
		dispatch('generate-new', get(currentDataset));
	}
</script>

<div class="m-4 mb-8 rounded-lg border border-gray-700 bg-gray-900 p-4">
	<div class="mb-4 flex items-center justify-center">
		<label for="dataset" class="mr-2 text-lg text-white">Select Dataset:</label>
		<select
			id="dataset"
			class="rounded-md bg-gray-800 p-2 text-white shadow"
			on:change={switchDataset}
			value={$currentDataset}
		>
			<option value="linear">Linear</option>
			<option value="quadratic">Quadratic</option>
			<option value="cubic">Cubic</option>
		</select>
		<button
			class="ml-4 rounded-md bg-blue-800 p-2 text-white shadow transition hover:bg-blue-700"
			on:click={generateRandomDataset}
		>
			Generate New
		</button>
	</div>
	<slot />
</div>
