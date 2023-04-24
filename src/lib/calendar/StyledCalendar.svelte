<script lang="ts">
	import Calendar from './Calendar.svelte';

	let date: Date | undefined = undefined;
</script>

<div class="parent">
	<Calendar selectedDate={date} />
</div>

<style>
	.parent :global(.calendar) {
		border: 5px solid green;
	}
</style>
