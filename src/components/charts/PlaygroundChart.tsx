import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
  LabelList,
} from "recharts";
import { SurveyResponse } from "@/lib/types";

type ChartType = "grouped-bar" | "stacked-bar" | "scatter" | "distribution";

interface PlaygroundConfig {
  chartType: ChartType;
  selectedQuestions: string[];
  selectedGroups: string[];
  groupByField: keyof SurveyResponse | null;
  showDataLabels: boolean;
}

interface PlaygroundChartProps {
  data: SurveyResponse[];
  config: PlaygroundConfig;
}

const COLORS = [
  "oklch(48.8% 0.243 264.376)",
  "oklch(0.65 0.20 195)",
  "oklch(83.7% 0.128 66.29)",
  "oklch(0.60 0.25 25)",
  "oklch(0.45 0.20 250)",
  "oklch(0.75 0.18 45)",
  "oklch(0.55 0.15 300)",
  "oklch(0.70 0.22 120)",
  "oklch(0.50 0.18 30)",
  "oklch(0.65 0.16 180)",
];

const QUESTION_LABELS: Record<string, string> = {
  supportQ1: "Extra time",
  supportQ2: "Easier version",
  supportQ3: "Core only",
  supportQ4: "Different access",
  supportQ5: "Choose topic",
  supportQ6: "Flex grouping",
  challengeQ1: "Next task",
  challengeQ2: "Harder version",
  challengeQ3: "More content",
  challengeQ4: "Demanding mode",
  challengeQ5: "Interest extension",
  challengeQ6: "Flex grouping",
  supportAdaptationIndex: "Support Index",
  challengeAdaptationIndex: "Challenge Index",
  itemTimeToDifferentiate: "Time to Differentiate",
  itemClassSizeOk: "Class Size",
  itemConfidentSupport: "Confident Support",
  itemConfidentChallenge: "Confident Challenge",
  itemTeacherEdPrepared: "Teacher Ed Prepared",
  itemFormativeHelps: "Formative Assessment",
  itemDigitalTools: "Digital Tools",
  itemMaterialsSupport: "Materials Support",
  itemMaterialsChallenge: "Materials Challenge",
  yearsTeachingCategory: "Years Teaching",
  schoolType: "School Type",
  hasCertification: "Certification",
  levelsTeaching: "Levels Teaching",
  groupSize: "Group Size",
  shareSupportStudents: "Share Support Students",
  shareChallengeStudents: "Share Challenge Students",
};

const GROUP_BY_LABELS: Record<string, string> = {
  schoolType: "School Type",
  yearsTeachingCategory: "Years Teaching",
  levelsTeaching: "Levels Teaching",
  hasCertification: "Certification",
  groupSize: "Group Size",
  shareSupportStudents: "Share of Support Students",
  shareChallengeStudents: "Share of Challenge Students",
  itemTimeToDifferentiate: "Time to Differentiate",
  itemClassSizeOk: "Class Size",
  itemConfidentSupport: "Confident Support",
  itemConfidentChallenge: "Confident Challenge",
  itemTeacherEdPrepared: "Teacher Ed Prepared",
  itemFormativeHelps: "Formative Assessment",
  itemDigitalTools: "Digital Tools",
  itemMaterialsSupport: "Materials Support",
  itemMaterialsChallenge: "Materials Challenge",
};

const RANGE_FIELDS = new Set([
  "itemTimeToDifferentiate",
  "itemClassSizeOk",
  "itemConfidentSupport",
  "itemConfidentChallenge",
  "itemTeacherEdPrepared",
  "itemFormativeHelps",
  "itemDigitalTools",
  "itemMaterialsSupport",
  "itemMaterialsChallenge",
]);

const ITEM_QUESTIONS = new Set([
  "itemTimeToDifferentiate",
  "itemClassSizeOk",
  "itemConfidentSupport",
  "itemConfidentChallenge",
  "itemTeacherEdPrepared",
  "itemFormativeHelps",
  "itemDigitalTools",
  "itemMaterialsSupport",
  "itemMaterialsChallenge",
]);

const SUPPORT_QUESTIONS = new Set([
  "supportQ1",
  "supportQ2",
  "supportQ3",
  "supportQ4",
  "supportQ5",
  "supportQ6",
]);

const CHALLENGE_QUESTIONS = new Set([
  "challengeQ1",
  "challengeQ2",
  "challengeQ3",
  "challengeQ4",
  "challengeQ5",
  "challengeQ6",
]);

const NUMERIC_CONTEXT_QUESTIONS = new Set(["groupSize"]);

const CATEGORICAL_CONTEXT_QUESTIONS = new Set([
  "yearsTeachingCategory",
  "hasCertification",
  "shareSupportStudents",
  "shareChallengeStudents",
]);

// These are purely categorical - cannot be converted to numbers for averaging
const PURELY_CATEGORICAL_QUESTIONS = new Set(["schoolType", "levelsTeaching"]);

const shouldUse1to5Scale = (questionKey: string): boolean => {
  return (
    SUPPORT_QUESTIONS.has(questionKey) ||
    CHALLENGE_QUESTIONS.has(questionKey) ||
    ITEM_QUESTIONS.has(questionKey) ||
    questionKey === "supportAdaptationIndex" ||
    questionKey === "challengeAdaptationIndex"
  );
};

function convertLikertToNumber(value: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;

  const str = String(value).trim().toLowerCase();
  if (str === "") return null;

  if (str.includes("strongly disagree") || str === "1") return 1;
  if (str.includes("disagree") || str === "2") return 2;
  if (str.includes("neutral") || str === "3") return 3;
  if (str.includes("agree") && !str.includes("strongly")) return 4;
  if (str.includes("strongly agree") || str === "5") return 5;

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function getContextValue(value: any, questionKey: string): number | null {
  if (value === null || value === undefined) return null;

  if (questionKey === "groupSize") {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    return isNaN(num) ? null : num;
  }

  const num = typeof value === "number" ? value : parseFloat(String(value));
  return isNaN(num) ? null : num;
}

function convertContextToNumber(value: any, key: string): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === "") return null;

  if (key === "yearsTeachingCategory") {
    if (str === "0-5") return 2.5;
    if (str === "6-10" || str === "6-11") return 8;
    if (str === "11-20") return 15.5;
    if (str === "21-30" || str === "20-30") return 25.5;
    if (str === "30+") return 35;
    return null;
  }

  if (key === "shareSupportStudents" || key === "shareChallengeStudents") {
    if (str === "0-10%") return 5;
    if (str === "11-25%") return 18;
    if (str === "26-40%") return 33;
    if (str === "41-60%") return 50.5;
    if (str === ">61%" || str === "61%+") return 70;
    return null;
  }

  if (key === "hasCertification") {
    return str.toLowerCase() === "yes" ? 1 : 0;
  }

  return null;
}

export function PlaygroundChart({ data, config }: PlaygroundChartProps) {
  const chartData = useMemo(() => {
    if (config.selectedQuestions.length === 0) {
      return [];
    }

    if (!config.groupByField) {
      return config.selectedQuestions.map((questionKey) => {
        const isItemQuestion = ITEM_QUESTIONS.has(questionKey);
        const isNumericContext = NUMERIC_CONTEXT_QUESTIONS.has(questionKey);
        const isCategoricalContext =
          CATEGORICAL_CONTEXT_QUESTIONS.has(questionKey);
        const isPurelyCategorical =
          PURELY_CATEGORICAL_QUESTIONS.has(questionKey);

        // For purely categorical questions, show total count
        if (isPurelyCategorical) {
          const validCount = data.filter((row) => {
            const rawValue = (row as any)[questionKey];
            return (
              rawValue !== null &&
              rawValue !== undefined &&
              String(rawValue).trim() !== ""
            );
          }).length;
          return {
            name: QUESTION_LABELS[questionKey] || questionKey,
            value: validCount,
            count: validCount,
            isCategorical: true,
            questionKey: questionKey,
          };
        }

        const values = data
          .map((row) => {
            const rawValue = (row as any)[questionKey];
            if (isItemQuestion) {
              return convertLikertToNumber(rawValue);
            } else if (isNumericContext) {
              return getContextValue(rawValue, questionKey);
            } else if (isCategoricalContext) {
              return convertContextToNumber(rawValue, questionKey);
            }
            return rawValue;
          })
          .filter(
            (v) =>
              v !== null &&
              v !== undefined &&
              typeof v === "number" &&
              !isNaN(v)
          ) as number[];

        const average =
          values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;

        return {
          name: QUESTION_LABELS[questionKey] || questionKey,
          value: average,
          count: values.length,
        };
      });
    }

    const isRangeField = RANGE_FIELDS.has(config.groupByField as string);
    const questionsToUse = config.selectedQuestions;

    if (config.selectedGroups.length === 0) {
      const groups = new Set<string>();
      data.forEach((row) => {
        const value = row[config.groupByField as keyof SurveyResponse];
        if (
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
        ) {
          groups.add(String(value));
        }
      });
      let allGroups = Array.from(groups).sort();

      if (isRangeField) {
        allGroups = ["1", "2", "3", "4", "5"];
      }

      return allGroups.map((group) => {
        const groupData = data.filter(
          (row) =>
            String(row[config.groupByField as keyof SurveyResponse]) === group
        );

        const result: any = { name: group, _count: groupData.length };

        questionsToUse.forEach((questionKey) => {
          const isItemQuestion = ITEM_QUESTIONS.has(questionKey);
          const isNumericContext = NUMERIC_CONTEXT_QUESTIONS.has(questionKey);
          const isCategoricalContext =
            CATEGORICAL_CONTEXT_QUESTIONS.has(questionKey);
          const isPurelyCategorical =
            PURELY_CATEGORICAL_QUESTIONS.has(questionKey);

          // For purely categorical questions, we'll show the count of responses instead
          if (isPurelyCategorical) {
            const validCount = groupData.filter((row) => {
              const rawValue = (row as any)[questionKey];
              return (
                rawValue !== null &&
                rawValue !== undefined &&
                String(rawValue).trim() !== ""
              );
            }).length;
            // Use a normalized value based on count for display purposes
            result[questionKey] = validCount;
            result[`${questionKey}_count`] = validCount;
            result[`${questionKey}_isCategorical`] = true;
            return;
          }

          const values = groupData
            .map((row) => {
              const rawValue = (row as any)[questionKey];
              if (isItemQuestion) {
                return convertLikertToNumber(rawValue);
              } else if (isNumericContext) {
                return getContextValue(rawValue, questionKey);
              } else if (isCategoricalContext) {
                return convertContextToNumber(rawValue, questionKey);
              }
              return rawValue;
            })
            .filter(
              (v) =>
                v !== null &&
                v !== undefined &&
                typeof v === "number" &&
                !isNaN(v)
            ) as number[];

          result[questionKey] =
            values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : 0;
          result[`${questionKey}_count`] = values.length;
        });

        return result;
      });
    }

    let groupsToShow = config.selectedGroups;

    if (isRangeField) {
      groupsToShow = ["1", "2", "3", "4", "5"];
    }

    return groupsToShow.map((group) => {
      const groupData = data.filter(
        (row) =>
          String(row[config.groupByField as keyof SurveyResponse]) === group
      );

      const result: any = { name: group, _count: groupData.length };

      questionsToUse.forEach((questionKey) => {
        const isItemQuestion = ITEM_QUESTIONS.has(questionKey);
        const isNumericContext = NUMERIC_CONTEXT_QUESTIONS.has(questionKey);
        const isCategoricalContext =
          CATEGORICAL_CONTEXT_QUESTIONS.has(questionKey);
        const isPurelyCategorical =
          PURELY_CATEGORICAL_QUESTIONS.has(questionKey);

        // For purely categorical questions, we'll show the count of responses instead
        if (isPurelyCategorical) {
          const validCount = groupData.filter((row) => {
            const rawValue = (row as any)[questionKey];
            return (
              rawValue !== null &&
              rawValue !== undefined &&
              String(rawValue).trim() !== ""
            );
          }).length;
          result[questionKey] = validCount;
          result[`${questionKey}_count`] = validCount;
          result[`${questionKey}_isCategorical`] = true;
          return;
        }

        const values = groupData
          .map((row) => {
            const rawValue = (row as any)[questionKey];
            if (isItemQuestion) {
              return convertLikertToNumber(rawValue);
            } else if (isNumericContext) {
              return getContextValue(rawValue, questionKey);
            } else if (isCategoricalContext) {
              return convertContextToNumber(rawValue, questionKey);
            }
            return rawValue;
          })
          .filter(
            (v) =>
              v !== null &&
              v !== undefined &&
              typeof v === "number" &&
              !isNaN(v)
          ) as number[];

        result[questionKey] =
          values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;
        result[`${questionKey}_count`] = values.length;
      });

      return result;
    });
  }, [
    data,
    config.selectedQuestions,
    config.selectedGroups,
    config.groupByField,
  ]);

  // Compute distribution data for purely categorical questions
  const categoricalDistributions = useMemo(() => {
    const distributions: Record<
      string,
      Record<string, { count: number; percentage: number }>
    > = {};

    config.selectedQuestions.forEach((questionKey) => {
      if (PURELY_CATEGORICAL_QUESTIONS.has(questionKey)) {
        const dist: Record<string, number> = {};
        let total = 0;

        // Get the relevant data based on grouping
        const relevantData =
          config.groupByField && config.selectedGroups.length > 0
            ? data.filter((row) =>
                config.selectedGroups.includes(
                  String(row[config.groupByField as keyof SurveyResponse])
                )
              )
            : data;

        relevantData.forEach((row) => {
          const rawValue = (row as any)[questionKey];
          if (
            rawValue !== null &&
            rawValue !== undefined &&
            String(rawValue).trim() !== ""
          ) {
            const strValue = String(rawValue).trim();
            dist[strValue] = (dist[strValue] || 0) + 1;
            total++;
          }
        });

        distributions[questionKey] = {};
        Object.entries(dist).forEach(([value, count]) => {
          distributions[questionKey][value] = {
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          };
        });
      }
    });

    return distributions;
  }, [
    data,
    config.selectedQuestions,
    config.groupByField,
    config.selectedGroups,
  ]);

  // Check if we have any purely categorical questions selected
  const hasPurelyCategoricalQuestions = useMemo(() => {
    return config.selectedQuestions.some((q) =>
      PURELY_CATEGORICAL_QUESTIONS.has(q)
    );
  }, [config.selectedQuestions]);

  const scatterData = useMemo(() => {
    if (config.chartType !== "scatter" || config.selectedQuestions.length < 2) {
      return [];
    }

    const [xKey, yKey] = config.selectedQuestions;
    const isXItemQuestion = ITEM_QUESTIONS.has(xKey);
    const isYItemQuestion = ITEM_QUESTIONS.has(yKey);
    const isXNumericContext = NUMERIC_CONTEXT_QUESTIONS.has(xKey);
    const isYNumericContext = NUMERIC_CONTEXT_QUESTIONS.has(yKey);

    return data
      .filter((row) => {
        const xRaw = (row as any)[xKey];
        const yRaw = (row as any)[yKey];

        let xVal: number | null = null;
        if (isXItemQuestion) {
          xVal = convertLikertToNumber(xRaw);
        } else if (isXNumericContext) {
          if (xKey === "groupSize") {
            xVal = getContextValue(xRaw, xKey);
          } else {
            xVal = null;
          }
        } else {
          xVal = xRaw;
        }

        let yVal: number | null = null;
        if (isYItemQuestion) {
          yVal = convertLikertToNumber(yRaw);
        } else if (isYNumericContext) {
          if (yKey === "groupSize") {
            yVal = getContextValue(yRaw, yKey);
          } else {
            yVal = null;
          }
        } else {
          yVal = yRaw;
        }

        return (
          xVal !== null &&
          xVal !== undefined &&
          yVal !== null &&
          yVal !== undefined
        );
      })
      .map((row) => {
        const xRaw = (row as any)[xKey];
        const yRaw = (row as any)[yKey];

        let xVal: number | null = null;
        if (isXItemQuestion) {
          xVal = convertLikertToNumber(xRaw);
        } else if (isXNumericContext) {
          if (xKey === "groupSize") {
            xVal = getContextValue(xRaw, xKey);
          } else {
            xVal = null;
          }
        } else {
          xVal = xRaw;
        }

        let yVal: number | null = null;
        if (isYItemQuestion) {
          yVal = convertLikertToNumber(yRaw);
        } else if (isYNumericContext) {
          if (yKey === "groupSize") {
            yVal = getContextValue(yRaw, yKey);
          } else {
            yVal = null;
          }
        } else {
          yVal = yRaw;
        }

        return {
          x: xVal!,
          y: yVal!,
          group: config.groupByField ? String(row[config.groupByField]) : "All",
        };
      });
  }, [data, config.chartType, config.selectedQuestions, config.groupByField]);

  const distributionData = useMemo(() => {
    if (
      config.chartType !== "distribution" ||
      config.selectedQuestions.length === 0
    ) {
      return [];
    }

    const questionKey = config.selectedQuestions[0];
    const isItemQuestion = ITEM_QUESTIONS.has(questionKey);
    const isNumericContext = NUMERIC_CONTEXT_QUESTIONS.has(questionKey);
    const distribution = new Map<number, number>();

    data.forEach((row) => {
      const rawValue = (row as any)[questionKey];
      let value: number | null = null;
      if (isItemQuestion) {
        value = convertLikertToNumber(rawValue);
      } else if (isNumericContext) {
        if (questionKey === "groupSize") {
          value = getContextValue(rawValue, questionKey);
        } else {
          value = null;
        }
      } else {
        value = rawValue;
      }

      if (value !== null && value !== undefined) {
        distribution.set(value, (distribution.get(value) || 0) + 1);
      }
    });

    return Array.from(distribution.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, count]) => ({
        name: String(value),
        count,
        percentage: (count / data.length) * 100,
      }));
  }, [data, config.chartType, config.selectedQuestions]);

  const getYAxisConfig = useMemo(() => {
    const allSelectedUse1to5 = config.selectedQuestions.every((q) =>
      shouldUse1to5Scale(q)
    );

    if (allSelectedUse1to5) {
      return {
        domain: [0, 5] as [number, number],
        ticks: [0, 1, 2, 3, 4, 5],
      };
    }

    let allValues: number[] = [];
    if (config.groupByField) {
      chartData.forEach((row) => {
        config.selectedQuestions.forEach((q) => {
          const value = row[q];
          if (value !== null && value !== undefined && !isNaN(value)) {
            allValues.push(value);
          }
        });
      });
    } else {
      chartData.forEach((row) => {
        if (
          row.value !== null &&
          row.value !== undefined &&
          !isNaN(row.value)
        ) {
          allValues.push(row.value);
        }
      });
    }

    if (allValues.length === 0) {
      return {
        domain: undefined,
        ticks: undefined,
      };
    }

    const minValue = Math.floor(Math.min(...allValues));
    const maxValue = Math.ceil(Math.max(...allValues));

    return {
      domain: undefined,
      ticks: undefined,
    };
  }, [config.selectedQuestions, chartData, config.groupByField]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // Get categorical distributions for this group if we're grouping
    const getCategoricalDataForGroup = (
      groupName: string,
      questionKey: string
    ) => {
      if (!PURELY_CATEGORICAL_QUESTIONS.has(questionKey)) return null;

      // If we're grouping by a field, filter by that group
      // Otherwise use all data
      let relevantData = data;
      if (config.groupByField) {
        relevantData = data.filter(
          (row) =>
            String(row[config.groupByField as keyof SurveyResponse]) ===
            groupName
        );
      }

      const dist: Record<string, number> = {};
      let total = 0;

      relevantData.forEach((row) => {
        const rawValue = (row as any)[questionKey];
        if (
          rawValue !== null &&
          rawValue !== undefined &&
          String(rawValue).trim() !== ""
        ) {
          const strValue = String(rawValue).trim();
          dist[strValue] = (dist[strValue] || 0) + 1;
          total++;
        }
      });

      return { dist, total };
    };

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-md">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const countKey = `${entry.dataKey}_count`;
          const count = entry.payload[countKey];
          // Check if it's categorical either from grouped or non-grouped data
          const isCategoricalFromPayload =
            entry.payload?.isCategorical ||
            entry.payload?.[`${entry.dataKey}_isCategorical`];
          const questionKeyFromPayload =
            entry.payload?.questionKey || entry.dataKey;
          const isCategorical =
            PURELY_CATEGORICAL_QUESTIONS.has(questionKeyFromPayload) ||
            isCategoricalFromPayload;
          const catData = isCategorical
            ? getCategoricalDataForGroup(label, questionKeyFromPayload)
            : null;

          if (isCategorical && catData && catData.total > 0) {
            return (
              <div key={index} className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium text-sm">
                    {entry.name} (n={catData.total}):
                  </span>
                </div>
                <div className="ml-5 text-xs space-y-0.5">
                  {Object.entries(catData.dist)
                    .sort((a, b) => b[1] - a[1])
                    .map(([value, cnt]) => (
                      <div key={value} className="flex justify-between gap-2">
                        <span
                          className="text-muted-foreground truncate max-w-[200px]"
                          title={value}
                        >
                          {value.length > 30
                            ? value.substring(0, 30) + "..."
                            : value}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {cnt} ({((cnt / catData.total) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {typeof entry.value === "number"
                    ? entry.value.toFixed(2)
                    : entry.value}
                </span>
                {count !== undefined && (
                  <span className="text-muted-foreground text-xs">
                    (n={count})
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {payload[0]?.payload?._count !== undefined && (
          <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
            Total responses: {payload[0].payload._count}
          </div>
        )}
      </div>
    );
  };

  const calculateTrendLine = (chartData: any[], dataKey: string) => {
    if (chartData.length < 2) return null;

    const points = chartData
      .map((d, i) => ({ x: i, y: d[dataKey] }))
      .filter((p) => p.y !== null && p.y !== undefined);

    if (points.length < 2) return null;

    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return chartData.map((d, i) => ({
      x: d.name,
      y: slope * i + intercept,
    }));
  };

  if (config.selectedQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Select at least one question to visualize data
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (config.chartType === "scatter" && config.selectedQuestions.length < 2) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Scatter plots require at least 2 questions selected
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getChartTitle = () => {
    const chartTypeLabel =
      {
        "grouped-bar": "Grouped",
        "stacked-bar": "Stacked",
        scatter: "Scatter",
        distribution: "Distribution",
      }[config.chartType] || "Grouped";

    if (config.chartType === "scatter") {
      return `Scatter Plot: ${
        QUESTION_LABELS[config.selectedQuestions[0]]
      } vs ${QUESTION_LABELS[config.selectedQuestions[1]]}`;
    }

    if (config.chartType === "distribution") {
      return `Distribution: ${QUESTION_LABELS[config.selectedQuestions[0]]}`;
    }

    if (config.groupByField) {
      const groupLabel =
        GROUP_BY_LABELS[config.groupByField] || config.groupByField;
      return `${chartTypeLabel} by ${groupLabel}`;
    }

    return `${chartTypeLabel} Comparison`;
  };

  const renderChart = () => {
    if (config.chartType === "scatter") {
      const groupedScatter = new Map<string, any[]>();
      scatterData.forEach((point) => {
        if (!groupedScatter.has(point.group)) {
          groupedScatter.set(point.group, []);
        }
        groupedScatter.get(point.group)!.push(point);
      });

      const [xKey, yKey] = config.selectedQuestions;
      const xUses1to5 = shouldUse1to5Scale(xKey);
      const yUses1to5 = shouldUse1to5Scale(yKey);

      const xAxisConfig = xUses1to5
        ? { domain: [0, 5] as [number, number], ticks: [0, 1, 2, 3, 4, 5] }
        : { domain: undefined, ticks: undefined };

      const yAxisConfig = yUses1to5
        ? { domain: [0, 5] as [number, number], ticks: [0, 1, 2, 3, 4, 5] }
        : { domain: undefined, ticks: undefined };

      return (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.85 0.01 250)"
            />
            <XAxis
              type="number"
              dataKey="x"
              name={QUESTION_LABELS[xKey]}
              domain={xAxisConfig.domain}
              ticks={xAxisConfig.ticks}
              label={{
                value: QUESTION_LABELS[xKey],
                position: "bottom",
                offset: 40,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={QUESTION_LABELS[yKey]}
              domain={yAxisConfig.domain}
              ticks={yAxisConfig.ticks}
              label={{
                value: QUESTION_LABELS[yKey],
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<CustomTooltip />}
            />
            <Legend />
            {Array.from(groupedScatter.entries()).map(
              ([group, points], idx) => (
                <Scatter
                  key={group}
                  name={group}
                  data={points}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.6}
                />
              )
            )}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === "distribution") {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={distributionData}
            margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.85 0.01 250)"
            />
            <XAxis
              dataKey="name"
              label={{
                value: "Response Value",
                position: "bottom",
                offset: 40,
              }}
            />
            <YAxis
              label={{
                value: "Frequency",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill={COLORS[0]} radius={[8, 8, 0, 0]}>
              {distributionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
              {config.showDataLabels && (
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fontSize: "11px", fill: "oklch(0.20 0.02 250)" }}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === "stacked-bar" && config.groupByField) {
      const questionsToRender = config.selectedQuestions;

      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.85 0.01 250)"
            />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis
              domain={getYAxisConfig.domain}
              ticks={getYAxisConfig.ticks}
              label={{
                value: "Value",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {questionsToRender.map((questionKey, idx) => (
              <Bar
                key={questionKey}
                dataKey={questionKey}
                stackId="a"
                fill={COLORS[idx % COLORS.length]}
                name={QUESTION_LABELS[questionKey] || questionKey}
                radius={
                  idx === questionsToRender.length - 1
                    ? [8, 8, 0, 0]
                    : [0, 0, 0, 0]
                }
              >
                {config.showDataLabels && (
                  <LabelList
                    dataKey={questionKey}
                    position="center"
                    formatter={(value: number) =>
                      value > 0 ? value.toFixed(1) : ""
                    }
                    style={{ fontSize: "11px", fill: "oklch(0.99 0 0)" }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === "grouped-bar" && config.groupByField) {
      const questionsToRender = config.selectedQuestions;

      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.85 0.01 250)"
            />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis
              domain={getYAxisConfig.domain}
              ticks={getYAxisConfig.ticks}
              label={{
                value: "Value",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {questionsToRender.map((questionKey, idx) => (
              <Bar
                key={questionKey}
                dataKey={questionKey}
                fill={COLORS[idx % COLORS.length]}
                name={QUESTION_LABELS[questionKey] || questionKey}
                radius={[8, 8, 0, 0]}
              >
                {config.showDataLabels && (
                  <LabelList
                    dataKey={questionKey}
                    position="top"
                    formatter={(value: number) => value.toFixed(1)}
                    style={{ fontSize: "11px", fill: "oklch(0.20 0.02 250)" }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis
            domain={getYAxisConfig.domain}
            ticks={getYAxisConfig.ticks}
            label={{
              value: "Value",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
            {config.showDataLabels && (
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value: number) => value.toFixed(1)}
                style={{ fontSize: "11px", fill: "oklch(0.20 0.02 250)" }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
        <CardDescription>
          {chartData.length > 0 &&
            `Showing ${chartData.length} data point${
              chartData.length !== 1 ? "s" : ""
            }`}
          {config.chartType === "scatter" &&
            ` from ${scatterData.length} responses`}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
