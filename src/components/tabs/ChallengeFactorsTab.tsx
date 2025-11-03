import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from '@phosphor-icons/react';
import { SurveyResponse } from '@/lib/types';
import { calculateFactorImpact, calculateGroupSizeImpact, calculateQuestionStats } from '@/lib/analysis';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { BarChart } from '../charts/BarChart';

interface ChallengeFactorsTabProps {
  data: SurveyResponse[];
}

export function ChallengeFactorsTab({ data }: ChallengeFactorsTabProps) {
  const yearsImpact = calculateFactorImpact(data, 'yearsTeachingCategory', 'challenge', 4.0);
  const schoolTypeImpact = calculateFactorImpact(data, 'schoolType', 'challenge', 4.0);
  const certificationImpact = calculateFactorImpact(data, 'hasCertification', 'challenge', 4.0);
  const shareChallengeImpact = calculateFactorImpact(data, 'shareChallengeStudents', 'challenge', 4.0);
  const groupSizeImpact = calculateGroupSizeImpact(data, 'challenge', 4.0);

  const allImpacts = [
    ...yearsImpact.map(i => ({ ...i, variable: 'Years Teaching' })),
    ...schoolTypeImpact.map(i => ({ ...i, variable: 'School Type' })),
    ...certificationImpact.map(i => ({ ...i, variable: 'Certification' })),
    ...shareChallengeImpact.map(i => ({ ...i, variable: 'Share Challenge Students' })),
    ...groupSizeImpact.map(i => ({ ...i, variable: 'Group Size' })),
  ];

  const validData = data.filter(r => r.challengeAdaptationIndex !== null);
  const overallMean = validData.length > 0
    ? validData.reduce((sum, r) => sum + (r.challengeAdaptationIndex as number), 0) / validData.length
    : 0;
  const highChallengeCount = validData.filter(r => (r.challengeAdaptationIndex as number) >= 4.0).length;
  const baseRate = validData.length > 0 ? highChallengeCount / validData.length : 0;

  const stats = calculateQuestionStats(data);
  const challengeQuestions = stats.slice(6, 12);

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
      color: 'var(--chart-challenge)',
    }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-2">
          <h3 className="text-lg font-semibold">Challenge Adaptation Index - Overview</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs">
                The Challenge Adaptation Index measures how frequently teachers use strategies to provide additional challenge for students who need it (scale 1-5). 
                It's calculated as the average across 6 challenge strategies: moving to next planned task, harder versions, more content, more demanding modes, interest-based extensions, and flexible grouping.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-3xl font-semibold" style={{ color: 'var(--chart-challenge)' }}>
            {(baseRate * 100).toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground">
            of teachers report high challenge adaptation (index ≥ 4.0)
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Overall mean challenge index: <strong>{overallMean.toFixed(2)}</strong> • 
          {' '}{highChallengeCount} out of {validData.length} teachers
        </p>
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          <strong>What does this mean?</strong> The challenge index shows how often teachers adapt their lessons for students needing additional challenge. 
          A score of 5 means "always" using these strategies, while 1 means "never." 
          The baseline of {overallMean.toFixed(2)} represents the average across all teachers in this dataset.
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">How Teacher Characteristics Affect Challenge Adaptation</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This chart shows how different teacher contexts relate to their challenge adaptation scores, measured as differences from the overall mean ({overallMean.toFixed(2)}).
              </p>
              <p className="text-xs mb-2">
                <strong className="text-[var(--chart-support)]">Blue bars (negative values)</strong> indicate groups with LOWER challenge adaptation than average (less frequent use of challenge strategies).
              </p>
              <p className="text-xs">
                <strong className="text-[var(--chart-challenge)]">Yellow bars (positive values)</strong> indicate groups with HIGHER challenge adaptation than average (more frequent use of challenge strategies).
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-muted/30 rounded-md p-4 mb-4 text-sm">
          <p className="mb-2">
            <strong>How to read this chart:</strong> Each bar shows the difference between a specific group's average challenge index and the overall average of {overallMean.toFixed(2)}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: 'var(--chart-challenge)' }}></div>
              <div>
                <strong className="text-[var(--chart-challenge)]">Positive values (yellow/right):</strong> Groups that use challenge strategies MORE frequently than average
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: 'var(--chart-support)' }}></div>
              <div>
                <strong className="text-[var(--chart-support)]">Negative values (blue/left):</strong> Groups that use challenge strategies LESS frequently than average
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <strong>Example:</strong> If "School Type: Grundskola" shows -0.28, teachers at grundskola score 0.28 points lower on challenge adaptation, meaning they use these strategies less frequently than the typical teacher.
          </p>
        </div>
        <HorizontalBarChart
          data={diffData}
          height={Math.max(300, diffData.length * 25)}
          valueLabel="Difference from mean challenge index"
          showBaseline
          baselineValue={0}
          chartType="challenge"
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">
            P(High Challenge | Context) — Probability Analysis
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This shows the probability (chance) that a teacher will have a high challenge index (≥4.0) given specific characteristics.
              </p>
              <p className="text-xs">
                For example, if "Share Challenge Students: More than half" shows 45%, it means that 45% of teachers who have more than half their class needing challenge have a challenge index of 4.0 or higher.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-muted/30 rounded-md p-4 mb-4 text-sm">
          <p className="mb-2">
            <strong>What this shows:</strong> The percentage of teachers in each group who frequently use challenge strategies (index ≥ 4.0).
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Baseline:</strong> {(baseRate * 100).toFixed(1)}% of all teachers have high challenge adaptation. 
            Groups with percentages above this are more likely to use challenge strategies frequently.
          </p>
        </div>
        <BarChart
          data={probData}
          height={Math.max(300, probData.length * 20)}
          yLabel="Probability of high challenge (0-100%)"
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
                This table provides detailed statistics for how each teacher characteristic relates to challenge adaptation.
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li><strong>Mean Index:</strong> Average challenge score for this group (1-5 scale)</li>
                <li><strong>Diff from Overall:</strong> How much this group differs from the {overallMean.toFixed(2)} average</li>
                <li><strong>P(High):</strong> Percentage with challenge index ≥ 4.0</li>
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
                    <TableCell className={`text-right font-mono ${impact.diffFromOverall >= 0 ? 'text-chart-challenge' : 'text-muted-foreground'}`}>
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
          <h3 className="text-lg font-semibold">Individual Challenge Questions - Average Frequency</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs">
                These are the 6 challenge strategies teachers were asked about. The bars show the average frequency of use on a scale from 1 (Never) to 5 (Always).
                Higher bars indicate strategies that teachers use more frequently when adapting lessons for students needing additional challenge.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <BarChart
          data={challengeQuestions.map(q => ({
            label: q.question,
            value: q.mean,
            color: 'var(--chart-challenge)',
          }))}
          height={300}
          yLabel="Mean frequency (1-5 scale)"
        />
      </Card>
    </div>
  );
}
