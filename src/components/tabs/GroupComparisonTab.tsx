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
  { key: 'itemClassSizeOk', label: 'Class Size OK', fullText: 'My typical class size allows me to adapt instruction effectively.' },
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
  
  if (normalized.includes('strongly agree') || normalized.includes('instämmer helt')) return 5;
  if (normalized.includes('agree') || normalized.includes('instämmer')) return 4;
  if (normalized.includes('neutral') || normalized.includes('varken')) return 3;
  if (normalized.includes('disagree') || normalized.includes('instämmer inte')) return 2;
  if (normalized.includes('strongly disagree')) return 1;
  
  return null;
};

type FrequencyGroup = 'often' | 'sometimes' | 'rarely';

const classifyTeacher = (responses: SurveyResponse[], type: 'support' | 'challenge', group: FrequencyGroup): SurveyResponse[] => {
  const questionKeys = type === 'support' 
    ? ['supportQ1', 'supportQ2', 'supportQ3', 'supportQ4', 'supportQ5', 'supportQ6']
    : ['challengeQ1', 'challengeQ2', 'challengeQ3', 'challengeQ4', 'challengeQ5', 'challengeQ6'];

  return responses.filter(r => {
    const values = questionKeys
      .map(key => (r as any)[key])
      .filter(v => v !== null) as number[];
    
    if (values.length === 0) return false;
    
    const oftenCount = values.filter(v => v >= 4).length;
    const totalQuestions = values.length;
    const oftenRatio = oftenCount / totalQuestions;
    
    if (group === 'often') {
      return oftenRatio >= 0.5;
    } else if (group === 'sometimes') {
      const sometimesCount = values.filter(v => v === 3).length;
      const sometimesRatio = sometimesCount / totalQuestions;
      return sometimesRatio >= 0.5;
    } else {
      return oftenRatio < 0.5 && values.filter(v => v <= 2).length >= totalQuestions * 0.5;
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
  const oftenData = calculateGroupMeans(data, 'often');
  const sometimesData = calculateGroupMeans(data, 'sometimes');
  const rarelyData = calculateGroupMeans(data, 'rarely');

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
                  Teachers are grouped based on how often they answer "Often" or "Very Often" to support questions (Q1-6) vs challenge questions (Q7-12), then we compare their responses to context questions (Q13-21).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">
            Comparing teacher responses to context questions (Q13-21) based on their adaptation frequency patterns. 
            Each chart shows two bars per question: one for teachers who frequently use that type of adaptation, and one for teachers who use the other type.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold">Often/Very Often Adaptors</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={18} />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="text-xs mb-2">
                  <strong>Support Teachers (Blue):</strong> Teachers who answer "Often" or "Very Often" to at least 50% of support questions (Q1-6).
                </p>
                <p className="text-xs">
                  <strong>Challenge Teachers (Yellow):</strong> Teachers who answer "Often" or "Very Often" to at least 50% of challenge questions (Q7-12).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Teachers who say "Often" or "Very Often" to support questions vs those who say "Often" or "Very Often" to challenge questions.
            <br />
            <span className="font-medium">Support teachers: {oftenData.supportTeachers.length}</span> | <span className="font-medium">Challenge teachers: {oftenData.challengeTeachers.length}</span>
          </p>
          <GroupedBarChart data={oftenData.chartData} />
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold">Sometimes Adaptors</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={18} />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="text-xs mb-2">
                  <strong>Support Teachers (Blue):</strong> Teachers who answer "Sometimes" to at least 50% of support questions (Q1-6).
                </p>
                <p className="text-xs">
                  <strong>Challenge Teachers (Yellow):</strong> Teachers who answer "Sometimes" to at least 50% of challenge questions (Q7-12).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Teachers who say "Sometimes" to support questions vs those who say "Sometimes" to challenge questions.
            <br />
            <span className="font-medium">Support teachers: {sometimesData.supportTeachers.length}</span> | <span className="font-medium">Challenge teachers: {sometimesData.challengeTeachers.length}</span>
          </p>
          <GroupedBarChart data={sometimesData.chartData} />
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-lg font-semibold">Rarely/Very Rarely Adaptors</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground cursor-help mt-1" size={18} />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="text-xs mb-2">
                  <strong>Support Teachers (Blue):</strong> Teachers who answer "Rarely" or "Very Rarely" to at least 50% of support questions (Q1-6).
                </p>
                <p className="text-xs">
                  <strong>Challenge Teachers (Yellow):</strong> Teachers who answer "Rarely" or "Very Rarely" to at least 50% of challenge questions (Q7-12).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Teachers who say "Rarely" or "Very Rarely" to support questions vs those who say "Rarely" or "Very Rarely" to challenge questions.
            <br />
            <span className="font-medium">Support teachers: {rarelyData.supportTeachers.length}</span> | <span className="font-medium">Challenge teachers: {rarelyData.challengeTeachers.length}</span>
          </p>
          <GroupedBarChart data={rarelyData.chartData} />
        </Card>
      </div>
    </TooltipProvider>
  );
}
