import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CourseDefinition,
  DayOfWeek,
  ParsedWorkbook,
  Room,
  ScheduleResult,
  ScheduledSection,
  SemesterCalendar,
  Subject,
} from '../types';
import { sampleCalendar, sampleCourses, sampleRooms } from '../data/sampleData';
import { generateSchedule } from '../utils/scheduler/solver';

export type ViewMode = 'room' | 'teacher' | 'day';

type Filters = {
  subject?: Subject | 'All';
  teacher?: string;
  room?: string;
  day?: DayOfWeek;
};

type ScheduleState = {
  rooms: Room[];
  courses: CourseDefinition[];
  calendar?: SemesterCalendar;
  sections: ScheduledSection[];
  conflicts: string[];
  warnings: string[];
  unscheduled: CourseDefinition[];
  filters: Filters;
  view: ViewMode;
  setFilters: (filters: Partial<Filters>) => void;
  setView: (view: ViewMode) => void;
  loadSample: () => void;
  setFromWorkbook: (data: ParsedWorkbook) => void;
  generate: () => ScheduleResult;
  setScheduleResult: (result: ScheduleResult) => void;
};

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      rooms: sampleRooms,
      courses: sampleCourses,
      calendar: sampleCalendar,
      sections: [],
      conflicts: [],
      warnings: [],
      unscheduled: [],
      filters: { subject: 'All' },
      view: 'room',
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      setView: (view) => set(() => ({ view })),
      loadSample: () =>
        set(() => ({
          rooms: sampleRooms,
          courses: sampleCourses,
          calendar: sampleCalendar,
          sections: [],
          conflicts: [],
          warnings: [],
          unscheduled: [],
        })),
      setFromWorkbook: (data) =>
        set(() => ({
          rooms: data.rooms,
          courses: data.courses,
          calendar: data.calendar,
          sections: [],
          conflicts: [],
          warnings: [],
          unscheduled: [],
        })),
      generate: () => {
        const result = generateSchedule({ rooms: get().rooms, courses: get().courses });
        set(() => ({
          sections: result.sections,
          conflicts: result.conflicts,
          warnings: result.warnings,
          unscheduled: result.unscheduled,
        }));
        return result;
      },
      setScheduleResult: (result) =>
        set(() => ({
          sections: result.sections,
          conflicts: result.conflicts,
          warnings: result.warnings,
          unscheduled: result.unscheduled,
        })),
    }),
    {
      name: 'schedule-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rooms: state.rooms,
        courses: state.courses,
        calendar: state.calendar,
        filters: state.filters,
      }),
    },
  ),
);
