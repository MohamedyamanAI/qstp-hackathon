type ModelPricing = {
  inputPerMillion: number;
  outputPerMillion: number;
  thinkingPerMillion: number;
};

const PRICING: Record<string, ModelPricing> = {
  "gemini-2.5-flash": {
    inputPerMillion: 0.15,
    outputPerMillion: 0.6,
    thinkingPerMillion: 3.5,
  },
  "gemini-2.5-pro": {
    inputPerMillion: 1.25,
    outputPerMillion: 10.0,
    thinkingPerMillion: 10.0,
  },
};

type ImageModelPricing = {
  inputPerMillion: number;
  outputPerMillion: number;
};

const IMAGE_PRICING: Record<string, ImageModelPricing> = {
  "gemini-2.5-flash-image": {
    inputPerMillion: 0.15,
    outputPerMillion: 30.0,
  },
  "gemini-3-pro-image-preview": {
    inputPerMillion: 1.25,
    outputPerMillion: 10.0,
  },
};

export type CostBreakdown = {
  inputCost: number;
  outputCost: number;
  reasoningCost: number;
  totalCost: number;
};

export type UsageData = {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  model: string;
  cost: CostBreakdown;
};

export function calculateUsage(
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    outputTokenDetails?: { reasoningTokens?: number };
  },
  model: string
): UsageData {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  const reasoningTokens = usage.outputTokenDetails?.reasoningTokens ?? 0;
  const totalTokens = usage.totalTokens ?? inputTokens + outputTokens;

  // outputTokens from the SDK includes reasoning tokens
  const textOutputTokens = Math.max(0, outputTokens - reasoningTokens);

  const pricing = PRICING[model];
  const inputCost = pricing
    ? (inputTokens / 1_000_000) * pricing.inputPerMillion
    : 0;
  const outputCost = pricing
    ? (textOutputTokens / 1_000_000) * pricing.outputPerMillion
    : 0;
  const reasoningCost = pricing
    ? (reasoningTokens / 1_000_000) * pricing.thinkingPerMillion
    : 0;

  return {
    inputTokens,
    outputTokens,
    reasoningTokens,
    totalTokens,
    model,
    cost: {
      inputCost,
      outputCost,
      reasoningCost,
      totalCost: inputCost + outputCost + reasoningCost,
    },
  };
}

export type ImageUsageData = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  cost: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
};

export function calculateImageUsage(
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  },
  model: string
): ImageUsageData {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  const totalTokens = usage.totalTokens ?? inputTokens + outputTokens;

  const pricing = IMAGE_PRICING[model];
  const inputCost = pricing
    ? (inputTokens / 1_000_000) * pricing.inputPerMillion
    : 0;
  const outputCost = pricing
    ? (outputTokens / 1_000_000) * pricing.outputPerMillion
    : 0;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    model,
    cost: {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    },
  };
}
