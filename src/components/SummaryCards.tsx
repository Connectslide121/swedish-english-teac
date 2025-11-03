import { Card } from '@/components/ui/card';
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
      </Card>

      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Avg Support Index
        </div>
        <div className="text-3xl font-semibold" style={{ color: 'var(--chart-support)' }}>
          {stats.avgSupport.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Mean of 6 support questions (1-5 scale)
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Avg Challenge Index
        </div>
        <div className="text-3xl font-semibold" style={{ color: 'var(--chart-challenge)' }}>
          {stats.avgChallenge.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Mean of 6 challenge questions (1-5 scale)
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Difference (C - S)
        </div>
        <div className={`text-3xl font-semibold ${stats.difference >= 0 ? 'text-foreground' : 'text-foreground'}`}>
          {stats.difference >= 0 ? '+' : ''}{stats.difference.toFixed(2)}
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
