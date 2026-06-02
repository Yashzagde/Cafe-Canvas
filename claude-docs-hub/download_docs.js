const fs = require('fs');
const path = require('path');

// Paths
const indexPath = 'C:\\Users\\yash\\.gemini\\antigravity-ide\\brain\\00df9693-9606-4b08-bf61-0e7dca7dff69\\.system_generated\\steps\\13\\content.md';
const outputDir = path.join(__dirname, 'docs');
const indexJSONPath = path.join(__dirname, 'docs_index.json');

async function main() {
  console.log('Reading documentation index...');
  if (!fs.existsSync(indexPath)) {
    console.error('Documentation index file not found at:', indexPath);
    process.exit(1);
  }

  const content = fs.readFileSync(indexPath, 'utf-8');
  const lines = content.split('\n');
  const articles = [];

  // Match: - [Title](URL): Description
  const regex = /-\s+\[(.*?)\]\((https:\/\/code\.claude\.com\/docs\/en\/.*?\.md)\)(?::\s*(.*))?/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const title = match[1].trim();
      const url = match[2].trim();
      const description = match[3] ? match[3].trim() : '';

      // Determine category based on URL structure
      let category = 'Core Docs';
      if (url.includes('/agent-sdk/')) {
        category = 'Agent SDK';
      } else if (url.includes('/whats-new/')) {
        category = 'What\'s New';
      }

      // Determine local path
      const urlPath = new URL(url).pathname; // e.g. /docs/en/agent-sdk/agent-loop.md
      const relativePath = urlPath.replace(/^\/docs\/en\//, ''); // e.g. agent-sdk/agent-loop.md
      const localFilePath = path.join(outputDir, relativePath);

      articles.push({
        title,
        url,
        description,
        category,
        relativePath: relativePath.replace(/\\/g, '/'),
        localFilePath
      });
    }
  }

  console.log(`Found ${articles.length} articles to download.`);

  // Create base docs directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Download articles with parallel limit
  const CONCURRENCY_LIMIT = 5;
  const results = [];

  for (let i = 0; i < articles.length; i += CONCURRENCY_LIMIT) {
    const batch = articles.slice(i, i + CONCURRENCY_LIMIT);
    console.log(`Downloading batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1}...`);

    await Promise.all(batch.map(async (art) => {
      try {
        const fileDir = path.dirname(art.localFilePath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }

        console.log(`Fetching: ${art.title} (${art.url})`);
        const res = await fetch(art.url);
        if (!res.ok) {
          throw new Error(`HTTP status ${res.status}`);
        }
        const text = await res.text();
        fs.writeFileSync(art.localFilePath, text, 'utf-8');
        
        results.push({
          title: art.title,
          category: art.category,
          description: art.description,
          path: art.relativePath
        });
      } catch (err) {
        console.error(`Failed to download ${art.title}:`, err.message);
      }
    }));

    // Wait a little between batches to avoid spamming
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Write index JSON file
  fs.writeFileSync(indexJSONPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Finished downloading docs! Saved ${results.length} files. Index generated at: docs_index.json`);
}

main().catch(err => {
  console.error('Fatal error running scraper:', err);
});
