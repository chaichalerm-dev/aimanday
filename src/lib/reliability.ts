import type { EstimationResult } from './analyzer';

export type ReliabilityLevel = 'high' | 'medium' | 'low';

export interface ReliabilityScore {
  score: number;        // 0–100
  level: ReliabilityLevel;
  assumptionPenalty: number;
  rangePenalty: number;
  detailBonus: number;
}

export function calculateReliability(result: {
  sow: unknown[];
  manday_estimate: { min: number; max: number };
  modules: { manday: number }[];
  assumptions: unknown[];
}): ReliabilityScore {
  // Penalty: each assumption = an unknown requirement
  const assumptionPenalty = Math.min(result.assumptions.length * 12, 42);

  // Penalty: wide manday range = uncertain estimate
  const spread = result.manday_estimate.max - result.manday_estimate.min;
  const spreadRatio = result.manday_estimate.min > 0 ? spread / result.manday_estimate.min : 0;
  const rangePenalty = spreadRatio > 1.0 ? 20 : spreadRatio > 0.5 ? 10 : 0;

  // Bonus: detailed breakdown → more thorough analysis
  const detailBonus = (result.modules.length >= 5 ? 5 : 0) + (result.sow.length >= 5 ? 5 : 0);

  const score = Math.round(
    Math.max(5, Math.min(100, 100 - assumptionPenalty - rangePenalty + detailBonus)),
  );

  const level: ReliabilityLevel = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

  return { score, level, assumptionPenalty, rangePenalty, detailBonus };
}
