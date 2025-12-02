import { useCallback, useRef, useState } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useExcelParser } from '../hooks/useExcelParser';
import { useScheduleStore } from '../stores/scheduleStore';
import { TemplateDownloadButton } from './TemplateDownloadButton';

export const FileUploader = () => {
  const { parse, error, isParsing } = useExcelParser();
  const setFromWorkbook = useScheduleStore((s) => s.setFromWorkbook);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file?: File | null) => {
      if (!file) return;
      const parsed = await parse(file);
      if (parsed) {
        setFromWorkbook(parsed);
        setFileName(file.name);
      }
    },
    [parse, setFromWorkbook],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const [file] = Array.from(event.dataTransfer.files);
      handleFile(file);
    },
    [handleFile],
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-slate-500" />
          Import Excel
        </CardTitle>
        <TemplateDownloadButton />
      </CardHeader>
      <CardContent>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center"
        >
          <p className="text-sm font-semibold text-slate-900">Drop .xlsx here</p>
          <p className="text-xs text-slate-600">Rooms, Courses, Calendar sheets</p>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={isParsing}>
              <FileUp className="mr-2 h-4 w-4" />
              {isParsing ? 'Parsing…' : 'Choose file'}
            </Button>
            {fileName && <span className="text-xs text-slate-600">{fileName}</span>}
          </div>
          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
        <p className="mt-3 text-xs text-slate-600">
          The importer normalizes room types (e.g., &quot;Chemstry&quot; → &quot;Chemistry&quot;) and validates days/hours.
        </p>
      </CardContent>
    </Card>
  );
};
