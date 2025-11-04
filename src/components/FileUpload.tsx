import { useCallback, useState } from 'react';
import { UploadSimple, CheckCircle } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  onFileLoad: (content: string | ArrayBuffer, filename: string, fileType: 'csv' | 'excel') => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
    
    if (!isCSV && !isExcel) {
      alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (!content) return;
      
      setUploadedFile(file.name);
      onFileLoad(content, file.name, isCSV ? 'csv' : 'excel');
    };
    
    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <Card
      className={`p-12 border-2 border-dashed cursor-pointer transition-all bg-white shadow-lg ${
        isDragging
          ? 'border-accent bg-accent/5 shadow-xl shadow-accent/30 scale-[1.02]'
          : 'border-primary/30 hover:border-accent hover:shadow-xl hover:shadow-accent/10'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {uploadedFile ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/15 text-accent/50 shadow-md">
              <CheckCircle size={48} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-foreground">File Uploaded Successfully</h3>
              <p className="text-sm text-foreground/70 font-mono">{uploadedFile}</p>
              <p className="text-xs text-foreground/60 mt-2">
                Click or drag to upload a different file
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl transition-all shadow-md ${
              isDragging ? 'bg-accent/15 text-accent/50' : 'bg-primary/10 text-primary/40'
            }`}>
              <UploadSimple size={48} weight={isDragging ? 'fill' : 'regular'} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Survey Data</h3>
              <p className="text-sm text-foreground/70 mb-3 leading-relaxed">
                Upload the Google Forms export from the<br />
                <span className="font-semibold text-foreground">"Classroom Adaptations in the English Classroom"</span> survey
              </p>
              <p className="text-xs text-foreground/60 mb-1">
                Supports CSV and Excel formats (.csv, .xlsx, .xls)
              </p>
              <p className="text-xs text-accent font-semibold">
                Click to browse or drag and drop
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
