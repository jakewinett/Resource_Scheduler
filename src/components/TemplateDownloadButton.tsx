import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { downloadTemplate } from '../utils/excelExporter';

export const TemplateDownloadButton = () => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={downloadTemplate}
      className="text-xs text-slate-500 hover:text-slate-900"
    >
      <Download className="mr-1 h-3 w-3" />
      Download template
    </Button>
  );
};
