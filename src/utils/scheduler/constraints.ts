import type { CourseDefinition, DayPattern, Room, RoomType, Subject } from '../../types';
import { dayPatternMap } from './timeUtils';

const roomCompatibility: Record<Subject, Record<number, RoomType[]>> = {
  Biology: {
    101: ['Biology Lecture', 'General Lecture'],
    201: ['Biology Lecture', 'General Lecture'],
    301: ['Biology Lab'],
    401: ['Biology Lab'],
  },
  Chemistry: {
    101: ['Chemistry Lecture'],
    201: ['Chemistry Lecture'],
    301: ['Chemistry Lab'],
    401: ['Chemistry Lab'],
  },
  Physiology: {
    101: ['Physiology Lecture'],
    201: ['Physiology Lecture'],
    301: ['Physiology Lab'],
    401: ['Physiology Lab'],
  },
  Math: {
    101: ['Math Lecture'],
    201: ['Math Lecture'],
    301: ['Math Lab'],
    401: ['Math Lab'],
  },
};

export const allowedPatterns = (daysPerWeek: number): DayPattern[] => {
  if (daysPerWeek === 2) return ['MO-WE', 'TU-TH', 'WE-FR'];
  return ['MO', 'TU', 'WE', 'TH', 'FR'];
};

export const getCompatibleRooms = (course: CourseDefinition, rooms: Room[]) => {
  const roomTypes = getAllowedRoomTypes(course);
  return rooms
    .filter((room) => roomTypes.includes(room.type))
    .sort((a, b) => b.capacity - a.capacity);
};

export const getAllowedRoomTypes = (course: CourseDefinition): RoomType[] =>
  roomCompatibility[course.subject][course.courseNumber];

export const computeSectionSplit = (course: CourseDefinition, rooms: Room[]) => {
  const compatible = getCompatibleRooms(course, rooms);
  const maxCapacity = compatible.reduce((max, room) => Math.max(max, room.capacity), 0);
  if (!maxCapacity) return { sections: 0, perSectionCap: 0 };
  const sectionsNeeded = Math.ceil(course.totalEnrollment / maxCapacity);
  const enrollmentPerSection = Math.ceil(course.totalEnrollment / sectionsNeeded);
  return { sections: sectionsNeeded, perSectionCap: enrollmentPerSection };
};

export const patternDays = (pattern: DayPattern) => dayPatternMap[pattern];
