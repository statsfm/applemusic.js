const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export class CalendarDate {
  static parse(string: string): CalendarDate | undefined {
    const match = string.match(datePattern);

    if (match) {
      const [, year, month, day] = match;

      return new CalendarDate(Number(year), Number(month), Number(day));
    } else {
      return undefined;
    }
  }

  constructor(
    // eslint-disable-next-line no-unused-vars
    public readonly year: number,
    // eslint-disable-next-line no-unused-vars
    public readonly month: number,
    // eslint-disable-next-line no-unused-vars
    public readonly day: number
  ) {}

  toUTCDate(): Date {
    return new Date(this.year, this.month, this.day);
  }
}
