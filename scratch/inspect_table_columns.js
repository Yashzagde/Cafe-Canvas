const fs = require('fs');

const tableName = process.argv[2];
if (!tableName) {
  console.error('Please specify a table name.');
  process.exit(1);
}

try {
  const columns = JSON.parse(fs.readFileSync('d:\\Cafe Canva\\scratch\\db_columns.json', 'utf8'));
  const tableColumns = columns.filter(c => c.table_name === tableName);
  console.log(`=== Columns for ${tableName} ===`);
  tableColumns.forEach(c => {
    console.log(`- ${c.column_name} (${c.data_type})Default: ${c.column_default}, Nullable: ${c.is_nullable}`);
  });

  const constraints = JSON.parse(fs.readFileSync('d:\\Cafe Canva\\scratch\\db_constraints.json', 'utf8'));
  const tableConstraints = constraints.filter(c => c.table_name === tableName);
  console.log(`\n=== Constraints for ${tableName} ===`);
  tableConstraints.forEach(c => {
    console.log(`- ${c.constraint_name} (${c.constraint_type}) Clause: ${c.check_clause}`);
  });
} catch (err) {
  console.error(err);
}
