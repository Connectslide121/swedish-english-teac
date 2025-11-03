import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DownloadSimple } from '@phosphor-icons/react';
import { SurveyResponse } from '@/lib/types';
import { exportToCSV } from '@/lib/csv-parser';

interface RawDataTabProps {
  data: SurveyResponse[];
}

export function RawDataTab({ data }: RawDataTabProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const totalPages = Math.ceil(data.length / pageSize);
  
  const paginatedData = data.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleDownload = () => {
    const csv = exportToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered-survey-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Filtered Dataset</h3>
            <p className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {data.length} responses
            </p>
          </div>
          <Button onClick={handleDownload}>
            <DownloadSimple className="mr-2" size={16} />
            Download CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">Timestamp</TableHead>
                <TableHead className="min-w-[120px]">Teaching Status</TableHead>
                <TableHead className="min-w-[100px]">Years</TableHead>
                <TableHead className="min-w-[150px]">School Type</TableHead>
                <TableHead className="text-right min-w-[100px]">Support Index</TableHead>
                <TableHead className="text-right min-w-[110px]">Challenge Index</TableHead>
                <TableHead className="text-right min-w-[80px]">Group Size</TableHead>
                <TableHead className="min-w-[100px]">Certification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs">
                    {row.timestamp ? new Date(row.timestamp).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{row.currentlyTeaching || 'N/A'}</TableCell>
                  <TableCell>{row.yearsTeachingCategory}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.schoolType}>
                    {row.schoolType || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-mono" style={{ color: 'var(--chart-support)' }}>
                    {row.supportAdaptationIndex?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-mono" style={{ color: 'var(--chart-challenge)' }}>
                    {row.challengeAdaptationIndex?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-mono">{row.groupSize || 'N/A'}</TableCell>
                  <TableCell>{row.hasCertification || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
