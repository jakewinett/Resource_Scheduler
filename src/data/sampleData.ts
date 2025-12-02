import type { CourseDefinition, DayOfWeek, Room, SemesterCalendar } from '../types';

const days: DayOfWeek[] = ['MO', 'TU', 'WE', 'TH', 'FR'];

export const sampleCalendar: SemesterCalendar = {
  termName: 'Spring 2025',
  startDate: new Date('2025-01-13'),
  endDate: new Date('2025-05-02'),
  holidays: [
    { date: new Date('2025-02-17'), name: 'Presidents Day' },
    { date: new Date('2025-03-17'), name: 'Spring Break', mondaySchedule: true },
  ],
};

export const sampleRooms: Room[] = [
  { id: 'Baker-100', building: 'Baker', roomNumber: '100', type: 'Biology Lecture', capacity: 100, availableDays: days, availableHours: { start: '07:00', end: '20:00' } },
  { id: 'Baker-102', building: 'Baker', roomNumber: '102', type: 'Biology Lecture', capacity: 75, availableDays: days, availableHours: { start: '07:00', end: '20:00' } },
  { id: 'Baker-220', building: 'Baker', roomNumber: '220', type: 'Biology Lab', capacity: 28, availableDays: ['TU', 'TH', 'FR'], availableHours: { start: '08:00', end: '19:00' } },
  { id: 'Baker-240', building: 'Baker', roomNumber: '240', type: 'Biology Lab', capacity: 30, availableDays: ['MO', 'WE', 'FR'], availableHours: { start: '08:00', end: '19:00' } },
  { id: 'Baker-260', building: 'Baker', roomNumber: '260', type: 'Biology Lab', capacity: 24, availableDays: ['TU', 'TH'], availableHours: { start: '09:00', end: '18:00' } },
  { id: 'Chem-110', building: 'Chemistry', roomNumber: '110', type: 'Chemistry Lecture', capacity: 120, availableDays: days, availableHours: { start: '07:30', end: '20:00' } },
  { id: 'Chem-115', building: 'Chemistry', roomNumber: '115', type: 'Chemistry Lecture', capacity: 90, availableDays: days, availableHours: { start: '07:30', end: '20:00' } },
  { id: 'Chem-210', building: 'Chemistry', roomNumber: '210', type: 'Chemistry Lab', capacity: 32, availableDays: days, availableHours: { start: '07:00', end: '17:00' } },
  { id: 'Chem-212', building: 'Chemistry', roomNumber: '212', type: 'Chemistry Lab', capacity: 28, availableDays: ['MO', 'WE', 'FR'], availableHours: { start: '07:00', end: '17:00' } },
  { id: 'Phys-101', building: 'Physiology', roomNumber: '101', type: 'Physiology Lecture', capacity: 80, availableDays: days, availableHours: { start: '08:00', end: '18:30' } },
  { id: 'Phys-125', building: 'Physiology', roomNumber: '125', type: 'Physiology Lecture', capacity: 60, availableDays: ['MO', 'WE', 'FR'], availableHours: { start: '08:30', end: '17:00' } },
  { id: 'Phys-220', building: 'Physiology', roomNumber: '220', type: 'Physiology Lab', capacity: 26, availableDays: ['TU', 'TH'], availableHours: { start: '12:00', end: '21:00' } },
  { id: 'Phys-230', building: 'Physiology', roomNumber: '230', type: 'Physiology Lab', capacity: 28, availableDays: ['WE', 'FR'], availableHours: { start: '12:00', end: '21:00' } },
  { id: 'Math-101', building: 'Math', roomNumber: '101', type: 'Math Lecture', capacity: 120, availableDays: days, availableHours: { start: '07:00', end: '20:00' } },
  { id: 'Math-115', building: 'Math', roomNumber: '115', type: 'Math Lecture', capacity: 80, availableDays: days, availableHours: { start: '07:00', end: '20:00' } },
  { id: 'Math-210', building: 'Math', roomNumber: '210', type: 'Math Lab', capacity: 32, availableDays: ['MO', 'WE', 'FR'], availableHours: { start: '12:00', end: '21:00' } },
  { id: 'Math-212', building: 'Math', roomNumber: '212', type: 'Math Lab', capacity: 28, availableDays: ['TU', 'TH'], availableHours: { start: '12:00', end: '21:00' } },
  { id: 'Gen-100', building: 'Innovation', roomNumber: '100', type: 'General Lecture', capacity: 150, availableDays: days, availableHours: { start: '07:00', end: '20:00' } },
  { id: 'Gen-105', building: 'Innovation', roomNumber: '105', type: 'General Lecture', capacity: 90, availableDays: days, availableHours: { start: '07:00', end: '20:00' } },
  { id: 'Gen-130', building: 'Innovation', roomNumber: '130', type: 'General Lecture', capacity: 110, availableDays: ['MO', 'WE', 'FR'], availableHours: { start: '08:00', end: '18:00' } },
];

export const sampleCourses: CourseDefinition[] = [
  { id: 'Math-101', subject: 'Math', courseNumber: 101, teacher: 'Kermit The Frog', durationHours: 1.5, daysPerWeek: 2, totalEnrollment: 250, isLab: false },
  { id: 'Math-201', subject: 'Math', courseNumber: 201, teacher: 'Fozzie Bear', durationHours: 1.5, daysPerWeek: 2, totalEnrollment: 200, isLab: false },
  { id: 'Math-301', subject: 'Math', courseNumber: 301, teacher: 'Ada Lovelace', durationHours: 2, daysPerWeek: 1, totalEnrollment: 60, isLab: true, lectureDayPattern: 'MO-WE' },
  { id: 'Math-401', subject: 'Math', courseNumber: 401, teacher: 'Alan Turing', durationHours: 2, daysPerWeek: 1, totalEnrollment: 45, isLab: true, lectureDayPattern: 'TU-TH' },
  { id: 'Biology-101', subject: 'Biology', courseNumber: 101, teacher: 'Dr. Rivera', durationHours: 1.5, daysPerWeek: 2, totalEnrollment: 180, isLab: false },
  { id: 'Biology-201', subject: 'Biology', courseNumber: 201, teacher: 'Dr. Rivera', durationHours: 1.5, daysPerWeek: 2, totalEnrollment: 140, isLab: false },
  { id: 'Biology-301', subject: 'Biology', courseNumber: 301, teacher: 'Dr. Soto', durationHours: 3, daysPerWeek: 1, totalEnrollment: 50, isLab: true, lectureDayPattern: 'MO-WE' },
  { id: 'Biology-401', subject: 'Biology', courseNumber: 401, teacher: 'Dr. Soto', durationHours: 3, daysPerWeek: 1, totalEnrollment: 35, isLab: true, lectureDayPattern: 'TU-TH' },
  { id: 'Chemistry-101', subject: 'Chemistry', courseNumber: 101, teacher: 'Dr. Curie', durationHours: 1.5, daysPerWeek: 2, totalEnrollment: 160, isLab: false },
  { id: 'Chemistry-201', subject: 'Chemistry', courseNumber: 201, teacher: 'Dr. Curie', durationHours: 1.5, daysPerWeek: 2, totalEnrollment: 140, isLab: false },
  { id: 'Chemistry-301', subject: 'Chemistry', courseNumber: 301, teacher: 'Dr. Boyle', durationHours: 3, daysPerWeek: 1, totalEnrollment: 70, isLab: true, lectureDayPattern: 'TU-TH' },
  { id: 'Chemistry-401', subject: 'Chemistry', courseNumber: 401, teacher: 'Dr. Boyle', durationHours: 3, daysPerWeek: 1, totalEnrollment: 50, isLab: true, lectureDayPattern: 'WE-FR' },
  { id: 'Physiology-101', subject: 'Physiology', courseNumber: 101, teacher: 'Dr. Chen', durationHours: 1.5, daysPerWeek: 2, totalEnrollment: 120, isLab: false },
  { id: 'Physiology-201', subject: 'Physiology', courseNumber: 201, teacher: 'Dr. Chen', durationHours: 1.5, daysPerWeek: 2, totalEnrollment: 110, isLab: false },
  { id: 'Physiology-301', subject: 'Physiology', courseNumber: 301, teacher: 'Dr. Vega', durationHours: 3, daysPerWeek: 1, totalEnrollment: 60, isLab: true, lectureDayPattern: 'MO-WE' },
  { id: 'Physiology-401', subject: 'Physiology', courseNumber: 401, teacher: 'Dr. Vega', durationHours: 3, daysPerWeek: 1, totalEnrollment: 45, isLab: true, lectureDayPattern: 'TU-TH' },
];
