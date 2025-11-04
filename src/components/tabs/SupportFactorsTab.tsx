import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from '@phosphor-icons/react';
import { SurveyResponse } from '@/lib/types';
import { calculateFactorImpact, calculateGroupSizeImpact, calculateQuestionStats } from '@/lib/analysis';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { BarChart } from '../charts/BarChart';

interface SupportFactorsTabProps {
  data: SurveyResponse[];
}

export function SupportFactorsTab({ data }: SupportFactorsTabProps) {
  const yearsImpact = calculateFactorImpact(data, 'yearsTeachingCategory', 'support', 4.0);
  const schoolTypeImpact = calculateFactorImpact(data, 'schoolType', 'support', 4.0);
  const certificationImpact = calculateFactorImpact(data, 'hasCertification', 'support', 4.0);
  const shareSupportImpact = calculateFactorImpact(data, 'shareSupportStudents', 'support', 4.0);
  const groupSizeImpact = calculateGroupSizeImpact(data, 'support', 4.0);

  const allImpacts = [
    ...yearsImpact.map(i => ({ ...i, variable: 'Years Teaching' })),
    ...schoolTypeImpact.map(i => ({ ...i, variable: 'School Type' })),
    ...certificationImpact.map(i => ({ ...i, variable: 'Certification' })),
    ...shareSupportImpact.map(i => ({ ...i, variable: 'Share Support Students' })),
    ...groupSizeImpact.map(i => ({ ...i, variable: 'Group Size' })),
  ];

  const validData = data.filter(r => r.supportAdaptationIndex !== null);
  const overallMean = validData.length > 0 
    ? validData.reduce((sum, r) => sum + (r.supportAdaptationIndex as number), 0) / validData.length
    : 0;
  const highSupportCount = validData.filter(r => (r.supportAdaptationIndex as number) >= 4.0).length;
  const baseRate = validData.length > 0 ? highSupportCount / validData.length : 0;

  const stats = calculateQuestionStats(data);
  const supportQuestions = stats.slice(0, 6);

  const diffData = allImpacts
    .filter(i => i.count >= 3)
    .sort((a, b) => Math.abs(b.diffFromOverall) - Math.abs(a.diffFromOverall))
    .slice(0, 15)
    .map(i => ({
      category: `${i.variable}: ${i.category}`,
      value: i.diffFromOverall,
      count: i.count,
    }));

  const probData = allImpacts
    .filter(i => i.count >= 3)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 15)
    .map(i => ({
      label: `${i.variable}: ${i.category}`,
      value: i.probability,
      color: 'var(--chart-support)',
    }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-2">
          <h3 className="text-lg font-semibold">Support Adaptation Index - Overview</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs">
                The Support Adaptation Index measures how frequently teachers use strategies to help students who need extra support (scale 1-5). 
                It's calculated as the average across 6 support strategies: extra time, easier versions, limiting to core requirements, different access methods, topic choice, and flexible grouping.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-3xl font-semibold" style={{ color: 'var(--chart-support)' }}>
            {(baseRate * 100).toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground">
            of teachers report high support adaptation (index ≥ 4.0)
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Overall mean support index: <strong>{overallMean.toFixed(2)}</strong> • 
          {' '}{highSupportCount} out of {validData.length} teachers
        </p>
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          <strong>What does this mean?</strong> The support index shows how often teachers adapt their lessons for students needing support. 
          A score of 5 means "always" using these strategies, while 1 means "never." 
          The baseline of {overallMean.toFixed(2)} represents the average across all teachers in this dataset.
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">How Teacher Characteristics Affect Support Adaptation</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This chart shows how different teacher contexts relate to their support adaptation scores, measured as differences from the overall mean ({overallMean.toFixed(2)}).
              </p>
              <p className="text-xs mb-2">
                <strong className="text-[var(--chart-support)]">Blue bars (negative values)</strong> indicate groups with LOWER support adaptation than average (less frequent use of support strategies).
              </p>
              <p className="text-xs">
                <strong className="text-[var(--chart-challenge)]">Yellow bars (positive values)</strong> indicate groups with HIGHER support adaptation than average (more frequent use of support strategies).
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-muted/30 rounded-md p-4 mb-4 text-sm">
          <p className="mb-2">
            <strong>How to read this chart:</strong> Each bar shows the difference between a specific group's average support index and the overall average of {overallMean.toFixed(2)}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: 'var(--chart-challenge)' }}></div>
              <div>
                <strong className="text-[var(--chart-challenge)]">Positive values (yellow/right):</strong> Groups that use support strategies MORE frequently than average
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: 'var(--chart-support)' }}></div>
              <div>
                <strong className="text-[var(--chart-support)]">Negative values (blue/left):</strong> Groups that use support strategies LESS frequently than average
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <strong>Example:</strong> If "School Type: Gymnasium" shows +0.35, teachers at gymnasiums score 0.35 points higher on support adaptation, meaning they use these strategies more frequently than the typical teacher.
          </p>
        </div>
        <HorizontalBarChart
          data={diffData}
          height={Math.max(300, diffData.length * 25)}
          valueLabel="Difference from mean support index"
          showBaseline
          baselineValue={0}
          chartType="support"
          exportPrefix="support_factor_impact"
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">
            P(High Support | Context) — Probability Analysis
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This shows the probability (chance) that a teacher will have a high support index (≥4.0) given specific characteristics.
              </p>
              <p className="text-xs">
                For example, if "Years Teaching: 10-20 years" shows 65%, it means that 65% of teachers with 10-20 years of experience have a support index of 4.0 or higher.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-muted/30 rounded-md p-4 mb-4 text-sm">
          <p className="mb-2">
            <strong>What this shows:</strong> The percentage of teachers in each group who frequently use support strategies (index ≥ 4.0).
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Baseline:</strong> {(baseRate * 100).toFixed(1)}% of all teachers have high support adaptation. 
            Groups with percentages above this are more likely to use support strategies frequently.
          </p>
        </div>
        <BarChart
          data={probData}
          height={Math.max(300, probData.length * 20)}
          yLabel="Probability of high support (0-100%)"
          exportPrefix="support_probability"
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">Detailed Factor Analysis Table</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This table provides detailed statistics for how each teacher characteristic relates to support adaptation.
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li><strong>Mean Index:</strong> Average support score for this group (1-5 scale)</li>
                <li><strong>Diff from Overall:</strong> How much this group differs from the {overallMean.toFixed(2)} average</li>
                <li><strong>P(High):</strong> Percentage with support index ≥ 4.0</li>
                <li><strong>Count:</strong> Number of teachers in this group</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Mean Index</TableHead>
                <TableHead className="text-right">Diff from Overall</TableHead>
                <TableHead className="text-right">P(High)</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allImpacts
                .sort((a, b) => b.diffFromOverall - a.diffFromOverall)
                .map((impact, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{impact.variable}</TableCell>
                    <TableCell>{impact.category}</TableCell>
                    <TableCell className="text-right font-mono">{(impact.meanIndex ?? 0).toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-mono ${impact.diffFromOverall >= 0 ? 'text-chart-support' : 'text-muted-foreground'}`}>
                      {impact.diffFromOverall >= 0 ? '+' : ''}{(impact.diffFromOverall ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">{((impact.probability ?? 0) * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      {impact.count < 5 && <Badge variant="outline" className="mr-2 text-xs">Low n</Badge>}
                      {impact.count}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">Individual Support Questions - Average Frequency</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs">
                These are the 6 support strategies teachers were asked about. The bars show the average frequency of use on a scale from 1 (Never) to 5 (Always).
                Higher bars indicate strategies that teachers use more frequently when adapting lessons for students needing support.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <BarChart
          data={supportQuestions.map(q => ({
            label: q.question,
            value: q.mean,
            color: 'var(--chart-support)',
          }))}
          height={300}
          yLabel="Mean frequency (1-5 scale)"
          exportPrefix="support_questions"
        />
      </Card>
    </div>
  );
}
