import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from '@phosphor-icons/react';
import { SummaryStats } from '@/lib/types';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Total Responses
        </div>
        <div className="text-3xl font-semibold">
          {stats.totalResponses}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Number of teachers in current filter
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm font-medium text-muted-foreground">
            Avg Support Index
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help" size={14} />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Average frequency teachers use support strategies (helping students who need support). 
                Calculated from 6 questions on a 1-5 scale: 1 = Never, 5 = Always.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="text-3xl font-semibold" style={{ color: 'var(--chart-support)' }}>
          {(stats.avgSupport ?? 0).toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Mean of 6 support questions (1-5 scale)
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm font-medium text-muted-foreground">
            Avg Challenge Index
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help" size={14} />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Average frequency teachers use challenge strategies (providing additional challenge for students who need it). 
                Calculated from 6 questions on a 1-5 scale: 1 = Never, 5 = Always.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="text-3xl font-semibold" style={{ color: 'var(--chart-challenge)' }}>
          {(stats.avgChallenge ?? 0).toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Mean of 6 challenge questions (1-5 scale)
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm font-medium text-muted-foreground">
            Difference (C - S)
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground cursor-help" size={14} />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                The difference between average challenge and support indices. 
                Positive values mean teachers use challenge strategies more often than support strategies. 
                Negative values mean the opposite.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className={`text-3xl font-semibold ${stats.difference >= 0 ? 'text-foreground' : 'text-foreground'}`}>
          {stats.difference >= 0 ? '+' : ''}{(stats.difference ?? 0).toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {stats.difference > 0 
            ? 'More challenge adaptations' 
            : stats.difference < 0 
            ? 'More support adaptations'
            : 'Equal adaptations'}
        </div>
      </Card>
    </div>
  );
}
