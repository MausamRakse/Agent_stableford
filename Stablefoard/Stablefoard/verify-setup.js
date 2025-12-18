/**
 * Setup Verification Script
 * Run this to verify your installation is correct
 */

import fs from 'fs/promises';
import path from 'path';

const checks = [];

async function verify() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 STOCK ANALYSIS AGENT - SETUP VERIFICATION');
  console.log('='.repeat(60) + '\n');

  // Check 1: Node.js version
  console.log('1️⃣  Checking Node.js version...');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion >= 22) {
    console.log(`   ✅ Node.js ${nodeVersion} (OK)\n`);
    checks.push(true);
  } else {
    console.log(`   ❌ Node.js ${nodeVersion} (Need v22+)\n`);
    checks.push(false);
  }

  // Check 2: Dependencies
  console.log('2️⃣  Checking dependencies...');
  try {
    await fs.access('./node_modules');
    console.log('   ✅ node_modules exists\n');
    checks.push(true);
  } catch {
    console.log('   ❌ node_modules not found (Run: npm install)\n');
    checks.push(false);
  }

  // Check 3: Source files
  console.log('3️⃣  Checking source files...');
  const requiredFiles = [
    'src/index.js',
    'src/agent/gemini-client.js',
    'src/agent/stock-analyzer.js',
    'src/agent/langgraph-workflow.js',
    'src/config/prompts.js',
    'src/config/settings.js',
    'src/utils/validators.js',
    'src/utils/file-handler.js'
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
      console.log(`   ✅ ${file}`);
    } catch {
      console.log(`   ❌ ${file} (Missing)`);
      allFilesExist = false;
    }
  }
  console.log();
  checks.push(allFilesExist);

  // Check 4: Environment file
  console.log('4️⃣  Checking .env configuration...');
  try {
    const envContent = await fs.readFile('.env', 'utf-8');

    if (envContent.includes('GOOGLE_API_KEY') && !envContent.includes('your_gemini_api_key_here')) {
      console.log('   ✅ .env file exists with API key\n');
      checks.push(true);
    } else {
      console.log('   ⚠️  .env exists but API key not set\n');
      console.log('   → Edit .env and add your Google Gemini API key\n');
      checks.push(false);
    }
  } catch {
    console.log('   ❌ .env file not found\n');
    console.log('   → Create .env file and add your API key:\n');
    console.log('   GOOGLE_API_KEY=your_actual_api_key_here\n');
    checks.push(false);
  }

  // Check 5: Input example
  console.log('5️⃣  Checking example files...');
  try {
    await fs.access('input-example.json');
    const content = await fs.readFile('input-example.json', 'utf-8');
    JSON.parse(content); // Verify it's valid JSON
    console.log('   ✅ input-example.json (Valid JSON)\n');
    checks.push(true);
  } catch (error) {
    console.log(`   ❌ input-example.json issue: ${error.message}\n`);
    checks.push(false);
  }

  // Check 6: Package.json
  console.log('6️⃣  Checking package configuration...');
  try {
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));

    const requiredDeps = [
      '@google/generative-ai',
      '@langchain/google-genai',
      '@langchain/core',
      '@langchain/langgraph',
      'dotenv',
      'zod'
    ];

    const missingDeps = requiredDeps.filter(dep => !pkg.dependencies?.[dep]);

    if (missingDeps.length === 0) {
      console.log('   ✅ All required dependencies listed\n');
      checks.push(true);
    } else {
      console.log('   ⚠️  Missing dependencies:', missingDeps.join(', '));
      console.log('   → Run: npm install\n');
      checks.push(false);
    }
  } catch (error) {
    console.log(`   ❌ package.json issue: ${error.message}\n`);
    checks.push(false);
  }

  // Summary
  console.log('='.repeat(60));
  const passedChecks = checks.filter(c => c).length;
  const totalChecks = checks.length;

  console.log(`\n📊 VERIFICATION RESULTS: ${passedChecks}/${totalChecks} checks passed\n`);

  if (passedChecks === totalChecks) {
    console.log('✅ All checks passed! You\'re ready to go!\n');
    console.log('Next steps:');
    console.log('  1. npm run test        # Run example');
    console.log('  2. node src/index.js input-example.json output.json\n');
    return true;
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above.\n');
    console.log('Common fixes:');
    console.log('  - npm install          # Install dependencies');
    console.log('  - Create .env file     # Add your API key');
    console.log('  - Check file paths     # Verify all files exist\n');
    return false;
  }
}

// Run verification
verify().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});

