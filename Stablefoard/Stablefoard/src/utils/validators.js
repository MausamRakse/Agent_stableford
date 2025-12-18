/**
 * Input validation utilities
 */

import { z } from 'zod';

// Define the schema for input validation
const MetricSchema = z.object({
  name: z.string(),
  value: z.union([z.number(), z.string()]).optional(),
  threshold: z.string().optional(),
  thresholdRange: z.string().optional(),
  pass: z.boolean().optional(),
  actual: z.union([z.number(), z.string()]).optional(),
  points: z.number().optional(),
  result: z.string().optional(),
  weightedScore: z.number().optional()
}).refine((data) => data.value !== undefined || data.actual !== undefined, {
  message: "Either 'value' or 'actual' must be provided"
});

const StockInputSchema = z.object({
  stock: z.object({
    symbol: z.string(),
    name: z.string(),
    asOf: z.string(),
    overallResult: z.string()
  }),
  quantitative: z.object({
    fundamentalResilience: z.object({
      overall: z.string(),
      metrics: z.array(MetricSchema)
    }),
    asymmetricRiskReward: z.object({
      overall: z.string(),
      metrics: z.array(MetricSchema)
    }),
    technicalConfirmation: z.object({
      overall: z.string(),
      metrics: z.array(MetricSchema)
    }),
    riskSensitivityAlignment: z.object({
      overall: z.string(),
      signals: z.array(z.object({
        name: z.string(),
        pass: z.boolean()
      }))
    })
  }),
  sis: z.object({
    overall: z.number(),
    stocks: z.array(z.object({
      symbol: z.string(),
      name: z.string(),
      sisScore: z.number(),
      metrics: z.array(MetricSchema)
    }))
  }),
  ssis: z.object({
    overall: z.number(),
    peers: z.array(z.object({
      symbol: z.string(),
      name: z.string(),
      overallScore: z.number(),
      metrics: z.array(MetricSchema)
    }))
  }),
  qualitative: z.object({
    overallRating: z.number(),
    criteria: z.array(z.object({
      name: z.string(),
      score: z.number(),
      notes: z.string().nullable()
    }))
  }),
  peerComparison: z.object({
    baseSymbol: z.string(),
    peers: z.array(z.object({
      name: z.string(),
      symbol: z.string(),
      metrics: z.record(z.string())
    }))
  })
});

// Output schema
const StockAnalysisOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  recommendation: z.enum(['Buy', 'Watchlist', 'Avoid']),
  financialHealth: z.string().min(50),
  valuation: z.string().min(50),
  futureGrowth: z.string().min(50),
  competitiveAdvantage: z.string().min(50),
  managementQuality: z.string().min(50),
  riskFactors: z.string().min(50),
  technicalTrend: z.string().min(50),
  portfolioFit: z.string().min(50),
  timeHorizon: z.string().min(50),
  aiSummary: z.string().min(100),
  finalVerdict: z.string().min(50)
});

/**
 * Validate input JSON data
 * @param {Object} data - Input data to validate
 * @returns {Object} - Validation result with success flag and errors
 */
export function validateInput(data) {
  try {
    StockInputSchema.parse(data);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: [error.message] };
  }
}

/**
 * Validate output JSON data
 * @param {Object} data - Output data to validate
 * @returns {Object} - Validation result
 */
export function validateOutput(data) {
  try {
    StockAnalysisOutputSchema.parse(data);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: [error.message] };
  }
}

/**
 * Extract key metrics for quick analysis
 * @param {Object} data - Input data
 * @returns {Object} - Summary of key metrics
 */
export function extractKeyMetrics(data) {
  const passedMetrics = [];
  const failedMetrics = [];
  
  // Analyze quantitative metrics
  const allMetrics = [
    ...data.quantitative.fundamentalResilience.metrics,
    ...data.quantitative.asymmetricRiskReward.metrics,
    ...data.quantitative.technicalConfirmation.metrics
  ];
  
  allMetrics.forEach(metric => {
    if (metric.pass === true) {
      passedMetrics.push(metric.name);
    } else if (metric.pass === false) {
      failedMetrics.push(metric.name);
    }
  });
  
  return {
    totalMetrics: allMetrics.length,
    passedCount: passedMetrics.length,
    failedCount: failedMetrics.length,
    passRate: (passedMetrics.length / allMetrics.length * 100).toFixed(1),
    sisScore: data.sis.overall,
    ssisScore: data.ssis.overall,
    qualitativeRating: data.qualitative.overallRating,
    passedMetrics,
    failedMetrics
  };
}

