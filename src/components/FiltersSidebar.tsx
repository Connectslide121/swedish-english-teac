import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Funnel, X } from '@phosphor-icons/react';
import { Filters, SurveyResponse } from '@/lib/types';
import { getUniqueValues } from '@/lib/analysis';
import { Checkbox } from '@/components/ui/checkbox';

interface FiltersSidebarProps {
  data: SurveyResponse[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

const CONTEXT_QUESTIONS = [
  { key: 'hasCertification', label: 'Has Teaching Certification' },
  { key: 'itemTimeToDifferentiate', label: '13. I have sufficient time to differentiate for diverse needs.' },
  { key: 'itemClassSizeOk', label: '14. My typical class size allows me to adapt instruction effectively.' },
  { key: 'itemConfidentSupport', label: '15. I feel confident designing support-focused adaptations.' },
  { key: 'itemConfidentChallenge', label: '16. I feel confident designing challenge-focused adaptations.' },
  { key: 'itemTeacherEdPrepared', label: '17. My teacher education prepared me to adapt instruction for diverse needs.' },
  { key: 'itemFormativeHelps', label: '18. Formative assessment helps me identify and target adaptations efficiently.' },
  { key: 'itemDigitalTools', label: '19. Digital tools make it easier to adapt lessons for students with different levels and needs.' },
  { key: 'itemMaterialsSupport', label: '20. I have access to suitable materials for support adaptations.' },
  { key: 'itemMaterialsChallenge', label: '21. I have access to suitable materials for challenge adaptations.' },
] as const;

export function FiltersSidebar({ data, filters, onFiltersChange, onClose }: FiltersSidebarProps) {
  const schoolTypes = getUniqueValues(data, 'schoolType');
  const yearsCategories = ['0-5', '6-10', '11-20', '21-30', '30+'];
  const levelsOptions = ['7-9', 'Gymnasiet', 'Grundskola', 'Upper secondary'];
  const shareOptions = getUniqueValues(data, 'shareSupportStudents');

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof Filters, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated as any);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      currentlyTeaching: [],
      schoolType: [],
      yearsTeachingCategory: [],
      levelsTeaching: [],
      groupSizeMin: 0,
      groupSizeMax: 50,
      shareSupportStudents: [],
      shareChallengeStudents: [],
      hasCertification: [],
      itemTimeToDifferentiate: [],
      itemClassSizeOk: [],
      itemConfidentSupport: [],
      itemConfidentChallenge: [],
      itemTeacherEdPrepared: [],
      itemFormativeHelps: [],
      itemDigitalTools: [],
      itemMaterialsSupport: [],
      itemMaterialsChallenge: [],
    });
  };

  return (
    <Card className="h-full">
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="px-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Funnel size={20} className="text-muted-foreground" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X size={18} />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Currently Teaching</Label>
            <div className="space-y-2">
              {['Yes', 'No'].map(option => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`teaching-${option}`}
                    checked={filters.currentlyTeaching.includes(option)}
                    onCheckedChange={() => toggleArrayFilter('currentlyTeaching', option)}
                  />
                  <label htmlFor={`teaching-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">School Type</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {schoolTypes.map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`school-${type}`}
                    checked={filters.schoolType.includes(type)}
                    onCheckedChange={() => toggleArrayFilter('schoolType', type)}
                  />
                  <label htmlFor={`school-${type}`} className="text-sm cursor-pointer text-ellipsis overflow-hidden">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Years Teaching</Label>
            <div className="space-y-2">
              {yearsCategories.map(category => (
                <div key={category} className="flex items-center gap-2">
                  <Checkbox
                    id={`years-${category}`}
                    checked={filters.yearsTeachingCategory.includes(category)}
                    onCheckedChange={() => toggleArrayFilter('yearsTeachingCategory', category)}
                  />
                  <label htmlFor={`years-${category}`} className="text-sm cursor-pointer">
                    {category} years
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Grade Levels</Label>
            <div className="space-y-2">
              {levelsOptions.map(level => (
                <div key={level} className="flex items-center gap-2">
                  <Checkbox
                    id={`level-${level}`}
                    checked={filters.levelsTeaching.includes(level)}
                    onCheckedChange={() => toggleArrayFilter('levelsTeaching', level)}
                  />
                  <label htmlFor={`level-${level}`} className="text-sm cursor-pointer">
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Group Size: {filters.groupSizeMin} - {filters.groupSizeMax}
            </Label>
            <div className="px-2">
              <Slider
                min={0}
                max={50}
                step={1}
                value={[filters.groupSizeMin, filters.groupSizeMax]}
                onValueChange={([min, max]) => {
                  updateFilter('groupSizeMin', min);
                  updateFilter('groupSizeMax', max);
                }}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Share Needing Support</Label>
            <div className="space-y-2">
              {shareOptions.map(option => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`support-${option}`}
                    checked={filters.shareSupportStudents.includes(option)}
                    onCheckedChange={() => toggleArrayFilter('shareSupportStudents', option)}
                  />
                  <label htmlFor={`support-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Share Needing Challenge</Label>
            <div className="space-y-2">
              {shareOptions.map(option => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`challenge-${option}`}
                    checked={filters.shareChallengeStudents.includes(option)}
                    onCheckedChange={() => toggleArrayFilter('shareChallengeStudents', option)}
                  />
                  <label htmlFor={`challenge-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />
          
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Context Questions</h4>
          </div>

          {CONTEXT_QUESTIONS.map(({ key, label }) => {
            const uniqueValues = getUniqueValues(data, key as keyof SurveyResponse);
            const filterKey = key as keyof Filters;
            
            return (
              <div key={key}>
                <Separator />
                <div className="space-y-2 mt-4">
                  <Label className="text-sm font-medium">{label}</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uniqueValues.map(value => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${key}-${value}`}
                          checked={(filters[filterKey] as string[]).includes(value)}
                          onCheckedChange={() => toggleArrayFilter(filterKey, value)}
                        />
                        <label htmlFor={`${key}-${value}`} className="text-sm cursor-pointer">
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {(filters.currentlyTeaching.length > 0 ||
            filters.schoolType.length > 0 ||
            filters.yearsTeachingCategory.length > 0 ||
            filters.levelsTeaching.length > 0 ||
            filters.groupSizeMin > 0 ||
            filters.groupSizeMax < 50 ||
            filters.shareSupportStudents.length > 0 ||
            filters.shareChallengeStudents.length > 0 ||
            filters.hasCertification.length > 0 ||
            filters.itemTimeToDifferentiate.length > 0 ||
            filters.itemClassSizeOk.length > 0 ||
            filters.itemConfidentSupport.length > 0 ||
            filters.itemConfidentChallenge.length > 0 ||
            filters.itemTeacherEdPrepared.length > 0 ||
            filters.itemFormativeHelps.length > 0 ||
            filters.itemDigitalTools.length > 0 ||
            filters.itemMaterialsSupport.length > 0 ||
            filters.itemMaterialsChallenge.length > 0) && (
            <>
              <Separator />
              <button
                onClick={clearAllFilters}
                className="text-sm text-accent hover:underline w-full text-left"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
