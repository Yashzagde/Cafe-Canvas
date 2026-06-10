const postgres = require('postgres');
const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function inspectColumns() {
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    const result = await sql`
      SELECT * FROM storefront_config LIMIT 5;
    `;
    console.log('Rows in storefront_config:');
    console.log(result);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.end();
  }
}

inspectColumns();
