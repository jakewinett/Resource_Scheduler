import * as XLSX from 'xlsx';
import type { CourseDefinition, DayOfWeek, ParsedWorkbook, Room, RoomType, SemesterCalendar } from '../types';

const normalizeSubject = (value: string): CourseDefinition['subject'] => {
  const cleaned = value.trim().toLowerCase();
  if (cleaned.startsWith('chem')) return 'Chemistry';
  if (cleaned.startsWith('bio')) return 'Biology';
  if (cleaned.startsWith('physio')) return 'Physiology';
  return 'Math';
};

const normalizeRoomType = (value: string): RoomType => {
  const cleaned = value.trim().toLowerCase();
  if (cleaned.includes('biology') && cleaned.includes('lab')) return 'Biology Lab';
  if (cleaned.includes('biology')) return 'Biology Lecture';
  if (cleaned.includes('chem') && cleaned.includes('lab')) return 'Chemistry Lab';
  if (cleaned.includes('chem')) return 'Chemistry Lecture';
  if (cleaned.includes('phys') && cleaned.includes('lab')) return 'Physiology Lab';
  if (cleaned.includes('phys')) return 'Physiology Lecture';
  if (cleaned.includes('math') && cleaned.includes('lab')) return 'Math Lab';
  if (cleaned.includes('math')) return 'Math Lecture';
  return 'General Lecture';
};

const normalizeDays = (value: string | string[]): DayOfWeek[] => {
  if (Array.isArray(value)) return value as DayOfWeek[];
  return value
    .split(',')
    .map((d) => d.trim().toUpperCase())
    .filter(Boolean) as DayOfWeek[];
};

const parseRoomsSheet = (sheet: XLSX.WorkSheet): Room[] => {
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  return rows.map((row, idx) => {
    const building = row.building || row.Building || row.buildingName || 'Building';
    const number = String(row.roomNumber || row.Number || row.Room || idx + 1);
    const id = `${building}-${number}`;
    return {
      id,
      building,
      roomNumber: number,
      type: normalizeRoomType(row.type || row.RoomType || ''),
      capacity: Number(row.capacity || row.Capacity || 0),
      availableDays: normalizeDays(row.availableDays || row.Days || 'MO,TU,WE,TH,FR'),
      availableHours: {
        start: row.start || row.open || row.Start || '07:00',
        end: row.end || row.close || row.End || '20:00',
      },
    } as Room;
  });
};

const parseCoursesSheet = (sheet: XLSX.WorkSheet): CourseDefinition[] => {
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  return rows.map((row) => ({
    id: row.id || row.courseId || `${row.subject}-${row.courseNumber}`,
    subject: normalizeSubject(row.subject || row.Subject),
    courseNumber: Number(row.courseNumber || row.Number || 101) as CourseDefinition['courseNumber'],
    teacher: row.teacher || row.instructor || 'TBD',
    durationHours: Number(row.durationHours || row.duration || 1.5),
    daysPerWeek: Number(row.daysPerWeek || row.days || 2),
    totalEnrollment: Number(row.totalEnrollment || row.enrollment || 0),
    isLab: Boolean(row.isLab || row.lab || false),
    lectureDayPattern: row.lectureDayPattern || row.lectureDays || undefined,
  }));
};

const parseCalendarSheet = (sheet?: XLSX.WorkSheet): SemesterCalendar | undefined => {
  if (!sheet) return undefined;
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  if (!rows.length) return undefined;
  const row = rows[0];
  const holidays = rows
    .filter((r) => r.holiday || r.Holiday)
    .map((r) => ({
      date: new Date(r.date || r.Date),
      name: r.holiday || r.Holiday,
      mondaySchedule: Boolean(r.mondaySchedule || r.MondaySchedule),
    }));
  return {
    termName: row.termName || row.Term || 'Term',
    startDate: new Date(row.startDate || row.StartDate),
    endDate: new Date(row.endDate || row.EndDate),
    holidays,
  };
};

export const parseWorkbook = async (file: File): Promise<ParsedWorkbook> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const roomSheetName =
        workbook.SheetNames.find((n) => n.toLowerCase().includes('room')) || workbook.SheetNames[0];
      const courseSheetName =
        workbook.SheetNames.find((n) => n.toLowerCase().includes('course')) || workbook.SheetNames[1];
      const calendarSheetName =
        workbook.SheetNames.find((n) => n.toLowerCase().includes('calendar')) || workbook.SheetNames[2];
      const roomsSheet = roomSheetName ? workbook.Sheets[roomSheetName] : undefined;
      const coursesSheet = courseSheetName ? workbook.Sheets[courseSheetName] : undefined;
      const calendarSheet = calendarSheetName ? workbook.Sheets[calendarSheetName] : undefined;
      const rooms = roomsSheet ? parseRoomsSheet(roomsSheet) : [];
      const courses = coursesSheet ? parseCoursesSheet(coursesSheet) : [];
      const calendar = parseCalendarSheet(calendarSheet);
      resolve({ rooms, courses, calendar });
    };
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsArrayBuffer(file);
  });
