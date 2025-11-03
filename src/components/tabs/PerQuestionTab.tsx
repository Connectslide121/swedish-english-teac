import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SurveyResponse } from '@/lib/types';
import { calculateQuestionStats, getQuestionDistribution, getQuestionBreakdown } from '@/lib/analysis';
import { BarChart } from '../charts/BarChart';
import { GroupedBarChart } from '../charts/GroupedBarChart';

interface PerQuestionTabProps {
  data: SurveyResponse[];
}

const QUESTIONS = [
  { key: 'supportQ1', label: 'Support Q1: Extra time to finish', type: 'support' },
  { key: 'supportQ2', label: 'Support Q2: Easier/supported version', type: 'support' },
  { key: 'supportQ3', label: 'Support Q3: Limit to core requirements', type: 'support' },
  { key: 'supportQ4', label: 'Support Q4: Different ways to access task', type: 'support' },
  { key: 'supportQ5', label: 'Support Q5: Choose topic for motivation', type: 'support' },
  { key: 'supportQ6', label: 'Support Q6: Flexible grouping (support)', type: 'support' },
  { key: 'challengeQ1', label: 'Challenge Q1: Move to planned next task', type: 'challenge' },
  { key: 'challengeQ2', label: 'Challenge Q2: Harder version of task', type: 'challenge' },
  { key: 'challengeQ3', label: 'Challenge Q3: More/deeper content', type: 'challenge' },
  { key: 'challengeQ4', label: 'Challenge Q4: More demanding mode', type: 'challenge' },
  { key: 'challengeQ5', label: 'Challenge Q5: Interest-based extension', type: 'challenge' },
  { key: 'challengeQ6', label: 'Challenge Q6: Flexible grouping (challenge)', type: 'challenge' },
];

export function PerQuestionTab({ data }: PerQuestionTabProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTIONS[0].key);
  
  const stats = calculateQuestionStats(data);
  const selectedQ = QUESTIONS.find(q => q.key === selectedQuestion)!;
  const questionColor = selectedQ.type === 'support' ? 'var(--chart-support)' : 'var(--chart-challenge)';
  
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
      support: selectedQ.type === 'support' ? val.mean : 0,
      challenge: selectedQ.type === 'challenge' ? val.mean : 0,
    }));

  const schoolBreakdown = getQuestionBreakdown(data, selectedQuestion, 'schoolType');
  const schoolData = Array.from(schoolBreakdown.entries())
    .sort((a, b) => b[1].mean - a[1].mean)
    .slice(0, 8)
    .map(([cat, val]) => ({
      category: cat.length > 30 ? cat.substring(0, 27) + '...' : cat,
      support: selectedQ.type === 'support' ? val.mean : 0,
      challenge: selectedQ.type === 'challenge' ? val.mean : 0,
    }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Question Statistics - All Questions</h3>
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
        <h3 className="text-lg font-semibold mb-4">Detailed Question Analysis</h3>
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
            <h4 className="text-md font-semibold mb-3">Response Distribution</h4>
            <BarChart
              data={distributionData}
              height={250}
              xLabel="Frequency (1-5 scale)"
              yLabel="Number of responses"
            />
          </div>

          {yearData.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3">By Years Teaching Experience</h4>
              <GroupedBarChart data={yearData} height={300} />
            </div>
          )}

          {schoolData.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3">By School Type (Top 8)</h4>
              <GroupedBarChart data={schoolData} height={350} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
