import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from '@phosphor-icons/react';
import { SurveyResponse } from '@/lib/types';
import { GroupedBarChart } from '../charts/GroupedBarChart';
import { calculateQuestionStats } from '@/lib/analysis';

interface OverviewTabProps {
  data: SurveyResponse[];
}

export function OverviewTab({ data }: OverviewTabProps) {
  const stats = calculateQuestionStats(data);
  
  const supportStats = stats.slice(0, 6);
  const challengeStats = stats.slice(6, 12);
  
  const avgSupport = supportStats.length > 0 ? supportStats.reduce((sum, s) => sum + (s.mean ?? 0), 0) / 6 : 0;
  const avgChallenge = challengeStats.length > 0 ? challengeStats.reduce((sum, s) => sum + (s.mean ?? 0), 0) / 6 : 0;

  const indexData = [
    { category: 'Indices', support: avgSupport, challenge: avgChallenge }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="text-lg font-semibold">Support vs Challenge Adaptation Indices</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs mb-2">
                This chart compares how frequently teachers use support strategies (for students needing help) versus challenge strategies (for students needing more difficulty).
              </p>
              <p className="text-xs">
                Each index is the average of 6 related questions, measured on a 1-5 scale where 1 = Never and 5 = Always.
                Higher bars indicate more frequent use of that type of adaptation.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <GroupedBarChart data={indexData} height={250} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--chart-support)' }}>
              Support Adaptations
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={16} />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-xs">
                  These are the 6 strategies teachers use to help students who need support. 
                  The mean shows average frequency (1-5), and the percentage shows how many teachers use each strategy often or always.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-3">
            {supportStats.map((stat, idx) => (
              <div key={idx} className="border-b border-border pb-2 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">{stat.question}</span>
                  <span className="text-sm font-mono font-semibold" style={{ color: 'var(--chart-support)' }}>
                    {(stat.mean ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Median: {(stat.median ?? 0).toFixed(1)}</span>
                  <span>{(stat.percentHighUse ?? 0).toFixed(0)}% use frequently (4-5)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--chart-challenge)' }}>
              Challenge Adaptations
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={16} />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-xs">
                  These are the 6 strategies teachers use to challenge students who need more difficulty. 
                  The mean shows average frequency (1-5), and the percentage shows how many teachers use each strategy often or always.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-3">
            {challengeStats.map((stat, idx) => (
              <div key={idx} className="border-b border-border pb-2 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">{stat.question}</span>
                  <span className="text-sm font-mono font-semibold" style={{ color: 'var(--chart-challenge)' }}>
                    {(stat.mean ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Median: {(stat.median ?? 0).toFixed(1)}</span>
                  <span>{(stat.percentHighUse ?? 0).toFixed(0)}% use frequently (4-5)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-2 mb-3">
          <h3 className="text-lg font-semibold">Key Insights</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help mt-1" size={18} />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs">
                Automatically generated insights that highlight the most-used strategies and overall patterns in the data.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            <strong>Most frequent support strategy:</strong> {supportStats.reduce((max, s) => (s.mean ?? 0) > (max.mean ?? 0) ? s : max).question} (avg: {(supportStats.reduce((max, s) => (s.mean ?? 0) > (max.mean ?? 0) ? s : max).mean ?? 0).toFixed(2)})
          </p>
          <p className="text-muted-foreground">
            <strong>Most frequent challenge strategy:</strong> {challengeStats.reduce((max, s) => (s.mean ?? 0) > (max.mean ?? 0) ? s : max).question} (avg: {(challengeStats.reduce((max, s) => (s.mean ?? 0) > (max.mean ?? 0) ? s : max).mean ?? 0).toFixed(2)})
          </p>
          <p className="text-muted-foreground">
            <strong>Overall balance:</strong> {avgSupport > avgChallenge ? 'Teachers use more support adaptations' : avgChallenge > avgSupport ? 'Teachers use more challenge adaptations' : 'Support and challenge adaptations are used equally'}
          </p>
        </div>
      </Card>
    </div>
  );
}
