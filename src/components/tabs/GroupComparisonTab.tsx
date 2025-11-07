import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Info } from '@phosphor-icons/react';
import { SurveyResponse } from '@/lib/types';
import { GroupedBarChart } from '../charts/GroupedBarChart';

interface GroupComparisonTabProps {
  data: SurveyResponse[];
}

const contextQuestions = [
  { key: 'itemTimeToDifferentiate', label: 'Time to Differentiate', fullText: 'I have sufficient time to differentiate for diverse needs.' },
  { key: 'itemClassSizeOk', label: 'Class Size', fullText: 'My typical class size allows me to adapt instruction effectively.' },
  { key: 'itemConfidentSupport', label: 'Confident Support', fullText: 'I feel confident designing support-focused adaptations.' },
  { key: 'itemConfidentChallenge', label: 'Confident Challenge', fullText: 'I feel confident designing challenge-focused adaptations.' },
  { key: 'itemTeacherEdPrepared', label: 'Teacher Ed Prepared', fullText: 'My teacher education prepared me to adapt instruction for diverse needs.' },
  { key: 'itemFormativeHelps', label: 'Formative Helps', fullText: 'Formative assessment helps me identify and target adaptations efficiently.' },
  { key: 'itemDigitalTools', label: 'Digital Tools', fullText: 'Digital tools make it easier to adapt lessons for students with different levels and needs.' },
  { key: 'itemMaterialsSupport', label: 'Materials Support', fullText: 'I have access to suitable materials for support adaptations.' },
  { key: 'itemMaterialsChallenge', label: 'Materials Challenge', fullText: 'I have access to suitable materials for challenge adaptations.' },
];

const likertToNumber = (value: string): number | null => {
  const normalized = value?.toLowerCase().trim();
  if (!normalized) return null;
  
  const asNumber = parseFloat(normalized);
  if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= 5) {
    return asNumber;
  }
  
  if (normalized.includes('strongly agree') || normalized.includes('instämmer helt')) return 5;
  if (normalized.includes('strongly disagree') || normalized.includes('instämmer inte alls')) return 1;
  if (normalized.includes('agree') && !normalized.includes('disagree')) return 4;
  if (normalized.includes('disagree') && !normalized.includes('strongly')) return 2;
  if (normalized.includes('neutral') || normalized.includes('varken') || normalized.includes('neither') || normalized.includes('eller')) return 3;
  
  return null;
};

type FrequencyGroup = 'high' | 'medium' | 'low';

const classifyTeacher = (responses: SurveyResponse[], type: 'support' | 'challenge', group: FrequencyGroup): SurveyResponse[] => {
  const questionKeys = type === 'support' 
    ? ['supportQ1', 'supportQ2', 'supportQ3', 'supportQ4', 'supportQ5', 'supportQ6']
    : ['challengeQ1', 'challengeQ2', 'challengeQ3', 'challengeQ4', 'challengeQ5', 'challengeQ6'];

  return responses.filter(r => {
    const values = questionKeys
      .map(key => (r as any)[key])
      .filter(v => v !== null) as number[];
    
    if (values.length === 0) return false;
    
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    if (group === 'high') {
      return average >= 4;
    } else if (group === 'medium') {
      return average >= 2.5 && average < 4;
    } else {
      return average < 2.5;
    }
  });
};

const calculateGroupMeans = (
  data: SurveyResponse[],
  group: FrequencyGroup
): { supportTeachers: SurveyResponse[]; challengeTeachers: SurveyResponse[]; chartData: any[] } => {
  const supportTeachers = classifyTeacher(data, 'support', group);
  const challengeTeachers = classifyTeacher(data, 'challenge', group);

  const chartData = contextQuestions.map(q => {
    const supportValues = supportTeachers
      .map(r => likertToNumber((r as any)[q.key]))
      .filter(v => v !== null) as number[];
    
    const challengeValues = challengeTeachers
      .map(r => likertToNumber((r as any)[q.key]))
      .filter(v => v !== null) as number[];
    
    const supportMean = supportValues.length > 0
      ? supportValues.reduce((a, b) => a + b, 0) / supportValues.length
      : 0;
    
    const challengeMean = challengeValues.length > 0
      ? challengeValues.reduce((a, b) => a + b, 0) / challengeValues.length
      : 0;

    return {
      category: q.label,
      fullQuestion: q.fullText,
      support: supportMean,
      challenge: challengeMean,
      supportCount: supportValues.length,
      challengeCount: challengeValues.length,
    };
  });

  return { supportTeachers, challengeTeachers, chartData };
};

export function GroupComparisonTab({ data }: GroupComparisonTabProps) {
  const highData = calculateGroupMeans(data, 'high');
  const mediumData = calculateGroupMeans(data, 'medium');
  const lowData = calculateGroupMeans(data, 'low');

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold">Support vs Challenge Teachers - Context Comparison</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={18} />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="text-xs mb-2">
                  This analysis compares how teachers who frequently use support strategies differ from those who frequently use challenge strategies in terms of their teaching context and attitudes.
                </p>
                <p className="text-xs">
                  Teachers are grouped based on their average responses to support questions (Q1-6) vs challenge questions (Q7-12), then we compare their responses to context questions (Q13-21).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">
            Comparing teacher responses to context questions (Q13-21) based on their adaptation frequency patterns. 
            Each chart shows two bars per question: one for teachers who score high on average for that type of adaptation, and one for teachers who score high for the other type.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold">High Frequency Adaptors</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={18} />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="text-xs mb-2">
                  <strong>Support Teachers (Blue):</strong> Teachers whose average response to support questions (Q1-6) is 4 or higher (Often/Very Often).
                </p>
                <p className="text-xs">
                  <strong>Challenge Teachers (Yellow):</strong> Teachers whose average response to challenge questions (Q7-12) is 4 or higher (Often/Very Often).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Teachers with high average scores (≥4.0) on support questions vs those with high average scores on challenge questions.
            <br />
            <span className="font-medium">Support teachers: {highData.supportTeachers.length}</span> | <span className="font-medium">Challenge teachers: {highData.challengeTeachers.length}</span>
          </p>
          <GroupedBarChart data={highData.chartData} exportPrefix="high-frequency-adaptors" />
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold">Medium Frequency Adaptors</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={18} />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="text-xs mb-2">
                  <strong>Support Teachers (Blue):</strong> Teachers whose average response to support questions (Q1-6) is between 2.5 and 4.0 (Sometimes to Often).
                </p>
                <p className="text-xs">
                  <strong>Challenge Teachers (Yellow):</strong> Teachers whose average response to challenge questions (Q7-12) is between 2.5 and 4.0 (Sometimes to Often).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Teachers with medium average scores (2.5-3.9) on support questions vs those with medium average scores on challenge questions.
            <br />
            <span className="font-medium">Support teachers: {mediumData.supportTeachers.length}</span> | <span className="font-medium">Challenge teachers: {mediumData.challengeTeachers.length}</span>
          </p>
          <GroupedBarChart data={mediumData.chartData} exportPrefix="medium-frequency-adaptors" />
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold">Low Frequency Adaptors</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={18} />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="text-xs mb-2">
                  <strong>Support Teachers (Blue):</strong> Teachers whose average response to support questions (Q1-6) is below 2.5 (Rarely/Very Rarely).
                </p>
                <p className="text-xs">
                  <strong>Challenge Teachers (Yellow):</strong> Teachers whose average response to challenge questions (Q7-12) is below 2.5 (Rarely/Very Rarely).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Teachers with low average scores (&lt;2.5) on support questions vs those with low average scores on challenge questions.
            <br />
            <span className="font-medium">Support teachers: {lowData.supportTeachers.length}</span> | <span className="font-medium">Challenge teachers: {lowData.challengeTeachers.length}</span>
          </p>
          <GroupedBarChart data={lowData.chartData} exportPrefix="low-frequency-adaptors" />
        </Card>
      </div>
    </TooltipProvider>
  );
}
