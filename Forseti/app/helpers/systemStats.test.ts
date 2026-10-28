import type { HuginData } from 'tsclients/proto/hugin.pb';
import { makeStat } from './systemStats';

const record = (
  datetime: string,
  siteId: string,
  uniqCount: number,
  browser = '{}'
): HuginData => ({
  datetime,
  siteId,
  uniqCount,
  browser,
  country: '{}',
  city: '{}',
  os: '{}',
  device: '{}',
  language: '{}',
  eventCount: 0,
  screen: '{}',
  eventType: '{}',
  hostname: '{}',
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 15, 10));
});

afterEach(() => vi.useRealTimers());

it('waits for data and supports an empty subsystem', () => {
  expect(makeStat(null, 'uniqCount', 'all', 'lastday')).toBeNull();
  expect(makeStat([], 'browser', 'all', 'lastday')).toEqual({ data: [], series: [] });
  expect(makeStat([record('01', 'Tyr', 2)], 'uniqCount', 'Forseti', 'lastday')).toEqual({
    data: [],
    series: [],
  });
});

it('sums unique counts across subsystems and filters a single subsystem', () => {
  const records = [record('10', 'Tyr', 2), record('10', 'Forseti', 3), record('11', 'Tyr', 4)];
  expect(makeStat(records, 'uniqCount', 'all', 'lastday')?.data).toEqual([
    { date: '10', series0: 5 },
    { date: '11', series0: 4 },
  ]);
  expect(makeStat(records, 'uniqCount', 'Forseti', 'lastday')?.data).toEqual([
    { date: '10', series0: 3 },
  ]);
});

it('aligns categories by date, fills missing values, and preserves literal labels', () => {
  const result = makeStat(
    [
      record('10', 'Tyr', 0, '{"Browser 1.2":2,"Other[0]":1}'),
      record('10', 'Forseti', 0, '{"Browser 1.2":3}'),
      record('12', 'Tyr', 0, '{"Other[0]":4}'),
    ],
    'browser',
    'all',
    'lastday'
  );
  expect(result?.series).toEqual([
    { name: 'series0', label: 'Browser 1.2', color: 'red' },
    { name: 'series1', label: 'Other[0]', color: 'grape' },
  ]);
  expect(result?.data).toEqual([
    { date: '12', series0: 0, series1: 4 },
    { date: '10', series0: 5, series1: 1 },
  ]);
});

it.each([
  ['lastday', ['2', '10', '11', '12'], ['12', '2', '10', '11']],
  ['lastmonth', ['2', '15', '16', '20'], ['20', '2', '15', '16']],
  ['lastyear', ['2', '9', '10', '12'], ['12', '2', '9', '10']],
] as const)('orders rolling buckets numerically for %s', (period, dates, expected) => {
  expect(
    makeStat(
      dates.map((date) => record(date, 'Forseti', 1)),
      'uniqCount',
      'all',
      period
    )?.data.map((row) => row.date)
  ).toEqual(expected);
});
