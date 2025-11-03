import * as XLSX from 'xlsx';
import { SurveyResponse } from './types';

const EXPECTED_COLS = 34;

function normalizeRowTo34(row: any[]): string[] {
  const arr: string[] = [];
  
  for (let i = 0; i < row.length; i++) {
    const val = row[i];
    if (val === null || val === undefined) {
      arr.push('');
    } else {
      arr.push(String(val).trim());
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

export function parseExcel(file: ArrayBuffer): { data: SurveyResponse[]; warnings: string[] } {
  const warnings: string[] = [];
  
  const workbook = XLSX.read(file, { type: 'array' });
  
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel file has no sheets');
  }
  
  const worksheet = workbook.Sheets[firstSheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
  
  if (rawData.length < 2) {
    throw new Error('Excel file appears to be empty or invalid');
  }
  
  const data: SurveyResponse[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const values = normalizeRowTo34(rawData[i]);
    
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
