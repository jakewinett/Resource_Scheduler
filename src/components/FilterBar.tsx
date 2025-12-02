import { useMemo } from 'react';
import { useScheduleStore } from '../stores/scheduleStore';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import type { Subject } from '../types';

const subjects: Subject[] = ['Math', 'Biology', 'Chemistry', 'Physiology'];
const days = ['MO', 'TU', 'WE', 'TH', 'FR'] as const;

export const FilterBar = () => {
  const { filters, view, setFilters, setView, rooms, courses } = useScheduleStore();

  const teachers = useMemo(
    () => Array.from(new Set(courses.map((c) => c.teacher))),
    [courses],
  );
  const roomOptions = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.id))),
    [rooms],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList>
          <TabsTrigger value="room">By Room</TabsTrigger>
          <TabsTrigger value="teacher">By Teacher</TabsTrigger>
          <TabsTrigger value="day">By Day</TabsTrigger>
        </TabsList>
      </Tabs>

      <select
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        value={filters.subject ?? 'All'}
        onChange={(e) => setFilters({ subject: e.target.value as Subject | 'All' })}
      >
        <option value="All">All Subjects</option>
        {subjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        value={filters.teacher ?? ''}
        onChange={(e) => setFilters({ teacher: e.target.value || undefined })}
      >
        <option value="">All Teachers</option>
        {teachers.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        value={filters.room ?? ''}
        onChange={(e) => setFilters({ room: e.target.value || undefined })}
        disabled={view !== 'room'}
      >
        <option value="">All Rooms</option>
        {roomOptions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {view === 'day' && (
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          value={filters.day ?? ''}
          onChange={(e) => setFilters({ day: (e.target.value as any) || undefined })}
        >
          <option value="">All Days</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      )}

      <Button variant="ghost" size="sm" onClick={() => setFilters({ subject: 'All', teacher: undefined, room: undefined, day: undefined })}>
        Reset filters
      </Button>
    </div>
  );
};
