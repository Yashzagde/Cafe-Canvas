import re

with open(r'd:\Cafe Canva\homepage.cafecanvas.bar\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the hero-content div (comment + div with all children) but keep the hero-cards div
old = """  <!-- Hero Centerpiece Content -->
  <div class="hero-content" data-reveal>
    <h1 style="font-family: 'Cormorant Garamond', serif; font-size: clamp(42px, 6vw, 76px); font-weight: 400; line-height: 1.1; color: #FAF6F0; margin-bottom: 18px;">
      Cafe <i>Canvas</i>
    </h1>
    <p style="font-family: 'DM Sans', sans-serif; font-size: clamp(16px, 2vw, 20px); font-weight: 300; color: rgba(250,246,240,0.80); line-height: 1.6; margin-bottom: 12px; letter-spacing: 0.02em;">
      Modern hospitality solutions for
    </p>
    <h2 style="font-family: 'Cormorant Garamond', serif; font-size: clamp(24px, 3.5vw, 42px); font-weight: 300; font-style: italic; color: #C9A84C; line-height: 1.2; margin-bottom: 0;">
      Caf\u00e9s, Restaurants, Bars & Pubs
    </h2>
  </div><div class="hero-cards">"""

new = """  <div class="hero-cards">"""

if old in content:
    content = content.replace(old, new)
    with open(r'd:\Cafe Canva\homepage.cafecanvas.bar\index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Hero content removed")
else:
    print("ERROR: Pattern not found")
    # Debug: find the approximate location
    idx = content.find('Hero Centerpiece Content')
    if idx >= 0:
        print(f"Found 'Hero Centerpiece Content' at position {idx}")
        print("Context:")
        print(repr(content[idx:idx+800]))
