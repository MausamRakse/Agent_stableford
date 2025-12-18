/**
 * API Usage Examples
 * Demonstrates different ways to use the Stock Analysis Agent
 */

import { StockAnalyzer, StockAnalysisWorkflow } from '../src/index.js';
import { readJsonFile, writeJsonFile } from '../src/utils/file-handler.js';

// =============================================================================
// Example 1: Basic Single Stock Analysis
// =============================================================================

async function example1_basicAnalysis() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 1: Basic Single Stock Analysis');
  console.log('='.repeat(60) + '\n');

  const stockData = await readJsonFile('../input-example.json');
  
  const analyzer = new StockAnalyzer();
  const report = await analyzer.analyze(stockData);
  
  console.log(`Stock: ${report.metadata.stockName}`);
  console.log(`Score: ${report.overallScore}/100`);
  console.log(`Recommendation: ${report.recommendation}`);
  console.log(`\nFinal Verdict: ${report.finalVerdict.substring(0, 100)}...`);
  
  await writeJsonFile('example1-output.json', report);
}

// =============================================================================
// Example 2: Batch Analysis of Multiple Stocks
// =============================================================================

async function example2_batchAnalysis() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 2: Batch Analysis');
  console.log('='.repeat(60) + '\n');

  const analyzer = new StockAnalyzer();
  
  // Load multiple stock data files
  const stockData1 = await readJsonFile('../input-example.json');
  const stockData2 = JSON.parse(JSON.stringify(stockData1)); // Clone for demo
  const stockData3 = JSON.parse(JSON.stringify(stockData1)); // Clone for demo
  
  // Modify for variety
  stockData2.stock.symbol = 'DEMO2';
  stockData3.stock.symbol = 'DEMO3';
  
  const stocks = [stockData1, stockData2, stockData3];
  
  console.log(`Analyzing ${stocks.length} stocks...\n`);
  
  const results = await analyzer.batchAnalyze(stocks);
  
  // Display summary
  console.log('\nBatch Analysis Summary:');
  console.log('-'.repeat(60));
  
  results.forEach((result, index) => {
    if (result.success) {
      const { overallScore, recommendation, metadata } = result.data;
      console.log(`${index + 1}. ${metadata.stockSymbol}: ${recommendation} (${overallScore}/100)`);
    } else {
      console.log(`${index + 1}. Failed: ${result.error}`);
    }
  });
  
  // Get summary statistics
  const stats = analyzer.getSummaryStats();
  console.log('\nOverall Statistics:');
  console.log(`- Total Analyses: ${stats.totalAnalyses}`);
  console.log(`- Average Score: ${stats.averageScore}`);
  console.log(`- Recommendations:`, stats.recommendations);
}

// =============================================================================
// Example 3: LangGraph Workflow Mode
// =============================================================================

async function example3_workflowMode() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 3: LangGraph Workflow Mode');
  console.log('='.repeat(60) + '\n');

  const stockData = await readJsonFile('../input-example.json');
  
  const workflow = new StockAnalysisWorkflow();
  const report = await workflow.execute(stockData);
  
  console.log(`Stock: ${report.metadata.stockName}`);
  console.log(`Score: ${report.overallScore}/100`);
  console.log(`Recommendation: ${report.recommendation}`);
  
  await writeJsonFile('example3-output.json', report);
}

// =============================================================================
// Example 4: Custom Analysis with Filtering
// =============================================================================

async function example4_customFiltering() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 4: Custom Filtering');
  console.log('='.repeat(60) + '\n');

  const analyzer = new StockAnalyzer();
  
  // Analyze multiple stocks
  const stockData = await readJsonFile('../input-example.json');
  
  const stocks = [];
  for (let i = 0; i < 5; i++) {
    const stock = JSON.parse(JSON.stringify(stockData));
    stock.stock.symbol = `STOCK${i + 1}`;
    stocks.push(stock);
  }
  
  const results = await analyzer.batchAnalyze(stocks);
  
  // Filter for "Buy" recommendations only
  const buyRecommendations = results.filter(r => 
    r.success && r.data.recommendation === 'Buy'
  );
  
  console.log(`Found ${buyRecommendations.length} BUY recommendations:\n`);
  
  buyRecommendations.forEach((result, index) => {
    const { overallScore, metadata } = result.data;
    console.log(`${index + 1}. ${metadata.stockSymbol} - Score: ${overallScore}/100`);
  });
  
  // Filter for high scores (>75)
  const highScores = results.filter(r => 
    r.success && r.data.overallScore > 75
  );
  
  console.log(`\nFound ${highScores.length} high-scoring stocks (>75):\n`);
  
  highScores.forEach((result, index) => {
    const { overallScore, recommendation, metadata } = result.data;
    console.log(`${index + 1}. ${metadata.stockSymbol} - ${overallScore}/100 (${recommendation})`);
  });
}

// =============================================================================
// Example 5: Extract Specific Insights
// =============================================================================

async function example5_extractInsights() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 5: Extract Specific Insights');
  console.log('='.repeat(60) + '\n');

  const stockData = await readJsonFile('../input-example.json');
  const analyzer = new StockAnalyzer();
  const report = await analyzer.analyze(stockData);
  
  // Extract key insights
  console.log('📊 Key Insights:\n');
  
  console.log('1. Financial Health:');
  console.log('  ', report.financialHealth.substring(0, 150) + '...\n');
  
  console.log('2. Risk Factors:');
  console.log('  ', report.riskFactors.substring(0, 150) + '...\n');
  
  console.log('3. Growth Potential:');
  console.log('  ', report.futureGrowth.substring(0, 150) + '...\n');
  
  console.log('4. Investment Horizon:');
  console.log('  ', report.timeHorizon.substring(0, 150) + '...\n');
  
  // Key metrics from metadata
  const { keyMetrics } = report.metadata;
  console.log('5. Key Metrics Summary:');
  console.log(`   - Pass Rate: ${keyMetrics.passRate}%`);
  console.log(`   - SIS Score: ${keyMetrics.sisScore}`);
  console.log(`   - Qualitative Rating: ${keyMetrics.qualitativeRating}/5`);
  console.log(`   - Failed Metrics: ${keyMetrics.failedCount}/${keyMetrics.totalMetrics}`);
}

// =============================================================================
// Example 6: Comparative Analysis
// =============================================================================

async function example6_comparativeAnalysis() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 6: Comparative Analysis');
  console.log('='.repeat(60) + '\n');

  const analyzer = new StockAnalyzer();
  const stockData = await readJsonFile('../input-example.json');
  
  // Create variations for comparison
  const stock1 = JSON.parse(JSON.stringify(stockData));
  stock1.stock.symbol = 'TECH1';
  stock1.stock.name = 'Tech Company 1';
  
  const stock2 = JSON.parse(JSON.stringify(stockData));
  stock2.stock.symbol = 'TECH2';
  stock2.stock.name = 'Tech Company 2';
  
  const results = await analyzer.batchAnalyze([stock1, stock2]);
  
  console.log('Comparative Analysis:\n');
  console.log('-'.repeat(60));
  console.log('| Metric                | TECH1          | TECH2          |');
  console.log('-'.repeat(60));
  
  if (results[0].success && results[1].success) {
    const r1 = results[0].data;
    const r2 = results[1].data;
    
    console.log(`| Overall Score        | ${r1.overallScore}/100        | ${r2.overallScore}/100        |`);
    console.log(`| Recommendation       | ${r1.recommendation.padEnd(14)} | ${r2.recommendation.padEnd(14)} |`);
    console.log(`| SIS Score            | ${r1.metadata.keyMetrics.sisScore.toFixed(1).padEnd(14)} | ${r2.metadata.keyMetrics.sisScore.toFixed(1).padEnd(14)} |`);
    console.log(`| Pass Rate            | ${r1.metadata.keyMetrics.passRate}%          | ${r2.metadata.keyMetrics.passRate}%          |`);
    console.log('-'.repeat(60));
    
    // Determine winner
    const winner = r1.overallScore > r2.overallScore ? 'TECH1' : 'TECH2';
    console.log(`\n🏆 Best Choice: ${winner}`);
  }
}

// =============================================================================
// Example 7: Error Handling
// =============================================================================

async function example7_errorHandling() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 7: Error Handling');
  console.log('='.repeat(60) + '\n');

  const analyzer = new StockAnalyzer();
  
  // Example 1: Invalid input
  console.log('Test 1: Invalid input handling\n');
  try {
    const invalidData = { stock: { symbol: 'TEST' } }; // Missing required fields
    await analyzer.analyze(invalidData);
  } catch (error) {
    console.log('✅ Caught error:', error.message.substring(0, 80) + '...\n');
  }
  
  // Example 2: Batch with mixed results
  console.log('Test 2: Batch analysis with errors\n');
  
  const validData = await readJsonFile('../input-example.json');
  const invalidData = { stock: { symbol: 'BAD' } };
  
  const results = await analyzer.batchAnalyze([validData, invalidData, validData]);
  
  console.log('Results:');
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`  ${index + 1}. ✅ Success - ${result.data.metadata.stockSymbol}`);
    } else {
      console.log(`  ${index + 1}. ❌ Failed - ${result.error.substring(0, 50)}...`);
    }
  });
}

// =============================================================================
// Main Runner
// =============================================================================

async function runAllExamples() {
  console.log('\n' + '█'.repeat(60));
  console.log('  STOCK ANALYSIS AGENT - API USAGE EXAMPLES');
  console.log('█'.repeat(60));

  try {
    await example1_basicAnalysis();
    await example2_batchAnalysis();
    await example3_workflowMode();
    await example4_customFiltering();
    await example5_extractInsights();
    await example6_comparativeAnalysis();
    await example7_errorHandling();
    
    console.log('\n' + '█'.repeat(60));
    console.log('  ✅ ALL EXAMPLES COMPLETED SUCCESSFULLY!');
    console.log('█'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. You have created a .env file with GOOGLE_API_KEY');
    console.error('2. You have run: npm install');
    console.error('3. The input-example.json file exists\n');
  }
}

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

// Export for use in other scripts
export {
  example1_basicAnalysis,
  example2_batchAnalysis,
  example3_workflowMode,
  example4_customFiltering,
  example5_extractInsights,
  example6_comparativeAnalysis,
  example7_errorHandling
};

