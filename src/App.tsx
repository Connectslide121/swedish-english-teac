import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, UploadSimple } from '@phosphor-icons/react';
import { FileUpload } from '@/components/FileUpload';
import { SummaryCards } from '@/components/SummaryCards';
import { FiltersSidebar } from '@/components/FiltersSidebar';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { SupportFactorsTab } from '@/components/tabs/SupportFactorsTab';
import { ChallengeFactorsTab } from '@/components/tabs/ChallengeFactorsTab';
import { BothFactorsTab } from '@/components/tabs/BothFactorsTab';
import { PerQuestionTab } from '@/components/tabs/PerQuestionTab';
import { RawDataTab } from '@/components/tabs/RawDataTab';
import { parseCSV } from '@/lib/csv-parser';
import { applyFilters, calculateSummaryStats } from '@/lib/analysis';
import { SurveyResponse, Filters } from '@/lib/types';

function App() {
  const [rawData, setRawData] = useState<SurveyResponse[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    currentlyTeaching: ['Yes'],
    schoolType: [],
    yearsTeachingCategory: [],
    levelsTeaching: [],
    groupSizeMin: 0,
    groupSizeMax: 50,
    shareSupportStudents: [],
    shareChallengeStudents: [],
  });

  const handleFileLoad = (content: string, filename: string) => {
    try {
      const { data, warnings: parseWarnings } = parseCSV(content);
      setRawData(data);
      setWarnings(parseWarnings);
      
      setFilters({
        currentlyTeaching: ['Yes'],
        schoolType: [],
        yearsTeachingCategory: [],
        levelsTeaching: [],
        groupSizeMin: 0,
        groupSizeMax: 50,
        shareSupportStudents: [],
        shareChallengeStudents: [],
      });
    } catch (error) {
      alert(`Error parsing CSV: ${(error as Error).message}`);
    }
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          handleFileLoad(content, file.name);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredData = rawData.length > 0 ? applyFilters(rawData, filters) : [];
  const summaryStats = filteredData.length > 0 
    ? calculateSummaryStats(filteredData) 
    : { totalResponses: 0, avgSupport: 0, avgChallenge: 0, difference: 0 };

  if (rawData.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2 tracking-tight">
              Swedish English Teachers Classroom Adaptation Dashboard
            </h1>
            <p className="text-muted-foreground">
              Analyze how teachers adapt lessons for students needing support and challenge
            </p>
          </div>
          <FileUpload onFileLoad={handleFileLoad} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Swedish English Teachers Classroom Adaptation Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Analyzing {rawData.length} survey responses
              </p>
            </div>
            <Button onClick={handleUploadClick} variant="outline">
              <UploadSimple className="mr-2" size={16} />
              Upload New File
            </Button>
          </div>
        </div>

        {warnings.length > 0 && (
          <Alert className="mb-6 border-accent/50 bg-accent/5">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Data Warnings:</strong>
              <ul className="list-disc list-inside mt-2">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <SummaryCards stats={summaryStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <FiltersSidebar
              data={rawData}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          <div>
            {filteredData.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No data matches current filters. Try adjusting your filter selections.
                </AlertDescription>
              </Alert>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="support">Support Factors</TabsTrigger>
                  <TabsTrigger value="challenge">Challenge Factors</TabsTrigger>
                  <TabsTrigger value="both">Both Factors</TabsTrigger>
                  <TabsTrigger value="questions">Per Question</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <OverviewTab data={filteredData} />
                </TabsContent>

                <TabsContent value="support">
                  <SupportFactorsTab data={filteredData} />
                </TabsContent>

                <TabsContent value="challenge">
                  <ChallengeFactorsTab data={filteredData} />
                </TabsContent>

                <TabsContent value="both">
                  <BothFactorsTab data={filteredData} />
                </TabsContent>

                <TabsContent value="questions">
                  <PerQuestionTab data={filteredData} />
                </TabsContent>

                <TabsContent value="raw">
                  <RawDataTab data={filteredData} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;