/**
 * Example usage of the Stock Analysis Agent
 */

import { StockAnalyzer, StockAnalysisWorkflow } from './index.js';
import { writeJsonFile } from './utils/file-handler.js';

// Example stock data
const exampleStockData = {
  "stock": {
    "symbol": "TBD",
    "name": "TBD",
    "asOf": "2025-06-25",
    "overallResult": "pass"
  },
  "quantitative": {
    "fundamentalResilience": {
      "overall": "pass",
      "metrics": [
        { "name": "Free Cash Flow Yield", "value": 3, "threshold": "> 2%", "pass": true },
        { "name": "Net Debt/EBITDA", "value": 4, "threshold": "< 2.5x", "pass": false },
        { "name": "Return on Invested Capital", "value": 11, "threshold": "> 10%", "pass": true },
        { "name": "Revenue Growth (5Y CAGR)", "value": 3.5, "threshold": "> 5%", "pass": false }
      ]
    },
    "asymmetricRiskReward": {
      "overall": "fail",
      "metrics": [
        { "name": "Forward P/E vs Sector", "value": "Above", "threshold": "Below Sector Median", "pass": false },
        { "name": "Operating Leverage Trend", "value": "Negative", "threshold": "Expanding", "pass": false },
        { "name": "Insider Ownership/Buying", "value": "Significant", "threshold": "Significant or Increasing", "pass": true }
      ]
    },
    "technicalConfirmation": {
      "overall": "mixed",
      "metrics": [
        { "name": "Above 200-day Moving Average", "value": "Yes", "threshold": "Yes", "pass": true },
        { "name": "Relative Strength vs Sector", "value": "Negative", "threshold": "Positive", "pass": false },
        { "name": "Accumulation/Distribution Indicator", "value": "Positive", "threshold": "Neutral to Positive", "pass": true }
      ]
    },
    "riskSensitivityAlignment": {
      "overall": "mixed",
      "signals": [
        { "name": "Free Cash Flow Yield", "pass": true },
        { "name": "Net Debt/EBITDA", "pass": false },
        { "name": "Return on Invested Capital", "pass": true },
        { "name": "Revenue Growth (5Y CAGR)", "pass": false },
        { "name": "Forward P/E vs Sector", "pass": false },
        { "name": "Operating Leverage Trend", "pass": false },
        { "name": "Insider Ownership/Buying", "pass": true },
        { "name": "Above 200-day Moving Average", "pass": true },
        { "name": "Relative Strength vs Sector", "pass": false },
        { "name": "Accumulation/Distribution Indicator", "pass": true }
      ]
    }
  },
  "sis": {
    "overall": 3.8,
    "stocks": [
      {
        "symbol": "JD",
        "name": "JD.com, Inc.",
        "sisScore": 2.8,
        "metrics": [
          { "name": "Valuation", "actual": 50, "threshold": "30-60", "points": 2, "result": "Neutral", "weightedScore": 0.4 },
          { "name": "Earnings Quality", "actual": 90, "threshold": ">60", "points": 3, "result": "Pass", "weightedScore": 0.4 },
          { "name": "Momentum Score", "actual": 46, "threshold": "20-60", "points": 3, "result": "Pass", "weightedScore": 0.6 },
          { "name": "Max Drawdown", "actual": "37%", "threshold": ">35%", "points": 1, "result": "Fail", "weightedScore": 0.2 },
          { "name": "Liquidity Score", "actual": 60, "threshold": "50-60", "points": 2, "result": "Neutral", "weightedScore": 0.4 },
          { "name": "Compounding Score", "actual": 80, "threshold": ">60", "points": 3, "result": "Pass", "weightedScore": 0.6 }
        ]
      },
      {
        "symbol": "ETSY",
        "name": "Etsy, Inc.",
        "sisScore": 2.6,
        "metrics": [
          { "name": "Valuation", "actual": 90, "threshold": ">80", "points": 3, "result": "Pass", "weightedScore": 0.6 },
          { "name": "Earnings Quality", "actual": 20, "threshold": "<30", "points": 1, "result": "Fail", "weightedScore": 0.2 },
          { "name": "Momentum Score", "actual": 10, "threshold": "<10", "points": 3, "result": "Pass", "weightedScore": 0.6 },
          { "name": "Max Drawdown", "actual": "5%", "threshold": "<10%", "points": 3, "result": "Pass", "weightedScore": 0.6 },
          { "name": "Liquidity Score", "actual": 25, "threshold": "20-30", "points": 2, "result": "Neutral", "weightedScore": 0.4 },
          { "name": "Compounding Score", "actual": 50, "threshold": "30-60", "points": 2, "result": "Neutral", "weightedScore": 0.4 }
        ]
      }
    ]
  },
  "ssis": {
    "overall": 3.8,
    "peers": [
      {
        "symbol": "JD",
        "name": "JD.com, Inc.",
        "overallScore": 2.8,
        "metrics": [
          { "name": "Valuation", "actual": 50, "thresholdRange": "30-60", "points": 2, "result": "Neutral", "weightedScore": 0.4 },
          { "name": "Earnings Quality", "actual": 90, "thresholdRange": ">60", "points": 3, "result": "Pass", "weightedScore": 0.4 },
          { "name": "Momentum Score", "actual": 46, "thresholdRange": "20-60", "points": 3, "result": "Pass", "weightedScore": 0.6 },
          { "name": "Max Drawdown", "actual": "37%", "thresholdRange": ">35%", "points": 1, "result": "Fail", "weightedScore": 0.2 },
          { "name": "Liquidity Score", "actual": 60, "thresholdRange": "50-60", "points": 2, "result": "Neutral", "weightedScore": 0.4 },
          { "name": "Compounding Score", "actual": 80, "thresholdRange": ">60", "points": 3, "result": "Pass", "weightedScore": 0.6 }
        ]
      },
      {
        "symbol": "ETSY",
        "name": "Etsy, Inc.",
        "overallScore": 2.6,
        "metrics": [
          { "name": "Valuation", "actual": 90, "thresholdRange": ">80", "points": 3, "result": "Pass", "weightedScore": 0.6 },
          { "name": "Earnings Quality", "actual": 20, "thresholdRange": "<30", "points": 1, "result": "Fail", "weightedScore": 0.2 },
          { "name": "Momentum Score", "actual": 10, "thresholdRange": "<10", "points": 3, "result": "Pass", "weightedScore": 0.6 },
          { "name": "Max Drawdown", "actual": "5%", "thresholdRange": "<10%", "points": 3, "result": "Pass", "weightedScore": 0.6 },
          { "name": "Liquidity Score", "actual": 25, "thresholdRange": "20-30", "points": 2, "result": "Neutral", "weightedScore": 0.4 },
          { "name": "Compounding Score", "actual": 50, "thresholdRange": "30-60", "points": 2, "result": "Neutral", "weightedScore": 0.4 }
        ]
      }
    ]
  },
  "qualitative": {
    "overallRating": 4.5,
    "criteria": [
      { "name": "Investment Process", "score": 4, "notes": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout..." },
      { "name": "Valuation Approach", "score": 4, "notes": null },
      { "name": "Catalyst Recognition", "score": 3, "notes": null }
    ]
  },
  "peerComparison": {
    "baseSymbol": "TBD",
    "peers": [
      {
        "name": "Advanced Micro Device Inc.",
        "symbol": "AMD",
        "metrics": {
          "P/E": "31.1",
          "EV/EBITDA": "27.1",
          "EPS 3Y CAGR": "26.7%",
          "ROE": "51.2%",
          "Net Margin": "48.1%",
          "Beta": "1.7",
          "Max Drawdown": "-29.5%",
          "RSI": "54.6",
          "50-DMA": "2.3%"
        }
      },
      {
        "name": "Intel Corporation",
        "symbol": "INTC",
        "metrics": {
          "P/E": "24.4",
          "EV/EBITDA": "24.4",
          "EPS 3Y CAGR": "15.4%",
          "ROE": "4.1%",
          "Net Margin": "7.4%",
          "Beta": "1.6",
          "Max Drawdown": "-37.5%",
          "RSI": "57.3",
          "50-DMA": "4.5%"
        }
      },
      {
        "name": "Broadcom Inc.",
        "symbol": "AVGO",
        "metrics": {
          "P/E": "20.4",
          "EV/EBITDA": "15.8",
          "EPS 3Y CAGR": "7.3%",
          "ROE": "3.6%",
          "Net Margin": "10.6%",
          "Beta": "0.9",
          "Max Drawdown": "-23.6%",
          "RSI": "52.2",
          "50-DMA": "-0.9%"
        }
      }
    ]
  }
};

/**
 * Run example analysis
 */
async function runExample() {
  console.log('\n' + '='.repeat(70));
  console.log('📈 STOCK ANALYSIS AGENT - EXAMPLE');
  console.log('='.repeat(70) + '\n');

  try {
    // Example 1: Using Simple Analyzer
    console.log('Example 1: Using StockAnalyzer (Simple Mode)\n');
    console.log('-'.repeat(70) + '\n');
    
    const analyzer = new StockAnalyzer();
    const simpleResult = await analyzer.analyze(exampleStockData);
    
    await writeJsonFile('example-output-simple.json', simpleResult);
    
    console.log('\n' + '-'.repeat(70) + '\n');

    // Example 2: Using LangGraph Workflow
    console.log('Example 2: Using LangGraph Workflow (Advanced Mode)\n');
    console.log('-'.repeat(70) + '\n');
    
    const workflow = new StockAnalysisWorkflow();
    const workflowResult = await workflow.execute(exampleStockData);
    
    await writeJsonFile('example-output-workflow.json', workflowResult);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Examples completed successfully!');
    console.log('='.repeat(70) + '\n');
    
    console.log('Output files created:');
    console.log('  - example-output-simple.json');
    console.log('  - example-output-workflow.json\n');

  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
    console.error('\nMake sure you have:');
    console.error('1. Created a .env file with your GOOGLE_API_KEY');
    console.error('2. Installed dependencies: npm install');
    console.error('3. Valid Google Gemini API access\n');
    process.exit(1);
  }
}

// Run example
runExample();

