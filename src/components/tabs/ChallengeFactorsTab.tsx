import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
        <h3 className="text-lg font-semibold mb-2">Challenge Adaptation Index - Base Rate</h3>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-3xl font-semibold" style={{ color: 'var(--chart-challenge)' }}>
            {(baseRate * 100).toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground">
            of teachers report high challenge adaptation (index ≥ 4.0)
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Overall mean challenge index: <strong>{overallMean.toFixed(2)}</strong> • 
          {' '}{highChallengeCount} out of {validData.length} teachers
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Factor Impact on Challenge Index</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Difference from overall mean ({overallMean.toFixed(2)}). Positive values indicate higher challenge adaptation.
        </p>
        <HorizontalBarChart
          data={diffData}
          height={Math.max(300, diffData.length * 25)}
          valueLabel="Difference from mean challenge index"
          showBaseline
          baselineValue={0}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          P(High Challenge | Context) — Bayesian View
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Probability of high challenge adaptation (≥4.0) given teacher context. 
          Base rate: {(baseRate * 100).toFixed(1)}%
        </p>
        <BarChart
          data={probData}
          height={Math.max(300, probData.length * 20)}
          yLabel="Probability of high challenge"
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Challenge Factor Impact - Detailed Table</h3>
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
                    <TableCell className={`text-right font-mono ${impact.diffFromOverall >= 0 ? 'text-chart-challenge' : 'text-chart-support'}`}>
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
        <h3 className="text-lg font-semibold mb-4">Individual Challenge Questions - Means</h3>
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
