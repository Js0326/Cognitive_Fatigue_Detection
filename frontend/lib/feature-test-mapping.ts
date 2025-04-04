export interface FeatureTestMapping {
  feature: string;
  test: string;
  description: string;
}

export const featureTestMappings: FeatureTestMapping[] = [
  {
    feature: "Multitasking_Index",
    test: "multitasking",
    description: "Multitasking Performance Test"
  },
  {
    feature: "Fastest_Reaction",
    test: "reaction",
    description: "Reaction Time Test"
  },
  {
    feature: "Math_Response_Time",
    test: "math",
    description: "Mathematical Problem Solving Test"
  },
  {
    feature: "Typing_Accuracy",
    test: "typing",
    description: "Typing Speed & Accuracy Test"
  },
  {
    feature: "Equation_Accuracy",
    test: "math",
    description: "Mathematical Accuracy Test"
  }
];

export function getMissingFeatures(testResults: Record<string, any> | null): FeatureTestMapping[] {
  if (!testResults) {
    return featureTestMappings;
  }

  return featureTestMappings.filter(mapping => {
    switch (mapping.feature) {
      case "Multitasking_Index":
        return !testResults.multitasking?.score;
      case "Fastest_Reaction":
        return !testResults.reaction?.fastestReaction;
      case "Math_Response_Time":
        return !testResults.math?.averageResponseTime;
      case "Typing_Accuracy":
        return !testResults.typing?.accuracy;
      case "Equation_Accuracy":
        return !testResults.math?.accuracy;
      default:
        return true;
    }
  });
}
