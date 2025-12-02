import { useCallback, useState } from 'react';
import { generateSchedule } from '../utils/scheduler/solver';
import { useScheduleStore } from '../stores/scheduleStore';

export const useScheduler = () => {
  const { rooms, courses, setScheduleResult } = useScheduleStore();
  const [isRunning, setIsRunning] = useState(false);

  const runScheduler = useCallback(() => {
    setIsRunning(true);
    const result = generateSchedule({ courses, rooms });
    setScheduleResult(result);
    setIsRunning(false);
    return result;
  }, [courses, rooms, setScheduleResult]);

  return { runScheduler, isRunning };
};
