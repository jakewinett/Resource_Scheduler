import { useEffect, useMemo, useState } from 'react';
import { Wand2, Play, RefreshCw, RotateCcw } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { FilterBar } from './components/FilterBar';
import { ScheduleGrid } from './components/ScheduleGrid';
import { ConflictPanel } from './components/ConflictPanel';
import { ExportButton } from './components/ExportButton';
import { CourseDetailModal } from './components/CourseDetailModal';
import { AiAssistant } from './components/AiAssistant';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useScheduleStore } from './stores/scheduleStore';
import { useScheduler } from './hooks/useScheduler';
import type { ScheduledSection } from './types';

function App() {
  const { courses, rooms, sections, warnings, conflicts, loadSample, refresh } = useScheduleStore();
  const { runScheduler, isRunning } = useScheduler();
  const [selected, setSelected] = useState<ScheduledSection | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (sections.length === 0) {
      runScheduler();
    }
  }, [runScheduler, sections.length]);

  const stats = useMemo(
    () => [
      { label: 'Rooms', value: rooms.length },
      { label: 'Courses', value: courses.length },
      { label: 'Sections', value: sections.length },
    ],
    [rooms.length, courses.length, sections.length],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-900 px-6 py-7 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-indigo-200">University Scheduler</p>
              <h1 className="text-3xl font-semibold">College of Science &amp; Mathematics</h1>
              <p className="mt-1 max-w-2xl text-sm text-indigo-100">
                Import the semester spreadsheet, auto-generate a conflict-free schedule, and export instantly. Manual tweaks stay validated in real time.
              </p>
            </div>
            <div className="flex gap-2">
              <ExportButton />
              <Button variant="outline" onClick={() => refresh()} title="Force refresh view">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => loadSample()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to sample
              </Button>
              <Button onClick={() => runScheduler()} disabled={isRunning}>
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? 'Scheduling…' : 'Generate schedule'}
              </Button>
            </div>
          </div>
          <div className="flex gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm backdrop-blur">
                <span className="text-indigo-200">{stat.label}</span>
                <span className="text-lg font-bold">{stat.value}</span>
              </div>
            ))}
            <Badge tone={conflicts.length ? 'warning' : 'success'}>
              {conflicts.length ? `${conflicts.length} conflicts` : 'Conflict-free'}
            </Badge>
            {warnings.length > 0 && <Badge tone="warning">{warnings.length} suboptimal placements</Badge>}
          </div>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <FileUploader />
            <ConflictPanel />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Wand2 className="h-4 w-4 text-indigo-600" />
                    Auto-placement controls
                  </div>
                  <p className="text-xs text-slate-600">
                    Greedy + backtracking algorithm honors buffers, sequencing, and instructor conflicts.
                  </p>
                </div>
              </div>
              <FilterBar />
            </div>

            <ScheduleGrid
              onSelect={(section) => {
                setSelected(section);
                setModalOpen(true);
              }}
            />
          </div>
        </div>
      </div>

      <CourseDetailModal open={modalOpen} onOpenChange={setModalOpen} section={selected} />
      <AiAssistant />
    </div>
  );
}

export default App;
