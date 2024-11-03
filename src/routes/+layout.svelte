<script lang="ts">
	import '../app.css';
	import TabHeader from '../components/TabHeader.svelte';
	let { children } = $props();
</script>

<div class="flex h-full flex-col">
	<TabHeader />

	<div class="flex-1 px-4">
		{@render children()}
	</div>
</div>
