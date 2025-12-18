/**
 * Stock Analysis Agent - Core logic
 */

import { createGeminiModel, invokeWithRetry, parseJsonResponse, formatPrompt } from './gemini-client.js';
import { SYSTEM_PROMPT, ANALYSIS_PROMPT, VALIDATION_PROMPT } from '../config/prompts.js';
import { validateInput, validateOutput, extractKeyMetrics } from '../utils/validators.js';

/**
 * Stock Analysis Agent Class
 */
export class StockAnalyzer {
  constructor() {
    this.model = createGeminiModel();
    this.analysisHistory = [];
  }

  /**
   * Analyze stock data and generate report
   * @param {Object} inputData - Stock data in JSON format
   * @returns {Promise<Object>} - Analysis report
   */
  async analyze(inputData) {
    console.log('🔍 Starting stock analysis...\n');
    
    // Step 1: Validate input
    console.log('📊 Step 1: Validating input data...');
    const inputValidation = validateInput(inputData);
    
    if (!inputValidation.success) {
      throw new Error(`Input validation failed:\n${inputValidation.errors.join('\n')}`);
    }
    console.log('✅ Input validation passed\n');
    
    // Step 2: Extract key metrics
    console.log('📈 Step 2: Extracting key metrics...');
    const keyMetrics = extractKeyMetrics(inputData);
    console.log(`   - Total metrics: ${keyMetrics.totalMetrics}`);
    console.log(`   - Pass rate: ${keyMetrics.passRate}%`);
    console.log(`   - SIS Score: ${keyMetrics.sisScore}`);
    console.log(`   - SSIS Score: ${keyMetrics.ssisScore}`);
    console.log(`   - Qualitative Rating: ${keyMetrics.qualitativeRating}/5\n`);
    
    // Step 3: Generate analysis
    console.log('🤖 Step 3: Generating AI analysis...');
    const analysisPrompt = formatPrompt(ANALYSIS_PROMPT, {
      input_data: JSON.stringify(inputData, null, 2)
    });
    
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${analysisPrompt}`;
    const rawResponse = await invokeWithRetry(this.model, fullPrompt);
    console.log('✅ Analysis generated\n');
    
    // Step 4: Parse response
    console.log('📝 Step 4: Parsing response...');
    let report;
    try {
      report = parseJsonResponse(rawResponse);
    } catch (error) {
      console.error('Failed to parse response, attempting recovery...');
      throw new Error(`Failed to generate valid JSON report: ${error.message}`);
    }
    console.log('✅ Response parsed successfully\n');
    
    // Step 5: Validate output
    console.log('🔍 Step 5: Validating output...');
    const outputValidation = validateOutput(report);
    
    if (!outputValidation.success) {
      console.warn('⚠️  Output validation warnings:', outputValidation.errors);
      // Continue anyway but log warnings
    } else {
      console.log('✅ Output validation passed\n');
    }
    
    // Step 6: Enrich report with metadata
    console.log('✨ Step 6: Enriching report with metadata...');
    const enrichedReport = {
      ...report,
      metadata: {
        stockSymbol: inputData.stock.symbol,
        stockName: inputData.stock.name,
        analysisDate: new Date().toISOString(),
        asOfDate: inputData.stock.asOf,
        keyMetrics: keyMetrics,
        modelUsed: this.model.modelName || 'gemini-1.5-pro',
        version: '1.0.0'
      }
    };
    
    // Store in history
    this.analysisHistory.push({
      timestamp: new Date().toISOString(),
      symbol: inputData.stock.symbol,
      recommendation: report.recommendation,
      score: report.overallScore
    });
    
    console.log('✅ Analysis complete!\n');
    console.log(`📊 Overall Score: ${report.overallScore}/100`);
    console.log(`💡 Recommendation: ${report.recommendation}\n`);
    
    return enrichedReport;
  }

  /**
   * Batch analyze multiple stocks
   * @param {Array<Object>} stockDataArray - Array of stock data
   * @returns {Promise<Array<Object>>} - Array of analysis reports
   */
  async batchAnalyze(stockDataArray) {
    console.log(`\n🔄 Starting batch analysis for ${stockDataArray.length} stocks...\n`);
    
    const results = [];
    
    for (let i = 0; i < stockDataArray.length; i++) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing stock ${i + 1}/${stockDataArray.length}`);
      console.log(`${'='.repeat(60)}\n`);
      
      try {
        const result = await this.analyze(stockDataArray[i]);
        results.push({
          success: true,
          data: result
        });
      } catch (error) {
        console.error(`❌ Failed to analyze stock ${i + 1}:`, error.message);
        results.push({
          success: false,
          error: error.message,
          symbol: stockDataArray[i]?.stock?.symbol || 'Unknown'
        });
      }
    }
    
    console.log(`\n✅ Batch analysis complete: ${results.filter(r => r.success).length}/${stockDataArray.length} successful\n`);
    
    return results;
  }

  /**
   * Get analysis history
   * @returns {Array} - History of analyses
   */
  getHistory() {
    return this.analysisHistory;
  }

  /**
   * Generate summary statistics
   * @returns {Object} - Summary statistics
   */
  getSummaryStats() {
    if (this.analysisHistory.length === 0) {
      return { message: 'No analyses performed yet' };
    }

    const recommendations = this.analysisHistory.reduce((acc, item) => {
      acc[item.recommendation] = (acc[item.recommendation] || 0) + 1;
      return acc;
    }, {});

    const scores = this.analysisHistory.map(item => item.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      totalAnalyses: this.analysisHistory.length,
      averageScore: avgScore.toFixed(2),
      recommendations,
      latestAnalysis: this.analysisHistory[this.analysisHistory.length - 1]
    };
  }
}

