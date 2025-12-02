export type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR';

export type RoomType =
  | 'Biology Lecture'
  | 'Biology Lab'
  | 'Chemistry Lecture'
  | 'Chemistry Lab'
  | 'Physiology Lecture'
  | 'Physiology Lab'
  | 'Math Lecture'
  | 'Math Lab'
  | 'General Lecture';

export interface SemesterCalendar {
  termName: string;
  startDate: Date;
  endDate: Date;
  holidays: { date: Date; name: string; mondaySchedule?: boolean }[];
}

export interface Room {
  id: string; // e.g., "Baker-100"
  building: string;
  roomNumber: string;
  type: RoomType;
  capacity: number;
  availableDays: DayOfWeek[];
  availableHours: { start: string; end: string }; // "07:00" to "20:00"
}

export type Subject = 'Math' | 'Biology' | 'Chemistry' | 'Physiology';

export interface CourseDefinition {
  id: string; // e.g., "Math-101"
  subject: Subject;
  courseNumber: 101 | 201 | 301 | 401;
  teacher: string;
  durationHours: number;
  daysPerWeek: number;
  totalEnrollment: number;
  isLab: boolean;
  lectureDayPattern?: DayPattern; // optional reference for lab sequencing
}

export type DayPattern =
  | 'MO-WE'
  | 'TU-TH'
  | 'WE-FR'
  | 'MO'
  | 'TU'
  | 'WE'
  | 'TH'
  | 'FR';

export interface ScheduledSection {
  id: string;
  courseId: string;
  sectionNumber: number;
  roomId: string;
  teacher: string;
  dayPattern: DayPattern;
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  enrollmentCapacity: number;
  isLab?: boolean;
  subject?: Subject;
  courseNumber?: number;
  durationHours?: number;
  daysPerWeek?: number;
  lectureDayPattern?: DayPattern;
}

export interface ScheduleResult {
  sections: ScheduledSection[];
  conflicts: string[];
  warnings: string[];
  unscheduled: CourseDefinition[];
}

export interface ParsedWorkbook {
  rooms: Room[];
  courses: CourseDefinition[];
  calendar?: SemesterCalendar;
}
