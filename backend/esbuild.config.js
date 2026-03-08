/**
 * esbuild Configuration for Lambda Functions
 * 
 * Optimizes bundle size and cold start performance by:
 * - Tree-shaking unused code
 * - Bundling all dependencies except AWS SDK
 * - Minifying code
 * - Creating separate bundles for each Lambda function
 */

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Lambda handlers to build
const handlers = [
  'conceptExplainer',
  'codeAnalyzer',
  'viroAssistant',
  'dictionaryService',
  'visionAnalyzer'
];

// External dependencies (provided by Lambda runtime or layers)
const external = [
  '@aws-sdk/*',
  'aws-sdk'
];

async function build() {
  console.log('🔨 Building Lambda functions with esbuild...\n');

  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist', { recursive: true });

  // Build each handler separately
  for (const handler of handlers) {
    console.log(`Building ${handler}...`);
    
    try {
      await esbuild.build({
        entryPoints: [`src/lambda/handlers/${handler}.ts`],
        bundle: true,
        minify: true,
        sourcemap: true,
        platform: 'node',
        target: 'node20',
        outfile: `dist/lambda/handlers/${handler}.js`,
        external,
        format: 'cjs',
        metafile: true,
        logLevel: 'info',
        treeShaking: true,
        // Optimize for Lambda
        mainFields: ['module', 'main'],
        conditions: ['node'],
      });
      
      console.log(`✅ ${handler} built successfully`);
    } catch (error) {
      console.error(`❌ Failed to build ${handler}:`, error);
      process.exit(1);
    }
  }

  console.log('\n✅ All Lambda functions built successfully!');
  
  // Calculate bundle sizes
  console.log('\n📦 Bundle sizes:');
  for (const handler of handlers) {
    const filePath = `dist/lambda/handlers/${handler}.js`;
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ${handler}: ${sizeKB} KB`);
  }
}

build().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
