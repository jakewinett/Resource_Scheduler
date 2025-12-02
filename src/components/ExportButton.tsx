import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { exportSchedule } from '../utils/excelExporter';
import { useScheduleStore } from '../stores/scheduleStore';

export const ExportButton = () => {
  const sections = useScheduleStore((s) => s.sections);
  return (
    <Button
      variant="outline"
      onClick={() => exportSchedule(sections)}
      disabled={sections.length === 0}
      title={sections.length === 0 ? 'Generate a schedule first' : 'Export schedule to Excel'}
    >
      <Download className="mr-2 h-4 w-4" />
      Export Excel
    </Button>
  );
};
