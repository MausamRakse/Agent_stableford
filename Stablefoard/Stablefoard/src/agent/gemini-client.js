/**
 * Google Gemini API client integration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config/settings.js';

/**
 * Create and configure Gemini LLM instance
 * @returns {Object} - Configured Gemini model
 */
export function createGeminiModel() {
  if (!CONFIG.googleApiKey) {
    throw new Error('Google API key is not configured. Please set GOOGLE_API_KEY in your .env file.');
  }

  const genAI = new GoogleGenerativeAI(CONFIG.googleApiKey);
  return genAI.getGenerativeModel({ 
    model: CONFIG.geminiModel,
    generationConfig: {
      temperature: CONFIG.temperature,
      maxOutputTokens: CONFIG.maxOutputTokens,
      topP: CONFIG.topP,
      topK: CONFIG.topK,
    }
  });
}

/**
 * Invoke Gemini model with retry logic
 * @param {Object} model - Gemini model instance
 * @param {string} prompt - Prompt to send
 * @param {number} retries - Number of retries on failure
 * @returns {Promise<string>} - Model response
 */
export async function invokeWithRetry(model, prompt, retries = CONFIG.maxRetries) {
  // In mock mode we bypass the API entirely and return a fixed JSON
  // string that matches the expected output schema. This lets you run
  // and test the software (including the frontend) without consuming
  // Gemini quota or even having network access.
  if (CONFIG.mockMode) {
    return JSON.stringify({
      overallScore: 70,
      recommendation: "Watchlist",
      financialHealth: "The company exhibits a mixed financial health profile. Strengths include a Free Cash Flow Yield of 3%, which surpasses the >2% threshold, and a Return on Invested Capital (ROIC) of 11%, exceeding the >10% benchmark, both indicating efficient capital utilization and cash generation. However, a significant weakness is the Net Debt/EBITDA ratio of 4x, which is considerably above the <2.5x threshold, suggesting elevated leverage and potential financial risk. Additionally, the 5-year Revenue Growth CAGR of 3.5% falls short of the >5% target, indicating slower top-line expansion. The Risk Sensitivity Alignment signals confirm these mixed results, with FCF Yield and ROIC passing, while Net Debt/EBITDA and Revenue Growth fail.",
      valuation: "The stock appears to be overvalued relative to its sector, as indicated by its Forward P/E being 'Above' the sector median, failing the 'Below Sector Median' threshold. While specific P/E and EV/EBITDA figures for TBD are not provided, a comparison with peers reveals a range: Broadcom (AVGO) has a P/E of 20.4 and EV/EBITDA of 15.8, Intel (INTC) stands at P/E 24.4 and EV/EBITDA 24.4, and Advanced Micro Device (AMD) at P/E 31.1 and EV/EBITDA 27.1. Given TBD's 'Above Sector' P/E, it suggests the stock is trading at a premium compared to many of its peers, implying it is likely overvalued at current levels.",
      futureGrowth: "Future growth prospects appear challenged. The 5-year Revenue Growth CAGR of 3.5% is below the 5% threshold, indicating a sluggish historical growth trajectory. Furthermore, the Operating Leverage Trend is 'Negative', failing the 'Expanding' threshold, which suggests that the company is not effectively translating revenue growth into disproportionately higher operating income, potentially due to rising costs or inefficiencies. When compared to peers, TBD's 3.5% revenue growth significantly lags the EPS 3Y CAGR of AMD (26.7%), INTC (15.4%), and AVGO (7.3%). While the SIS/SSIS data provides Compounding Scores for peers (JD at 80, ETSY at 50), TBD's specific compounding score is not available, but its own growth metrics point to limited organic expansion.",
      competitiveAdvantage: "The company exhibits mixed signals regarding its competitive advantage. A key strength is 'Significant' Insider Ownership/Buying, which passes its threshold, indicating strong alignment of management interests with shareholders and confidence in the company's future. However, the 'Negative' Relative Strength vs Sector, which fails the 'Positive' threshold, suggests the stock is underperforming its industry peers, potentially indicating a weakening competitive position or market perception. While direct performance metrics for TBD against peers are not provided, its significantly lower revenue growth (3.5% CAGR) compared to peers' EPS growth (e.g., AMD 26.7%, INTC 15.4%) further underscores a potential lag in market leadership or product innovation, challenging the presence of a strong, sustained competitive moat.",
      managementQuality: "Management quality appears strong, as evidenced by an overall qualitative rating of 4.5. The 'Investment Process' and 'Valuation Approach' criteria both received a score of 4, indicating robust strategic planning and financial assessment capabilities. The 'Catalyst Recognition' score of 3, while slightly lower, still suggests a reasonable ability to identify and capitalize on market opportunities. Furthermore, the 'Significant' Insider Ownership/Buying metric, which passed its threshold, reinforces confidence in management, as their personal financial interests are closely tied to the company's success, aligning them with shareholder value creation.",
      riskFactors: "Several risk factors warrant attention. Financial leverage is a concern, with Net Debt/EBITDA at 4x, significantly above the <2.5x threshold. Growth risks are highlighted by a 5-year Revenue Growth CAGR of 3.5% (below 5%) and a 'Negative' Operating Leverage Trend. Valuation risk is present as the Forward P/E is 'Above' the sector median. Technical risks include 'Negative' Relative Strength vs Sector. While TBD's specific Max Drawdown is not provided, peer data shows high drawdowns for JD (37%) and INTC (37.5%), indicating potential for significant price volatility. Beta values for peers range from 0.9 (AVGO) to 1.7 (AMD), suggesting that the sector can exhibit considerable market sensitivity, which could imply similar volatility for TBD.",
      technicalTrend: "The technical trend presents a mixed picture. Positively, the stock is 'Above' its 200-day Moving Average, which is a bullish indicator. The Accumulation/Distribution Indicator is also 'Positive', suggesting buying interest. However, a significant concern is the 'Negative' Relative Strength vs Sector, indicating underperformance compared to its industry. While specific RSI and 50-DMA trends for TBD are not available, peer data shows RSI levels in a neutral range (AMD 54.6, INTC 57.3, AVGO 52.2) and mixed 50-DMA trends (AMD +2.3%, INTC +4.5%, AVGO -0.9%). Momentum scores for peers JD (46) and ETSY (10) are positive, but TBD's specific momentum is not provided, leaving its overall short-term price action outlook somewhat ambiguous despite the positive MA and accumulation signals.",
      portfolioFit: "This stock is best suited for a balanced or quality-focused investor with a moderate to high-risk tolerance and a medium-to-long-term investment horizon. It is not ideal for pure growth investors due to its subdued revenue growth and negative operating leverage, nor for deep value investors given its 'Above Sector' P/E. Its strong Free Cash Flow Yield, Return on Invested Capital, and robust management quality suggest a company with underlying fundamental strength, which could appeal to investors seeking stable, albeit slower, compounding. However, the elevated debt levels and underperforming relative strength necessitate a careful assessment of its risk-adjusted return profile and a willingness to tolerate potential volatility.",
      timeHorizon: "A medium to long-term time horizon is recommended for this investment. The current challenges in revenue growth and elevated debt levels suggest that short-term catalysts for significant price appreciation may be limited, as indicated by a 'Catalyst Recognition' score of 3. However, the company's strong fundamental resilience, demonstrated by its Free Cash Flow Yield and Return on Invested Capital, coupled with high-quality management and significant insider ownership, provides a foundation for potential long-term value creation. Investors should be prepared to hold the stock for several years to allow management to address growth and leverage concerns and for the market to potentially re-rate the stock based on improved operational performance.",
      aiSummary: "TBD presents a complex investment profile with a blend of notable strengths and significant weaknesses. Key strengths include robust Free Cash Flow Yield (3%) and Return on Invested Capital (11%), strong qualitative management ratings (4.5 overall), and significant insider ownership, indicating sound operational efficiency and aligned leadership. Technically, it trades above its 200-day Moving Average with positive accumulation. However, the company faces critical challenges: high Net Debt/EBITDA (4x), sluggish 5-year Revenue Growth (3.5%), a negative Operating Leverage Trend, and a valuation that appears 'Above Sector' median. Its 'Negative' Relative Strength vs Sector also points to underperformance. The overall investment thesis suggests a fundamentally sound company with strong cash generation and management, but currently hampered by growth deceleration, elevated leverage, and a potentially stretched valuation. Critical decision factors for investors will revolve around management's ability to accelerate top-line growth and deleverage the balance sheet, while maintaining profitability. The mixed signals warrant a cautious approach, placing it on a 'Watchlist' rather than an immediate 'Buy'.",
      finalVerdict: "TBD is a fundamentally solid but currently imbalanced opportunity that merits Watchlist status rather than an outright Buy. Its strengths in free cash flow generation, return on invested capital, and management quality provide a robust foundation, yet these positives are tempered by elevated leverage, subpar revenue growth, negative operating leverage, and valuation above sector norms. Until the company demonstrates tangible progress in accelerating top-line growth, improving operating efficiency, and reducing debt, the risk-reward profile remains skewed toward caution rather than aggressive accumulation."
    });
  }

  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < retries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw new Error(`Failed after ${retries} attempts: ${lastError.message}`);
}

/**
 * Parse JSON response from model, handling markdown code blocks
 * @param {string} response - Raw response from model
 * @returns {Object} - Parsed JSON object
 */
export function parseJsonResponse(response) {
  let cleanedResponse = response.trim();
  
  // Remove markdown code blocks if present
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*\n/, '').replace(/\n```\s*$/, '');
  }
  
  // Try to extract JSON object if response contains other text
  const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanedResponse = jsonMatch[0];
  }
  
  // Try to fix common JSON issues
  try {
    // First, try parsing as-is
    return JSON.parse(cleanedResponse);
  } catch (error) {
    // Try to fix unterminated strings by finding the last complete JSON structure
    try {
      // Find the last complete closing brace
      let lastBrace = cleanedResponse.lastIndexOf('}');
      if (lastBrace > 0) {
        const truncated = cleanedResponse.substring(0, lastBrace + 1);
        // Try to complete any unterminated strings
        let fixed = truncated;
        // Count quotes to see if we have an unterminated string
        const quoteCount = (fixed.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          // Odd number of quotes, try to find and close the last string
          const lastQuote = fixed.lastIndexOf('"');
          if (lastQuote > 0 && fixed[lastQuote - 1] !== '\\') {
            // Check if this is likely an unterminated string
            const beforeQuote = fixed.substring(0, lastQuote);
            const quotePairs = (beforeQuote.match(/"/g) || []).length;
            if (quotePairs % 2 !== 0) {
              // This is an opening quote, close it
              fixed = fixed.substring(0, lastQuote + 1) + '"';
            }
          }
        }
        return JSON.parse(fixed);
      }
    } catch (e) {
      // If that fails, try to extract just the JSON object more carefully
      console.warn('Attempting to recover JSON by extracting object...');
    }
    
    console.error('Failed to parse JSON response. First 500 chars:', cleanedResponse.substring(0, 500));
    throw new Error(`Invalid JSON response from model: ${error.message}`);
  }
}

/**
 * Format prompt with data
 * @param {string} template - Prompt template
 * @param {Object} data - Data to insert
 * @returns {string} - Formatted prompt
 */
export function formatPrompt(template, data) {
  let formatted = template;
  
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    const replacement = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    formatted = formatted.replace(new RegExp(placeholder, 'g'), replacement);
  }
  
  return formatted;
}

