import { add, setWeek, startOfWeek, type Locale, getYear, getISOWeeksInYear } from 'date-fns';
import { de } from 'date-fns/locale';

export function get_weekdates(week_no: number, year: number) {
	const safe_start_date = new Date(year, 0, 5);

	const week_date = setWeek(safe_start_date, week_no, { locale: de });
	const start_of_week = startOfWeek(week_date, { locale: de });

	return Array.from({ length: 7 }, (_, i) => add(start_of_week, { days: i }));
}

export function get_day_names(locale: Locale) {
	return [...Array(7).keys()]
		.sort((a, b) => {
			if (b < (de.options?.weekStartsOn ?? 0)) return -1;
			return a - b;
		})
		.map((i) => de.localize?.day(i, { width: 'abbreviated' }, { locale }))
		.map((name) => name.substr(0, 2));
}

export function create_weeks(year: number, start_week_no: number, count: number) {
	return Array.from({ length: count }).map((_, i) => {
		const dates = get_weekdates(start_week_no + i, year);
		return {
			...get_next_start_week_no(year, start_week_no, i, 'next'),
			dates
		};
	});
}

export function get_next_start_week_no(
	year: number,
	start_week_no: number,
	diff: number,
	direction: 'next' | 'prev'
) {
	const next_week = start_week_no + diff * (direction === 'next' ? 1 : -1);

	if (direction === 'next') {
		const week_no_threshold = direction === 'next' ? getISOWeeksInYear(new Date(year, 0, 1)) : 1;
		if (next_week > week_no_threshold) {
			return {
				week_no: next_week - week_no_threshold,
				year: year + 1
			};
		}
	}

	if (direction === 'prev' && next_week < 1) {
		const no_weeks_last_year = getISOWeeksInYear(new Date(year - 1, 0, 1));
		return {
			// + cus next_week is negative
			week_no: no_weeks_last_year + next_week,
			year: year - 1
		};
	}

	return { week_no: next_week, year };
}
