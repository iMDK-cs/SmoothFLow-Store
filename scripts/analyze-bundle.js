const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting bundle analysis...');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Analyze bundle
  console.log('📊 Analyzing bundle...');
  execSync('npx @next/bundle-analyzer', { stdio: 'inherit' });

  // Check build output
  const buildDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(buildDir)) {
    console.log('✅ Build completed successfully');
    
    // Get build stats
    const staticDir = path.join(buildDir, 'static');
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(staticDir);
      console.log(`📁 Found ${chunks.length} static chunks`);
      
      // Find largest chunks
      const chunkSizes = [];
      chunks.forEach(chunk => {
        const chunkPath = path.join(staticDir, chunk);
        if (fs.statSync(chunkPath).isDirectory()) {
          const files = fs.readdirSync(chunkPath);
          files.forEach(file => {
            const filePath = path.join(chunkPath, file);
            const stats = fs.statSync(filePath);
            chunkSizes.push({
              name: file,
              size: stats.size,
              sizeKB: Math.round(stats.size / 1024)
            });
          });
        }
      });
      
      // Sort by size
      chunkSizes.sort((a, b) => b.size - a.size);
      
      console.log('\n📊 Largest chunks:');
      chunkSizes.slice(0, 10).forEach((chunk, index) => {
        console.log(`${index + 1}. ${chunk.name}: ${chunk.sizeKB} KB`);
      });
    }
  }

} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}