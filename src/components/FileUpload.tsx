import { useCallback, useState } from 'react';
import { UploadSimple, CheckCircle } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedFile(file.name);
      onFileLoad(content, file.name);
    };
    reader.readAsText(file);
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
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <Card
      className={`p-12 border-2 border-dashed cursor-pointer transition-all ${
        isDragging
          ? 'border-accent bg-accent/5'
          : 'border-border hover:border-accent/50 hover:bg-muted/30'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {uploadedFile ? (
          <>
            <CheckCircle className="text-accent" size={48} weight="fill" />
            <div>
              <h3 className="text-lg font-medium mb-1">File Uploaded</h3>
              <p className="text-sm text-muted-foreground">{uploadedFile}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Click or drag to upload a different file
              </p>
            </div>
          </>
        ) : (
          <>
            <UploadSimple className="text-muted-foreground" size={48} />
            <div>
              <h3 className="text-lg font-medium mb-1">Upload CSV Data</h3>
              <p className="text-sm text-muted-foreground">
                Upload the Google Forms CSV from the<br />
                "Classroom Adaptations in the English Classroom" survey
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click to browse or drag and drop
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
