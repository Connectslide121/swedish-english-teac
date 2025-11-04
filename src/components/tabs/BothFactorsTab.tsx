import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from '@phosphor-icons/react';
import { SurveyResponse } from '@/lib/types';
import { calculateDualFactorImpact, calculateDualGroupSizeImpact } from '@/lib/analysis';
import { getFullQuestion } from '@/lib/question-mappings';
import { BarChart } from '../charts/BarChart';
import { GroupedBarChart } from '../charts/GroupedBarChart';
import { TooltipProvider } from '@/components/ui/tooltip';

interface BothFactorsTabProps {
  data: SurveyResponse[];
}

export function BothFactorsTab({ data }: BothFactorsTabProps) {
  const yearsImpact = calculateDualFactorImpact(data, 'yearsTeachingCategory', 4.0);
  const schoolTypeImpact = calculateDualFactorImpact(data, 'schoolType', 4.0);
  const certificationImpact = calculateDualFactorImpact(data, 'hasCertification', 4.0);
  const shareSupportImpact = calculateDualFactorImpact(data, 'shareSupportStudents', 4.0);
  const shareChallengeImpact = calculateDualFactorImpact(data, 'shareChallengeStudents', 4.0);
  const levelsImpact = calculateDualFactorImpact(data, 'levelsTeaching', 4.0);
  const groupSizeImpact = calculateDualGroupSizeImpact(data, 4.0);
  
  const timeImpact = calculateDualFactorImpact(data, 'itemTimeToDifferentiate', 4.0);
  const classSizeImpact = calculateDualFactorImpact(data, 'itemClassSizeOk', 4.0);
  const confidentSupportImpact = calculateDualFactorImpact(data, 'itemConfidentSupport', 4.0);
  const confidentChallengeImpact = calculateDualFactorImpact(data, 'itemConfidentChallenge', 4.0);
  const teacherEdImpact = calculateDualFactorImpact(data, 'itemTeacherEdPrepared', 4.0);
  const formativeImpact = calculateDualFactorImpact(data, 'itemFormativeHelps', 4.0);
  const digitalToolsImpact = calculateDualFactorImpact(data, 'itemDigitalTools', 4.0);
  const materialsSupportImpact = calculateDualFactorImpact(data, 'itemMaterialsSupport', 4.0);
  const materialsChallengeImpact = calculateDualFactorImpact(data, 'itemMaterialsChallenge', 4.0);

  const allImpacts = [
    ...yearsImpact.map(i => ({ ...i, variable: 'Years Teaching' })),
    ...schoolTypeImpact.map(i => ({ ...i, variable: 'School Type' })),
    ...certificationImpact.map(i => ({ ...i, variable: 'Certification' })),
    ...levelsImpact.map(i => ({ ...i, variable: 'Levels Teaching' })),
    ...shareSupportImpact.map(i => ({ ...i, variable: 'Share Support Students' })),
    ...shareChallengeImpact.map(i => ({ ...i, variable: 'Share Challenge Students' })),
    ...groupSizeImpact.map(i => ({ ...i, variable: 'Group Size' })),
    ...timeImpact.map(i => ({ ...i, variable: 'Time to Differentiate' })),
    ...classSizeImpact.map(i => ({ ...i, variable: 'Class Size OK' })),
    ...confidentSupportImpact.map(i => ({ ...i, variable: 'Confident Supporting' })),
    ...confidentChallengeImpact.map(i => ({ ...i, variable: 'Confident Challenging' })),
    ...teacherEdImpact.map(i => ({ ...i, variable: 'Teacher Ed Prepared' })),
    ...formativeImpact.map(i => ({ ...i, variable: 'Formative Assessment Helps' })),
    ...digitalToolsImpact.map(i => ({ ...i, variable: 'Digital Tools Available' })),
    ...materialsSupportImpact.map(i => ({ ...i, variable: 'Materials for Support' })),
    ...materialsChallengeImpact.map(i => ({ ...i, variable: 'Materials for Challenge' })),
  ];

  const validData = data.filter(r => 
    r.supportAdaptationIndex !== null && r.challengeAdaptationIndex !== null
  );

  const supportMean = validData.length > 0 
    ? validData.reduce((sum, r) => sum + (r.supportAdaptationIndex as number), 0) / validData.length
    : 0;

  const challengeMean = validData.length > 0
    ? validData.reduce((sum, r) => sum + (r.challengeAdaptationIndex as number), 0) / validData.length
    : 0;

  const highBothCount = validData.filter(r => 
    (r.supportAdaptationIndex as number) >= 4.0 && 
    (r.challengeAdaptationIndex as number) >= 4.0
  ).length;

  const baseRate = validData.length > 0 ? highBothCount / validData.length : 0;

  const topBothFactors = allImpacts
    .filter(i => i.count >= 3)
    .sort((a, b) => b.probabilityBoth - a.probabilityBoth)
    .slice(0, 15);

  const topSupportDiff = allImpacts
    .filter(i => i.count >= 3)
    .sort((a, b) => Math.abs(b.diffSupportFromOverall) - Math.abs(a.diffSupportFromOverall))
    .slice(0, 10);

  const topChallengeDiff = allImpacts
    .filter(i => i.count >= 3)
    .sort((a, b) => Math.abs(b.diffChallengeFromOverall) - Math.abs(a.diffChallengeFromOverall))
    .slice(0, 10);

  const topCombined = allImpacts
    .filter(i => i.count >= 3)
    .sort((a, b) => b.combinedImpact - a.combinedImpact)
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-2">
          <h3 className="text-lg font-semibold">Dual Adaptation Index - Overview</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs">
                This analysis identifies factors that affect BOTH support and challenge adaptation simultaneously. 
                Teachers who score high on both indices (≥4.0) are effectively differentiating for diverse student needs.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-3xl font-semibold text-primary">
            {(baseRate * 100).toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground">
            of teachers report high adaptation for BOTH support and challenge (both indices ≥ 4.0)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold" style={{ color: 'var(--chart-support)' }}>
              {supportMean.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              Mean support index
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold" style={{ color: 'var(--chart-challenge)' }}>
              {challengeMean.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              Mean challenge index
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {highBothCount} out of {validData.length} teachers score high on both indices
        </p>
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          <strong>What does this mean?</strong> Teachers who adapt frequently for BOTH support and challenge needs demonstrate 
          comprehensive differentiation practices. This analysis shows which teacher characteristics and contexts are associated 
          with this balanced approach to meeting diverse student needs.
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">
            P(High Both | Context) — Which Factors Lead to Dual Adaptation?
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This shows the probability that a teacher will score high (≥4.0) on BOTH support and challenge indices 
                given specific characteristics.
              </p>
              <p className="text-xs">
                Higher percentages indicate contexts where teachers are more likely to adapt effectively for diverse needs.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-muted/30 rounded-md p-4 mb-4 text-sm">
          <p className="mb-2">
            <strong>What this shows:</strong> The percentage of teachers in each group who frequently adapt for BOTH 
            support and challenge needs (both indices ≥ 4.0).
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Baseline:</strong> {(baseRate * 100).toFixed(1)}% of all teachers score high on both. 
            Groups with percentages above this show stronger dual adaptation.
          </p>
        </div>
        <BarChart
          data={topBothFactors.map(i => ({
            label: `${i.variable}: ${i.category}`,
            value: i.probabilityBoth,
            color: 'var(--primary)',
          }))}
          height={Math.max(300, topBothFactors.length * 20)}
          yLabel="Probability of high adaptation for both (0-100%)"
          exportPrefix="both_probability"
          enableQuestionTooltips
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">Combined Impact Score - Top Influencing Factors</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This score combines the absolute differences from mean for both support and challenge. 
                Higher scores indicate factors that have strong influence on BOTH types of adaptation.
              </p>
              <p className="text-xs">
                Formula: |Diff from Support Mean| + |Diff from Challenge Mean|
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-muted/30 rounded-md p-4 mb-4 text-sm">
          <p className="text-xs text-muted-foreground">
            This metric identifies which teacher characteristics have the strongest overall impact on differentiation practices, 
            regardless of direction. Factors at the top affect both support and challenge adaptation most significantly.
          </p>
        </div>
        <BarChart
          data={topCombined.map(i => ({
            label: `${i.variable}: ${i.category}`,
            value: i.combinedImpact,
            color: 'var(--accent)',
          }))}
          height={Math.max(300, topCombined.length * 20)}
          yLabel="Combined impact score"
          exportPrefix="both_combined_impact"
          enableQuestionTooltips
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">Support vs Challenge Impact Comparison</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs">
                This grouped chart shows how each factor affects support and challenge adaptation side-by-side. 
                You can see whether a factor increases/decreases both equally or affects one more than the other.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-muted/30 rounded-md p-4 mb-4 text-sm">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: 'var(--chart-support)' }}></div>
            <span className="text-xs"><strong>Blue bars:</strong> Difference from mean support index</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: 'var(--chart-challenge)' }}></div>
            <span className="text-xs"><strong>Yellow bars:</strong> Difference from mean challenge index</span>
          </div>
        </div>
        <GroupedBarChart
          data={topCombined.map(i => ({
            category: `${i.variable}: ${i.category}`,
            support: i.diffSupportFromOverall,
            challenge: i.diffChallengeFromOverall,
          }))}
          height={Math.max(400, topCombined.length * 30)}
          exportPrefix="both_comparison"
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">Detailed Dual Factor Analysis Table</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This comprehensive table shows all statistics for how each factor relates to both support and challenge adaptation.
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li><strong>Support/Challenge Mean:</strong> Average index for this group (1-5 scale)</li>
                <li><strong>Diff from Overall:</strong> How much this group differs from overall averages</li>
                <li><strong>P(Both High):</strong> Percentage with both indices ≥ 4.0</li>
                <li><strong>Combined Impact:</strong> Total influence on both adaptations</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Support Mean</TableHead>
                  <TableHead className="text-right">Challenge Mean</TableHead>
                  <TableHead className="text-right">Diff Support</TableHead>
                  <TableHead className="text-right">Diff Challenge</TableHead>
                  <TableHead className="text-right">P(Both High)</TableHead>
                  <TableHead className="text-right">Combined Impact</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allImpacts
                  .sort((a, b) => b.combinedImpact - a.combinedImpact)
                  .map((impact, idx) => {
                    const fullQuestion = getFullQuestion(impact.variable);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {fullQuestion ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help underline decoration-dotted underline-offset-2">
                                  {impact.variable}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-xs">{fullQuestion}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            impact.variable
                          )}
                        </TableCell>
                        <TableCell>{impact.category}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {impact.meanSupport.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {impact.meanChallenge.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs ${Math.abs(impact.diffSupportFromOverall) > 0.2 ? 'font-semibold' : ''}`}>
                          {impact.diffSupportFromOverall >= 0 ? '+' : ''}{impact.diffSupportFromOverall.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs ${Math.abs(impact.diffChallengeFromOverall) > 0.2 ? 'font-semibold' : ''}`}>
                          {impact.diffChallengeFromOverall >= 0 ? '+' : ''}{impact.diffChallengeFromOverall.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {(impact.probabilityBoth * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-accent">
                          {impact.combinedImpact.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {impact.count < 5 && <Badge variant="outline" className="mr-2 text-xs">Low n</Badge>}
                          {impact.count}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
}
