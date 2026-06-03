const { execSync } = require('child_process');

const envs = ['production', 'preview', 'development'];
const vars = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://oeringgdbxmmihgvuyfa.supabase.co' },
  { name: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', value: 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU' },
  { name: 'DATABASE_URL', value: 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' }
];

console.log("Starting Vercel environment variable configuration...");

for (const v of vars) {
  for (const env of envs) {
    const cmd = `npx vercel env add ${v.name} ${env} --value "${v.value}" --yes --force`;
    console.log(`\nRunning: npx vercel env add ${v.name} ${env}...`);
    try {
      const output = execSync(cmd, { cwd: 'd:\\Cafe Canva\\frontend', encoding: 'utf8' });
      console.log(output.trim());
    } catch (error) {
      console.error(`Failed to add ${v.name} for ${env}:`, error.message);
    }
  }
}

console.log("\n================================================");
console.log("✓ Vercel environment variables setup complete!");
console.log("================================================");
