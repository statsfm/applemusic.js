export class CalendarDate {
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
