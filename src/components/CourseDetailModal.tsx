import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import type { ScheduledSection } from '../types';
import { Badge } from './ui/badge';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: ScheduledSection | null;
}

export const CourseDetailModal = ({ open, onOpenChange, section }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      {section ? (
        <div className="space-y-3">
          <DialogTitle>{section.courseId}</DialogTitle>
          <DialogDescription>Section {section.sectionNumber}</DialogDescription>
          <div className="flex flex-wrap gap-2">
            <Badge>{section.teacher}</Badge>
            <Badge tone="success">{section.roomId}</Badge>
            <Badge tone="warning">{section.dayPattern}</Badge>
          </div>
          <div className="text-sm text-slate-700">
            <div>
              Time: <strong>{section.startTime}</strong> - <strong>{section.endTime}</strong>
            </div>
            <div>Capacity: {section.enrollmentCapacity}</div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-700">Select a block to view details.</div>
      )}
    </DialogContent>
  </Dialog>
);
