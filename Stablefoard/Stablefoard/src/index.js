/**
 * Stock Analysis Agent - Main Entry Point
 * 
 * An AI-powered stock analysis agent using Google Gemini, LangChain, and LangGraph
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { StockAnalyzer } from './agent/stock-analyzer.js';
import { StockAnalysisWorkflow } from './agent/langgraph-workflow.js';
import { validateConfig } from './config/settings.js';

/**
 * Main function to run the stock analysis agent
 */
async function main() {
  try {
    // Validate configuration
    console.log('⚙️  Validating configuration...\n');
    validateConfig();
    console.log('✅ Configuration valid\n');

    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Usage: node src/index.js <input-file.json> [output-file.json] [--workflow]');
      console.log('\nOptions:');
      console.log('  --workflow    Use LangGraph workflow (default: simple analyzer)');
      console.log('\nExample:');
      console.log('  node src/index.js input.json output.json');
      console.log('  node src/index.js input.json output.json --workflow');
      process.exit(0);
    }

    const inputFile = args[0];
    const outputFile = args[1] || 'output.json';
    const useWorkflow = args.includes('--workflow');

    // Read input file
    console.log(`📂 Reading input file: ${inputFile}\n`);
    const inputData = JSON.parse(await fs.readFile(inputFile, 'utf-8'));

    // Choose analyzer
    let result;
    
    if (useWorkflow) {
      console.log('🔄 Using LangGraph workflow mode\n');
      const workflow = new StockAnalysisWorkflow();
      result = await workflow.execute(inputData);
    } else {
      console.log('⚡ Using simple analyzer mode\n');
      const analyzer = new StockAnalyzer();
      result = await analyzer.analyze(inputData);
    }

    // Write output file
    console.log(`💾 Writing output to: ${outputFile}\n`);
    await fs.writeFile(outputFile, JSON.stringify(result, null, 2));

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Stock: ${result.metadata?.stockName || 'N/A'} (${result.metadata?.stockSymbol || 'N/A'})`);
    console.log(`Overall Score: ${result.overallScore}/100`);
    console.log(`Recommendation: ${result.recommendation}`);
    console.log(`\n📄 Full report saved to: ${outputFile}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

/**
 * Export for programmatic use
 */
export { StockAnalyzer, StockAnalysisWorkflow };

/**
 * Run if executed directly
 */
const __filename = fileURLToPath(import.meta.url);
const currentFile = path.resolve(__filename);
const executedFile = path.resolve(process.argv[1]);

// Check if this file is being run directly
if (currentFile === executedFile) {
  main();
}

