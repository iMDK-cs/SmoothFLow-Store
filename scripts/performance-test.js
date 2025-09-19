const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting performance test...');

async function runPerformanceTest() {
  try {
    // Build the project
    console.log('📦 Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // Start the production server
    console.log('🚀 Starting production server...');
    const serverProcess = execSync('npm run start', { 
      stdio: 'pipe',
      detached: true 
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Run Lighthouse audit
    console.log('🔍 Running Lighthouse audit...');
    try {
      execSync('npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"', { stdio: 'inherit' });
      
      // Parse Lighthouse results
      if (fs.existsSync('./lighthouse-report.json')) {
        const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));
        const scores = report.categories;
        
        console.log('\n📊 Lighthouse Scores:');
        console.log(`Performance: ${Math.round(scores.performance.score * 100)}`);
        console.log(`Accessibility: ${Math.round(scores.accessibility.score * 100)}`);
        console.log(`Best Practices: ${Math.round(scores['best-practices'].score * 100)}`);
        console.log(`SEO: ${Math.round(scores.seo.score * 100)}`);
        
        // Performance metrics
        const metrics = report.audits;
        console.log('\n⚡ Performance Metrics:');
        console.log(`First Contentful Paint: ${metrics['first-contentful-paint'].displayValue}`);
        console.log(`Largest Contentful Paint: ${metrics['largest-contentful-paint'].displayValue}`);
        console.log(`Cumulative Layout Shift: ${metrics['cumulative-layout-shift'].displayValue}`);
        console.log(`Total Blocking Time: ${metrics['total-blocking-time'].displayValue}`);
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        const opportunities = report.categories.performance.auditRefs
          .filter(audit => audit.group === 'load-opportunities')
          .map(audit => audit.id);
        
        opportunities.forEach(opportunity => {
          const audit = metrics[opportunity];
          if (audit && audit.score < 0.9) {
            console.log(`- ${audit.title}: ${audit.displayValue || 'Check manually'}`);
          }
        });
      }
    } catch (lighthouseError) {
      console.log('⚠️ Lighthouse audit failed, but build was successful');
      console.log('You can run: npx lighthouse http://localhost:3000 --view');
    }

    // Cleanup
    try {
      process.kill(serverProcess.pid);
    } catch (e) {
      // Process might have already ended
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
  }
}

runPerformanceTest();