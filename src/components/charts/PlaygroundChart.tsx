import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from '@phosphor-icons/react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
  LabelList
} from 'recharts';
import { SurveyResponse } from '@/lib/types';

type ChartType = 'bar' | 'line' | 'grouped-bar' | 'stacked-bar' | 'scatter' | 'distribution';
type DataMode = 'average' | 'distribution';

interface PlaygroundConfig {
  chartType: ChartType;
  dataMode: DataMode;
  selectedQuestions: string[];
  selectedGroups: string[];
  groupByField: keyof SurveyResponse | null;
  showDataLabels: boolean;
}

interface PlaygroundChartProps {
  data: SurveyResponse[];
  config: PlaygroundConfig;
}

const COLORS = [
  'oklch(48.8% 0.243 264.376)',
  'oklch(0.65 0.20 195)',
  'oklch(83.7% 0.128 66.29)',
  'oklch(0.60 0.25 25)',
  'oklch(0.45 0.20 250)',
  'oklch(0.75 0.18 45)',
  'oklch(0.55 0.15 300)',
  'oklch(0.70 0.22 120)',
  'oklch(0.50 0.18 30)',
  'oklch(0.65 0.16 180)',
];

const QUESTION_LABELS: Record<string, string> = {
  supportQ1: 'Extra time',
  supportQ2: 'Easier version',
  supportQ3: 'Core only',
  supportQ4: 'Different access',
  supportQ5: 'Choose topic',
  supportQ6: 'Flex grouping',
  challengeQ1: 'Next task',
  challengeQ2: 'Harder version',
  challengeQ3: 'More content',
  challengeQ4: 'Demanding mode',
  challengeQ5: 'Interest extension',
  challengeQ6: 'Flex grouping',
  supportAdaptationIndex: 'Support Index',
  challengeAdaptationIndex: 'Challenge Index',
};

function calculateStatistic(values: number[], mode: DataMode): number {
  if (values.length === 0) return 0;
  
  if (mode === 'average') {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function PlaygroundChart({ data, config }: PlaygroundChartProps) {
  const chartData = useMemo(() => {
    if (config.selectedQuestions.length === 0) {
      return [];
    }

    if (!config.groupByField) {
      return config.selectedQuestions.map(questionKey => {
        const values = data
          .map(row => (row as any)[questionKey])
          .filter(v => v !== null && v !== undefined) as number[];
        
        return {
          name: QUESTION_LABELS[questionKey] || questionKey,
          value: calculateStatistic(values, config.dataMode),
          count: values.length,
        };
      });
    }

    if (config.selectedGroups.length === 0) {
      const groups = new Set<string>();
      data.forEach(row => {
        const value = row[config.groupByField as keyof SurveyResponse];
        if (value !== null && value !== undefined && String(value).trim() !== '') {
          groups.add(String(value));
        }
      });
      const allGroups = Array.from(groups).sort();

      return allGroups.map(group => {
        const groupData = data.filter(
          row => String(row[config.groupByField as keyof SurveyResponse]) === group
        );

        const result: any = { name: group };
        
        config.selectedQuestions.forEach(questionKey => {
          const values = groupData
            .map(row => (row as any)[questionKey])
            .filter(v => v !== null && v !== undefined) as number[];
          
          result[questionKey] = calculateStatistic(values, config.dataMode);
        });

        return result;
      });
    }

    return config.selectedGroups.map(group => {
      const groupData = data.filter(
        row => String(row[config.groupByField as keyof SurveyResponse]) === group
      );

      const result: any = { name: group };
      
      config.selectedQuestions.forEach(questionKey => {
        const values = groupData
          .map(row => (row as any)[questionKey])
          .filter(v => v !== null && v !== undefined) as number[];
        
        result[questionKey] = calculateStatistic(values, config.dataMode);
      });

      return result;
    });
  }, [
    data, 
    config.selectedQuestions, 
    config.selectedGroups, 
    config.groupByField, 
    config.dataMode
  ]);

  const scatterData = useMemo(() => {
    if (config.chartType !== 'scatter' || config.selectedQuestions.length < 2) {
      return [];
    }

    const [xKey, yKey] = config.selectedQuestions;
    
    return data
      .filter(row => {
        const xVal = (row as any)[xKey];
        const yVal = (row as any)[yKey];
        return xVal !== null && xVal !== undefined && yVal !== null && yVal !== undefined;
      })
      .map(row => ({
        x: (row as any)[xKey],
        y: (row as any)[yKey],
        group: config.groupByField ? String(row[config.groupByField]) : 'All',
      }));
  }, [data, config.chartType, config.selectedQuestions, config.groupByField]);

  const distributionData = useMemo(() => {
    if (config.chartType !== 'distribution' || config.selectedQuestions.length === 0) {
      return [];
    }

    const questionKey = config.selectedQuestions[0];
    const distribution = new Map<number, number>();
    
    data.forEach(row => {
      const value = (row as any)[questionKey];
      if (value !== null && value !== undefined) {
        distribution.set(value, (distribution.get(value) || 0) + 1);
      }
    });

    return Array.from(distribution.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, count]) => ({
        name: String(value),
        count,
        percentage: (count / data.length) * 100,
      }));
  }, [data, config.chartType, config.selectedQuestions]);

  const calculateTrendLine = (chartData: any[], dataKey: string) => {
    if (chartData.length < 2) return null;
    
    const points = chartData
      .map((d, i) => ({ x: i, y: d[dataKey] }))
      .filter(p => p.y !== null && p.y !== undefined);
    
    if (points.length < 2) return null;
    
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return chartData.map((d, i) => ({
      x: d.name,
      y: slope * i + intercept
    }));
  };

  if (config.selectedQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Select at least one question to visualize data
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (config.chartType === 'scatter' && config.selectedQuestions.length < 2) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Scatter plots require at least 2 questions selected
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getChartTitle = () => {
    const modeLabel = {
      mean: 'Average',
      median: 'Median',
      count: 'Count',
      percentage: 'Percentage (≥4)',
    }[config.dataMode];

    if (config.chartType === 'scatter') {
      return `Scatter Plot: ${QUESTION_LABELS[config.selectedQuestions[0]]} vs ${QUESTION_LABELS[config.selectedQuestions[1]]}`;
    }

    if (config.chartType === 'distribution') {
      return `Distribution: ${QUESTION_LABELS[config.selectedQuestions[0]]}`;
    }

    if (config.groupByField) {
      return `${modeLabel} by ${config.groupByField}`;
    }

    return `${modeLabel} Comparison`;
  };

  const renderChart = () => {
    if (config.chartType === 'scatter') {
      const groupedScatter = new Map<string, any[]>();
      scatterData.forEach(point => {
        if (!groupedScatter.has(point.group)) {
          groupedScatter.set(point.group, []);
        }
        groupedScatter.get(point.group)!.push(point);
      });

      return (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name={QUESTION_LABELS[config.selectedQuestions[0]]}
              label={{ 
                value: QUESTION_LABELS[config.selectedQuestions[0]], 
                position: 'bottom',
                offset: 40 
              }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name={QUESTION_LABELS[config.selectedQuestions[1]]}
              label={{ 
                value: QUESTION_LABELS[config.selectedQuestions[1]], 
                angle: -90, 
                position: 'insideLeft',
                offset: 10 
              }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {Array.from(groupedScatter.entries()).map(([group, points], idx) => (
              <Scatter 
                key={group}
                name={group}
                data={points}
                fill={COLORS[idx % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === 'distribution') {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={distributionData} margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
            <XAxis 
              dataKey="name" 
              label={{ value: 'Response Value', position: 'bottom', offset: 40 }}
            />
            <YAxis 
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS[0]} radius={[8, 8, 0, 0]}>
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              {config.showDataLabels && (
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  style={{ fontSize: '11px', fill: 'oklch(0.20 0.02 250)' }}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis 
              domain={[0, 'auto']}
              label={{ 
                value: 'Value', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip />
            {config.groupByField ? (
              <>
                <Legend />
                {config.selectedQuestions.map((questionKey, idx) => (
                  <Line
                    key={questionKey}
                    type="monotone"
                    dataKey={questionKey}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    name={QUESTION_LABELS[questionKey] || questionKey}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  >
                    {config.showDataLabels && (
                      <LabelList 
                        dataKey={questionKey} 
                        position="top" 
                        formatter={(value: number) => value.toFixed(1)}
                        style={{ fontSize: '11px', fill: 'oklch(0.20 0.02 250)' }}
                      />
                    )}
                  </Line>
                ))}
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              >
                {config.showDataLabels && (
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    formatter={(value: number) => value.toFixed(1)}
                    style={{ fontSize: '11px', fill: 'oklch(0.20 0.02 250)' }}
                  />
                )}
              </Line>
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === 'stacked-bar' && config.groupByField) {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis 
              domain={[0, 'auto']}
              label={{ 
                value: 'Value', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip />
            <Legend />
            {config.selectedQuestions.map((questionKey, idx) => (
              <Bar
                key={questionKey}
                dataKey={questionKey}
                stackId="a"
                fill={COLORS[idx % COLORS.length]}
                name={QUESTION_LABELS[questionKey] || questionKey}
                radius={idx === config.selectedQuestions.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
              >
                {config.showDataLabels && (
                  <LabelList 
                    dataKey={questionKey} 
                    position="center" 
                    formatter={(value: number) => value > 0 ? value.toFixed(1) : ''}
                    style={{ fontSize: '11px', fill: 'oklch(0.99 0 0)' }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === 'grouped-bar' && config.groupByField) {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis 
              domain={[0, 'auto']}
              label={{ 
                value: 'Value', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip />
            <Legend />
            {config.selectedQuestions.map((questionKey, idx) => (
              <Bar
                key={questionKey}
                dataKey={questionKey}
                fill={COLORS[idx % COLORS.length]}
                name={QUESTION_LABELS[questionKey] || questionKey}
                radius={[8, 8, 0, 0]}
              >
                {config.showDataLabels && (
                  <LabelList 
                    dataKey={questionKey} 
                    position="top" 
                    formatter={(value: number) => value.toFixed(1)}
                    style={{ fontSize: '11px', fill: 'oklch(0.20 0.02 250)' }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis 
            domain={[0, 'auto']}
            label={{ 
              value: 'Value', 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <Tooltip />
          {config.groupByField ? (
            <>
              <Legend />
              {config.selectedQuestions.map((questionKey, idx) => (
                <Bar
                  key={questionKey}
                  dataKey={questionKey}
                  fill={COLORS[idx % COLORS.length]}
                  name={QUESTION_LABELS[questionKey] || questionKey}
                  radius={[8, 8, 0, 0]}
                >
                  {config.showDataLabels && (
                    <LabelList 
                      dataKey={questionKey} 
                      position="top" 
                      formatter={(value: number) => value.toFixed(1)}
                      style={{ fontSize: '11px', fill: 'oklch(0.20 0.02 250)' }}
                    />
                  )}
                </Bar>
              ))}
            </>
          ) : (
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              {config.showDataLabels && (
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  formatter={(value: number) => value.toFixed(1)}
                  style={{ fontSize: '11px', fill: 'oklch(0.20 0.02 250)' }}
                />
              )}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
        <CardDescription>
          {chartData.length > 0 && `Showing ${chartData.length} data point${chartData.length !== 1 ? 's' : ''}`}
          {config.chartType === 'scatter' && ` from ${scatterData.length} responses`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
