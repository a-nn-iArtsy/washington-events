// Auto-deployment script for Washington Events
// This script helps automate the deployment process

const fs = require('fs');
const path = require('path');

console.log('🚀 Washington Events Auto-Deployment Script');
console.log('==========================================');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Not in the right directory. Run this from the project root.');
  process.exit(1);
}

console.log('✅ Project structure verified');

// Check if all required files exist
const requiredFiles = [
  'src/api/server.js',
  'client/package.json',
  'client/src/App.tsx',
  'src/database/schema.sql',
  'railway.json',
  'vercel.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('❌ Some required files are missing. Please check your project structure.');
  process.exit(1);
}

console.log('✅ All required files present');

// Check if build works
console.log('🏗️ Testing build process...');
try {
  const { execSync } = require('child_process');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Frontend build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Generate deployment URLs
const deploymentUrls = {
  github: 'https://github.com/a-nn-iArtsy/washington-events',
  railway: 'https://railway.app',
  vercel: 'https://vercel.com',
  stripe: 'https://stripe.com'
};

console.log('\n🎯 Deployment URLs:');
console.log('==================');
Object.entries(deploymentUrls).forEach(([service, url]) => {
  console.log(`${service.toUpperCase()}: ${url}`);
});

console.log('\n📋 Next Steps:');
console.log('==============');
console.log('1. Go to Railway.app and deploy from GitHub');
console.log('2. Add PostgreSQL database in Railway');
console.log('3. Set environment variables in Railway');
console.log('4. Go to Vercel.com and deploy frontend');
console.log('5. Set up Stripe for payments');
console.log('6. Your app will be live and earning money!');

console.log('\n💰 Revenue Timeline:');
console.log('===================');
console.log('Month 1: Build user base (free)');
console.log('Month 6: $500/month (50 Pro users)');
console.log('Month 12: $2,000/month (200 Pro users)');
console.log('Month 24: $8,000/month (500 Pro + ads)');

console.log('\n🎉 Your Washington Events aggregator is ready to deploy!');
console.log('Follow the steps above to go live and start earning money! 💰');
