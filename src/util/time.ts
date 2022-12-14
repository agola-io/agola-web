import { DateTime, Duration } from 'luxon';

export interface StartEnd {
  startTime?: Date;
  endTime?: Date;
}

export function _formatDuration(d: Duration): string {
  let formatString = "s's'";
  const millis = d.toMillis();
  if (millis >= 3600 * 1000) formatString = "h:mm:ss's'";
  else if (millis >= 60 * 1000) formatString = "mm:ss's'";
  else if (millis >= 10 * 1000) formatString = "ss's'";

  return d.toFormat(formatString);
}

export function formatDuration(se: StartEnd, now: Date): string {
  const start = DateTime.fromJSDate(se.startTime ?? new Date(0));
  const end = DateTime.fromJSDate(se.endTime ?? new Date(0));
  const lnow = DateTime.fromJSDate(now);

  if (!se.startTime) {
    return _formatDuration(Duration.fromMillis(0));
  }
  if (!se.endTime) {
    return _formatDuration(lnow.diff(start));
  }
  return _formatDuration(end.diff(start));
}

export function endTime(se: StartEnd): string {
  const formatString = 'FF';
  const end = DateTime.fromJSDate(se.endTime ?? new Date(0));

  if (!se.endTime) {
    return '';
  }
  return 'Finished ' + end.toFormat(formatString);
}

export function endTimeHuman(se: StartEnd): string | undefined {
  if (!se.endTime) {
    return '';
  }

  const end = DateTime.fromJSDate(se.endTime);

  return end.toRelative() ?? undefined;
}
