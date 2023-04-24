<script lang="ts">
	import {
		format,
		getWeek,
		getYear,
		isFirstDayOfMonth,
		isSameMonth,
		isToday,
		isWeekend,
		startOfMonth,
		startOfToday
	} from 'date-fns';
	import { create_weeks, get_day_names, get_next_start_week_no } from './calendar';
	import de from 'date-fns/locale/de';
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import { scale } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let selectedDate: Date | undefined;
	/** Inital focus for calendar; defaults to today */
	export let initialDate = new Date();

	const day_names = get_day_names(de);

	let dates_wrapper: HTMLElement;
	let current_date = initialDate;

	const buffer = 6;
	let first_week_no = getWeek(startOfMonth(current_date), { locale: de }) - buffer;

	let weeks = create_weeks(getYear(current_date), first_week_no, 4 + 2 * buffer);

	onMount(() => {
		// start of months scrolls into view
		document.querySelector(`.calendar [data-weekno="${first_week_no + buffer}"]`)?.scrollIntoView();
	});

	let scrollbar_width = 0;
	function measure(el: HTMLElement) {
		scrollbar_width = el.offsetWidth - el.clientWidth;
	}

	async function add_weeks(before: boolean) {
		const add_weeks_count = 6;

		const { week_no, year } = get_next_start_week_no(
			before ? weeks[0].year : weeks[weeks.length - 1].year,
			before ? weeks[0].week_no : weeks[weeks.length - 1].week_no,
			before ? add_weeks_count : 1,
			before ? 'prev' : 'next'
		);

		if (before) {
			first_week_no = week_no;

			// TODO: this should be 0 all the time?
			const prev_scroll_top = dates_wrapper.scrollTop;

			weeks = [...create_weeks(year, week_no, add_weeks_count), ...weeks];

			await tick();
			dates_wrapper.scrollTop = prev_scroll_top + add_weeks_count * 44;
		} else {
			weeks = [...weeks, ...create_weeks(year, week_no, add_weeks_count)];
		}
	}

	function select_date(date: Date | undefined) {
		selectedDate = date;
		dispatch('select', { date });
	}

	function handle_scroll(e: any) {
		const { scrollTop } = e.target;

		// -34: more-height; -4: grid gap; +1 pick first fully visible row
		const week_row_index = Math.floor((scrollTop - 34 - 4) / 44) + 1;
		const start_week_info = weeks[week_row_index];
		// we are interested in the "middle" week row to determine the month
		const relevant_week = get_next_start_week_no(
			start_week_info.year,
			start_week_info.week_no,
			2,
			'next'
		);
		const last_date = weeks
			.find((w) => w.year === relevant_week.year && w.week_no === relevant_week.week_no)
			?.dates.at(-1);

		if (!last_date) return;

		current_date = last_date;
	}
</script>

<div class="calendar">
	<div class="header" style="position: relative; height:30px">
		{#key format(current_date, 'MMMM yyyy', { locale: de })}
			<div
				transition:scale
				style="position:absolute; top:0; bottom:0; left:0;display:flex; align-items:center;"
			>
				<div style="padding-left:8px">
					{format(current_date, 'MMMM yyyy', { locale: de })}
				</div>
			</div>
		{/key}
	</div>

	<div class="day-names" style="margin-right: {scrollbar_width}px;">
		<!-- week no -->
		<div>&nbsp;</div>

		{#each day_names as day_name}
			<div class="day-name">{day_name}</div>
		{/each}
	</div>

	<div class="dates-wrapper" use:measure bind:this={dates_wrapper} on:scroll={handle_scroll}>
		<div class="dates">
			<div class="more" on:click={() => add_weeks(true)} on:keyup>More</div>

			{#each weeks as week (`${week.year}_${week.week_no}`)}
				<div class="tile week-no" data-weekno={week.week_no}>
					{week.week_no}
				</div>

				{#each week.dates as date (date)}
					<!-- class:month-even={date.getMonth() % 2} -->
					<div
						title={format(date, 'dd.MM.yyyy')}
						class="tile day"
						class:weekend={isWeekend(date)}
						class:today={isToday(date)}
						class:active-month={isSameMonth(date, current_date)}
						data-month-start={isFirstDayOfMonth(date) ? format(date, 'MM.yyyy') : undefined}
						on:click={() => select_date(date)}
						on:keyup
					>
						{format(date, 'dd')}
					</div>
				{/each}
			{/each}

			<div class="more" on:click={() => add_weeks(false)} on:keyup>More</div>
		</div>
	</div>

	<div class="actions">
		<button on:click={() => select_date(undefined)}>Clear</button>
		<button on:click={() => select_date(startOfToday())}>Today</button>
	</div>
</div>

<style>
	button {
		cursor: pointer;
		padding: 3px 4px;
	}

	.calendar {
		border: 1px solid gray;
		padding: 2px;

		display: flex;
		flex-direction: column;
		gap: 4px;

		max-width: fit-content;
	}

	.header {
		padding: 4px;
		font-size: 20px;
	}

	.day-names {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		place-content: center;
		gap: 2px;
	}

	.dates {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		place-content: center;
		gap: 4px;
		padding-bottom: 4px; /* TODO only for calucations at the moment */
	}

	.dates-wrapper {
		/* 5 lines +  gaps */
		height: calc(44px * 5);
		overflow-y: scroll;
		/* does not work with resettings weeks */
		/* scroll-behavior: smooth; */
		/* scroll-snap-type: y; */
	}

	/* .snapper {
		scroll-snap-align: start;
	} */

	.more {
		display: grid;
		place-content: center;
		grid-column: span 8;
		cursor: pointer;
		border-radius: 4px;
		height: 32px;
		border: 1px solid rgba(10, 10, 10, 0.05);
	}

	.day {
		/* opacity: 0.4; */
		transition: background-color 0.2s;

		background-color: rgba(10, 10, 10, 0.05);
		cursor: pointer;
	}

	.weekend {
		background: rgba(10, 10, 10, 0.15);
	}

	.week-no {
		background: rgba(10, 10, 10, 0.6);
		color: white;
	}

	.tile {
		width: 40px;
		height: 40px;
		display: grid;
		place-content: center;
		border-radius: 4px;
	}

	.day-name {
		text-align: center;
		padding: 2px 0;
	}

	.active-month {
		/* opacity: 1; */
		transition: background-color 0.8s;

		background-color: rgba(10, 10, 10, 0.3);
	}

	.active-month.weekend {
		background: rgba(10, 10, 10, 0.5);
	}

	.today,
	.today.weekend {
		background: lightblue;
		font-weight: 900;
	}

	.actions {
		padding: 4px;
		display: flex;
		justify-content: flex-end;
		gap: 4px;
	}
</style>
