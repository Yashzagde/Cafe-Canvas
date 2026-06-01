# CafeCanva Homepage — Master Generation Plan

Regenerate the complete, production-ready, single-file homepage for **CafeCanva** at `d:\Cafe Canva\homepage.cafecanvas.bar\index.html`. The page will be styled as a "living artist's canvas" with warm, textured elements (creams, espresso browns, sage greens, ambers, watercolor gradients) and fluid GSAP/Lenis animations, fully responsive and free of black/near-black tones.

## User Review Required

> [!IMPORTANT]
> **Zero Near-Black Colors:** We will enforce CSS variables for colors, ensuring all body text, shadows, and dark highlights are warm browns (`#6B3A2A`, `#5C3D2E`) and never pure black or dark grey.
> **No Top Navigation Bar:** Standard header navbar will be removed entirely, replaced with fixed floating navigation dots on the right edge of the screen.

> [!WARNING]
> **Replacing Existing index.html:** This will completely replace the current `d:\Cafe Canva\homepage.cafecanvas.bar\index.html` (which does not use GSAP, has standard top navigation, and contains some dark accents).

## Open Questions

> [!IMPORTANT]
> **Formspree Form ID:** Do you have a specific Formspree form ID (e.g. `mqkvgzel`) that we should hardcode in the contact form, or should we leave it as a placeholder/comment for you to fill?

---

## Proposed Changes

### Web Homepage Component

#### [MODIFY] [index.html](file:///d:/Cafe%20Canva/homepage.cafecanvas.bar/index.html)
- Completely rebuild the page with the warm canvas aesthetic, loading screen, floating dots navigation, hero section with watercolor blobs and floating mockups, stats strip counter animations, product cards, how-it-works path drawer, detailed tabs, visual screenshots grid, download cards, documentation cards, enquiry form with floating labels, founder bio, and warm light footer.
- Add GSAP, Lenis, and Lucide libraries from CDN.
- Embed all styles in `<style>` and scripts in `<script>` with custom cursor and responsive behaviors.

---

## Verification Plan

### Automated Tests
- We will run the local Node server `node dev-server.js` (if configured) or open the page in a browser to inspect console warnings/errors.
- Run static checks on the generated HTML file to ensure all tag closures and script tags are valid.

### Manual Verification
- Verify that the custom cursor follows the mouse smoothly and rings expand/transform on links/buttons.
- Scroll down the page and verify that:
  - The loading screen fades out after 2 seconds.
  - The statistics counter numbers count up when scrolled into view.
  - The "How It Works" dotted path draws itself as the user scrolls.
  - Tabs in the deep-dive section switch content smoothly with GSAP animations.
- Test responsive viewports on desktop, tablet, and mobile to verify columns collapse and the floating navigation dots hide appropriately.
