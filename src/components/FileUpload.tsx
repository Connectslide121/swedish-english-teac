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
      className={`p-12 border-2 border-dashed cursor-pointer transition-all backdrop-blur-sm ${
        isDragging
          ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
          : 'border-border/50 hover:border-accent/50 hover:bg-card/80 hover:shadow-md'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {uploadedFile ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
              <CheckCircle className="text-accent" size={48} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">File Uploaded Successfully</h3>
              <p className="text-sm text-muted-foreground font-mono">{uploadedFile}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Click or drag to upload a different file
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full transition-all ${
              isDragging ? 'bg-accent/10' : 'bg-primary/10'
            }`}>
              <UploadSimple className={isDragging ? 'text-accent' : 'text-primary'} size={48} weight={isDragging ? 'fill' : 'regular'} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Survey Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Upload the Google Forms export from the<br />
                <span className="font-medium">"Classroom Adaptations in the English Classroom"</span> survey
              </p>
              <p className="text-xs text-muted-foreground mb-1">
                Supports CSV and Excel formats (.csv, .xlsx, .xls)
              </p>
              <p className="text-xs text-primary font-medium">
                Click to browse or drag and drop
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
