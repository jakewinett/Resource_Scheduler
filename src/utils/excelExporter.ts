import * as XLSX from 'xlsx';
import type { ScheduledSection } from '../types';
import { sampleCalendar, sampleCourses, sampleRooms } from '../data/sampleData';

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

export const downloadTemplate = () => {
  const workbook = XLSX.utils.book_new();

  // Rooms Sheet Template
  const roomsData = sampleRooms.slice(0, 2).map((r) => ({
    Building: r.building,
    Number: r.roomNumber,
    RoomType: r.type,
    Capacity: r.capacity,
    Days: r.availableDays.join(','),
    Start: r.availableHours.start,
    End: r.availableHours.end,
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(roomsData), 'Rooms');

  // Courses Sheet Template
  const coursesData = sampleCourses.slice(0, 2).map((c) => ({
    Subject: c.subject,
    Number: c.courseNumber,
    Instructor: c.teacher,
    Duration: c.durationHours,
    Days: c.daysPerWeek,
    Enrollment: c.totalEnrollment,
    Lab: c.isLab,
    LectureDays: c.lectureDayPattern || '',
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(coursesData), 'Courses');

  // Calendar Sheet Template
  const calendarData = [
    {
      Term: sampleCalendar.termName,
      StartDate: sampleCalendar.startDate.toISOString().split('T')[0],
      EndDate: sampleCalendar.endDate.toISOString().split('T')[0],
      Holiday: sampleCalendar.holidays[0].name,
      Date: sampleCalendar.holidays[0].date.toISOString().split('T')[0],
      MondaySchedule: sampleCalendar.holidays[0].mondaySchedule || false,
    },
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(calendarData), 'Calendar');

  XLSX.writeFile(workbook, 'import-template.xlsx');
};
