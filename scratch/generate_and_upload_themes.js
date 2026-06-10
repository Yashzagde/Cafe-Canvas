const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';

const supabase = createClient(supabaseUrl, supabaseKey);

function isDarkBackground(hex) {
  if (!hex) return false;
  if (hex.startsWith('rgba')) return false;
  const color = hex.replace('#', '');
  if (color.length !== 6) return false;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

async function run() {
  try {
    const presets = JSON.parse(fs.readFileSync('scratch/presets_extracted.json', 'utf8'));
    console.log(`Loaded ${presets.length} presets from presets_extracted.json`);
    
    // Create local directory for built themes if it doesn't exist
    const outDir = path.join(__dirname, 'built_themes');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
    
    for (const preset of presets) {
      const { id, name, colors, fontHeading } = preset;
      if (!id || !colors || colors.length === 0) continue;
      
      const bg = colors[0];
      const primary = colors[1] || colors[0];
      const accent = colors[2] || colors[1] || colors[0];
      
      const isDark = isDarkBackground(bg);
      
      // Determine typography
      const headingFont = fontHeading || 'Inter';
      
      // Construct Google Font import URL
      let fontImport = '';
      if (headingFont && headingFont !== 'Inter' && headingFont !== 'sans-serif') {
        const fontNameForUrl = headingFont.replace(/\s+/g, '+');
        fontImport = `@import url('https://fonts.googleapis.com/css2?family=${fontNameForUrl}:wght@400;700;900&display=swap');\n\n`;
      }
      
      // Build CSS variables
      const cssContent = `${fontImport}:root {
  --background: ${bg};
  --foreground: ${isDark ? '#f8fafc' : '#1e293b'};
  --brand: ${primary};
  --brand-light: ${isDark ? 'rgba(255, 255, 255, 0.15)' : primary + '15'};
  --accent: ${accent};
  --card-bg: ${isDark ? 'rgba(255, 255, 255, 0.07)' : '#ffffff'};
  --border-color: ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
  --border-focus: ${primary};
  --font-heading: '${headingFont}', serif;
  
  /* Additional details */
  --shadow-warm: ${isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(30, 41, 59, 0.04)'};
  --shadow-hover: ${isDark ? '0 10px 30px rgba(0,0,0,0.6)' : '0 10px 30px rgba(30, 41, 59, 0.08)'};
}

/* Scoped classes to support themes inside preview overlays */
.theme-${id.replace('theme-', '')} {
  --background: ${bg};
  --foreground: ${isDark ? '#f8fafc' : '#1e293b'};
  --brand: ${primary};
  --brand-light: ${isDark ? 'rgba(255, 255, 255, 0.15)' : primary + '15'};
  --accent: ${accent};
  --card-bg: ${isDark ? 'rgba(255, 255, 255, 0.07)' : '#ffffff'};
  --border-color: ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
  --border-focus: ${primary};
  --font-heading: '${headingFont}', serif;
}
`;
      
      const fileName = `${id}.css`;
      const localFilePath = path.join(outDir, fileName);
      fs.writeFileSync(localFilePath, cssContent, 'utf8');
      
      console.log(`Uploading ${fileName} to themes bucket...`);
      const { data, error } = await supabase.storage
        .from('themes')
        .upload(fileName, fs.readFileSync(localFilePath), {
          contentType: 'text/css',
          upsert: true
        });
        
      if (error) {
        console.error(`❌ Failed to upload ${fileName}:`, error.message);
      } else {
        console.log(`✓ Succeeded uploading ${fileName}`);
      }
    }
    
    console.log('\n=============================================');
    console.log('🎉 Theme regeneration and upload completed!');
    console.log('=============================================');
    
  } catch (err) {
    console.error('Execution failed:', err.message);
  }
}

run();
