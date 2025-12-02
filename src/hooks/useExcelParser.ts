import { useCallback, useState } from 'react';
import type { ParsedWorkbook } from '../types';
import { parseWorkbook } from '../utils/excelParser';

export const useExcelParser = () => {
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parse = useCallback(async (file: File): Promise<ParsedWorkbook | null> => {
    setIsParsing(true);
    setError(null);
    try {
      const parsed = await parseWorkbook(file);
      return parsed;
    } catch (err) {
      setError((err as Error).message || 'Unable to parse file');
      return null;
    } finally {
      setIsParsing(false);
    }
  }, []);

  return { parse, error, isParsing };
};
