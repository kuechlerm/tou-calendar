import { describe, test, expect } from 'vitest';
import { create_weeks, get_next_start_week_no, get_weekdates } from './calendar';

describe('calendar', () => {
	describe('get_weekdates', () => {
		test('1 / 2023', () => {
			expect(get_weekdates(1, 2023)).toEqual([
				new Date(2023, 0, 2),
				new Date(2023, 0, 3),
				new Date(2023, 0, 4),
				new Date(2023, 0, 5),
				new Date(2023, 0, 6),
				new Date(2023, 0, 7),
				new Date(2023, 0, 8)
			]);
		});

		test('14 / 2023', () => {
			expect(get_weekdates(14, 2023)).toEqual([
				new Date(2023, 3, 3),
				new Date(2023, 3, 4),
				new Date(2023, 3, 5),
				new Date(2023, 3, 6),
				new Date(2023, 3, 7),
				new Date(2023, 3, 8),
				new Date(2023, 3, 9)
			]);
		});
	});

	describe('create_weeks', () => {
		test('simple', () => {
			expect(create_weeks(2023, 1, 2)).toEqual([
				{
					week_no: 1,
					year: 2023,
					dates: [
						new Date(2023, 0, 2),
						new Date(2023, 0, 3),
						new Date(2023, 0, 4),
						new Date(2023, 0, 5),
						new Date(2023, 0, 6),
						new Date(2023, 0, 7),
						new Date(2023, 0, 8)
					]
				},
				{
					week_no: 2,
					year: 2023,
					dates: [
						new Date(2023, 0, 9),
						new Date(2023, 0, 10),
						new Date(2023, 0, 11),
						new Date(2023, 0, 12),
						new Date(2023, 0, 13),
						new Date(2023, 0, 14),
						new Date(2023, 0, 15)
					]
				}
			]);
		});

		test('with year change', () => {
			expect(create_weeks(2022, 52, 2)).toEqual([
				{
					week_no: 52,
					year: 2022,
					dates: [
						new Date(2022, 11, 26),
						new Date(2022, 11, 27),
						new Date(2022, 11, 28),
						new Date(2022, 11, 29),
						new Date(2022, 11, 30),
						new Date(2022, 11, 31),
						new Date(2023, 0, 1)
					]
				},
				{
					week_no: 1,
					year: 2023,
					dates: [
						new Date(2023, 0, 2),
						new Date(2023, 0, 3),
						new Date(2023, 0, 4),
						new Date(2023, 0, 5),
						new Date(2023, 0, 6),
						new Date(2023, 0, 7),
						new Date(2023, 0, 8)
					]
				}
			]);
		});
	});

	describe('get_next_start_week_no', () => {
		test('next in same year', () => {
			expect(get_next_start_week_no(2023, 1, 1, 'next')).toEqual({
				week_no: 2,
				year: 2023
			});
		});

		test('prev in same year', () => {
			expect(get_next_start_week_no(2023, 2, 1, 'prev')).toEqual({
				week_no: 1,
				year: 2023
			});
		});

		test('next in next year', () => {
			expect(get_next_start_week_no(2023, 52, 1, 'next')).toEqual({
				week_no: 1,
				year: 2024
			});
		});

		test('next far in next year', () => {
			expect(get_next_start_week_no(2023, 52, 4, 'next')).toEqual({
				week_no: 4,
				year: 2024
			});
		});

		test('prev in last year', () => {
			expect(get_next_start_week_no(2023, 1, 1, 'prev')).toEqual({
				week_no: 52,
				year: 2022
			});
		});

		test('prev far in last year', () => {
			expect(get_next_start_week_no(2023, 1, 4, 'prev')).toEqual({
				week_no: 49,
				year: 2022
			});
		});
	});
});
