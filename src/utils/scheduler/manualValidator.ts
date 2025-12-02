import type { DayPattern, DayOfWeek, Room, ScheduledSection } from '../../types';
import { allowedPatterns, getAllowedRoomTypes } from './constraints';
import { dayPatternMap, formatMeetingLabel, minutesToTime, timeToMinutes } from './timeUtils';
import { getBufferMinutes, labPatternAllowed, meetsTimePreference } from './rules';

const getDurationMinutes = (section: ScheduledSection) => {
  if (section.durationHours) return Math.round(section.durationHours * 60);
  return timeToMinutes(section.endTime) - timeToMinutes(section.startTime);
};

const getDaysPerWeek = (section: ScheduledSection) => section.daysPerWeek ?? (section.dayPattern.includes('-') ? 2 : 1);

const overlapWithBuffer = (
  candidateStart: number,
  candidateEnd: number,
  otherStart: number,
  otherEnd: number,
  buffer: number,
) => candidateStart < otherEnd + buffer && candidateEnd > otherStart - buffer;

const findRoom = (rooms: Room[], roomId: string) => rooms.find((room) => room.id === roomId);

export interface PlacementValidationResult {
  valid: boolean;
  conflicts: string[];
  warnings: string[];
}

export const validateManualPlacement = (
  nextSection: ScheduledSection,
  sections: ScheduledSection[],
  rooms: Room[],
): PlacementValidationResult => {
  const conflicts: string[] = [];
  const warnings: string[] = [];
  const room = findRoom(rooms, nextSection.roomId);
  if (!room) return { valid: false, conflicts: ['Selected room no longer exists'], warnings };

  const courseNumber = (nextSection.courseNumber ?? 101) as 101 | 201 | 301 | 401;
  const allowedTypes = getAllowedRoomTypes({
    id: nextSection.courseId,
    subject: nextSection.subject!,
    courseNumber,
    teacher: nextSection.teacher,
    durationHours: nextSection.durationHours ?? (getDurationMinutes(nextSection) / 60),
    daysPerWeek: getDaysPerWeek(nextSection),
    totalEnrollment: nextSection.enrollmentCapacity,
    isLab: Boolean(nextSection.isLab),
    lectureDayPattern: nextSection.lectureDayPattern,
  });
  if (!allowedTypes.includes(room.type)) {
    conflicts.push(`Room ${room.id} incompatible (${room.type})`);
  }

  const candidateStart = timeToMinutes(nextSection.startTime);
  const candidateEnd = timeToMinutes(nextSection.endTime);
  const roomStart = timeToMinutes(room.availableHours.start);
  const roomEnd = timeToMinutes(room.availableHours.end);

  if (candidateStart < roomStart || candidateEnd > roomEnd) {
    conflicts.push(`Time outside ${room.id} availability (${room.availableHours.start}-${room.availableHours.end})`);
  }

  const candidateDays = dayPatternMap[nextSection.dayPattern] as DayOfWeek[];
  if (!candidateDays.every((day) => room.availableDays.includes(day))) {
    conflicts.push(`Room ${room.id} unavailable for ${nextSection.dayPattern}`);
  }

  const allowedPatternsForCourse = allowedPatterns(getDaysPerWeek(nextSection));
  if (!allowedPatternsForCourse.includes(nextSection.dayPattern as DayPattern)) {
    conflicts.push(`Day pattern ${nextSection.dayPattern} not allowed for this course`);
  }

  if (!labPatternAllowed(nextSection, nextSection.dayPattern)) {
    conflicts.push('Lab must be scheduled on/after a lecture day');
  }

  const others = sections.filter((s) => s.id !== nextSection.id);
  const buffer = getBufferMinutes(nextSection);

  for (const other of others) {
    const otherDays = (dayPatternMap[other.dayPattern] as DayOfWeek[]).filter((day) => candidateDays.includes(day));
    if (otherDays.length === 0) continue;
    const otherStart = timeToMinutes(other.startTime);
    const otherEnd = timeToMinutes(other.endTime);

    if (other.roomId === nextSection.roomId) {
      const otherBuffer = getBufferMinutes(other);
      const totalBuffer = Math.max(buffer, otherBuffer);
      if (overlapWithBuffer(candidateStart, candidateEnd, otherStart, otherEnd, totalBuffer)) {
        conflicts.push(
          `Room ${nextSection.roomId} busy with ${other.courseId} (${other.startTime}-${other.endTime})`,
        );
        break;
      }
    }

    if (other.teacher === nextSection.teacher) {
      if (candidateStart < otherEnd && candidateEnd > otherStart) {
        conflicts.push(`Teacher ${nextSection.teacher} busy with ${other.courseId}`);
        break;
      }
    }
  }

  if (!meetsTimePreference(nextSection, candidateStart)) {
    warnings.push(
      `${nextSection.courseId} at ${formatMeetingLabel(nextSection.startTime, nextSection.endTime, nextSection.dayPattern)} outside preferred block`,
    );
  }

  return { valid: conflicts.length === 0, conflicts, warnings };
};

export const collectTimePreferenceWarnings = (sections: ScheduledSection[]) =>
  sections
    .map((section) => {
      const startMinutes = timeToMinutes(section.startTime);
      if (meetsTimePreference(section, startMinutes)) return null;
      return `${section.courseId} at ${formatMeetingLabel(section.startTime, section.endTime, section.dayPattern)} outside preferred block`;
    })
    .filter(Boolean) as string[];

export const moveSectionTimes = (section: ScheduledSection, startMinutes: number) => {
  const duration = getDurationMinutes(section);
  const start = minutesToTime(startMinutes);
  const end = minutesToTime(startMinutes + duration);
  return { start, end };
};

export const findAlternativeSlots = (
  section: ScheduledSection,
  rooms: Room[],
  sections: ScheduledSection[],
  limit = 5,
) => {
  const alternatives: {
    roomId: string;
    startTime: string;
    endTime: string;
    dayPattern: DayPattern;
    warnings: string[];
  }[] = [];

  const courseNumber = (section.courseNumber ?? 101) as 101 | 201 | 301 | 401;
  const allowedTypes = getAllowedRoomTypes({
    id: section.courseId,
    subject: section.subject!,
    courseNumber,
    teacher: section.teacher,
    durationHours: section.durationHours ?? (getDurationMinutes(section) / 60),
    daysPerWeek: getDaysPerWeek(section),
    totalEnrollment: section.enrollmentCapacity,
    isLab: Boolean(section.isLab),
    lectureDayPattern: section.lectureDayPattern,
  });

  const compatibleRooms = rooms.filter((r) => allowedTypes.includes(r.type));
  const patterns = allowedPatterns(getDaysPerWeek(section));
  const duration = getDurationMinutes(section);

  for (const room of compatibleRooms) {
    const roomStart = timeToMinutes(room.availableHours.start);
    const roomEnd = timeToMinutes(room.availableHours.end);
    const latestStart = roomEnd - duration;

    for (const pattern of patterns) {
      // Check if room supports these days
      const neededDays = dayPatternMap[pattern] as DayOfWeek[];
      if (!neededDays.every((d) => room.availableDays.includes(d))) continue;

      // Check lab sequencing
      if (!labPatternAllowed(section, pattern)) continue;

      // Try 30-minute increments
      for (let start = roomStart; start <= latestStart; start += 30) {
        const end = start + duration;
        const startTime = minutesToTime(start);
        const endTime = minutesToTime(end);

        const candidate: ScheduledSection = {
          ...section,
          roomId: room.id,
          startTime,
          endTime,
          dayPattern: pattern,
        };

        const validation = validateManualPlacement(candidate, sections, rooms);
        if (validation.valid) {
          alternatives.push({
            roomId: room.id,
            startTime,
            endTime,
            dayPattern: pattern,
            warnings: validation.warnings,
          });
          if (alternatives.length >= limit) return alternatives;
        }
      }
    }
  }
  return alternatives;
};
