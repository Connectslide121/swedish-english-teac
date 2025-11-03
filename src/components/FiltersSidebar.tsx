import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Funnel } from '@phosphor-icons/react';
import { Filters, SurveyResponse } from '@/lib/types';
import { getUniqueValues } from '@/lib/analysis';
import { Checkbox } from '@/components/ui/checkbox';

interface FiltersSidebarProps {
  data: SurveyResponse[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FiltersSidebar({ data, filters, onFiltersChange }: FiltersSidebarProps) {
  const schoolTypes = getUniqueValues(data, 'schoolType');
  const yearsCategories = ['0-3', '4-6', '7-10', '11-20', '21-30', '30+'];
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

  return (
    <Card className="h-full">
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Funnel size={20} className="text-muted-foreground" />
            <h3 className="font-semibold">Filters</h3>
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

          {(filters.currentlyTeaching.length > 0 ||
            filters.schoolType.length > 0 ||
            filters.yearsTeachingCategory.length > 0 ||
            filters.levelsTeaching.length > 0 ||
            filters.groupSizeMin > 0 ||
            filters.groupSizeMax < 50 ||
            filters.shareSupportStudents.length > 0 ||
            filters.shareChallengeStudents.length > 0) && (
            <>
              <Separator />
              <button
                onClick={() => onFiltersChange({
                  currentlyTeaching: [],
                  schoolType: [],
                  yearsTeachingCategory: [],
                  levelsTeaching: [],
                  groupSizeMin: 0,
                  groupSizeMax: 50,
                  shareSupportStudents: [],
                  shareChallengeStudents: [],
                })}
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
