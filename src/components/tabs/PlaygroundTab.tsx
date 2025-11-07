import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartBar, ChartLine, ChartPie, Rows, Sparkle, X } from '@phosphor-icons/react';
import { SurveyResponse } from '@/lib/types';
import { PlaygroundChart } from '@/components/charts/PlaygroundChart';

type ChartType = 'bar' | 'line' | 'grouped-bar' | 'stacked-bar' | 'scatter' | 'distribution';
type DataMode = 'mean' | 'median' | 'count' | 'percentage';
type ComparisonMode = 'none' | 'side-by-side' | 'overlay';

interface PlaygroundConfig {
  chartType: ChartType;
  dataMode: DataMode;
  comparisonMode: ComparisonMode;
  selectedQuestions: string[];
  selectedGroups: string[];
  groupByField: keyof SurveyResponse | null;
  showTrendLine: boolean;
  showDataLabels: boolean;
}

const QUESTIONS = [
  { key: 'supportQ1', label: 'Support: Extra time to finish', category: 'support' },
  { key: 'supportQ2', label: 'Support: Easier/supported version', category: 'support' },
  { key: 'supportQ3', label: 'Support: Limit to core requirements', category: 'support' },
  { key: 'supportQ4', label: 'Support: Different ways to access task', category: 'support' },
  { key: 'supportQ5', label: 'Support: Choose topic for motivation', category: 'support' },
  { key: 'supportQ6', label: 'Support: Flexible grouping', category: 'support' },
  { key: 'challengeQ1', label: 'Challenge: Move to planned next task', category: 'challenge' },
  { key: 'challengeQ2', label: 'Challenge: Harder version of task', category: 'challenge' },
  { key: 'challengeQ3', label: 'Challenge: More/deeper content', category: 'challenge' },
  { key: 'challengeQ4', label: 'Challenge: More demanding mode', category: 'challenge' },
  { key: 'challengeQ5', label: 'Challenge: Interest-based extension', category: 'challenge' },
  { key: 'challengeQ6', label: 'Challenge: Flexible grouping', category: 'challenge' },
  { key: 'supportAdaptationIndex', label: 'Support Adaptation Index (avg)', category: 'index' },
  { key: 'challengeAdaptationIndex', label: 'Challenge Adaptation Index (avg)', category: 'index' },
];

const GROUP_BY_FIELDS = [
  { key: 'schoolType', label: 'School Type' },
  { key: 'yearsTeachingCategory', label: 'Years Teaching' },
  { key: 'levelsTeaching', label: 'Levels Teaching' },
  { key: 'shareSupportStudents', label: 'Share of Support Students' },
  { key: 'shareChallengeStudents', label: 'Share of Challenge Students' },
  { key: 'itemTimeToDifferentiate', label: 'Time to Differentiate' },
  { key: 'itemClassSizeOk', label: 'Class Size OK' },
  { key: 'itemConfidentSupport', label: 'Confident Support' },
  { key: 'itemConfidentChallenge', label: 'Confident Challenge' },
  { key: 'itemTeacherEdPrepared', label: 'Teacher Ed Prepared' },
  { key: 'itemFormativeHelps', label: 'Formative Assessment Helps' },
  { key: 'itemDigitalTools', label: 'Digital Tools' },
  { key: 'itemMaterialsSupport', label: 'Materials for Support' },
  { key: 'itemMaterialsChallenge', label: 'Materials for Challenge' },
];

interface PlaygroundTabProps {
  data: SurveyResponse[];
}

export function PlaygroundTab({ data }: PlaygroundTabProps) {
  const [config, setConfig] = useState<PlaygroundConfig>({
    chartType: 'bar',
    dataMode: 'mean',
    comparisonMode: 'none',
    selectedQuestions: ['supportAdaptationIndex', 'challengeAdaptationIndex'],
    selectedGroups: [],
    groupByField: 'schoolType',
    showTrendLine: false,
    showDataLabels: true,
  });

  const availableGroups = useMemo(() => {
    if (!config.groupByField) return [];
    
    const groups = new Set<string>();
    data.forEach(row => {
      const value = row[config.groupByField as keyof SurveyResponse];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        groups.add(String(value));
      }
    });
    return Array.from(groups).sort();
  }, [data, config.groupByField]);

  const handleQuestionToggle = (questionKey: string) => {
    setConfig(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(questionKey)
        ? prev.selectedQuestions.filter(q => q !== questionKey)
        : [...prev.selectedQuestions, questionKey]
    }));
  };

  const handleGroupToggle = (group: string) => {
    setConfig(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(group)
        ? prev.selectedGroups.filter(g => g !== group)
        : [...prev.selectedGroups, group]
    }));
  };

  const handleSelectAllQuestions = (category?: string) => {
    const questionsToSelect = category 
      ? QUESTIONS.filter(q => q.category === category).map(q => q.key)
      : QUESTIONS.map(q => q.key);
    
    setConfig(prev => ({
      ...prev,
      selectedQuestions: questionsToSelect
    }));
  };

  const handleClearAllQuestions = () => {
    setConfig(prev => ({
      ...prev,
      selectedQuestions: []
    }));
  };

  const handleSelectAllGroups = () => {
    setConfig(prev => ({
      ...prev,
      selectedGroups: availableGroups
    }));
  };

  const handleClearAllGroups = () => {
    setConfig(prev => ({
      ...prev,
      selectedGroups: []
    }));
  };

  const handleClearSelections = () => {
    setConfig(prev => ({
      ...prev,
      selectedQuestions: [],
      selectedGroups: []
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={24} weight="fill" className="text-primary" />
                Chart Playground
              </CardTitle>
              <CardDescription>
                Build custom visualizations by selecting questions, groups, and chart types
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearSelections}
            >
              <X className="mr-2" size={16} />
              Clear All
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chart Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Chart Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={config.chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, chartType: 'bar' }))}
                    className="justify-start"
                  >
                    <ChartBar className="mr-2" size={16} />
                    Bar
                  </Button>
                  <Button
                    variant={config.chartType === 'line' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, chartType: 'line' }))}
                    className="justify-start"
                  >
                    <ChartLine className="mr-2" size={16} />
                    Line
                  </Button>
                  <Button
                    variant={config.chartType === 'grouped-bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, chartType: 'grouped-bar' }))}
                    className="justify-start"
                  >
                    <Rows className="mr-2" size={16} />
                    Grouped
                  </Button>
                  <Button
                    variant={config.chartType === 'stacked-bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, chartType: 'stacked-bar' }))}
                    className="justify-start"
                  >
                    <Rows className="mr-2" size={16} />
                    Stacked
                  </Button>
                  <Button
                    variant={config.chartType === 'scatter' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, chartType: 'scatter' }))}
                    className="justify-start"
                  >
                    <ChartPie className="mr-2" size={16} />
                    Scatter
                  </Button>
                  <Button
                    variant={config.chartType === 'distribution' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, chartType: 'distribution' }))}
                    className="justify-start"
                  >
                    <ChartBar className="mr-2" size={16} />
                    Distribution
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Data Aggregation</Label>
                <Select 
                  value={config.dataMode} 
                  onValueChange={(value: DataMode) => setConfig(prev => ({ ...prev, dataMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mean">Mean (Average)</SelectItem>
                    <SelectItem value="median">Median</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Group By</Label>
                <Select 
                  value={config.groupByField || 'none'} 
                  onValueChange={(value) => setConfig(prev => ({ 
                    ...prev, 
                    groupByField: value === 'none' ? null : value as keyof SurveyResponse,
                    selectedGroups: []
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No grouping</SelectItem>
                    {GROUP_BY_FIELDS.map(field => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Comparison Mode</Label>
                <Select 
                  value={config.comparisonMode} 
                  onValueChange={(value: ComparisonMode) => setConfig(prev => ({ ...prev, comparisonMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No comparison</SelectItem>
                    <SelectItem value="side-by-side">Side by Side</SelectItem>
                    <SelectItem value="overlay">Overlay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="trend-line"
                    checked={config.showTrendLine}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, showTrendLine: checked as boolean }))
                    }
                  />
                  <Label htmlFor="trend-line" className="cursor-pointer">
                    Show trend line
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="data-labels"
                    checked={config.showDataLabels}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, showDataLabels: checked as boolean }))
                    }
                  />
                  <Label htmlFor="data-labels" className="cursor-pointer">
                    Show data labels
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Questions</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllQuestions()}
                    className="h-7 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllQuestions}
                    className="h-7 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center justify-between">
                <span>{config.selectedQuestions.length} selected</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllQuestions('support')}
                    className="h-6 text-xs px-2"
                  >
                    All Support
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllQuestions('challenge')}
                    className="h-6 text-xs px-2"
                  >
                    All Challenge
                  </Button>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {QUESTIONS.map(question => (
                    <div key={question.key} className="flex items-start gap-2">
                      <Checkbox 
                        id={question.key}
                        checked={config.selectedQuestions.includes(question.key)}
                        onCheckedChange={() => handleQuestionToggle(question.key)}
                      />
                      <Label 
                        htmlFor={question.key} 
                        className="cursor-pointer text-sm leading-tight"
                      >
                        {question.label}
                        <Badge 
                          variant="outline" 
                          className="ml-2 text-xs"
                        >
                          {question.category}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {config.groupByField && availableGroups.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Groups</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllGroups}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllGroups}
                      className="h-7 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {config.selectedGroups.length} of {availableGroups.length} selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {availableGroups.map(group => (
                      <div key={group} className="flex items-start gap-2">
                        <Checkbox 
                          id={`group-${group}`}
                          checked={config.selectedGroups.includes(group)}
                          onCheckedChange={() => handleGroupToggle(group)}
                        />
                        <Label 
                          htmlFor={`group-${group}`} 
                          className="cursor-pointer text-sm"
                        >
                          {group}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <PlaygroundChart 
            data={data}
            config={config}
          />
        </div>
      </div>
    </div>
  );
}
