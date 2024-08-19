import { CalendarDate } from './CalendarDate';

const DATE_REG_EXP = /^(\d{4})-(\d{2})-(\d{2})$/;

const DATE_TIME_REG_EXP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseWithDates<T>(text: string): T {
  return JSON.parse(text, (_key: string, value: unknown) => {
    if (typeof value !== 'string') {
      return value;
    }

    const dateMatch = value.match(DATE_REG_EXP);

    if (dateMatch) {
      const [, year, month, day] = dateMatch;

      return new CalendarDate(Number(year), Number(month), Number(day));
    }

    if (DATE_TIME_REG_EXP.test(value)) {
      return new Date(value);
    }

    return value;
  });
}
