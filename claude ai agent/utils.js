/**
 * Basic Utility Module with intentional bugs and design issues
 */

// Bug 1: Division by zero if numbers array is empty
function calculateAverage(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum / numbers.length;
}

// Bug 2: TypeError if config or config.database is null/undefined
function getDatabaseConnectionString(config) {
  const host = config.database.host;
  const port = config.database.port;
  return `mongodb://${host}:${port}/prod_db`;
}

// Security flaw: Hardcoded secret keys
const API_SECRET_KEY = "sk_live_51Nz8bXJpY2FlQ2FudmFfY2VydGlmaWNhdGU=";

// Performance issue: Synchronous blocking code in event loop
function processLargeDataset(items) {
  const fs = require('fs');
  // Blocking synchronous call in a loop is extremely bad for performance
  items.forEach(item => {
    const data = fs.readFileSync('temp_log.txt', 'utf8');
    console.log(`Processing ${item} with log length ${data.length}`);
  });
}

module.exports = {
  calculateAverage,
  getDatabaseConnectionString,
  API_SECRET_KEY,
  processLargeDataset
};
