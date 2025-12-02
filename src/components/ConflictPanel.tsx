import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useScheduleStore } from '../stores/scheduleStore';

export const ConflictPanel = () => {
  const { conflicts, warnings, unscheduled } = useScheduleStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="h-4 w-4 text-slate-500" />
          Conflicts & Warnings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Conflicts
              </div>
              {conflicts.length === 0 ? (
                <p className="mt-1 text-sm text-slate-600">None</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-red-700">
                  {conflicts.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <Info className="h-4 w-4 text-blue-500" />
                Warnings
              </div>
              {warnings.length === 0 ? (
                <p className="mt-1 text-sm text-slate-600">No soft constraint issues</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-amber-700">
                  {warnings.map((w) => (
                    <li key={w}>• {w}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Unscheduled
              </div>
              {unscheduled.length === 0 ? (
                <p className="mt-1 text-sm text-slate-600">All courses placed</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {unscheduled.map((c) => (
                    <Badge key={c.id} tone="warning">
                      {c.id}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
