import type { DayPattern, Subject } from '../../types';
import { dayPatternMap, getTimeBlock, isDayAfterLecture } from './timeUtils';

interface CourseMeta {
  subject?: Subject;
  courseNumber?: number;
  isLab?: boolean;
  lectureDayPattern?: DayPattern;
}

export const getBufferMinutes = (meta: CourseMeta) => (meta.isLab ? 60 : 15);

export const meetsTimePreference = (meta: CourseMeta, startMinutes: number) => {
  const block = getTimeBlock(startMinutes);
  const level = meta.courseNumber ?? 0;
  if (meta.subject === 'Chemistry' && level >= 301) {
    return block === 'morning';
  }
  if (level >= 301) {
    return meta.isLab ? block === 'evening' : block === 'afternoon';
  }
  return true;
};

export const labPatternAllowed = (meta: CourseMeta, candidatePattern: DayPattern) => {
  if (!meta.isLab || (meta.courseNumber ?? 0) < 301) return true;
  const candidateDays = dayPatternMap[candidatePattern];
  return candidateDays.some((day) => isDayAfterLecture(day, meta.lectureDayPattern));
};
