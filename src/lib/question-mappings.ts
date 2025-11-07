export const IMPACT_FACTOR_QUESTIONS: Record<string, string> = {
  'Time to Differentiate': '13. I have sufficient time to differentiate for diverse needs.',
  'Class Size': '14. My typical class size allows me to adapt instruction effectively.',
  'Class Size OK': '14. My typical class size allows me to adapt instruction effectively.',
  'Confident Supporting': '15. I feel confident designing support-focused adaptations.',
  'Confident Support': '15. I feel confident designing support-focused adaptations.',
  'Confident Challenging': '16. I feel confident designing challenge-focused adaptations.',
  'Confident Challenge': '16. I feel confident designing challenge-focused adaptations.',
  'Teacher Ed Prepared': '17. My teacher education prepared me to adapt instruction for diverse needs.',
  'Formative Assessment Helps': '18. Formative assessment helps me identify and target adaptations efficiently.',
  'Formative Helps': '18. Formative assessment helps me identify and target adaptations efficiently.',
  'Digital Tools Available': '19. Digital tools make it easier to adapt lessons for students with different levels and needs.',
  'Digital Tools': '19. Digital tools make it easier to adapt lessons for students with different levels and needs.',
  'Materials for Support': '20. I have access to suitable materials for support adaptations.',
  'Materials Support': '20. I have access to suitable materials for support adaptations.',
  'Materials for Challenge': '21. I have access to suitable materials for challenge adaptations.',
  'Materials Challenge': '21. I have access to suitable materials for challenge adaptations.',
};

export function getFullQuestion(variableName: string): string | null {
  return IMPACT_FACTOR_QUESTIONS[variableName] || null;
}
