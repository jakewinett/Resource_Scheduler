import type { HTMLAttributes } from 'react';
import type { ScheduledSection } from '../types';
import { cn } from '../lib/utils';

const subjectPalette: Record<string, string> = {
  Math: 'bg-blue-100 text-blue-900 ring-blue-200',
  Biology: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  Chemistry: 'bg-orange-100 text-orange-900 ring-orange-200',
  Physiology: 'bg-purple-100 text-purple-900 ring-purple-200',
};

export interface PositionedSection extends ScheduledSection {
  _offset?: string;
  _width?: string;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  section: PositionedSection;
}

export const ScheduleBlock = ({ section, className, style, ...props }: Props) => (
  <div
    className={cn(
      'absolute inset-y-1 rounded-lg border px-2 py-1 text-xs shadow-sm ring-2',
      subjectPalette[section.subject || ''] || 'bg-slate-100 text-slate-900 ring-slate-200',
      className,
    )}
    style={{
      left: section._offset,
      width: section._width,
      ...style,
    }}
    {...props}
  >
    <div className="font-semibold leading-tight">{section.courseId}</div>
    <div className="text-[11px]">{section.dayPattern} · {section.startTime}-{section.endTime}</div>
    <div className="text-[11px] text-slate-700">{section.teacher}</div>
  </div>
);
