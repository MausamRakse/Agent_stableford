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
        return { ...state, validatedInput: false, errors: [...state.errors, ...validation.errors], step: 'error' };
      }
      return { ...state, validatedInput: true, step: 'parallel_processing' };
    });

    // Node 2: Parallel Processing (Metrics + AI Analysis) - FASTEST METHOD
    workflow.addNode('parallel_processing', async (state) => {
      console.log('⚡ Node 2: Running Parallel Processing (Metrics + Analysis)...');

      try {
        // Run both operations simultaneously for maximum speed
        const [metrics, rawAnalysis] = await Promise.all([
          // Task A: Extract Metrics (Cpu bound, fast)
          (async () => {
            console.log('  📊 Extracting metrics...');
            return extractKeyMetrics(state.inputData);
          })(),
          // Task B: Generate Analysis (Network bound, slow)
          (async () => {
            console.log('  🤖 Generating AI analysis...');
            const analysisPrompt = formatPrompt(ANALYSIS_PROMPT, {
              input_data: JSON.stringify(state.inputData, null, 2)
            });
            const fullPrompt = `${SYSTEM_PROMPT}\n\n${analysisPrompt}`;
            return await invokeWithRetry(this.model, fullPrompt);
          })()
        ]);

        return {
          ...state,
          keyMetrics: metrics,
          rawAnalysis: rawAnalysis,
          step: 'parse_response'
        };
      } catch (error) {
        return { ...state, errors: [...state.errors, error.message], step: 'error' };
      }
    });

    // Node 3: Parse Response
    workflow.addNode('parse_response', async (state) => {
      console.log('📝 Node 3: Parsing response...');
      try {
        const parsed = parseJsonResponse(state.rawAnalysis);
        return { ...state, parsedReport: parsed, step: 'enrich_report' };
      } catch (error) {
        return { ...state, errors: [...state.errors, `Parse error: ${error.message}`], step: 'error' };
      }
    });

    // Node 4: Enrich Report (Finalizing)
    workflow.addNode('enrich_report', async (state) => {
      console.log('✨ Node 4: Finalizing report...');
      // Return ONLY the parsed report from the AI, no extra metadata
      return { ...state, finalReport: state.parsedReport, step: 'complete' };
    });

    // Node 5: Error Handler
    workflow.addNode('error', async (state) => {
      console.error('❌ Workflow error:', state.errors);
      return {
        ...state,
        finalReport: { error: true, errors: state.errors, message: 'Analysis failed' },
        step: 'complete'
      };
    });

    // Define edges (workflow flow)
    workflow.setEntryPoint('validate_input');

    workflow.addConditionalEdges(
      'validate_input',
      (state) => state.validatedInput ? 'parallel_processing' : 'error'
    );

    workflow.addEdge('parallel_processing', 'parse_response');
    workflow.addEdge('parse_response', 'enrich_report');
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

