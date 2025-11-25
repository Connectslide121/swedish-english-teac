import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, UploadSimple, ChartBar, Funnel, Sparkle, Heart } from '@phosphor-icons/react';
import { FileUpload } from '@/components/FileUpload';
import { SummaryCards } from '@/components/SummaryCards';
import { FiltersSidebar } from '@/components/FiltersSidebar';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { SupportFactorsTab } from '@/components/tabs/SupportFactorsTab';
import { ChallengeFactorsTab } from '@/components/tabs/ChallengeFactorsTab';
import { BothFactorsTab } from '@/components/tabs/BothFactorsTab';
import { PerQuestionTab } from '@/components/tabs/PerQuestionTab';
import { RawDataTab } from '@/components/tabs/RawDataTab';
import { GroupComparisonTab } from '@/components/tabs/GroupComparisonTab';
import { PlaygroundTab } from '@/components/tabs/PlaygroundTab';
import { parseCSV } from '@/lib/csv-parser';
import { applyFilters, calculateSummaryStats } from '@/lib/analysis';
import { SurveyResponse, Filters } from '@/lib/types';

function App() {
  const [rawData, setRawData] = useState<SurveyResponse[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    currentlyTeaching: ['Yes'],
    schoolType: [],
    yearsTeachingCategory: [],
    levelsTeaching: [],
    groupSizeMin: 0,
    groupSizeMax: 50,
    shareSupportStudents: [],
    shareChallengeStudents: [],
    hasCertification: [],
    itemTimeToDifferentiate: [],
    itemClassSizeOk: [],
    itemConfidentSupport: [],
    itemConfidentChallenge: [],
    itemTeacherEdPrepared: [],
    itemFormativeHelps: [],
    itemDigitalTools: [],
    itemMaterialsSupport: [],
    itemMaterialsChallenge: [],
  });

  const handleFileLoad = (content: string, filename: string) => {
    try {
      const result = parseCSV(content);
      
      setRawData(result.data);
      setWarnings(result.warnings);
      
      setFilters({
        currentlyTeaching: ['Yes'],
        schoolType: [],
        yearsTeachingCategory: [],
        levelsTeaching: [],
        groupSizeMin: 0,
        groupSizeMax: 50,
        shareSupportStudents: [],
        shareChallengeStudents: [],
        hasCertification: [],
        itemTimeToDifferentiate: [],
        itemClassSizeOk: [],
        itemConfidentSupport: [],
        itemConfidentChallenge: [],
        itemTeacherEdPrepared: [],
        itemFormativeHelps: [],
        itemDigitalTools: [],
        itemMaterialsSupport: [],
        itemMaterialsChallenge: [],
      });
    } catch (error) {
      alert(`Error parsing file: ${(error as Error).message}`);
    }
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const isCSV = file.name.toLowerCase().endsWith('.csv');
        
        if (!isCSV) {
          alert('Please upload a CSV file');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          if (!content) return;
          handleFileLoad(content as string, file.name);
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/15 p-6 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-full text-sm font-medium mb-6 shadow-lg shadow-accent/20">
                <Sparkle size={18} weight="fill" />
                Hello Kimia!
              </div>
              
              <h1 className="text-5xl font-semibold mb-4 tracking-tight text-foreground">
                Swedish English Teachers
                <br />
                Classroom Adaptation Dashboard
              </h1>
              
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-12 leading-relaxed">
                A comprehensive analytics tool to visualize and understand how Swedish English teachers 
                adapt their lessons for students needing support and challenge
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 text-center shadow-lg hover:shadow-xl hover:border-primary/40 transition-all">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary/40 mb-4 shadow-md">
                    <ChartBar size={28} weight="fill" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Rich Visualizations</h3>
                  <p className="text-sm text-foreground/60">
                    Interactive charts and graphs to explore survey responses
                  </p>
                </div>

                <div className="bg-white border-2 border-accent/20 rounded-xl p-6 text-center shadow-lg hover:shadow-xl hover:border-accent/40 transition-all">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 text-accent/50 mb-4 shadow-md">
                    <Funnel size={28} weight="fill" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Advanced Filtering</h3>
                  <p className="text-sm text-foreground/60">
                    Filter by teaching experience, school type, and more
                  </p>
                </div>

                <div className="bg-white border-2 border-secondary/20 rounded-xl p-6 text-center shadow-lg hover:shadow-xl hover:border-secondary/40 transition-all">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/20 text-secondary/50 mb-4 shadow-md">
                    <Info size={28} weight="fill" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Detailed Analysis</h3>
                  <p className="text-sm text-foreground/60">
                    Deep dive into support and challenge factors
                  </p>
                </div>
              </div>
            </div>

            <FileUpload onFileLoad={handleFileLoad} />

            <div className="mt-8 text-center text-sm text-foreground/60">
              <p>Upload your Google Forms export (CSV) to get started</p>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-foreground/60">
          Made with <Heart size={14} weight="fill" className="inline text-destructive mx-1" /> by Jon
        </footer>
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

        <div className="flex gap-6">
          {!filtersOpen && (
            <div className="flex-shrink-0">
              <div className="sticky top-6 h-[50vh]">
                <Button
                  onClick={() => setFiltersOpen(true)}
                  variant="outline"
                  className="h-full min-h-[200px] w-10 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-accent transition-colors px-2"
                >
                  <Funnel size={18} />
                  <span className="text-xs writing-mode-vertical transform rotate-180">
                    Filters
                  </span>
                </Button>
              </div>
            </div>
          )}

          {filtersOpen && (
            <div className="w-[280px] flex-shrink-0">
              <div className="sticky top-6">
                <FiltersSidebar
                  data={rawData}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClose={() => setFiltersOpen(false)}
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
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
                    <TabsTrigger value="playground">Playground</TabsTrigger>
                    <TabsTrigger value="support">Support Factors</TabsTrigger>
                    <TabsTrigger value="challenge">Challenge Factors</TabsTrigger>
                    <TabsTrigger value="both">Both Factors</TabsTrigger>
                    <TabsTrigger value="comparison">Group Comparison</TabsTrigger>
                    <TabsTrigger value="questions">Per Question</TabsTrigger>
                    <TabsTrigger value="raw">Raw Data</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <OverviewTab data={filteredData} />
                  </TabsContent>

                  <TabsContent value="playground">
                    <PlaygroundTab data={filteredData} />
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

                  <TabsContent value="comparison">
                    <GroupComparisonTab data={filteredData} />
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

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        Made with <Heart size={14} weight="fill" className="inline text-destructive mx-1" /> by Jon
      </footer>
    </div>
  );
}

export default App;