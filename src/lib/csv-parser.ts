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
      timestamp: parseTimestamp(values[0]?.trim() || ''),
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

function parseTimestamp(timestamp: string): string {
  if (!timestamp) return '';
  
  const match = timestamp.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})\s+(em|am|pm)\s+(\w+)/i);
  
  if (match) {
    const [, year, month, day, hour, minute, second, meridiem, timezone] = match;
    
    let hour24 = parseInt(hour, 10);
    const meridiemLower = meridiem.toLowerCase();
    
    if (meridiemLower === 'em' || meridiemLower === 'pm') {
      if (hour24 !== 12) {
        hour24 += 12;
      }
    } else if ((meridiemLower === 'am') && hour24 === 12) {
      hour24 = 0;
    }
    
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    const paddedHour = hour24.toString().padStart(2, '0');
    const paddedMinute = minute.padStart(2, '0');
    const paddedSecond = second.padStart(2, '0');
    
    return `${year}-${paddedMonth}-${paddedDay} ${paddedHour}:${paddedMinute}:${paddedSecond} ${timezone}`;
  }
  
  return timestamp;
}

function categorizeYears(yearsText: string): string {
  const text = yearsText.toLowerCase().trim();
  
  if (text.includes('30+') || text.includes('>30') || text.includes('> 30') || text.includes('more than 30')) {
    return '30+';
  }
  
  if (text.includes('21-30') || text.includes('21–30') || text.includes('20-30') || text.includes('20–30')) {
    return '21-30';
  }
  
  if (text.includes('11-20') || text.includes('11–20')) {
    return '11-20';
  }
  
  if (text.includes('6-10') || text.includes('6–10') || text.includes('6-11') || text.includes('6–11')) {
    return '6-10';
  }
  
  if (text.includes('0-5') || text.includes('0–5')) {
    return '0-5';
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
