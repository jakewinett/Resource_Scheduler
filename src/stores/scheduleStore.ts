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
import { collectTimePreferenceWarnings, validateManualPlacement } from '../utils/scheduler/manualValidator';
import { minutesToTime, timeToMinutes } from '../utils/scheduler/timeUtils';

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
  refresh: () => void;
  moveSection: (
    sectionId: string,
    updates: Partial<Pick<ScheduledSection, 'startTime' | 'endTime' | 'dayPattern' | 'roomId'>>,
  ) => { success: boolean; warnings: string[]; conflicts: string[] };
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
      refresh: () => set((state) => ({ sections: [...state.sections] })),
      moveSection: (sectionId, updates) => {
        const state = get();
        const index = state.sections.findIndex((section) => section.id === sectionId);
        if (index === -1) return { success: false, conflicts: ['Section not found'], warnings: [] };
        const current = state.sections[index];
        const nextSection = { ...current, ...updates };
        if (updates.startTime && !updates.endTime) {
          const startMinutes = timeToMinutes(updates.startTime);
          const duration = timeToMinutes(current.endTime) - timeToMinutes(current.startTime);
          nextSection.endTime = minutesToTime(startMinutes + duration);
        }
        const validation = validateManualPlacement(nextSection, state.sections, state.rooms);
        if (!validation.valid) {
          return { success: false, conflicts: validation.conflicts, warnings: [] };
        }
        const nextSections = [...state.sections];
        nextSections[index] = nextSection;
        const warnings = collectTimePreferenceWarnings(nextSections);
        set(() => ({ sections: nextSections, warnings }));
        return { success: true, warnings: validation.warnings, conflicts: [] };
      },
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
