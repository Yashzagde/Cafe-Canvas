/* ==========================================================================
   CLAUDE CODE HUB — INTERACTIVE JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // State Management
  let articles = [];
  let currentArticle = null;
  let activeTab = 'docs-browser';
  let activeConfigSubTab = 'settings';
  let themePreset = 'cyberpunk';

  // --- TAB SYSTEM IMPLEMENTATION ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update contents
      tabContents.forEach(c => c.classList.remove('active'));
      document.getElementById(targetTab).classList.add('active');
      
      activeTab = targetTab;
    });
  });

  // --- CONFIG SUB-TAB SYSTEM ---
  const subTabButtons = document.querySelectorAll('.sub-tab-btn');
  const subForms = document.querySelectorAll('.sub-form-content');

  subTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetConfig = btn.getAttribute('data-config');
      
      // Update sub tabs
      subTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update forms
      subForms.forEach(f => f.classList.remove('active'));
      document.getElementById(`form-${targetConfig}`).classList.add('active');
      
      activeConfigSubTab = targetConfig;
      
      // Update filename tab and compile configuration
      const filenameMap = {
        'settings': 'settings.json',
        'subagent': 'custom-subagents.json',
        'hooks': 'hooks.json'
      };
      document.getElementById('preview-filename').textContent = filenameMap[targetConfig];
      
      // Refresh instruction text
      const infoText = document.getElementById('export-info-text');
      if (targetConfig === 'settings') {
        infoText.innerHTML = 'Save the generated file above into your global config directory: <code class="terminal-inline">~/.claude/settings.json</code>. This enables experimental Agent Teams for all sessions.';
      } else if (targetConfig === 'subagent') {
        infoText.innerHTML = 'Save subagent definitions as <code class="terminal-inline">.claude/subagents/{agent-name}.json</code> inside your project directory to load custom role profiles.';
      } else {
        infoText.innerHTML = 'Save hook configs as <code class="terminal-inline">.claude/hooks.json</code> inside your project directory to run scripts checking tasks or teammate status automatically.';
      }

      compileConfig();
    });
  });

  // --- DYNAMIC DOCUMENT BROWSER IMPLEMENTATION ---
  const navContainer = document.getElementById('nav-container');
  const readerContent = document.getElementById('reader-content');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const tocNav = document.getElementById('toc-nav');

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false
  });

  // Render Sidebar and Categories
  function renderSidebar(filteredArticles) {
    if (filteredArticles.length === 0) {
      navContainer.innerHTML = `
        <div class="nav-loading">
          <i data-lucide="info" style="color: var(--text-dim);"></i>
          <p>No matches found</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    // Group by category
    const categories = {
      'Core Docs': [],
      'Agent SDK': [],
      'What\'s New': []
    };

    filteredArticles.forEach(art => {
      if (categories[art.category]) {
        categories[art.category].push(art);
      } else {
        categories['Core Docs'].push(art);
      }
    });

    let navHtml = '';

    for (const [catName, catList] of Object.entries(categories)) {
      if (catList.length === 0) continue;

      navHtml += `
        <div class="nav-category">
          <h4 class="category-title">${catName}</h4>
          <ul class="nav-list">
      `;

      catList.forEach(art => {
        const isActive = currentArticle && currentArticle.path === art.path ? 'active' : '';
        navHtml += `
          <li class="nav-item">
            <a class="nav-link ${isActive}" data-path="${art.path}">
              <i data-lucide="file-text"></i>
              <span>${art.title}</span>
            </a>
          </li>
        `;
      });

      navHtml += `
          </ul>
        </div>
      `;
    }

    navContainer.innerHTML = navHtml;
    lucide.createIcons();

    // Attach click events
    const navLinks = navContainer.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('data-path');
        const art = articles.find(a => a.path === path);
        if (art) loadArticle(art);
      });
    });
  }

  // Load and Parse Article
  async function loadArticle(art) {
    currentArticle = art;
    
    // Highlight sidebar active link
    const navLinks = navContainer.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('data-path') === art.path) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    readerContent.innerHTML = `
      <div class="nav-loading">
        <div class="spinner"></div>
        <p>Loading content...</p>
      </div>
    `;

    try {
      const response = await fetch(`docs/${art.path}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      let markdown = await response.readAsText ? await response.readAsText() : await response.text();

      // Convert warning/note tags to custom html alerts
      markdown = convertCustomAlerts(markdown);

      // Render markdown using Marked
      const renderedHtml = marked.parse(markdown);
      
      // Update viewer
      readerContent.innerHTML = renderedHtml;
      
      // Highlight code blocks
      Prism.highlightAllUnder(readerContent);

      // Generate Table of Contents
      generateTOC();

      // Initialize icons in rendered alerts
      lucide.createIcons();

      // Scroll reader to top
      document.querySelector('.reader-container').scrollTop = 0;

    } catch (err) {
      console.error(err);
      readerContent.innerHTML = `
        <div class="welcome-screen">
          <i data-lucide="alert-triangle" style="color: var(--danger);"></i>
          <h3>Failed to load document</h3>
          <p>${err.message}</p>
        </div>
      `;
      lucide.createIcons();
    }
  }

  // Helper to convert custom alerts (<Warning>, <Note>, etc.) to gorgeous html cards
  function convertCustomAlerts(md) {
    // Map: TagName -> HSL border class & Lucide icon
    const alertTypes = {
      'Warning': { class: 'alert-warning', title: 'Warning', icon: 'alert-triangle' },
      'Note': { class: 'alert-note', title: 'Note', icon: 'info' },
      'Tip': { class: 'alert-tip', title: 'Tip', icon: 'sparkles' },
      'Caution': { class: 'alert-caution', title: 'Caution', icon: 'shield-alert' }
    };

    let result = md;
    for (const [tag, props] of Object.entries(alertTypes)) {
      const openRegex = new RegExp(`<${tag}>`, 'g');
      const closeRegex = new RegExp(`</${tag}>`, 'g');

      result = result.replace(openRegex, `
<div class="custom-alert ${props.class}">
  <h4><i data-lucide="${props.icon}"></i> ${props.title}</h4>
`);
      result = result.replace(closeRegex, `</div>`);
    }

    return result;
  }

  // Table of Contents generator
  function generateTOC() {
    const headings = readerContent.querySelectorAll('h2, h3');
    
    if (headings.length === 0) {
      tocNav.innerHTML = '<p class="toc-empty">No headings on this page</p>';
      return;
    }

    let tocHtml = '';
    headings.forEach((heading, idx) => {
      const text = heading.textContent;
      const tag = heading.tagName.toLowerCase();
      
      // Give heading an ID if it doesn't have one
      const headingId = heading.id || `toc-heading-${idx}`;
      heading.id = headingId;

      tocHtml += `
        <a class="toc-link ${tag}" data-target="${headingId}">${text}</a>
      `;
    });

    tocNav.innerHTML = tocHtml;

    // Attach click listeners to TOC items
    const tocLinks = tocNav.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Implement IntersectionObserver to highlight section on scroll
    const observerOptions = {
      root: document.querySelector('.reader-container'),
      rootMargin: '-50px 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(l => {
            if (l.getAttribute('data-target') === id) {
              l.classList.add('active');
            } else {
              l.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    headings.forEach(h => observer.observe(h));
  }

  // --- SEARCH IMPLEMENTATION ---
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length > 0) {
      searchClearBtn.style.display = 'block';
      const filtered = articles.filter(art => 
        art.title.toLowerCase().includes(query) || 
        art.description.toLowerCase().includes(query)
      );
      renderSidebar(filtered);
    } else {
      searchClearBtn.style.display = 'none';
      renderSidebar(articles);
    }
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    renderSidebar(articles);
    searchInput.focus();
  });

  // Quick Links Event Bindings
  document.getElementById('ql-intro').addEventListener('click', () => {
    const art = articles.find(a => a.path.includes('quickstart.md'));
    if (art) loadArticle(art);
  });
  document.getElementById('ql-teams').addEventListener('click', () => {
    const art = articles.find(a => a.path.includes('agent-teams.md'));
    if (art) loadArticle(art);
  });
  document.getElementById('ql-subagents').addEventListener('click', () => {
    const art = articles.find(a => a.path.includes('sub-agents.md'));
    if (art) loadArticle(art);
  });

  // Fetch Index JSON
  async function fetchIndex() {
    try {
      const res = await fetch('docs_index.json');
      if (!res.ok) throw new Error('Could not load docs index');
      articles = await res.json();
      renderSidebar(articles);
    } catch (err) {
      console.error(err);
      navContainer.innerHTML = `
        <div class="nav-loading">
          <i data-lucide="alert-circle" style="color: var(--danger);"></i>
          <p>Failed to index documentation</p>
        </div>
      `;
      lucide.createIcons();
    }
  }

  // --- CONFIG BUILDER ENGINE ---
  const configInputs = [
    'set-teams', 'set-mode', 'set-permission', 'set-model',
    'plug-vercel', 'plug-security', 'sub-name', 'sub-model',
    'sub-instructions', 'sub-tools', 'hook-type', 'hook-command', 'hook-action'
  ];

  configInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', compileConfig);
      if (el.tagName === 'SELECT') {
        el.addEventListener('change', compileConfig);
      }
    }
  });

  const previewCodeBlock = document.getElementById('preview-code-block');
  const btnCopyPreview = document.getElementById('btn-copy-preview');
  const btnResetConfig = document.getElementById('btn-reset-config');
  const btnExportConfig = document.getElementById('btn-export-config');

  function compileConfig() {
    let outputObj = {};

    if (activeConfigSubTab === 'settings') {
      const env = {};
      if (document.getElementById('set-teams').value === '1') {
        env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1";
      }
      
      const enabledPlugins = {};
      if (document.getElementById('plug-vercel').checked) {
        enabledPlugins["vercel-plugin@vercel"] = true;
      }
      if (document.getElementById('plug-security').checked) {
        enabledPlugins["security-guidance-plugin"] = true;
      }

      outputObj = {
        "$schema": "https://json.schemastore.org/claude-code-settings.json",
        "env": env,
        "teammateMode": document.getElementById('set-mode').value,
        "permissionMode": document.getElementById('set-permission').value,
        "teammateModel": document.getElementById('set-model').value,
        "enabledPlugins": enabledPlugins
      };

    } else if (activeConfigSubTab === 'subagent') {
      const name = document.getElementById('sub-name').value || 'custom-subagent';
      const instructions = document.getElementById('sub-instructions').value || '';
      const toolsRaw = document.getElementById('sub-tools').value;
      const tools = toolsRaw ? toolsRaw.split(',').map(t => t.trim()) : [];

      outputObj = {
        "name": name,
        "model": document.getElementById('sub-model').value,
        "instructions": instructions
      };

      if (tools.length > 0) {
        outputObj.tools = tools;
      }

    } else if (activeConfigSubTab === 'hooks') {
      const type = document.getElementById('hook-type').value;
      const cmd = document.getElementById('hook-command').value || '';
      const failAction = document.getElementById('hook-action').value;

      outputObj = {
        "hooks": [
          {
            "event": type,
            "command": cmd,
            "onFailure": failAction === 'feedback' ? "send_feedback" : "terminate"
          }
        ]
      };
    }

    const compiledJson = JSON.stringify(outputObj, null, 2);
    previewCodeBlock.textContent = compiledJson;
    
    // Trigger Prism highlight
    Prism.highlightElement(previewCodeBlock);
  }

  // Reset form
  btnResetConfig.addEventListener('click', () => {
    if (activeConfigSubTab === 'settings') {
      document.getElementById('set-teams').value = '1';
      document.getElementById('set-mode').value = 'in-process';
      document.getElementById('set-permission').value = 'ask';
      document.getElementById('set-model').value = 'claude-3-5-sonnet';
      document.getElementById('plug-vercel').checked = true;
      document.getElementById('plug-security').checked = true;
    } else if (activeConfigSubTab === 'subagent') {
      document.getElementById('sub-name').value = '';
      document.getElementById('sub-model').value = 'claude-3-5-sonnet';
      document.getElementById('sub-instructions').value = '';
      document.getElementById('sub-tools').value = '';
    } else if (activeConfigSubTab === 'hooks') {
      document.getElementById('hook-type').value = 'TeammateIdle';
      document.getElementById('hook-command').value = '';
      document.getElementById('hook-action').value = 'feedback';
    }
    compileConfig();
  });

  // Copy Preview code to Clipboard
  btnCopyPreview.addEventListener('click', () => {
    navigator.clipboard.writeText(previewCodeBlock.textContent)
      .then(() => {
        const originalText = btnCopyPreview.innerHTML;
        btnCopyPreview.innerHTML = '<i data-lucide="check" style="color: var(--success)"></i> Copied!';
        lucide.createIcons();
        setTimeout(() => {
          btnCopyPreview.innerHTML = originalText;
          lucide.createIcons();
        }, 1500);
      });
  });

  // Export / Download Config
  btnExportConfig.addEventListener('click', () => {
    const filenameMap = {
      'settings': 'settings.json',
      'subagent': `${document.getElementById('sub-name').value || 'custom-subagent'}.json`,
      'hooks': 'hooks.json'
    };
    const filename = filenameMap[activeConfigSubTab];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(previewCodeBlock.textContent);
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // --- TERMINAL THEME LAB ENGINE ---
  const presetEl = document.getElementById('theme-preset');
  const primaryEl = document.getElementById('theme-primary');
  const accentEl = document.getElementById('theme-accent');
  const bgEl = document.getElementById('theme-bg');
  const textEl = document.getElementById('theme-text');
  
  const simTerminalFrame = document.getElementById('sim-terminal-frame');
  const simTerminalBody = document.getElementById('sim-terminal-body');
  const simStatusLine = document.getElementById('sim-status-line');
  const themeCodeBlock = document.getElementById('theme-code-block');
  const btnExportTheme = document.getElementById('btn-export-theme');

  const presets = {
    'cyberpunk': { primary: '#6366f1', accent: '#d946ef', bg: '#0c0f17', text: '#e2e8f0' },
    'matrix': { primary: '#10b981', accent: '#34d399', bg: '#05070a', text: '#22c55e' },
    'aurora': { primary: '#0ea5e9', accent: '#10b981', bg: '#0b131a', text: '#cbd5e1' },
    'glass': { primary: '#ffffff', accent: '#64748b', bg: '#0f172a', text: '#f8fafc' }
  };

  presetEl.addEventListener('change', () => {
    const pre = presets[presetEl.value];
    if (pre) {
      primaryEl.value = pre.primary;
      accentEl.value = pre.accent;
      bgEl.value = pre.bg;
      textEl.value = pre.text;
      updateSimulator();
    }
  });

  [primaryEl, accentEl, bgEl, textEl].forEach(el => {
    el.addEventListener('input', updateSimulator);
  });

  function updateSimulator() {
    const p = primaryEl.value;
    const a = accentEl.value;
    const bg = bgEl.value;
    const txt = textEl.value;

    // Apply styles to simulator terminal
    simTerminalFrame.style.borderColor = `rgba(${hexToRgb(p)}, 0.15)`;
    simTerminalBody.style.backgroundColor = bg;
    simTerminalBody.style.color = txt;

    // Apply glowing text styles
    const prompts = simTerminalBody.querySelectorAll('.prompt');
    prompts.forEach(pr => pr.style.color = p);

    const activePill = simTerminalBody.querySelector('.tm-pill.active');
    if (activePill) {
      activePill.style.borderColor = p;
      activePill.style.backgroundColor = `rgba(${hexToRgb(p)}, 0.12)`;
      activePill.style.color = txt;
    }

    const chats = simTerminalBody.querySelectorAll('.chat-user');
    chats.forEach(ch => ch.style.color = a);

    // Status Line Simulator Styling
    simStatusLine.style.backgroundColor = `rgba(${hexToRgb(p)}, 0.15)`;
    simStatusLine.style.borderColor = `rgba(${hexToRgb(p)}, 0.25)`;
    simStatusLine.style.color = txt;

    // Generate output theme json
    const themeObj = {
      "theme": {
        "primaryGlow": p,
        "secondaryAccent": a,
        "backgroundColor": bg,
        "textColor": txt,
        "statusLine": {
          "background": `rgba(${hexToRgb(p)}, 0.15)`,
          "border": `rgba(${hexToRgb(p)}, 0.25)`
        }
      }
    };

    themeCodeBlock.textContent = JSON.stringify(themeObj, null, 2);
    Prism.highlightElement(themeCodeBlock);
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  // Export theme config
  btnExportTheme.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(themeCodeBlock.textContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "theme.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Initial fetch and compilation
  fetchIndex();
  compileConfig();
  updateSimulator();
});
