import type { AreaChartSeries } from '@mantine/charts';
import type { HuginData } from 'tsclients/proto/hugin.pb';

export type HuginKeys = Exclude<keyof HuginData, 'eventCount'>;
export type Subsystems = 'all' | 'Forseti' | 'Tyr' | 'Sigrun' | 'Bragi';
type Period = 'lastday' | 'lastmonth' | 'lastyear';
export type Stats = {
  data: Record<string, string | number>[];
  series: AreaChartSeries[];
};

const colors = [
  'red',
  'grape',
  'violet',
  'blue',
  'cyan',
  'green',
  'lime',
  'yellow',
  'orange',
  'teal',
];

export function makeStat(
  stats: HuginData[] | null | undefined,
  field: HuginKeys,
  subsystem: Subsystems,
  period: Period
): Stats | null {
  if (!stats) return null;

  const selected = stats.filter((item) => subsystem === 'all' || item.siteId === subsystem);
  const entries = selected.map((item) => ({
    date: item.datetime,
    values:
      field === 'uniqCount'
        ? { uniqCount: item.uniqCount ?? 0 }
        : (JSON.parse(item[field].toString()) as Record<string, string | number>),
  }));
  const labels = Array.from(new Set(entries.flatMap((item) => Object.keys(item.values))));
  // Category labels can contain dots or brackets, which Recharts treats as property paths.
  const series = labels.map((label, index) => ({
    name: `series${index}`,
    label,
    color: colors[index % colors.length],
  }));
  const dates = sortDates(period, Array.from(new Set(entries.map((item) => item.date))));
  const rows = new Map<string, Record<string, string | number>>(
    dates.map((date) => [
      date,
      { date, ...Object.fromEntries(series.map(({ name }) => [name, 0])) },
    ])
  );
  for (const item of entries) {
    const row = rows.get(item.date)!;
    for (const { name, label } of series) {
      row[name] = Number(row[name]) + (parseInt(String(item.values[label] ?? 0), 10) || 0);
    }
  }
  return { data: Array.from(rows.values()), series };
}

function sortDates(period: Period, dates: string[]) {
  dates.sort((a, b) => Number(a) - Number(b));
  const now = new Date();
  const compareTo =
    period === 'lastday'
      ? now.getHours() + 1
      : period === 'lastmonth'
        ? now.getDate() + 1
        : now.getMonth() + 1;
  return [
    ...dates.filter((date) => Number(date) > compareTo),
    ...dates.filter((date) => Number(date) <= compareTo),
  ];
}
