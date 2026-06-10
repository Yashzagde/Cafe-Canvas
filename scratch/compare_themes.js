const fs = require('fs');

const userPromptPath = 'd:\\Cafe Canva\\scratch\\user_prompt_full.txt';
const screenPath = 'd:\\Cafe Canva\\cafe-canvas-store-admin\\src\\screens\\StorefrontConfig\\StorefrontConfigScreen.tsx';

try {
  const promptContent = fs.readFileSync(userPromptPath, 'utf8');
  const screenContent = fs.readFileSync(screenPath, 'utf8');
  
  // Let's extract each theme from promptContent
  // We look for: ### THEME-XX: NAME or THEME-XX: NAME
  // And then extract COLOR SYSTEM: --bg-primary: #..., and TYPOGRAPHY: ...
  const themes = {};
  
  // Match themes block by block
  const themeBlocks = promptContent.split(/### THEME-\d+:|THEME-\d+:/i);
  
  // Note: the first element is the header
  const regexThemeNum = /THEME-(\d+)/i;
  
  // Let's parse with a simple loop
  const lines = promptContent.split('\n');
  let currentThemeId = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^### THEME-(\d+):\s*(.*)$/i) || line.match(/^THEME-(\d+):\s*(.*)$/i);
    if (match) {
      currentThemeId = 'theme-' + match[1].padStart(2, '0');
      themes[currentThemeId] = {
        id: currentThemeId,
        name: match[2].trim(),
        colors: [],
        fontHeading: ''
      };
    }
    if (currentThemeId && line.includes('--bg-primary:')) {
      const bgMatch = line.match(/--bg-primary:\s*(#[a-fA-F0-9]{6}|rgba?\([^)]+\))/);
      if (bgMatch) themes[currentThemeId].bg = bgMatch[1];
    }
    if (currentThemeId && line.includes('--bg:')) {
      const bgMatch = line.match(/--bg:\s*(#[a-fA-F0-9]{6}|rgba?\([^)]+\))/);
      if (bgMatch) themes[currentThemeId].bg = bgMatch[1];
    }
    if (currentThemeId && line.includes('--accent:')) {
      const accentMatch = line.match(/--accent:\s*(#[a-fA-F0-9]{6}|rgba?\([^)]+\))/);
      if (accentMatch) themes[currentThemeId].accent = accentMatch[1];
    }
    if (currentThemeId && line.includes('--accent-2:')) {
      const accent2Match = line.match(/--accent-2:\s*(#[a-fA-F0-9]{6}|rgba?\([^)]+\))/);
      if (accent2Match) themes[currentThemeId].accent2 = accent2Match[1];
    }
    if (currentThemeId && line.includes('--green:')) {
      const greenMatch = line.match(/--green:\s*(#[a-fA-F0-9]{6}|rgba?\([^)]+\))/);
      if (greenMatch && !themes[currentThemeId].accent2) themes[currentThemeId].accent2 = greenMatch[1];
    }
    if (currentThemeId && line.includes('--yellow:')) {
      const yellowMatch = line.match(/--yellow:\s*(#[a-fA-F0-9]{6}|rgba?\([^)]+\))/);
      if (yellowMatch && !themes[currentThemeId].accent2) themes[currentThemeId].accent2 = yellowMatch[1];
    }
    if (currentThemeId && line.includes('TYPOGRAPHY:')) {
      // e.g. TYPOGRAPHY: Cormorant Garamond (display, hero) · DM Sans (body, UI)
      const typoText = line.replace('TYPOGRAPHY:', '').trim();
      const fontMatch = typoText.match(/^([a-zA-Z0-9\s]+)/);
      if (fontMatch) {
        themes[currentThemeId].fontHeading = fontMatch[1].trim();
      }
    }
  }
  
  console.log('Parsed themes from prompt:');
  Object.values(themes).forEach(t => {
    console.log(`- ${t.id}: ${t.name} | BG: ${t.bg || 'N/A'}, ACC: ${t.accent || 'N/A'}, ACC2: ${t.accent2 || 'N/A'} | Font: ${t.fontHeading || 'N/A'}`);
  });
  
} catch (err) {
  console.error('Error:', err);
}
