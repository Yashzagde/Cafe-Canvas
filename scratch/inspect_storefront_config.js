const postgres = require('postgres');
const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function inspectColumns() {
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'storefront_config' 
      ORDER BY ordinal_position;
    `;
    console.log('Columns in storefront_config:');
    result.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.end();
  }
}

inspectColumns();
