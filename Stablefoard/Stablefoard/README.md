# Stock Analysis AI Agent 📈

An intelligent AI-powered stock analysis agent built with **Google Gemini API**, **Node.js**, **LangChain**, and **LangGraph**. This agent analyzes comprehensive stock data in JSON format and generates institutional-grade investment evaluation reports.

## 🎯 Features

- **AI-Powered Analysis**: Uses Google Gemini 1.5 Pro for sophisticated stock evaluation
- **Comprehensive Metrics**: Analyzes quantitative, qualitative, technical, and peer comparison data
- **Two Execution Modes**:
  - **Simple Mode**: Direct analysis with StockAnalyzer
  - **Workflow Mode**: Advanced state-based processing with LangGraph
- **Strict Data-Driven**: Only analyzes provided JSON data without external assumptions
- **Institutional-Grade Reports**: Generates detailed 11-section analysis reports
- **Batch Processing**: Analyze multiple stocks in one run
- **Input Validation**: Robust schema validation using Zod
- **Error Handling**: Automatic retry logic with exponential backoff

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Input Format](#input-format)
- [Output Format](#output-format)
- [Architecture](#architecture)
- [Examples](#examples)
- [API Reference](#api-reference)

## 🚀 Installation

1. **Clone or download the project**

```bash
cd stock-analysis-agent
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
TEMPERATURE=0.3
```

To get a Google Gemini API key:
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Sign in with your Google account
- Create a new API key

## ⚙️ Configuration

Edit `src/config/settings.js` to customize:

- Model parameters (temperature, max tokens, etc.)
- Scoring weights for different analysis components
- Retry and timeout settings

```javascript
export const CONFIG = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  geminiModel: 'gemini-1.5-pro',
  temperature: 0.3,
  maxOutputTokens: 8192,
  weights: {
    quantitative: 0.40,
    sis: 0.15,
    ssis: 0.15,
    qualitative: 0.20,
    peerComparison: 0.10
  }
};
```

## 📖 Usage

### Command Line Interface

**Basic usage:**

```bash
node src/index.js input.json output.json
```

**Using LangGraph workflow:**

```bash
node src/index.js input.json output.json --workflow
```

**Run example:**

```bash
npm run test
```

### Programmatic Usage

```javascript
import { StockAnalyzer, StockAnalysisWorkflow } from './src/index.js';

// Simple mode
const analyzer = new StockAnalyzer();
const result = await analyzer.analyze(stockData);

// Workflow mode
const workflow = new StockAnalysisWorkflow();
const result = await workflow.execute(stockData);

// Batch analysis
const results = await analyzer.batchAnalyze([stock1Data, stock2Data]);
```

## 📥 Input Format

The agent expects a JSON file with the following structure:

```json
{
  "stock": {
    "symbol": "TBD",
    "name": "Company Name",
    "asOf": "2025-06-25",
    "overallResult": "pass"
  },
  "quantitative": {
    "fundamentalResilience": {
      "overall": "pass",
      "metrics": [
        {
          "name": "Free Cash Flow Yield",
          "value": 3,
          "threshold": "> 2%",
          "pass": true
        }
      ]
    },
    "asymmetricRiskReward": { /* ... */ },
    "technicalConfirmation": { /* ... */ },
    "riskSensitivityAlignment": { /* ... */ }
  },
  "sis": {
    "overall": 3.8,
    "stocks": [ /* ... */ ]
  },
  "ssis": {
    "overall": 3.8,
    "peers": [ /* ... */ ]
  },
  "qualitative": {
    "overallRating": 4.5,
    "criteria": [ /* ... */ ]
  },
  "peerComparison": {
    "baseSymbol": "TBD",
    "peers": [ /* ... */ ]
  }
}
```

See `src/example.js` for a complete example.

## 📤 Output Format

The agent generates a comprehensive JSON report:

```json
{
  "overallScore": 78,
  "recommendation": "Buy",
  "financialHealth": "Strong financials with consistent revenue growth...",
  "valuation": "Fairly valued compared to peers...",
  "futureGrowth": "Industry tailwinds indicate strong long-term potential...",
  "competitiveAdvantage": "Moderate moat with brand strength...",
  "managementQuality": "Highly rated leadership...",
  "riskFactors": "Moderate risks—market competition...",
  "technicalTrend": "Stock is in a positive trend...",
  "portfolioFit": "Fits a growth-focused medium to long-term portfolio...",
  "timeHorizon": "Best suited for 3–5+ years...",
  "aiSummary": "The stock's historical performance shows...",
  "finalVerdict": "A fundamentally strong stock with good growth potential...",
  "metadata": {
    "stockSymbol": "TBD",
    "analysisDate": "2025-12-15T...",
    "modelUsed": "gemini-1.5-pro",
    "keyMetrics": { /* ... */ }
  }
}
```

## 🏗️ Architecture

### Project Structure

```
stock-analysis-agent/
├── src/
│   ├── agent/
│   │   ├── gemini-client.js       # Gemini API integration
│   │   ├── stock-analyzer.js      # Simple analyzer
│   │   └── langgraph-workflow.js  # LangGraph workflow
│   ├── config/
│   │   ├── prompts.js             # AI prompts
│   │   └── settings.js            # Configuration
│   ├── utils/
│   │   ├── validators.js          # Input/output validation
│   │   └── file-handler.js        # File I/O utilities
│   ├── index.js                   # Main entry point
│   └── example.js                 # Example usage
├── package.json
├── .env                           # Environment variables
└── README.md
```

### Component Overview

#### 1. **StockAnalyzer** (Simple Mode)
- Direct linear analysis flow
- Best for single stock analysis
- Faster execution

#### 2. **StockAnalysisWorkflow** (LangGraph Mode)
- State-based workflow with 7 nodes:
  1. Input Validation
  2. Extract Key Metrics
  3. Generate Analysis
  4. Parse Response
  5. Validate Output
  6. Enrich Report
  7. Error Handler
- Better for complex multi-step processing
- More robust error recovery

#### 3. **Validators**
- Zod-based schema validation
- Ensures data integrity
- Extracts key metrics

#### 4. **Prompts**
- System prompt defines AI role
- Analysis prompt structures the evaluation
- Validation prompt ensures quality

## 💡 Examples

### Example 1: Analyze Single Stock

Create `my-stock.json`:

```json
{
  "stock": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "asOf": "2025-12-15",
    "overallResult": "pass"
  },
  "quantitative": { /* ... */ },
  "sis": { /* ... */ },
  "ssis": { /* ... */ },
  "qualitative": { /* ... */ },
  "peerComparison": { /* ... */ }
}
```

Run analysis:

```bash
node src/index.js my-stock.json my-report.json
```

### Example 2: Batch Analysis

```javascript
import { StockAnalyzer } from './src/index.js';

const analyzer = new StockAnalyzer();
const stocks = [stock1Data, stock2Data, stock3Data];

const results = await analyzer.batchAnalyze(stocks);

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Stock ${index + 1}: ${result.data.recommendation}`);
  } else {
    console.log(`Stock ${index + 1}: Failed - ${result.error}`);
  }
});
```

### Example 3: Custom Configuration

```javascript
import { CONFIG } from './src/config/settings.js';

// Adjust temperature for more creative responses
CONFIG.temperature = 0.5;

// Adjust scoring weights
CONFIG.weights.quantitative = 0.50;
CONFIG.weights.qualitative = 0.30;

const analyzer = new StockAnalyzer();
const result = await analyzer.analyze(stockData);
```

## 📚 API Reference

### StockAnalyzer

#### `analyze(inputData)`
Analyzes a single stock and returns a comprehensive report.

**Parameters:**
- `inputData` (Object): Stock data in required JSON format

**Returns:**
- Promise<Object>: Analysis report with metadata

**Example:**
```javascript
const analyzer = new StockAnalyzer();
const report = await analyzer.analyze(stockData);
```

#### `batchAnalyze(stockDataArray)`
Analyzes multiple stocks sequentially.

**Parameters:**
- `stockDataArray` (Array<Object>): Array of stock data objects

**Returns:**
- Promise<Array<Object>>: Array of results with success flags

#### `getHistory()`
Returns analysis history.

**Returns:**
- Array: List of previous analyses

#### `getSummaryStats()`
Returns summary statistics of all analyses.

**Returns:**
- Object: Summary with averages, recommendations, etc.

### StockAnalysisWorkflow

#### `execute(inputData)`
Executes the LangGraph workflow for stock analysis.

**Parameters:**
- `inputData` (Object): Stock data in required JSON format

**Returns:**
- Promise<Object>: Analysis report

**Example:**
```javascript
const workflow = new StockAnalysisWorkflow();
const report = await workflow.execute(stockData);
```

### Validators

#### `validateInput(data)`
Validates input JSON against schema.

**Returns:**
- Object: `{ success: boolean, errors: Array<string> }`

#### `validateOutput(data)`
Validates output JSON against schema.

**Returns:**
- Object: `{ success: boolean, errors: Array<string> }`

#### `extractKeyMetrics(data)`
Extracts summary metrics from input data.

**Returns:**
- Object: Key metrics summary

## 🔧 Troubleshooting

### Common Issues

**1. API Key Error**
```
Error: Google API key is not configured
```
**Solution:** Create `.env` file with valid `GOOGLE_API_KEY`

**2. Invalid JSON**
```
Error: Invalid JSON response from model
```
**Solution:** Check input format, increase temperature, or retry

**3. Validation Errors**
```
Input validation failed: stock.symbol: Required
```
**Solution:** Ensure all required fields are present in input JSON

**4. Rate Limiting**
```
Error: Failed after 3 attempts
```
**Solution:** Add delays between requests or check API quota

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- Built with [Google Gemini API](https://ai.google.dev/)
- Powered by [LangChain](https://js.langchain.com/)
- Workflow orchestration with [LangGraph](https://langchain-ai.github.io/langgraphjs/)
- Validation with [Zod](https://zod.dev/)

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Review the examples in `src/example.js`
- Check the configuration in `src/config/`

---

**Built with ❤️ for institutional-grade stock analysis**

