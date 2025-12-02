import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useScheduleStore } from '../stores/scheduleStore';
import { ScheduleBlock, type PositionedSection } from './ScheduleBlock';
import type { ScheduledSection } from '../types';
import { minutesToTime, timeToMinutes, formatMeetingLabel } from '../utils/scheduler/timeUtils';
import { cn } from '../lib/utils';

const START_MIN = 7 * 60;
const END_MIN = 22 * 60;
const TOTAL = END_MIN - START_MIN;
const STEP = 15;

const mapSectionsToRows = (sections: ScheduledSection[], view: 'room' | 'teacher' | 'day') => {
  if (view === 'room') {
    const grouped: Record<string, ScheduledSection[]> = {};
    sections.forEach((s) => {
      grouped[s.roomId] = grouped[s.roomId] ? [...grouped[s.roomId], s] : [s];
    });
    return grouped;
  }
  if (view === 'teacher') {
    const grouped: Record<string, ScheduledSection[]> = {};
    sections.forEach((s) => {
      grouped[s.teacher] = grouped[s.teacher] ? [...grouped[s.teacher], s] : [s];
    });
    return grouped;
  }
  // day view
  const grouped: Record<string, ScheduledSection[]> = {};
  sections.forEach((s) => {
    const days = s.dayPattern.includes('-') ? s.dayPattern.split('-') : [s.dayPattern];
    days.forEach((day) => {
      grouped[day] = grouped[day] ? [...grouped[day], s] : [s];
    });
  });
  return grouped;
};

const positionSection = (section: ScheduledSection, overrideStart?: number): PositionedSection => {
  const startMin = overrideStart ?? timeToMinutes(section.startTime);
  const duration = timeToMinutes(section.endTime) - timeToMinutes(section.startTime);
  const endMin = overrideStart ? startMin + duration : timeToMinutes(section.endTime);
  const offset = ((startMin - START_MIN) / TOTAL) * 100;
  const width = ((endMin - startMin) / TOTAL) * 100;
  return {
    ...section,
    startTime: overrideStart ? minutesToTime(startMin) : section.startTime,
    endTime: overrideStart ? minutesToTime(endMin) : section.endTime,
    _offset: `${offset}%`,
    _width: `${width}%`,
  };
};

interface Props {
  onSelect?: (section: ScheduledSection) => void;
}

type DragSession = {
  pointerId: number;
  startX: number;
  width: number;
  originalStart: number;
  duration: number;
  section: ScheduledSection;
  moved: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const quantize = (value: number) => Math.round(value / STEP) * STEP;

type StatusState = { type: 'success' | 'warning' | 'error'; text: string } | null;

export const ScheduleGrid = ({ onSelect }: Props) => {
  const { sections, filters, view, moveSection } = useScheduleStore();
  const [status, setStatus] = useState<StatusState>(null);
  const [dragPreview, setDragPreview] = useState<{ id: string; startMinutes: number } | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);

  const filtered = useMemo(() => {
    return sections.filter((s) => {
      const subjectOk = filters.subject && filters.subject !== 'All' ? s.subject === filters.subject : true;
      const teacherOk = filters.teacher ? s.teacher === filters.teacher : true;
      const roomOk = filters.room ? s.roomId === filters.room : true;
      const dayOk =
        view === 'day' && filters.day
          ? (s.dayPattern.includes(filters.day) || s.dayPattern === filters.day)
          : true;
      return subjectOk && teacherOk && roomOk && dayOk;
    });
  }, [sections, filters, view]);

  const grouped = useMemo(() => {
    const rows = mapSectionsToRows(filtered, view) as Record<string, ScheduledSection[]>;
    const entries = Object.entries(rows).map(
      ([key, value]) =>
        [
          key,
          value.map((section) =>
            positionSection(section, dragPreview?.id === section.id ? dragPreview.startMinutes : undefined),
          ),
        ] as [string, PositionedSection[]],
    );
    return Object.fromEntries(entries) as Record<string, PositionedSection[]>;
  }, [filtered, view, dragPreview]);

  const timeMarkers = useMemo(() => {
    const markers: string[] = [];
    for (let h = 7; h <= 22; h += 1) {
      markers.push(`${`${h}`.padStart(2, '0')}:00`);
    }
    return markers;
  }, []);

  useEffect(() => {
    if (!status) return undefined;
    const timeout = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const session = dragSessionRef.current;
    if (!session || event.pointerId !== session.pointerId || session.width === 0) return;
    const deltaPx = event.clientX - session.startX;
    const deltaMinutes = quantize((deltaPx / session.width) * TOTAL);
    const nextStart = clamp(session.originalStart + deltaMinutes, START_MIN, END_MIN - session.duration);
    if (Math.abs(deltaPx) > 2) session.moved = true;
    setDragPreview({ id: session.section.id, startMinutes: nextStart });
  }, []);

const handlePointerUp = useCallback(
  (event: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId || session.width === 0) return;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dragSessionRef.current = null;
      const deltaPx = event.clientX - session.startX;
      const deltaMinutes = quantize((deltaPx / session.width) * TOTAL);
      const nextStart = clamp(session.originalStart + deltaMinutes, START_MIN, END_MIN - session.duration);
      const moved = session.moved || Math.abs(deltaMinutes) > 0;
      setDragPreview(null);
      if (!moved) {
        onSelect?.(session.section);
        return;
      }
      const startTime = minutesToTime(nextStart);
      const endTime = minutesToTime(nextStart + session.duration);
      const result = moveSection(session.section.id, { startTime, endTime });
      if (!result.success) {
        setStatus({
          type: 'error',
          text: result.conflicts[0] || 'Unable to place section in that slot.',
        });
        return;
      }
      if (result.warnings.length) {
        setStatus({ type: 'warning', text: result.warnings[0] });
      } else {
        setStatus({
          type: 'success',
          text: `${session.section.courseId} moved to ${formatMeetingLabel(startTime, endTime, session.section.dayPattern)}`,
        });
      }
    },
    [handlePointerMove, moveSection, onSelect],
  );

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, section: PositionedSection) => {
      event.preventDefault();
      const track = event.currentTarget.parentElement;
      if (!track) return;
      const bounds = track.getBoundingClientRect();
      const startMinutes = timeToMinutes(section.startTime);
      const endMinutes = timeToMinutes(section.endTime);
      dragSessionRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        width: bounds.width,
        originalStart: startMinutes,
        duration: endMinutes - startMinutes,
        section,
        moved: false,
      };
      setDragPreview({ id: section.id, startMinutes });
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  return (
    <Card className="mt-4">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base text-slate-900">Schedule</CardTitle>
        <div className="flex gap-6 text-[11px] text-slate-600">
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-blue-200" /> Math
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-emerald-200" /> Biology
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-orange-200" /> Chemistry
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-purple-200" /> Physiology
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {status && (
          <div
            className={cn(
              'mb-3 rounded-lg border px-3 py-2 text-sm',
              status.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : status.type === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800',
            )}
          >
            {status.text}
          </div>
        )}
        <div className="mb-2 flex items-center justify-between px-16 text-[11px] text-slate-500">
          {timeMarkers.map((label) => (
            <span key={label} className="w-[6.25%] text-center">
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Object.keys(grouped).length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-600">
              No sections scheduled yet. Generate a schedule to visualize.
            </div>
          )}
          {Object.entries(grouped).map(([label, items]) => (
            <div key={label} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="absolute left-0 top-0 z-10 h-full w-20 border-r border-slate-100 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-800">
                {label}
              </div>
              <div className="relative ml-20 h-24">
                <div className="absolute inset-0">
                  {[...Array(16)].map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute top-0 h-full w-px bg-slate-100"
                      style={{ left: `${(idx / 16) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="relative h-full">
                  {items.map((section) => (
                    <ScheduleBlock
                      key={section.id}
                      section={section}
                      role="button"
                      tabIndex={0}
                      onPointerDown={(event) => startDrag(event, section)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect?.(section);
                        }
                      }}
                      onDoubleClick={() => onSelect?.(section)}
                      className={cn('cursor-grab transition-opacity', {
                        'cursor-grabbing opacity-90': dragPreview?.id === section.id,
                      })}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
