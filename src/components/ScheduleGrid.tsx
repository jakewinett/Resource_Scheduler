import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useScheduleStore } from '../stores/scheduleStore';
import { ScheduleBlock, type PositionedSection } from './ScheduleBlock';
import type { ScheduledSection } from '../types';

const START_MIN = 7 * 60;
const END_MIN = 22 * 60;
const TOTAL = END_MIN - START_MIN;

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

const positionSection = (section: ScheduledSection): PositionedSection => {
  const startMin = parseInt(section.startTime.split(':')[0], 10) * 60 + parseInt(section.startTime.split(':')[1], 10);
  const endMin = parseInt(section.endTime.split(':')[0], 10) * 60 + parseInt(section.endTime.split(':')[1], 10);
  const offset = ((startMin - START_MIN) / TOTAL) * 100;
  const width = ((endMin - startMin) / TOTAL) * 100;
  return { ...section, _offset: `${offset}%`, _width: `${width}%` };
};

interface Props {
  onSelect?: (section: ScheduledSection) => void;
}

export const ScheduleGrid = ({ onSelect }: Props) => {
  const { sections, filters, view } = useScheduleStore();

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
      ([key, value]) => [key, value.map(positionSection)] as [string, PositionedSection[]],
    );
    return Object.fromEntries(entries) as Record<string, PositionedSection[]>;
  }, [filtered, view]);

  const timeMarkers = useMemo(() => {
    const markers: string[] = [];
    for (let h = 7; h <= 22; h += 1) {
      markers.push(`${`${h}`.padStart(2, '0')}:00`);
    }
    return markers;
  }, []);

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
                    <ScheduleBlock key={section.id} section={section} onSelect={onSelect} />
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
