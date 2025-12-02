import type { DayOfWeek } from '../../types';

export const dayOrder: DayOfWeek[] = ['MO', 'TU', 'WE', 'TH', 'FR'];

export const dayPatternMap = {
  'MO-WE': ['MO', 'WE'],
  'TU-TH': ['TU', 'TH'],
  'WE-FR': ['WE', 'FR'],
  MO: ['MO'],
  TU: ['TU'],
  WE: ['WE'],
  TH: ['TH'],
  FR: ['FR'],
} as const;

export type DayPatternKey = keyof typeof dayPatternMap;

export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (mins: number) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
};

export const getTimeBlock = (startMinutes: number) => {
  if (startMinutes >= 17 * 60) return 'evening';
  if (startMinutes >= 13 * 60) return 'afternoon';
  return 'morning';
};

export const toDurationMinutes = (hours: number) => Math.round(hours * 60);

export const hasBufferConflict = (
  start: number,
  end: number,
  existing: { start: number; end: number }[],
  bufferMinutes: number,
) =>
  existing.some((slot) => {
    const paddedStart = slot.start - bufferMinutes;
    const paddedEnd = slot.end + bufferMinutes;
    return start < paddedEnd && end > paddedStart;
  });

export const isDayAfterLecture = (candidateDay: DayOfWeek, lecturePattern?: DayPatternKey) => {
  if (!lecturePattern) return true;
  const lectureDays = dayPatternMap[lecturePattern];
  const candidateIndex = dayOrder.indexOf(candidateDay);
  return lectureDays.some((day) => candidateIndex >= dayOrder.indexOf(day));
};

export const formatMeetingLabel = (start: string, end: string, pattern: DayPatternKey) =>
  `${pattern} ${start}–${end}`;
