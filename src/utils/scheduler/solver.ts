import type {
  CourseDefinition,
  DayPattern,
  DayOfWeek,
  Room,
  ScheduleResult,
  ScheduledSection,
} from '../../types';
import {
  allowedPatterns,
  computeSectionSplit,
  getCompatibleRooms,
  getAllowedRoomTypes,
  patternDays,
} from './constraints';
import {
  dayPatternMap,
  formatMeetingLabel,
  hasBufferConflict,
  minutesToTime,
  timeToMinutes,
  toDurationMinutes,
} from './timeUtils';
import { getBufferMinutes, labPatternAllowed, meetsTimePreference } from './rules';

type Booking = { start: number; end: number };
type ScheduleState = {
  sections: ScheduledSection[];
  warnings: string[];
  roomBookings: Map<string, Map<DayOfWeek, Booking[]>>;
  teacherBookings: Map<string, Map<DayOfWeek, Booking[]>>;
};

interface SchedulerInput {
  courses: CourseDefinition[];
  rooms: Room[];
}

const baseState = (): ScheduleState => ({
  sections: [],
  warnings: [],
  roomBookings: new Map(),
  teacherBookings: new Map(),
});

const orderCourses = (courses: CourseDefinition[], rooms: Room[]) => {
  const compatibilitySize = (course: CourseDefinition) => getCompatibleRooms(course, rooms).length || 99;
  return [...courses].sort((a, b) => {
    if (a.isLab !== b.isLab) return a.isLab ? -1 : 1;
    if (a.totalEnrollment !== b.totalEnrollment) return b.totalEnrollment - a.totalEnrollment;
    return compatibilitySize(a) - compatibilitySize(b);
  });
};

const registerBooking = (
  bookings: Map<string, Map<DayOfWeek, Booking[]>>,
  key: string,
  day: DayOfWeek,
  slot: Booking,
) => {
  const resource = bookings.get(key) ?? new Map();
  const dayBookings = resource.get(day) ?? [];
  dayBookings.push(slot);
  resource.set(day, dayBookings);
  bookings.set(key, resource);
};

const hasScheduleConflict = (
  bookings: Map<string, Map<DayOfWeek, Booking[]>>,
  key: string,
  day: DayOfWeek,
  slot: Booking,
  buffer: number,
) => {
  const resource = bookings.get(key);
  if (!resource) return false;
  const dayBookings = resource.get(day) ?? [];
  return hasBufferConflict(slot.start, slot.end, dayBookings, buffer);
};

const generateCandidates = (
  course: CourseDefinition,
  room: Room,
): { start: string; end: string; startMinutes: number }[] => {
  const duration = toDurationMinutes(course.durationHours);
  const roomStart = timeToMinutes(room.availableHours.start);
  const roomEnd = timeToMinutes(room.availableHours.end);
  const latestStart = roomEnd - duration;
  const candidates: { start: string; end: string; startMinutes: number }[] = [];
  for (let start = roomStart; start <= latestStart; start += 30) {
    const end = start + duration;
    candidates.push({ start: minutesToTime(start), end: minutesToTime(end), startMinutes: start });
  }
  return candidates;
};

const isDaySetAvailable = (room: Room, pattern: DayPattern) => {
  const needed = patternDays(pattern);
  return needed.every((day) => room.availableDays.includes(day));
};

const attemptPlaceSection = (
  course: CourseDefinition,
  sectionNumber: number,
  enrollmentCap: number,
  rooms: Room[],
  state: ScheduleState,
): { success: boolean; warning?: string } => {
  const compatibleRooms = getCompatibleRooms(course, rooms).sort((a, b) => {
    const diffA = Math.abs(a.capacity - enrollmentCap);
    const diffB = Math.abs(b.capacity - enrollmentCap);
    return diffA - diffB;
  });
  const patterns = allowedPatterns(course.daysPerWeek);
  const buffer = getBufferMinutes(course);

  for (const pattern of patterns) {
    for (const room of compatibleRooms) {
      if (!isDaySetAvailable(room, pattern) || !labPatternAllowed(course, pattern)) continue;
      const candidates = generateCandidates(course, room);
      for (const candidate of candidates) {
        const slot: Booking = {
          start: candidate.startMinutes,
          end: candidate.startMinutes + toDurationMinutes(course.durationHours),
        };
        const days = dayPatternMap[pattern];
        const conflicts = days.some(
          (day) =>
            hasScheduleConflict(state.roomBookings, room.id, day, slot, buffer) ||
            hasScheduleConflict(state.teacherBookings, course.teacher, day, slot, 0),
        );
        if (conflicts) continue;

        const section: ScheduledSection = {
          id: `${course.id}-S${sectionNumber}`,
          courseId: course.id,
          sectionNumber,
          roomId: room.id,
          teacher: course.teacher,
          dayPattern: pattern,
          startTime: candidate.start,
          endTime: candidate.end,
          enrollmentCapacity: enrollmentCap,
          isLab: course.isLab,
          subject: course.subject,
          courseNumber: course.courseNumber,
          durationHours: course.durationHours,
          daysPerWeek: course.daysPerWeek,
          lectureDayPattern: course.lectureDayPattern,
        };

        state.sections.push(section);
        days.forEach((day) => {
          registerBooking(state.roomBookings, room.id, day, slot);
          registerBooking(state.teacherBookings, course.teacher, day, slot);
        });

        const preferenceOk = meetsTimePreference(course, candidate.startMinutes);
        const warning = preferenceOk
          ? undefined
          : `${course.id} placed at ${formatMeetingLabel(candidate.start, candidate.end, pattern)} outside preferred block`;
        if (warning) state.warnings.push(warning);
        return { success: true, warning };
      }
    }
  }
  return { success: false };
};

export const generateSchedule = ({ courses, rooms }: SchedulerInput): ScheduleResult => {
  const state = baseState();
  const ordered = orderCourses(courses, rooms);
  const conflicts: string[] = [];
  const unscheduled: CourseDefinition[] = [];

  for (const course of ordered) {
    const { sections, perSectionCap } = computeSectionSplit(course, rooms);
    if (!sections || !perSectionCap) {
      conflicts.push(`No compatible rooms for ${course.id} (${getAllowedRoomTypes(course).join(', ')})`);
      unscheduled.push(course);
      continue;
    }

    for (let i = 0; i < sections; i += 1) {
      const placement = attemptPlaceSection(course, i + 1, perSectionCap, rooms, state);
      if (!placement.success) {
        conflicts.push(`Unable to place section ${i + 1} of ${course.id}`);
        unscheduled.push(course);
        break;
      }
    }
  }

  return {
    sections: state.sections,
    conflicts,
    warnings: state.warnings,
    unscheduled: Array.from(new Set(unscheduled)),
  };
};
