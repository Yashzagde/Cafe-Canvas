const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
  console.error('Error: Please configure DATABASE_URL in your .env file with your actual Supabase database password first.');
  process.exit(1);
}

// Disable prefetch as it is not supported for transaction mode poolers
const sql = postgres(connectionString, { ssl: 'require', prepare: false });

async function setup() {
  console.log('Connecting to Supabase and creating pre_registrations table...');
  try {
    // 1. Create table
    await sql`
      CREATE TABLE IF NOT EXISTS pre_registrations (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email text NOT NULL UNIQUE,
        restaurant_name text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;
    console.log('✔ Table "pre_registrations" created successfully.');
    
    // 2. Enable Row Level Security (RLS)
    await sql`ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;`;
    console.log('✔ Row Level Security (RLS) enabled.');

    // 3. Check and create policies
    try {
      await sql`
        CREATE POLICY "Allow public inserts" 
        ON pre_registrations 
        FOR INSERT 
        WITH CHECK (true);
      `;
      console.log('✔ Public insert policy added.');
    } catch (policyErr) {
      console.log('• Public insert policy already exists.');
    }

    try {
      await sql`
        CREATE POLICY "Allow authenticated reads" 
        ON pre_registrations 
        FOR SELECT 
        USING (auth.role() = 'authenticated');
      `;
      console.log('✔ Authenticated read policy added.');
    } catch (policyErr) {
      console.log('• Authenticated read policy already exists.');
    }

    console.log('\n🎉 Setup completed successfully! Your landing page can now save data directly to Supabase.');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  } finally {
    await sql.end();
  }
}

setup();
