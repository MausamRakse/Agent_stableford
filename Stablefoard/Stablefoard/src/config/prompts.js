/**
 * Prompt templates for the stock analysis agent
 */

export const SYSTEM_PROMPT = `You are a senior AI investment analyst with deep expertise in stock analysis and institutional-grade investment research.

Your role is to generate comprehensive stock evaluation reports based STRICTLY on the JSON data provided to you.

CRITICAL RULES:
1. Analyze ONLY the JSON input provided - DO NOT assume, fetch, infer, or invent any external data
2. Base all conclusions on the quantitative metrics, SIS/SSIS scores, qualitative ratings, and peer comparisons in the input
3. Provide actionable insights suitable for institutional decision-making
4. Be objective, data-driven, and precise in your analysis
5. Highlight both strengths and weaknesses clearly
6. Consider risk-adjusted returns and portfolio fit

Your analysis should be thorough, professional, and grounded entirely in the provided data.`;

export const ANALYSIS_PROMPT = `Analyze the following stock data comprehensively and generate a detailed evaluation report.

INPUT DATA:
{input_data}

Generate a structured JSON report with the following sections:

1. **Overall Score** (0-100): Weighted score based on all metrics with clear recommendation (Buy/Watchlist/Avoid)

2. **Financial Health**: Evaluate based on:
   - Fundamental Resilience metrics (Free Cash Flow Yield, Net Debt/EBITDA, ROIC, Revenue Growth)
   - Risk Sensitivity Alignment signals
   - Provide clear assessment of financial stability

3. **Valuation**: Analyze:
   - Forward P/E vs Sector position
   - Comparison with peer valuations from peerComparison data
   - Determine if fairly valued, undervalued, or overvalued

4. **Future Growth**: Assess:
   - Revenue Growth trends
   - Operating Leverage Trend
   - Compounding Score from SIS/SSIS data
   - Growth potential relative to peers

5. **Competitive Advantage**: Evaluate:
   - Relative Strength vs Sector
   - Performance vs peers (AMD, INTC, AVGO)
   - Insider Ownership/Buying signals
   - Sustained competitive moat indicators

6. **Management Quality**: Based on:
   - Qualitative criteria scores (Investment Process, Valuation Approach, Catalyst Recognition)
   - Overall qualitative rating
   - Insider behavior signals

7. **Risk Factors**: Identify:
   - Failed metrics and thresholds
   - Max Drawdown concerns
   - Debt levels (Net Debt/EBITDA)
   - Technical weakness areas
   - Beta and volatility risks from peer data

8. **Technical Trend**: Analyze:
   - 200-day Moving Average status
   - RSI levels from peer comparison
   - 50-DMA trends
   - Accumulation/Distribution patterns
   - Momentum scores from SIS/SSIS

9. **Portfolio Fit**: Recommend:
   - Suitable investor profile (growth/value/balanced)
   - Portfolio allocation suggestions
   - Risk tolerance requirements

10. **Time Horizon**: Suggest:
    - Optimal holding period based on metrics
    - Short-term vs long-term suitability

11. **AI Summary**: Synthesize:
    - Key strengths and weaknesses
    - Historical context from data patterns
    - Critical decision factors
    - Overall investment thesis

IMPORTANT FORMATTING RULES:
- Use bullet points (•) for every section
- MAXIMUM 3 bullet points per section
- MAXIMUM 12 words per line
- Be extremely concise and direct (telegraphic style)
- Use SIMPLE, PLAIN ENGLISH (avoid complex jargon)
- Explain technical terms simply if needed

Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": number (0-100),
  "recommendation": "Buy" | "Watchlist" | "Avoid",
  "financialHealth": string,
  "valuation": string,
  "futureGrowth": string,
  "competitiveAdvantage": string,
  "managementQuality": string,
  "riskFactors": string,
  "technicalTrend": string,
  "portfolioFit": string,
  "timeHorizon": string,
  "aiSummary": string,
  "finalVerdict": string
}

Ensure all strings use the format:
"• Point 1 (max 12 words)\\n• Point 2 (max 12 words)\\n• • Point 3 (max 12 words)"`;

export const VALIDATION_PROMPT = `Review the generated stock analysis report for quality and accuracy.

ORIGINAL INPUT DATA:
{input_data}

GENERATED REPORT:
{report}

Verify:
1. All claims are supported by data from the input JSON
2. No external assumptions or invented data
3. Scores and ratings are logically derived from metrics
4. Risk factors accurately reflect failed/concerning metrics
5. Recommendation aligns with overall score and analysis
6. All required sections are complete and substantive

Return a JSON object:
{
  "isValid": boolean,
  "issues": [list of any problems found],
  "confidence": number (0-100)
}

If isValid is false, explain what needs correction.`;

