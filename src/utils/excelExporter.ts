import * as XLSX from 'xlsx';
import type { ScheduledSection } from '../types';

export const exportSchedule = (sections: ScheduledSection[]) => {
  const workbook = XLSX.utils.book_new();

  const master = sections.map((s) => ({
    Section: s.id,
    Course: s.courseId,
    Teacher: s.teacher,
    Room: s.roomId,
    Days: s.dayPattern,
    Start: s.startTime,
    End: s.endTime,
    Capacity: s.enrollmentCapacity,
  }));
  const roomSchedule = sections.map((s) => ({
    Room: s.roomId,
    DayPattern: s.dayPattern,
    Start: s.startTime,
    End: s.endTime,
    Course: s.courseId,
    Section: s.sectionNumber,
  }));
  const teacherSchedule = sections.map((s) => ({
    Teacher: s.teacher,
    DayPattern: s.dayPattern,
    Start: s.startTime,
    End: s.endTime,
    Course: s.courseId,
    Section: s.sectionNumber,
    Room: s.roomId,
  }));

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(master), 'Master Schedule');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(roomSchedule), 'Room Schedule');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(teacherSchedule), 'Teacher Schedule');

  XLSX.writeFile(workbook, 'semester-schedule.xlsx');
};
