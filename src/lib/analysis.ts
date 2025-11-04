import { SurveyResponse, Filters, SummaryStats, FactorImpact, QuestionStats, DualFactorImpact } from './types';

export function applyFilters(data: SurveyResponse[], filters: Filters): SurveyResponse[] {
  return data.filter(row => {
    if (filters.currentlyTeaching.length > 0 && !filters.currentlyTeaching.includes(row.currentlyTeaching)) {
      return false;
    }
    
    if (filters.schoolType.length > 0 && !filters.schoolType.includes(row.schoolType)) {
      return false;
    }
    
    if (filters.yearsTeachingCategory.length > 0 && !filters.yearsTeachingCategory.includes(row.yearsTeachingCategory)) {
      return false;
    }
    
    if (filters.levelsTeaching.length > 0) {
      const hasMatch = filters.levelsTeaching.some(level => 
        row.levelsTeaching.toLowerCase().includes(level.toLowerCase())
      );
      if (!hasMatch) return false;
    }
    
    if (row.groupSize !== null) {
      if (row.groupSize < filters.groupSizeMin || row.groupSize > filters.groupSizeMax) {
        return false;
      }
    }
    
    if (filters.shareSupportStudents.length > 0 && !filters.shareSupportStudents.includes(row.shareSupportStudents)) {
      return false;
    }
    
    if (filters.shareChallengeStudents.length > 0 && !filters.shareChallengeStudents.includes(row.shareChallengeStudents)) {
      return false;
    }
    
    return true;
  });
}

export function calculateSummaryStats(data: SurveyResponse[]): SummaryStats {
  const supportValues = data
    .map(r => r.supportAdaptationIndex)
    .filter(v => v !== null) as number[];
  
  const challengeValues = data
    .map(r => r.challengeAdaptationIndex)
    .filter(v => v !== null) as number[];
  
  const avgSupport = supportValues.length > 0
    ? supportValues.reduce((a, b) => a + b, 0) / supportValues.length
    : 0;
  
  const avgChallenge = challengeValues.length > 0
    ? challengeValues.reduce((a, b) => a + b, 0) / challengeValues.length
    : 0;
  
  return {
    totalResponses: data.length,
    avgSupport,
    avgChallenge,
    difference: avgChallenge - avgSupport,
  };
}

export function calculateFactorImpact(
  data: SurveyResponse[],
  variable: keyof SurveyResponse,
  indexType: 'support' | 'challenge',
  threshold: number = 4.0
): FactorImpact[] {
  const indexField = indexType === 'support' ? 'supportAdaptationIndex' : 'challengeAdaptationIndex';
  
  const validData = data.filter(r => r[indexField] !== null && r[variable] !== null && String(r[variable]).trim() !== '');
  
  if (validData.length === 0) {
    return [];
  }
  
  const overallMean = validData.reduce((sum, r) => sum + (r[indexField] as number), 0) / validData.length;
  
  const categories = new Map<string, SurveyResponse[]>();
  
  validData.forEach(row => {
    const category = String(row[variable] || 'Unknown');
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(row);
  });
  
  const results: FactorImpact[] = [];
  
  categories.forEach((rows, category) => {
    if (rows.length === 0) return;
    
    const meanIndex = rows.reduce((sum, r) => sum + (r[indexField] as number), 0) / rows.length;
    const highCount = rows.filter(r => (r[indexField] as number) >= threshold).length;
    
    results.push({
      variable: String(variable),
      category,
      meanIndex,
      diffFromOverall: meanIndex - overallMean,
      count: rows.length,
      probability: highCount / rows.length,
    });
  });
  
  return results.sort((a, b) => b.diffFromOverall - a.diffFromOverall);
}

export function calculateGroupSizeImpact(
  data: SurveyResponse[],
  indexType: 'support' | 'challenge',
  threshold: number = 4.0
): FactorImpact[] {
  const indexField = indexType === 'support' ? 'supportAdaptationIndex' : 'challengeAdaptationIndex';
  
  const validData = data.filter(r => r[indexField] !== null && r.groupSize !== null);
  
  if (validData.length === 0) {
    return [];
  }
  
  const overallMean = validData.reduce((sum, r) => sum + (r[indexField] as number), 0) / validData.length;
  
  const buckets = [
    { name: '≤15', min: 0, max: 15 },
    { name: '16-20', min: 16, max: 20 },
    { name: '21-25', min: 21, max: 25 },
    { name: '26+', min: 26, max: 999 },
  ];
  
  return buckets.map(bucket => {
    const rows = validData.filter(r => {
      const size = r.groupSize as number;
      return size >= bucket.min && size <= bucket.max;
    });
    
    if (rows.length === 0) {
      return null;
    }
    
    const meanIndex = rows.reduce((sum, r) => sum + (r[indexField] as number), 0) / rows.length;
    const highCount = rows.filter(r => (r[indexField] as number) >= threshold).length;
    
    return {
      variable: 'groupSize',
      category: bucket.name,
      meanIndex,
      diffFromOverall: meanIndex - overallMean,
      count: rows.length,
      probability: highCount / rows.length,
    };
  }).filter((r): r is FactorImpact => r !== null);
}

export function calculateQuestionStats(data: SurveyResponse[]): QuestionStats[] {
  const questions = [
    { key: 'supportQ1', label: 'Extra time to finish' },
    { key: 'supportQ2', label: 'Easier/supported version' },
    { key: 'supportQ3', label: 'Limit to core requirements' },
    { key: 'supportQ4', label: 'Different ways to access task' },
    { key: 'supportQ5', label: 'Choose topic for motivation' },
    { key: 'supportQ6', label: 'Flexible grouping (support)' },
    { key: 'challengeQ1', label: 'Move to planned next task' },
    { key: 'challengeQ2', label: 'Harder version of task' },
    { key: 'challengeQ3', label: 'More/deeper content' },
    { key: 'challengeQ4', label: 'More demanding mode' },
    { key: 'challengeQ5', label: 'Interest-based extension' },
    { key: 'challengeQ6', label: 'Flexible grouping (challenge)' },
  ];
  
  return questions.map(({ key, label }) => {
    const values = data
      .map(r => (r as any)[key])
      .filter(v => v !== null) as number[];
    
    if (values.length === 0) {
      return {
        question: label,
        mean: 0,
        median: 0,
        stdDev: 0,
        percentHighUse: 0,
      };
    }
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const highUseCount = values.filter(v => v >= 4).length;
    
    return {
      question: label,
      mean,
      median,
      stdDev,
      percentHighUse: (highUseCount / values.length) * 100,
    };
  });
}

export function getUniqueValues(data: SurveyResponse[], field: keyof SurveyResponse): string[] {
  const values = new Set<string>();
  data.forEach(row => {
    const value = row[field];
    if (value !== null && value !== undefined && value !== '') {
      values.add(String(value));
    }
  });
  return Array.from(values).sort();
}

export function getQuestionDistribution(data: SurveyResponse[], questionKey: string): Map<number, number> {
  const distribution = new Map<number, number>();
  
  data.forEach(row => {
    const value = (row as any)[questionKey];
    if (value !== null) {
      distribution.set(value, (distribution.get(value) || 0) + 1);
    }
  });
  
  return distribution;
}

export function getQuestionBreakdown(
  data: SurveyResponse[],
  questionKey: string,
  breakdownField: keyof SurveyResponse
): Map<string, { mean: number; count: number }> {
  const groups = new Map<string, number[]>();
  
  data.forEach(row => {
    const value = (row as any)[questionKey];
    const category = String(row[breakdownField] || 'Unknown');
    
    if (value !== null) {
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(value);
    }
  });
  
  const result = new Map<string, { mean: number; count: number }>();
  
  groups.forEach((values, category) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    result.set(category, { mean, count: values.length });
  });
  
  return result;
}

export function calculateDualFactorImpact(
  data: SurveyResponse[],
  variable: keyof SurveyResponse,
  threshold: number = 4.0
): DualFactorImpact[] {
  const validData = data.filter(r => 
    r.supportAdaptationIndex !== null && 
    r.challengeAdaptationIndex !== null &&
    r[variable] !== null && 
    String(r[variable]).trim() !== ''
  );
  
  if (validData.length === 0) {
    return [];
  }
  
  const overallSupportMean = validData.reduce((sum, r) => sum + (r.supportAdaptationIndex as number), 0) / validData.length;
  const overallChallengeMean = validData.reduce((sum, r) => sum + (r.challengeAdaptationIndex as number), 0) / validData.length;
  
  const categories = new Map<string, SurveyResponse[]>();
  
  validData.forEach(row => {
    const category = String(row[variable] || 'Unknown');
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(row);
  });
  
  const results: DualFactorImpact[] = [];
  
  categories.forEach((rows, category) => {
    if (rows.length === 0) return;
    
    const meanSupport = rows.reduce((sum, r) => sum + (r.supportAdaptationIndex as number), 0) / rows.length;
    const meanChallenge = rows.reduce((sum, r) => sum + (r.challengeAdaptationIndex as number), 0) / rows.length;
    
    const highBothCount = rows.filter(r => 
      (r.supportAdaptationIndex as number) >= threshold && 
      (r.challengeAdaptationIndex as number) >= threshold
    ).length;
    
    const diffSupport = meanSupport - overallSupportMean;
    const diffChallenge = meanChallenge - overallChallengeMean;
    
    results.push({
      variable: String(variable),
      category,
      meanSupport,
      meanChallenge,
      diffSupportFromOverall: diffSupport,
      diffChallengeFromOverall: diffChallenge,
      count: rows.length,
      probabilityBoth: highBothCount / rows.length,
      combinedImpact: Math.abs(diffSupport) + Math.abs(diffChallenge),
    });
  });
  
  return results;
}

export function calculateDualGroupSizeImpact(
  data: SurveyResponse[],
  threshold: number = 4.0
): DualFactorImpact[] {
  const validData = data.filter(r => 
    r.supportAdaptationIndex !== null && 
    r.challengeAdaptationIndex !== null && 
    r.groupSize !== null
  );
  
  if (validData.length === 0) {
    return [];
  }
  
  const overallSupportMean = validData.reduce((sum, r) => sum + (r.supportAdaptationIndex as number), 0) / validData.length;
  const overallChallengeMean = validData.reduce((sum, r) => sum + (r.challengeAdaptationIndex as number), 0) / validData.length;
  
  const buckets = [
    { name: '≤15', min: 0, max: 15 },
    { name: '16-20', min: 16, max: 20 },
    { name: '21-25', min: 21, max: 25 },
    { name: '26+', min: 26, max: 999 },
  ];
  
  return buckets.map(bucket => {
    const rows = validData.filter(r => {
      const size = r.groupSize as number;
      return size >= bucket.min && size <= bucket.max;
    });
    
    if (rows.length === 0) {
      return null;
    }
    
    const meanSupport = rows.reduce((sum, r) => sum + (r.supportAdaptationIndex as number), 0) / rows.length;
    const meanChallenge = rows.reduce((sum, r) => sum + (r.challengeAdaptationIndex as number), 0) / rows.length;
    
    const highBothCount = rows.filter(r => 
      (r.supportAdaptationIndex as number) >= threshold && 
      (r.challengeAdaptationIndex as number) >= threshold
    ).length;
    
    const diffSupport = meanSupport - overallSupportMean;
    const diffChallenge = meanChallenge - overallChallengeMean;
    
    return {
      variable: 'groupSize',
      category: bucket.name,
      meanSupport,
      meanChallenge,
      diffSupportFromOverall: diffSupport,
      diffChallengeFromOverall: diffChallenge,
      count: rows.length,
      probabilityBoth: highBothCount / rows.length,
      combinedImpact: Math.abs(diffSupport) + Math.abs(diffChallenge),
    };
  }).filter((r): r is DualFactorImpact => r !== null);
}
