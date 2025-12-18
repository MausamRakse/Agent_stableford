/**
 * LangGraph workflow for stock analysis
 * Creates a stateful graph-based workflow
 */

import { StateGraph, END } from '@langchain/langgraph';
import { createGeminiModel, invokeWithRetry, parseJsonResponse, formatPrompt } from './gemini-client.js';
import { SYSTEM_PROMPT, ANALYSIS_PROMPT, VALIDATION_PROMPT } from '../config/prompts.js';
import { validateInput, validateOutput, extractKeyMetrics } from '../utils/validators.js';

/**
 * Define the state structure for the workflow
 */
class AnalysisState {
  constructor() {
    this.inputData = null;
    this.validatedInput = false;
    this.keyMetrics = null;
    this.rawAnalysis = null;
    this.parsedReport = null;
    this.validatedReport = false;
    this.finalReport = null;
    this.errors = [];
    this.step = 'init';
  }
}

/**
 * Create LangGraph workflow for stock analysis
 */
export class StockAnalysisWorkflow {
  constructor() {
    this.model = createGeminiModel();
    this.graph = this.buildGraph();
  }

  /**
   * Build the analysis workflow graph
   */
  buildGraph() {
    // Create state graph with proper channel reducers
    const workflow = new StateGraph({
      channels: {
        inputData: (x, y) => y ?? x,
        validatedInput: (x, y) => y ?? x,
        keyMetrics: (x, y) => y ?? x,
        rawAnalysis: (x, y) => y ?? x,
        parsedReport: (x, y) => y ?? x,
        validatedReport: (x, y) => y ?? x,
        finalReport: (x, y) => y ?? x,
        errors: (x, y) => [...(x || []), ...(y || [])],
        step: (x, y) => y ?? x
      }
    });

    // Node 1: Input Validation
    workflow.addNode('validate_input', async (state) => {
      console.log('🔍 Node 1: Validating input...');
      
      const validation = validateInput(state.inputData);
      
      if (!validation.success) {
        return {
          ...state,
          validatedInput: false,
          errors: [...state.errors, ...validation.errors],
          step: 'error'
        };
      }
      
      return {
        ...state,
        validatedInput: true,
        step: 'extract_metrics'
      };
    });

    // Node 2: Extract Key Metrics
    workflow.addNode('extract_metrics', async (state) => {
      console.log('📊 Node 2: Extracting key metrics...');
      
      const metrics = extractKeyMetrics(state.inputData);
      
      return {
        ...state,
        keyMetrics: metrics,
        step: 'generate_analysis'
      };
    });

    // Node 3: Generate Analysis
    workflow.addNode('generate_analysis', async (state) => {
      console.log('🤖 Node 3: Generating analysis with Gemini...');
      
      try {
        const analysisPrompt = formatPrompt(ANALYSIS_PROMPT, {
          input_data: JSON.stringify(state.inputData, null, 2)
        });
        
        const fullPrompt = `${SYSTEM_PROMPT}\n\n${analysisPrompt}`;
        const response = await invokeWithRetry(this.model, fullPrompt);
        
        return {
          ...state,
          rawAnalysis: response,
          step: 'parse_response'
        };
      } catch (error) {
        return {
          ...state,
          errors: [...state.errors, error.message],
          step: 'error'
        };
      }
    });

    // Node 4: Parse Response
    workflow.addNode('parse_response', async (state) => {
      console.log('📝 Node 4: Parsing response...');
      
      try {
        const parsed = parseJsonResponse(state.rawAnalysis);
        
        return {
          ...state,
          parsedReport: parsed,
          step: 'validate_output'
        };
      } catch (error) {
        return {
          ...state,
          errors: [...state.errors, `Parse error: ${error.message}`],
          step: 'error'
        };
      }
    });

    // Node 5: Validate Output
    workflow.addNode('validate_output', async (state) => {
      console.log('✅ Node 5: Validating output...');
      
      const validation = validateOutput(state.parsedReport);
      
      if (!validation.success) {
        console.warn('⚠️  Output validation warnings:', validation.errors);
      }
      
      return {
        ...state,
        validatedReport: validation.success,
        step: 'enrich_report'
      };
    });

    // Node 6: Enrich Report
    workflow.addNode('enrich_report', async (state) => {
      console.log('✨ Node 6: Enriching report...');
      
      const enriched = {
        ...state.parsedReport,
        metadata: {
          stockSymbol: state.inputData.stock.symbol,
          stockName: state.inputData.stock.name,
          analysisDate: new Date().toISOString(),
          asOfDate: state.inputData.stock.asOf,
          keyMetrics: state.keyMetrics,
          modelUsed: this.model.modelName || 'gemini-1.5-pro',
          version: '1.0.0'
        }
      };
      
      return {
        ...state,
        finalReport: enriched,
        step: 'complete'
      };
    });

    // Node 7: Error Handler
    workflow.addNode('error', async (state) => {
      console.error('❌ Workflow error:', state.errors);
      
      return {
        ...state,
        finalReport: {
          error: true,
          errors: state.errors,
          message: 'Analysis failed'
        },
        step: 'complete'
      };
    });

    // Define edges (workflow flow)
    workflow.setEntryPoint('validate_input');
    
    workflow.addConditionalEdges(
      'validate_input',
      (state) => state.validatedInput ? 'extract_metrics' : 'error'
    );
    
    workflow.addEdge('extract_metrics', 'generate_analysis');
    workflow.addEdge('generate_analysis', 'parse_response');
    workflow.addEdge('parse_response', 'validate_output');
    workflow.addEdge('validate_output', 'enrich_report');
    workflow.addEdge('enrich_report', END);
    workflow.addEdge('error', END);

    return workflow.compile();
  }

  /**
   * Execute workflow with input data
   * @param {Object} inputData - Stock data
   * @returns {Promise<Object>} - Final report
   */
  async execute(inputData) {
    console.log('🚀 Starting LangGraph workflow execution...\n');
    
    const initialState = {
      inputData,
      validatedInput: false,
      keyMetrics: null,
      rawAnalysis: null,
      parsedReport: null,
      validatedReport: false,
      finalReport: null,
      errors: [],
      step: 'init'
    };

    try {
      const result = await this.graph.invoke(initialState);
      
      console.log('\n✅ Workflow completed successfully!\n');
      
      return result.finalReport;
    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      throw error;
    }
  }
}

