import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartBar, ChartPie, Rows, Sparkle, X } from "@phosphor-icons/react";
import { SurveyResponse } from "@/lib/types";
import { PlaygroundChart } from "@/components/charts/PlaygroundChart";

type ChartType = "grouped-bar" | "stacked-bar" | "scatter" | "distribution";

interface PlaygroundConfig {
  chartType: ChartType;
  selectedQuestions: string[];
  groupByField: keyof SurveyResponse | null;
  selectedGroups: string[];
  showDataLabels: boolean;
}

const QUESTIONS = [
  {
    key: "supportQ1",
    label: "Support: Extra time to finish",
    category: "support",
  },
  {
    key: "supportQ2",
    label: "Support: Simpler instructions",
    category: "support",
  },
  {
    key: "supportQ3",
    label: "Support: Limit to core requirements",
    category: "support",
  },
  {
    key: "supportQ4",
    label: "Support: Different ways to access task",
    category: "support",
  },
  {
    key: "supportQ5",
    label: "Support: Choose topic for motivation",
    category: "support",
  },
  {
    key: "supportQ6",
    label: "Support: Flexible grouping (support)",
    category: "support",
  },
  {
    key: "challengeQ1",
    label: "Challenge: Move to planned next task",
    category: "challenge",
  },
  {
    key: "challengeQ2",
    label: "Challenge: Harder version of task",
    category: "challenge",
  },
  {
    key: "challengeQ3",
    label: "Challenge: More/deeper content",
    category: "challenge",
  },
  {
    key: "challengeQ4",
    label: "Challenge: More demanding mode",
    category: "challenge",
  },
  {
    key: "challengeQ5",
    label: "Challenge: Interest-based extension",
    category: "challenge",
  },
  {
    key: "challengeQ6",
    label: "Challenge: Flexible grouping (challenge)",
    category: "challenge",
  },
  {
    key: "itemTimeToDifferentiate",
    label: "Item: Sufficient time to differentiate",
    category: "item",
  },
  {
    key: "itemClassSizeOk",
    label: "Item: Class size allows adaptation",
    category: "item",
  },
  {
    key: "itemConfidentSupport",
    label: "Item: Confident designing support",
    category: "item",
  },
  {
    key: "itemConfidentChallenge",
    label: "Item: Confident designing challenge",
    category: "item",
  },
  {
    key: "itemTeacherEdPrepared",
    label: "Item: Teacher education prepared me",
    category: "item",
  },
  {
    key: "itemFormativeHelps",
    label: "Item: Formative assessment helps",
    category: "item",
  },
  {
    key: "itemDigitalTools",
    label: "Item: Digital tools make it easier",
    category: "item",
  },
  {
    key: "itemMaterialsSupport",
    label: "Item: Access to materials for support",
    category: "item",
  },
  {
    key: "itemMaterialsChallenge",
    label: "Item: Access to materials for challenge",
    category: "item",
  },
  {
    key: "supportAdaptationIndex",
    label: "Support Adaptation Index (avg)",
    category: "index",
  },
  {
    key: "challengeAdaptationIndex",
    label: "Challenge Adaptation Index (avg)",
    category: "index",
  },
  {
    key: "yearsTeachingCategory",
    label: "Context: Years Teaching",
    category: "context",
  },
  {
    key: "schoolType",
    label: "Context: School Type",
    category: "context-categorical",
  },
  {
    key: "hasCertification",
    label: "Context: Certification",
    category: "context",
  },
  {
    key: "levelsTeaching",
    label: "Context: Levels Teaching",
    category: "context-categorical",
  },
  { key: "groupSize", label: "Context: Group Size", category: "context" },
  {
    key: "shareSupportStudents",
    label: "Context: Share of Support Students",
    category: "context",
  },
  {
    key: "shareChallengeStudents",
    label: "Context: Share of Challenge Students",
    category: "context",
  },
];

const GROUP_BY_FIELDS = [
  {
    key: "yearsTeachingCategory",
    label: "Years Teaching",
    isRangeField: false,
  },
  { key: "schoolType", label: "School Type", isRangeField: false },
  { key: "hasCertification", label: "Certification", isRangeField: false },
  { key: "levelsTeaching", label: "Levels Teaching", isRangeField: false },
  { key: "groupSize", label: "Group Size", isRangeField: false },
  {
    key: "shareSupportStudents",
    label: "Share of Support Students",
    isRangeField: false,
  },
  {
    key: "shareChallengeStudents",
    label: "Share of Challenge Students",
    isRangeField: false,
  },
  {
    key: "itemTimeToDifferentiate",
    label: "Time to Differentiate",
    isRangeField: true,
  },
  { key: "itemClassSizeOk", label: "Class Size", isRangeField: true },
  {
    key: "itemConfidentSupport",
    label: "Confident Supporting",
    isRangeField: true,
  },
  {
    key: "itemConfidentChallenge",
    label: "Confident Challenging",
    isRangeField: true,
  },
  {
    key: "itemTeacherEdPrepared",
    label: "Teacher Ed Prepared",
    isRangeField: true,
  },
  {
    key: "itemFormativeHelps",
    label: "Formative Assessment",
    isRangeField: true,
  },
  { key: "itemDigitalTools", label: "Digital Tools", isRangeField: true },
  {
    key: "itemMaterialsSupport",
    label: "Materials Support",
    isRangeField: true,
  },
  {
    key: "itemMaterialsChallenge",
    label: "Materials Challenge",
    isRangeField: true,
  },
];

export function PlaygroundTab({ data }: { data: SurveyResponse[] }) {
  const [config, setConfig] = useState<PlaygroundConfig>({
    chartType: "grouped-bar",
    selectedQuestions: ["supportAdaptationIndex", "challengeAdaptationIndex"],
    groupByField: null,
    selectedGroups: [],
    showDataLabels: false,
  });

  const availableGroups = useMemo(() => {
    if (!config.groupByField) return [];

    const currentField = GROUP_BY_FIELDS.find(
      (f) => f.key === config.groupByField
    );
    if (!currentField) return [];

    if (currentField.isRangeField) {
      return ["1", "2", "3", "4", "5"];
    }

    const groups = new Set<string>();
    data.forEach((row) => {
      const value = row[config.groupByField as keyof SurveyResponse];
      if (value !== null && value !== undefined && value !== "") {
        groups.add(String(value));
      }
    });

    return Array.from(groups).sort();
  }, [data, config.groupByField]);

  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    availableGroups.forEach((group) => {
      const count = data.filter((row) => {
        const value = row[config.groupByField as keyof SurveyResponse];
        return String(value) === group;
      }).length;
      counts.set(group, count);
    });

    return counts;
  }, [data, config.groupByField, availableGroups]);

  const handleQuestionToggle = (questionKey: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(questionKey)
        ? prev.selectedQuestions.filter((q) => q !== questionKey)
        : [...prev.selectedQuestions, questionKey],
    }));
  };

  const handleGroupToggle = (group: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(group)
        ? prev.selectedGroups.filter((g) => g !== group)
        : [...prev.selectedGroups, group],
    }));
  };

  const handleSelectAllQuestions = (category?: string) => {
    const questionsToSelect = category
      ? QUESTIONS.filter((q) => q.category === category).map((q) => q.key)
      : QUESTIONS.map((q) => q.key);

    setConfig((prev) => ({
      ...prev,
      selectedQuestions: questionsToSelect,
    }));
  };

  const handleClearAllQuestions = () => {
    setConfig((prev) => ({
      ...prev,
      selectedQuestions: [],
    }));
  };

  const handleSelectAllGroups = () => {
    setConfig((prev) => ({
      ...prev,
      selectedGroups: availableGroups,
    }));
  };

  const handleClearAllGroups = () => {
    setConfig((prev) => ({
      ...prev,
      selectedGroups: [],
    }));
  };

  const handleClearSelections = () => {
    setConfig((prev) => ({
      ...prev,
      selectedQuestions: [],
      selectedGroups: [],
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={24} weight="fill" className="text-primary" />
                Chart Playground
              </CardTitle>
              <CardDescription>
                Build custom visualizations by selecting questions, groups, and
                chart types
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearSelections}>
              <X className="mr-2" size={16} />
              Clear All
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chart Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Chart Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={
                      config.chartType === "grouped-bar" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        chartType: "grouped-bar",
                      }))
                    }
                    className="justify-start"
                  >
                    <Rows className="mr-2" size={16} />
                    Grouped
                  </Button>
                  <Button
                    variant={
                      config.chartType === "stacked-bar" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        chartType: "stacked-bar",
                      }))
                    }
                    className="justify-start"
                  >
                    <Rows className="mr-2" size={16} />
                    Stacked
                  </Button>
                  <Button
                    variant={
                      config.chartType === "scatter" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, chartType: "scatter" }))
                    }
                    className="justify-start"
                  >
                    <ChartPie className="mr-2" size={16} />
                    Scatter
                  </Button>
                  <Button
                    variant={
                      config.chartType === "distribution"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        chartType: "distribution",
                      }))
                    }
                    className="justify-start"
                  >
                    <ChartBar className="mr-2" size={16} />
                    Distribution
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Group By</Label>
                <Select
                  value={config.groupByField || "none"}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      groupByField:
                        value === "none"
                          ? null
                          : (value as keyof SurveyResponse),
                      selectedGroups: [],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No grouping</SelectItem>
                    {GROUP_BY_FIELDS.map((field) => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label>Show Data Labels</Label>
                <Checkbox
                  checked={config.showDataLabels}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      showDataLabels: !!checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Questions</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllQuestions()}
                    className="h-7 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllQuestions}
                    className="h-7 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center justify-between">
                <span>{config.selectedQuestions.length} selected</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllQuestions("support")}
                    className="h-6 text-xs px-2"
                  >
                    All Support
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllQuestions("challenge")}
                    className="h-6 text-xs px-2"
                  >
                    All Challenge
                  </Button>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {QUESTIONS.map((question) => (
                    <div key={question.key} className="flex items-center gap-2">
                      <Checkbox
                        id={question.key}
                        checked={config.selectedQuestions.includes(
                          question.key
                        )}
                        onCheckedChange={() =>
                          handleQuestionToggle(question.key)
                        }
                      />
                      <Label
                        htmlFor={question.key}
                        className="cursor-pointer text-sm leading-tight flex-1 flex items-center justify-between"
                      >
                        <span>{question.label}</span>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs shrink-0"
                        >
                          {question.category}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {config.groupByField && availableGroups.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Groups</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllGroups}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllGroups}
                      className="h-7 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {config.selectedGroups.length} of {availableGroups.length}{" "}
                  selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {availableGroups.map((group) => {
                      const count = groupCounts.get(group) || 0;
                      return (
                        <div key={group} className="flex items-start gap-2">
                          <Checkbox
                            id={`group-${group}`}
                            checked={config.selectedGroups.includes(group)}
                            onCheckedChange={() => handleGroupToggle(group)}
                          />
                          <Label
                            htmlFor={`group-${group}`}
                            className="cursor-pointer text-sm flex-1"
                          >
                            <div className="flex items-center justify-between">
                              <span>{group}</span>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {count}
                              </Badge>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <PlaygroundChart data={data} config={config} />
        </div>
      </div>
    </div>
  );
}
