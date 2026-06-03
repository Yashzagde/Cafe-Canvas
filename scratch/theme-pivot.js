const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/app/admin/page.tsx',
  'frontend/src/app/admin/login/page.tsx',
  'frontend/src/components/admin/Sidebar.tsx',
  'frontend/src/components/admin/DashboardTab.tsx',
  'frontend/src/components/admin/MenuTab.tsx',
  'frontend/src/components/admin/MenuEditor.tsx',
  'frontend/src/components/admin/TableQRManager.tsx',
  'frontend/src/components/admin/BillingTab.tsx',
  'frontend/src/components/admin/CustomersTab.tsx',
  'frontend/src/components/admin/DiscountsTab.tsx',
  'frontend/src/components/admin/AnalyticsTab.tsx',
  'frontend/src/components/admin/StaffManager.tsx',
  'frontend/src/components/admin/StorefrontEditor.tsx',
  'frontend/src/components/admin/AuditLogViewer.tsx',
  'frontend/src/components/admin/ActivityFeedTab.tsx'
];

const replacements = [
  { from: /#151820/g, to: '#ffffff' },
  { from: /#1e222d/g, to: '#f1f5f9' },
  { from: /#0d0f12/g, to: '#fdfcf7' },
  { from: /#262b38/g, to: '#e2e8f0' },
  { from: /#fcfaf4/g, to: '#1e293b' },
  { from: /#e28743/g, to: '#d97706' },
  { from: /#f0a050/g, to: '#ca8a04' },
  { from: /text-red-400/g, to: 'text-red-600' },
  { from: /text-green-400/g, to: 'text-green-600' }
];

const baseDir = 'd:/Cafe Canva';

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated theme in: ${file}`);
  } else {
    console.log(`No updates needed in: ${file}`);
  }
});

console.log('Theme pivot bulk replacements completed!');
