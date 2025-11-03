import { SurveyResponse } from './types';

export const COLUMN_MAPPINGS = {
  timestamp: ['Tidstämpel', 'Timestamp'],
  consent: ['Consent: I have read the information above and agree to participate'],
  currentlyTeaching: ['Are you currently teaching English in Sweden at lower or upper secondary?'],
  supportQ1: ['Support Q1: 1. How often do you give extra time to finish the core task?'],
  supportQ2: ['Support Q2: 2. How often do you provide an easier/supported version of the same task'],
  supportQ3: ['Support Q3: 3. How often do you limit the task to the core requirements'],
  supportQ4: ['Support Q4: 4. How often do you allow students to use different ways to access the task'],
  supportQ5: ['Support Q5: 5. How often do you let students choose the topic in order to motivate those who need support?'],
  supportQ6: ['Support Q6: 6. How often do you use flexible grouping to target students who need extra help'],
  challengeQ1: ['Challenge Q1: 7. How often do you move fast finishers to a planned next task'],
  challengeQ2: ['Challenge Q2: 8. How often do you provide a harder version of the same task'],
  challengeQ3: ['Challenge Q3: 9. How often do you ask for more/deeper content, such as extra sources'],
  challengeQ4: ['Challenge Q4: 10. How often do you use a more demanding mode to do the same task'],
  challengeQ5: ['Challenge Q5: 11. How often do you offer an interest-based extension'],
  challengeQ6: ['Challenge Q6: 12. How often do you use flexible grouping to target students who need challenge'],
  hasCertification: ['Do you have a teaching certification?'],
  levelsTeaching: ['Which levels do you currently teach?'],
  yearsTeaching: ['How many years have you been teaching English?'],
  schoolType: ['What type of school are you currently working at?'],
  groupSize: ['How many students are typically in the English group you most often teach?'],
  shareSupportStudents: ['Approximately what share of students ... need extra support'],
  shareChallengeStudents: ['Approximately what share of students ... are ready for extra challenge'],
};

export function parseCSV(csvText: string): { data: SurveyResponse[]; warnings: string[] } {
  const warnings: string[] = [];
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or invalid');
  }
  
  const headers = parseCSVLine(lines[0]);
  const columnMap = new Map<string, number>();
  
  for (const [field, possibleHeaders] of Object.entries(COLUMN_MAPPINGS)) {
    let found = false;
    for (const header of possibleHeaders) {
      const index = headers.findIndex(h => h.includes(header) || header.includes(h));
      if (index !== -1) {
        columnMap.set(field, index);
        found = true;
        break;
      }
    }
    if (!found) {
      warnings.push(`Column not found: ${field}`);
    }
  }
  
  const data: SurveyResponse[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 10) continue;
    
    const row: any = {};
    
    for (const [field, index] of columnMap.entries()) {
      const value = values[index]?.trim() || '';
      
      if (field.startsWith('support') || field.startsWith('challenge')) {
        row[field] = parseNumber(value);
      } else if (field === 'groupSize') {
        row[field] = parseNumber(value);
      } else {
        row[field] = value;
      }
    }
    
    const supportValues = [
      row.supportQ1, row.supportQ2, row.supportQ3,
      row.supportQ4, row.supportQ5, row.supportQ6
    ].filter(v => v !== null) as number[];
    
    const challengeValues = [
      row.challengeQ1, row.challengeQ2, row.challengeQ3,
      row.challengeQ4, row.challengeQ5, row.challengeQ6
    ].filter(v => v !== null) as number[];
    
    row.supportAdaptationIndex = supportValues.length > 0
      ? supportValues.reduce((a, b) => a + b, 0) / supportValues.length
      : null;
      
    row.challengeAdaptationIndex = challengeValues.length > 0
      ? challengeValues.reduce((a, b) => a + b, 0) / challengeValues.length
      : null;
    
    row.yearsTeachingCategory = categorizeYears(row.yearsTeaching || '');
    
    data.push(row as SurveyResponse);
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
