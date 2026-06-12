const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const sql = postgres({
  host: 'db.oeringgdbxmmihgvuyfa.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'XASzdcFrmbyXuGOn',
  ssl: 'require',
  max: 1,
  connect_timeout: 30
});

async function main() {
  try {
    const email = 'yashzagde01@gmail.com';
    console.log(`Checking staff_accounts & users view for: ${email}`);
    
    const staff = await sql`SELECT * FROM public.staff_accounts WHERE email = ${email}`;
    console.log("Staff Accounts Row:", staff);
    
    const usersView = await sql`SELECT * FROM public.users WHERE email = ${email}`;
    console.log("Users View Row:", usersView);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
  }
}

main();
