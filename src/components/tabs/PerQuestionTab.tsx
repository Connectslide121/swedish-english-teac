import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from '@phosphor-icons/react';
import { SurveyResponse } from '@/lib/types';
import { calculateQuestionStats, getQuestionDistribution, getQuestionBreakdown } from '@/lib/analysis';
import { BarChart } from '../charts/BarChart';
import { GroupedBarChart } from '../charts/GroupedBarChart';

interface PerQuestionTabProps {
  data: SurveyResponse[];
}

const QUESTIONS = [
  { key: 'supportQ1', label: 'Q1: Extra time to finish', type: 'support' },
  { key: 'supportQ2', label: 'Q2: Easier/supported version', type: 'support' },
  { key: 'supportQ3', label: 'Q3: Limit to core requirements', type: 'support' },
  { key: 'supportQ4', label: 'Q4: Different ways to access task', type: 'support' },
  { key: 'supportQ5', label: 'Q5: Choose topic for motivation', type: 'support' },
  { key: 'supportQ6', label: 'Q6: Flexible grouping (support)', type: 'support' },
  { key: 'challengeQ1', label: 'Q7: Move to planned next task', type: 'challenge' },
  { key: 'challengeQ2', label: 'Q8: Harder version of task', type: 'challenge' },
  { key: 'challengeQ3', label: 'Q9: More/deeper content', type: 'challenge' },
  { key: 'challengeQ4', label: 'Q10: More demanding mode', type: 'challenge' },
  { key: 'challengeQ5', label: 'Q11: Interest-based extension', type: 'challenge' },
  { key: 'challengeQ6', label: 'Q12: Flexible grouping (challenge)', type: 'challenge' },
  { key: 'itemTimeToDifferentiate', label: 'Q13: I have sufficient time to differentiate', type: 'item' },
  { key: 'itemClassSizeOk', label: 'Q14: My typical class size allows me to adapt', type: 'item' },
  { key: 'itemConfidentSupport', label: 'Q15: I feel confident designing support adaptations', type: 'item' },
  { key: 'itemConfidentChallenge', label: 'Q16: I feel confident designing challenge adaptations', type: 'item' },
  { key: 'itemTeacherEdPrepared', label: 'Q17: My teacher education prepared me to adapt', type: 'item' },
  { key: 'itemFormativeHelps', label: 'Q18: Formative assessment helps me target adaptations', type: 'item' },
  { key: 'itemDigitalTools', label: 'Q19: Digital tools make it easier to adapt', type: 'item' },
  { key: 'itemMaterialsSupport', label: 'Q20: I have access to materials for support', type: 'item' },
  { key: 'itemMaterialsChallenge', label: 'Q21: I have access to materials for challenge', type: 'item' },
];

export function PerQuestionTab({ data }: PerQuestionTabProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTIONS[0].key);
  
  const stats = calculateQuestionStats(data);
  const selectedQ = QUESTIONS.find(q => q.key === selectedQuestion)!;
  const questionColor = selectedQ.type === 'support' 
    ? 'var(--chart-support)' 
    : selectedQ.type === 'challenge' 
    ? 'var(--chart-challenge)' 
    : 'var(--chart-neutral)';
  
  const distribution = getQuestionDistribution(data, selectedQuestion);
  const distributionData = Array.from(distribution.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => ({
      label: value.toString(),
      value: count,
      color: questionColor,
    }));

  const yearBreakdown = getQuestionBreakdown(data, selectedQuestion, 'yearsTeachingCategory');
  const yearData = Array.from(yearBreakdown.entries())
    .filter(([cat]) => cat !== 'Unknown')
    .sort((a, b) => {
      const order = ['0-3', '4-6', '7-10', '11-20', '21-30', '30+'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .map(([cat, val]) => ({
      category: cat,
      support: selectedQ.type === 'support' ? val.mean : selectedQ.type === 'item' ? val.mean : 0,
      challenge: selectedQ.type === 'challenge' ? val.mean : 0,
    }));

  const schoolBreakdown = getQuestionBreakdown(data, selectedQuestion, 'schoolType');
  const schoolData = Array.from(schoolBreakdown.entries())
    .sort((a, b) => b[1].mean - a[1].mean)
    .slice(0, 8)
    .map(([cat, val]) => ({
      category: cat.length > 30 ? cat.substring(0, 27) + '...' : cat,
      support: selectedQ.type === 'support' ? val.mean : selectedQ.type === 'item' ? val.mean : 0,
      challenge: selectedQ.type === 'challenge' ? val.mean : 0,
    }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">Question Statistics - All Questions</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This table shows statistics for all 21 survey questions (6 support + 6 challenge strategies + 9 context items).
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li><strong>Mean:</strong> Average frequency on 1-5 scale (1=Never/Strongly Disagree, 5=Always/Strongly Agree)</li>
                <li><strong>Median:</strong> Middle value when responses are sorted</li>
                <li><strong>Std Dev:</strong> How much responses vary (higher = more disagreement among teachers)</li>
                <li><strong>% High Use:</strong> Percentage who answered 4 (Often/Agree) or 5 (Always/Strongly Agree)</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead className="text-right">Mean</TableHead>
                <TableHead className="text-right">Median</TableHead>
                <TableHead className="text-right">Std Dev</TableHead>
                <TableHead className="text-right">% High Use (4-5)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{stat.question}</TableCell>
                  <TableCell className="text-right font-mono">{(stat.mean ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">{(stat.median ?? 0).toFixed(1)}</TableCell>
                  <TableCell className="text-right font-mono">{(stat.stdDev ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">{(stat.percentHighUse ?? 0).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">Detailed Question Analysis</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs">
                Select a specific question to see how responses are distributed and how they vary across different teacher groups. 
                This helps identify which teacher characteristics are associated with different teaching strategies.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Select Question</label>
          <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTIONS.map(q => (
                <SelectItem key={q.key} value={q.key}>
                  {q.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start gap-2 mb-3">
              <h4 className="text-md font-semibold">Response Distribution</h4>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground cursor-help" size={16} />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-xs">
                    Shows how many teachers selected each frequency level (1-5) for this question. 
                    For Q1-12: 1 = Never, 2 = Rarely, 3 = Sometimes, 4 = Often, 5 = Always.
                    For Q13-21: 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <BarChart
              data={distributionData}
              height={250}
              xLabel="Frequency (1-5 scale)"
              yLabel="Number of responses"
              exportPrefix={`question_distribution_${selectedQuestion}`}
            />
          </div>

          {yearData.length > 0 && (
            <div>
              <div className="flex items-start gap-2 mb-3">
                <h4 className="text-md font-semibold">By Years Teaching Experience</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground cursor-help" size={16} />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-xs">
                      Shows the average frequency of use for this strategy across different experience levels. 
                      This reveals whether more or less experienced teachers tend to use this strategy differently.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <GroupedBarChart data={yearData} height={300} exportPrefix={`question_by_years_${selectedQuestion}`} />
            </div>
          )}

          {schoolData.length > 0 && (
            <div>
              <div className="flex items-start gap-2 mb-3">
                <h4 className="text-md font-semibold">By School Type (Top 8)</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground cursor-help" size={16} />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-xs">
                      Shows the 8 school types with the highest average use of this strategy. 
                      Different school contexts may require or enable different adaptation approaches.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <GroupedBarChart data={schoolData} height={350} exportPrefix={`question_by_school_${selectedQuestion}`} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
