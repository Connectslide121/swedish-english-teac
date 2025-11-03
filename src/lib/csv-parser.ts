import { SurveyResponse } from './types';

const EXPECTED_COLS = 34;

function normalizeRowTo34(row: string[]): string[] {
  const arr = Array.isArray(row) ? row.slice() : Object.values(row) as string[];

  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] === 'string') {
      arr[i] = arr[i].trim();
    }
  }

  if (arr.length < EXPECTED_COLS) {
    while (arr.length < EXPECTED_COLS) {
      arr.push('');
    }
  }

  if (arr.length > EXPECTED_COLS) {
    arr.length = EXPECTED_COLS;
  }

  return arr;
}

export function parseCSV(csvText: string): { data: SurveyResponse[]; warnings: string[] } {
  const warnings: string[] = [];
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or invalid');
  }
  
  const data: SurveyResponse[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const parsedValues = parseCSVLine(lines[i]);
    const values = normalizeRowTo34(parsedValues);
    
    const supportValues = [
      parseNumber(values[3]),
      parseNumber(values[4]),
      parseNumber(values[5]),
      parseNumber(values[6]),
      parseNumber(values[7]),
      parseNumber(values[8])
    ].filter(v => v !== null) as number[];
    
    const challengeValues = [
      parseNumber(values[9]),
      parseNumber(values[10]),
      parseNumber(values[11]),
      parseNumber(values[12]),
      parseNumber(values[13]),
      parseNumber(values[14])
    ].filter(v => v !== null) as number[];
    
    const supportAdaptationIndex = supportValues.length > 0
      ? supportValues.reduce((a, b) => a + b, 0) / supportValues.length
      : null;
      
    const challengeAdaptationIndex = challengeValues.length > 0
      ? challengeValues.reduce((a, b) => a + b, 0) / challengeValues.length
      : null;
    
    const yearsTeaching = values[29]?.trim() || '';
    
    const row: SurveyResponse = {
      timestamp: values[0]?.trim() || '',
      consent: values[1]?.trim() || '',
      currentlyTeaching: values[2]?.trim() || '',
      
      supportQ1: parseNumber(values[3]),
      supportQ2: parseNumber(values[4]),
      supportQ3: parseNumber(values[5]),
      supportQ4: parseNumber(values[6]),
      supportQ5: parseNumber(values[7]),
      supportQ6: parseNumber(values[8]),
      
      challengeQ1: parseNumber(values[9]),
      challengeQ2: parseNumber(values[10]),
      challengeQ3: parseNumber(values[11]),
      challengeQ4: parseNumber(values[12]),
      challengeQ5: parseNumber(values[13]),
      challengeQ6: parseNumber(values[14]),
      
      itemTimeToDifferentiate: values[15]?.trim() || '',
      itemClassSizeOk: values[16]?.trim() || '',
      itemConfidentSupport: values[17]?.trim() || '',
      itemConfidentChallenge: values[18]?.trim() || '',
      itemTeacherEdPrepared: values[19]?.trim() || '',
      itemFormativeHelps: values[20]?.trim() || '',
      itemDigitalTools: values[21]?.trim() || '',
      itemMaterialsSupport: values[22]?.trim() || '',
      itemMaterialsChallenge: values[23]?.trim() || '',
      
      openHelpsMost: values[24]?.trim() || '',
      openHindersMost: values[25]?.trim() || '',
      openOther: values[26]?.trim() || '',
      
      hasCertification: values[27]?.trim() || '',
      levelsTeaching: values[28]?.trim() || '',
      yearsTeaching: yearsTeaching,
      schoolType: values[30]?.trim() || '',
      groupSize: parseNumber(values[31]),
      shareSupportStudents: values[32]?.trim() || '',
      shareChallengeStudents: values[33]?.trim() || '',
      
      supportAdaptationIndex,
      challengeAdaptationIndex,
      yearsTeachingCategory: categorizeYears(yearsTeaching),
    };
    
    data.push(row);
  }
  
  return { data, warnings };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function parseNumber(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : num;
}

function categorizeYears(yearsText: string): string {
  const text = yearsText.toLowerCase();
  
  if (text.includes('0') || text.includes('1') || text.includes('2') || text.includes('3')) {
    if (!text.includes('10') && !text.includes('20') && !text.includes('30')) {
      return '0-3';
    }
  }
  if (text.includes('4') || text.includes('5') || text.includes('6')) {
    return '4-6';
  }
  if (text.includes('7') || text.includes('8') || text.includes('9') || text.includes('10')) {
    if (!text.includes('20') && !text.includes('30')) {
      return '7-10';
    }
  }
  if (text.includes('11') || text.includes('12') || text.includes('13') || text.includes('14') ||
      text.includes('15') || text.includes('16') || text.includes('17') || text.includes('18') ||
      text.includes('19') || text.includes('20')) {
    if (!text.includes('21') && !text.includes('30')) {
      return '11-20';
    }
  }
  if (text.includes('21') || text.includes('22') || text.includes('23') || text.includes('24') ||
      text.includes('25') || text.includes('26') || text.includes('27') || text.includes('28') ||
      text.includes('29') || text.includes('30')) {
    if (!text.includes('30+') && !text.includes('>')) {
      return '21-30';
    }
  }
  if (text.includes('30+') || text.includes('>30') || text.includes('more than 30')) {
    return '30+';
  }
  
  return 'Unknown';
}

export function exportToCSV(data: SurveyResponse[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const value = (row as any)[header];
      if (value === null || value === undefined) return '';
      const str = String(value);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}
