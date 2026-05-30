# ☕ CAFE CANAVA — MASTER THEME PROMPT
## For Gemini 2.5 Flash · High Thinking Mode
## 52 Themes · Call Staff System · Mobile-First · No Code

---

> **HOW TO USE:**
> Paste this entire document into Gemini 2.5 Flash with Thinking set to HIGH.
> Let Gemini think fully before generating. Do not interrupt the thinking phase.
> After output, follow up with: *"Now apply the selected theme tokens to every
> page component including the Call Staff button. Ensure call-staff states match the
> active theme's accent color and personality."*

---

## ═══════════════════════════════════════════════════
## PART 0 — SYSTEM ROLE & MISSION
## ═══════════════════════════════════════════════════

You are the principal UI/UX architect for **Cafe Canava**, a Shopify-style
multi-tenant SaaS platform for Indian restaurants and cafes. Every tenant gets
a fully branded website on their own custom domain or at
`cafecanava.com/[slug]`.

Your mission in this session:

Design and specify the **complete Theme Selection System** for all 52 themes
plus the **Call Staff feature** — a real-time dine-in staff alert button that
must adapt visually and behaviourally to whichever theme the tenant has chosen.

You are building for:
- **Platform:** Next.js 14 App Router · Supabase · Razorpay · Tailwind CSS · Framer Motion · Swiper.js
- **Primary viewport:** Mobile-first (390px), scales to 1440px desktop
- **Target users:** Indian restaurant/cafe owners and their customers
- **Languages:** English primary, with regional script toggles (Hindi, Tamil, Marathi, etc.)
- **Payment:** Razorpay (UPI, cards, wallets, BNPL)
- **Regions:** India-first, export to Southeast Asia and diaspora markets

---

## ═══════════════════════════════════════════════════
## PART 1 — PLATFORM ARCHITECTURE OVERVIEW
## ═══════════════════════════════════════════════════

### 1.1 Tenant Website Pages (12 pages per tenant)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Homepage | 3-card hero swipe · categories · Google Reviews · Instagram · blogs |
| `/menu` | Full Menu | Category filter · veg/non-veg toggle · add to cart |
| `/dine-in` | Table Ordering | QR table session · live order tracking · **CALL STAFF button** |
| `/delivery` | Home Delivery | Address · slot picker · real-time tracking map |
| `/products` | Featured Items | Bestsellers · seasonal specials · combos |
| `/blogs` | Food Stories | SEO articles · recipe cards · AI-generated content |
| `/account` | Customer Profile | Order history · saved addresses · loyalty points |
| `/offers` | Deals | Coupons · combo deals · loyalty tier benefits |
| `/about` | Brand Story | Team · values · certifications |
| `/contact` | Customer Service | Live chat · call · map · hours · feedback form |
| `/gallery` | Photo Feed | Food photos · ambience · Instagram embed |
| `/careers` | Jobs | Openings · application form |

### 1.2 Revenue Tiers

| Plan | Price | Themes Available |
|------|-------|-----------------|
| Starter | ₹999/mo | 10 themes |
| Growth | ₹2,499/mo | 30 themes |
| Scale | ₹5,999/mo | All 52 themes + AI features |
| Enterprise | Custom | Custom themes + white-label |

### 1.3 Theme Runtime System

Themes are CSS custom properties stored in Supabase Storage as individual
CSS files (`theme-01.css` through `theme-52.css`). The theme engine loads the
correct file at runtime per tenant. Tenants switch themes from their dashboard
instantly — no redeployment needed.

Every component uses only `var(--token-name)` references. Never hard-coded
colour values anywhere in components.

### 1.4 Notification & Conversion System

Before any customer visits a tenant page, a smart popup fires:
- Trigger: First visit, 1.5 second delay, once per 30 days
- Captures phone number → OTP via Supabase Auth
- Post-verify: WhatsApp welcome message with promo code `WELCOME10`
- Popup adapts to the active theme's color palette and typography

---

## ═══════════════════════════════════════════════════
## PART 2 — CALL STAFF FEATURE SPECIFICATION
## ═══════════════════════════════════════════════════

### 2.1 What is Call Staff?

A physical dine-in customer who has scanned a QR code on their table and
loaded the `/dine-in` page should be able to summon a waiter with a single tap.
This replaces waving hands, shouting "bhaiya!", or pressing a physical buzzer.
It should feel instant, satisfying, and unmistakable.

### 2.2 Customer-Side Experience (Frontend)

**Button placement:**
- Persistent floating button — always visible during a dine-in session
- Position: bottom-right corner on mobile, above the cart/order bar
- Size: minimum 56px diameter (accessible tap target), ideally 64px
- Icon: a bell (🔔) or waiter silhouette — bold, clear at a glance
- Label: "Call Staff" in 12px below icon (or hidden if theme is icon-only)

**Button States (4 states, each with distinct visual treatment):**

| State | Label | Visual Cue | Duration |
|-------|-------|-----------|----------|
| `IDLE` | "Call Staff" | Theme accent color, gentle pulse animation | Persistent |
| `CALLING` | "Calling..." | Animated ring pulse radiating outward, loading spinner inside icon | 0–30 seconds |
| `ACKNOWLEDGED` | "Staff Coming!" | Green fill, checkmark animation, brief haptic/vibration hint | 15 seconds auto-dismiss |
| `COOLDOWN` | "Called (2 min)" | Greyed out, countdown timer, prevents spam | 2 minutes |

**Interaction flow:**
1. Customer taps the button
2. Immediate visual feedback: button enters `CALLING` state
3. POST request fires to `/api/dine-in/call-staff` with `{ tableId, sessionId, timestamp }`
4. If API success within 2 seconds: button enters `ACKNOWLEDGED`
5. If no response in 30 seconds: show "Try Again" option
6. Button enters `COOLDOWN` for 2 minutes after acknowledgement
7. Customer can still browse/order while waiting — button stays in corner

**Additional UX details:**
- The button should not obscure the add-to-cart button or navigation
- On scroll, the button remains fixed — it never scrolls away
- If a waiter has already been called, show the remaining cooldown countdown
- On table session expiry (after bill payment), the button disappears
- Haptic feedback on tap if `navigator.vibrate` is available: `vibrate(50)`

### 2.3 Staff-Side Experience (Store Admin Panel)

When a customer taps "Call Staff", the store admin panel (separate
`/store-admin` Next.js app) must:

- Show a real-time alert: "🔔 Table [X] needs assistance"
- Play an audible chime (short, non-jarring — not a loud alarm)
- Display the alert as a banner at the top of the admin dashboard
- Show table number, time since call, and a "Mark as Attended" button
- Keep a call log: timestamp, table number, staff member who attended
- Use Supabase Realtime (WebSocket subscription) for instant push
- Badge count on admin nav: unread call alerts

**Admin notification card:**
```
🔔  Table 7 needs assistance
    Called at 7:43 PM · 1 min ago
    [Mark as Attended]  [Ignore]
```

### 2.4 Technical Integration Points

**API endpoint:** `POST /api/dine-in/call-staff`
- Body: `{ tableNumber, tableSessionId, tenantId, timestamp }`
- Returns: `{ success, callId, estimatedWaitSeconds }`
- On success: creates a record in Supabase `staff_calls` table
- Supabase Realtime broadcasts to admin panel's `staff_calls` channel

**Data model (Supabase):**
```
staff_calls table:
  id, tenant_id, table_number, session_id,
  called_at, attended_at, attended_by,
  status (pending / attended / ignored)
```

**Cooldown enforcement:**
- Check Supabase for last call from this `tableSessionId` within 2 minutes
- If recent call exists: return `{ cooldown: true, remainingSeconds: N }`
- Frontend enforces cooldown locally too (localStorage per table session)

### 2.5 Theme Adaptation Rules for Call Staff Button

The Call Staff button MUST visually harmonize with the active theme.
It is not a generic orange button on every theme.

| Theme Type | Call Staff Visual Treatment |
|-----------|----------------------------|
| Premium Glass (01, 02) | Glassmorphism button, accent-color ring pulse |
| Dark Luxury (03, 45) | Dark button body, gold/ember accent ring |
| Indian Regional (08–14, 26–30) | Use the theme's primary accent, match festive energy |
| Seasonal (37–44) | Match seasonal mood (diya glow for Diwali, snow pulse for Christmas) |
| International (15–25) | Culture-matched color: red for Chinese, sakura pink for Japanese |
| Modern (31–36) | Neon glow for street food, botanical leaf for organic, pastel for kawaii |
| Accessible (46) | High contrast, visible focus ring, text label mandatory |
| Kiosk (48) | Oversized button (100px+), no hover states, top-center placement |

**Universal rule:** In `ACKNOWLEDGED` state, the green fill (#22C55E) is used
across ALL themes (universal success signal). Only the button's default/calling
state adapts to the theme.

---

## ═══════════════════════════════════════════════════
## PART 3 — ALL 52 THEMES: COMPLETE SPECIFICATIONS
## ═══════════════════════════════════════════════════

Each theme entry is formatted as:
**Theme ID · Name · Tier/Category**
`Best For | Palette | Typography | Mood | Key UI Features | Call Staff Style`

---

### TIER 1 — PREMIUM (Themes 01–03)

---

**Theme 01 · Liquid Glass Premium · Tier 1**
Best For: High-end rooftop cafes, luxury bars, fine dining
Palette: Deep navy-black #0A0A1A · Gold #D4AF37 · Ember accent #FF6B35 · White glass rgba(255,255,255,0.12)
Typography: Cormorant Garamond (display) · DM Sans (body) · Cinzel (accents)
Mood: 5-star hotel lobby, night-time fine dining, zero-gravity elegance
Key UI Features:
- Full-bleed video hero with floating glass card overlay
- Animated bokeh particle background
- Gold shimmer on CTA hover
- 3-card swipe hero with glassmorphism cards
- Floating navbar with blur on scroll
- Google Reviews and Instagram feed in glass cards
Call Staff Style: Glass morphism button (backdrop-blur, gold border), radial gold pulse ring on CALLING state, "Gold Service" label in Cinzel font

---

**Theme 02 · Liquid Glass Basic · Tier 1**
Best For: Minimalist cafes, co-working cafes, all-day breakfast joints
Palette: Warm white #F8F9FA · Glass rgba(255,255,255,0.70) · Orange accent #FF6B35 · Dark text #1A1A2E
Typography: Fraunces (display) · Inter (body)
Mood: Scandinavian-influenced, airy, Kinfolk magazine
Key UI Features:
- Split hero (large serif headline + lifestyle photo)
- Soft shadow cards on warm white
- Orange CTAs with smooth hover
- Light mode first with dark mode toggle
- Blog cards with editorial image layout
Call Staff Style: White glassmorphism button with orange accent ring, clean minimal label, soft pulse

---

**Theme 03 · Onyx Luxury Dark · Tier 1**
Best For: Fine dining, premium bars, whiskey/cigar lounges
Palette: Near-black #0D0D0D · Card #1C1C1C · Champagne gold #C9A84C · Off-white text #F5F5F5
Typography: Playfair Display (display) · Libre Baskerville (body)
Mood: Michelin-starred silence, single malt evenings, no neon ever
Key UI Features:
- Cinematic full-screen hero with parallax scroll
- Gold hairline border on all cards
- Chef's notes in italic pull-quotes
- Minimalist menu with gold divider lines
- Reservation form with dark elegant styling
Call Staff Style: Dark button with champagne gold border, subtle glow pulse, Playfair italic "Summon Staff" label

---

### TIER 2 — CAFE (Themes 04–07)

---

**Theme 04 · Classic Cafe Brown · Tier 2**
Best For: Traditional coffee shops, chai houses, Irani cafes, 1920s-era establishments
Palette: Espresso #3D1C02 · Sienna #A0522D · Linen #FFF3E0 · Chocolate #D2691E · Wheat #F5DEB3
Typography: Abril Fatface (display) · Merriweather (body) · Josefin Sans (UI)
Mood: Old Mumbai Irani cafe, Paris boulangerie, history on the walls
Key UI Features:
- Kraft paper CSS texture background
- Vintage illustrated coffee-bean dividers
- Chalkboard-style menu section
- Daily specials ticker banner
- Story section "Our Journey Since 1987"
Call Staff Style: Warm brown button with sienna border, illustrated bell icon, vintage label "Call Waiter" in Josefin Sans

---

**Theme 05 · Artisan Roastery · Tier 2**
Best For: Specialty coffee, pour-over cafes, third-wave coffee bars
Palette: Near-black #1B1B1B · Roast brown #4A3728 · Parchment #E8DCC8 · Amber #F97316
Typography: Space Grotesk (display) · Nunito (body)
Mood: Blue Bottle meets Stumptown, converted warehouse, serious about beans
Key UI Features:
- Dark industrial hero with coffee bean photography
- "From Farm to Cup" origin story section with map
- Coffee product grid with roast-level badges
- Brew guide with step illustrations
- Bold Space Grotesk numerals for brew stats
Call Staff Style: Parchment-colored button on dark background, amber accent ring, monospace "Call Staff" label in Space Grotesk

---

**Theme 06 · Chocolate Indulgence · Tier 2**
Best For: Dessert cafes, patisseries, gelato shops, chocolate boutiques
Palette: Dark chocolate #3B1D0E · Milk chocolate #7B3F00 · Caramel #D2A679 · Cream #FFF0E6 · Pink #E91E8C
Typography: Bodoni Moda (display) · Lato (body)
Mood: Ladurée meets Vosges Haut-Chocolat, luxury wrapped in pink ribbon
Key UI Features:
- Chocolate drip CSS animation on hero border
- Dessert macro photography grid
- Gift box packaging CTA
- "Build Your Box" interactive selector
- Pink heart animation on favourite toggle
Call Staff Style: Deep chocolate button with caramel drip effect on top edge, pink sparkle on tap, "Sweet Assistance" italic label in Bodoni Moda

---

**Theme 07 · Matcha Zen · Tier 2**
Best For: Japanese cafes, health cafes, vegan spots, wellness brands
Palette: Dark matcha #2D5016 · Matcha green #4A7C24 · Washi paper #F5F0E8 · Sand #E8D5B7 · Clay #C8A882
Typography: Noto Serif JP (display) · Poppins (body)
Mood: Ippodo Tea, wabi-sabi stillness, ceremony and intention
Key UI Features:
- Washi paper CSS texture background
- Ink brush stroke SVG dividers between sections
- Matcha grade selector (Ceremonial / Culinary / Classic)
- Generous whitespace Zen layout
- Japanese kanji accent decorations
Call Staff Style: Minimal matcha-green circle button, ink brush stroke ring animation on CALLING, quiet "Staff" label — restraint is the aesthetic

---

### TIER 3 — INDIAN REGIONAL (Themes 08–14)

---

**Theme 08 · Rajasthani Royal · Tier 3**
Best For: Dal Baati restaurants, Rajasthani thali, mithai shops, Udaipur fine dining
Palette: Deep maroon #8B0000 · Gold #D4AF37 · Saffron #FF6B00 · Cornsilk #FFF8DC · Royal purple #4B0082
Typography: Rozha One (display) · Hind (body)
Mood: Desert palace dinner, Rajput royalty at table, sunset over Jaisalmer
Key UI Features:
- Rajasthani jali SVG geometric pattern background
- Gold meenakari border on all cards
- Haveli-arch hero frame design
- Thali combo builder (interactive)
- Folk art illustrated menu dividers
- Camel silhouette footer animation
Call Staff Style: Maroon button with gold meenakari border, jali pattern inner ring animation, "Seva Bulayein" Hindi label beneath bell icon

---

**Theme 09 · Maharashtrian Heritage · Tier 3**
Best For: Vada Pav stalls, Misal Pav shops, Marathi thali, Mumbai street food
Palette: Marigold orange #FF8C00 · Saddle brown #8B4513 · Dark green #006400 · Seashell #FFF5EE · Crimson #DC143C
Typography: Tiro Devanagari Marathi (display) · Mukta (body)
Mood: Khau Galli Mumbai, Sunday morning Misal at College Road Pune
Key UI Features:
- Warli tribal art SVG background pattern
- Meal-time filter tabs (Breakfast / Lunch / Snacks / Dinner)
- Marathi language headline toggle
- Misal Pav spice level badge system
- Festival offer banner (Ganesh Chaturthi, Gudi Padwa)
- Pune / Mumbai outlet selector
Call Staff Style: Marigold orange button with warli art stencil as background texture, "कर्मचारी बोलवा" Marathi label option, green crimson ring on CALLING

---

**Theme 10 · Mughal Garden · Tier 3**
Best For: North Indian fine dining, Mughlai cuisine, biryani houses
Palette: Deep garden green #1B4332 · Gold #D4AF37 · Maroon #8B0000 · Ivory #F5F0E0 · Plum #4A235A
Typography: Amiri (display) · Noto Nastaliq Urdu (accents) · Hind (body)
Mood: Bukhara Delhi, Dum Pukht, a Mughal emperor's private banquet
Key UI Features:
- Arabesque CSS geometric background pattern
- Mughal arch-shaped image frames for dishes
- Biryani dum-layering animation
- "Slow Cook" timer badge on dum dishes
- Gold-foil effect on premium dish cards
- Urdu script accent decorations
Call Staff Style: Garden green button with gold arabesque border, ornate animated ring with plum secondary glow, "خدمت طلب کریں" Urdu label for premium tenants

---

**Theme 11 · Punjabi Dhaba Bold · Tier 3**
Best For: Dhaba-style joints, Punjabi cuisine, lassi bars, Amritsari spots
Palette: Deep orange-red #FF4500 · Yellow #FFD700 · Green #006400 · Cream #FFFACD · Brown #8B4513
Typography: Baloo Paaji 2 (display) · Mukta (body)
Mood: Grand Trunk Road midnight stop, butter on hot naan, loud and proud
Key UI Features:
- Truck-art SVG border decorations on all sections
- Bold dhaba-style oversized typography
- Punjabi / English language toggle
- Lassi flavour selector with colour swatches
- "Pure Desi Ghee" trust badge
- Roadside hoarding-inspired offer banner
Call Staff Style: Bold red-orange button with truck-art flower decoration, loud yellow ring burst on CALLING, "ਕਰਮਚਾਰੀ ਬੁਲਾਓ" Punjabi label option

---

**Theme 12 · South Indian Temple · Tier 3**
Best For: Idli-dosa spots, Kerala restaurants, filter coffee houses, MTR-style
Palette: Dark goldenrod #B8860B · Dark green #006400 · Temple red #8B0000 · Cream #FFFDD0 · Bronze #FF8C00
Typography: Noto Serif Tamil (Tamil text) · Tiro Kannada (Kannada text) · Mukta (body)
Mood: MTR Bangalore, Hotel Saravana Bhavan, brass lamps and banana leaf
Key UI Features:
- Kolam / rangoli SVG background pattern
- Temple gopuram arch-shaped hero frame
- Banana leaf menu section background
- Filter coffee drip CSS animation
- Tamil / Telugu / Kannada script headline toggle
- Brass lamp SVG divider
Call Staff Style: Temple red button with gold arch border, kolam ring animation radiating outward, "உதவி அழைக்கவும்" Tamil label toggle

---

**Theme 13 · Gujarat Mithai Gold · Tier 3**
Best For: Gujarati thali restaurants, mithai shops, farsan stalls, Navratri specials
Palette: Saffron yellow #FFD700 · Orange #FF8C00 · Deep red #8B0000 · Floral white #FFFAF0 · Green #008000
Typography: Noto Serif Gujarati (display) · Hind Vadodara (body)
Mood: Manek Chowk Ahmedabad, Diwali mithai shopping, generations in one kitchen
Key UI Features:
- Bandhani tie-dye SVG pattern background
- Mithai grid with illustrated descriptions
- Navratri festival offer banner (seasonal switch)
- Interactive thali builder
- Sweet weight-picker for mithai orders (100g / 250g / 500g / 1kg)
- "Pure Ghee" and "No Onion No Garlic" badges
Call Staff Style: Saffron yellow button with bandhani pattern ring, "સ્ટાફ ને બોલાવો" Gujarati label, festive energy on CALLING state

---

**Theme 14 · Kashmiri Winter · Tier 3**
Best For: Kashmiri cuisine, Kahwa tea houses, Wazwan caterers, Dal Lake restaurants
Palette: Midnight blue #1E3A5F · Silver #C0C0C0 · Kashmiri chili red #8B0000 · Snow white #F5F5F5 · Saffron #DAA520
Typography: Noto Nastaliq Urdu (display) · Hind (body)
Mood: Wazwan feast in a Srinagar houseboat, saffron snow, quiet luxury
Key UI Features:
- Paisley SVG pattern in silver on white
- Chinaar leaf seasonal decoration
- Kahwa tea product card with steaming animation
- Wazwan multi-course feast showcase
- Houseboat ambience hero photography
- Saffron spice authentication badge
Call Staff Style: Midnight blue button with silver paisley border, gentle silver snowflake pulse on CALLING, "خادم بلائیں" Urdu label option

---

### TIER 4 — INTERNATIONAL (Themes 15–25)

---

**Theme 15 · Italian Trattoria · Tier 4**
Best For: Pizza restaurants, pasta bars, Italian gelato shops
Palette: Italian green #009246 · Italian red #CE2B37 · White #FFFFFF · Parchment #F5F0DC · Terracotta #8B4513
Typography: Playfair Display (display) · Lora (body)
Mood: Authentic Naples trattoria, nonna's recipe, warm terracotta walls
Key UI Features:
- Aged parchment CSS texture
- Hand-drawn pasta SVG illustrations
- Pizza builder (interactive topping selector)
- Italian wine pairing recommendations
- Olive branch SVG dividers
- "Made in Italy" authenticity badge
Call Staff Style: Terracotta button with green-red tricolore accent ring, Italian flag-inspired CALLING animation, "Chiama il Cameriere" italic label option

---

**Theme 16 · Chinese Dynasty Red · Tier 4**
Best For: Chinese restaurants, dim sum houses, bubble tea bars
Palette: Crimson red #DC143C · Imperial gold #FFD700 · Black #1C1C1C · Dragon cream #FFF8DC · Mandarin #FF6B00
Typography: Noto Serif SC (display) · Source Han Sans SC (body)
Mood: Imperial Treasure Singapore, Hong Kong dim sum palace, lucky red lanterns
Key UI Features:
- Dragon cloud scroll SVG pattern background
- Red lantern SVG animation
- Chinese character accent decorations
- Dim sum rolling cart animation on menu
- Lucky number table booking
- Chopstick CSS loading animation
Call Staff Style: Crimson red button with gold dragon scale border, lantern-glow pulse on CALLING, "呼叫服务员" Chinese label option

---

**Theme 17 · Japanese Sakura · Tier 4**
Best For: Sushi bars, ramen shops, izakayas, Japanese dessert cafes
Palette: Sakura pink #FFB7C5 · Sumi black #1C1C1C · Washi #F5F0E0 · Beni red #8B0000 · Bamboo green #4A7C59
Typography: Noto Serif JP (display) · Zen Kaku Gothic New (body)
Mood: Refined Tokyo izakaya, kaiseki seasonality, cherry blossoms on gravel paths
Key UI Features:
- Falling sakura petal CSS animation on hero
- Washi paper SVG texture
- Seasonal omakase menu showcase
- Japanese dense grid layout
- Mt. Fuji SVG footer silhouette
- Minimalist ramen bowl illustration cards
Call Staff Style: Sakura pink button with washi paper texture inside, petal ring scatter on CALLING, "スタッフを呼ぶ" Japanese label option, delicate and precise

---

**Theme 18 · Mediterranean Blue · Tier 4**
Best For: Greek, Lebanese, Turkish, Spanish Mediterranean restaurants
Palette: Dodger blue #1E90FF · White #FFFFFF · Wheat #F5DEB3 · Sea green #3CB371 · Tomato #FF6347
Typography: Philosopher (display) · Open Sans (body)
Mood: Santorini terrace, coastal taverna, olive oil poured at the table
Key UI Features:
- Greek meander SVG border pattern
- Santorini blue dome photography style guide
- Meze platter sharing format selector
- Olive oil sourcing story section
- Blue-and-white tile card design
- Mediterranean location map section
Call Staff Style: Santorini blue button with white border, wave ring on CALLING, "Κάλεσε Σερβιτόρο" Greek or multilingual label option

---

**Theme 19 · Mexican Fiesta · Tier 4**
Best For: Taqueria, burritorias, margarita bars, Mexican street food
Palette: Red #FF0000 · Green #006400 · Yellow #FFD700 · Orange #FF8C00 · Cream #FFFACD
Typography: Pacifico (display) · Nunito (body)
Mood: Authentic Mexico City taqueria, Cinco de Mayo every day, noise and colour
Key UI Features:
- Papel picado CSS cut-paper animation
- Cactus and sombrero SVG illustrations
- Salsa heat-level selector (1–5 chilis)
- Taco Tuesday automated daily offer banner
- Fiesta confetti burst on order confirmation
- Day of the Dead loyalty badge tier
Call Staff Style: Red and green fiesta button with papel picado border decoration, confetti-burst ring on CALLING, "Llama al Mesero" script label

---

**Theme 20 · Thai Tropical · Tier 4**
Best For: Thai restaurants, Vietnamese pho houses, Southeast Asian cuisine
Palette: Tropical green #006400 · Gold #FFD700 · Chili orange #FF4500 · White #F5F5F5 · Teak #8B4513
Typography: Mitr (display) · Sarabun (body)
Mood: Bangkok street food meets upscale Thai fusion, lemongrass in the air
Key UI Features:
- Tropical leaf SVG pattern background
- Spice level chili visual indicator (1–5 chilis)
- Curry colour selector (Red / Green / Yellow)
- Thai script heading toggle
- Lemongrass botanical border illustration
- Bangkok street market hero photography
Call Staff Style: Teak wood-textured button with tropical green ring, leaf-flutter animation on CALLING, "เรียกพนักงาน" Thai label option

---

**Theme 21 · American Diner Chrome · Tier 4**
Best For: Burger joints, BBQ restaurants, milkshake bars, sports bars
Palette: Red #FF0000 · White #FFFFFF · Black #1C1C1C · Chrome silver #C0C0C0 · Mustard yellow #FFD700
Typography: Bebas Neue (display) · Roboto (body)
Mood: Johnny Rockets Route 66, jukebox in the corner, checkered floor
Key UI Features:
- Checkerboard tile CSS background pattern
- Neon text-shadow glow effect on headings
- Milkshake colour swatch flavour selector
- Retro badge price tags on menu cards
- Jukebox-themed footer section
- "Build Your Burger" interactive configurator
Call Staff Style: Chrome-effect button with red neon glow ring, neon flicker animation on CALLING state, "HEY WAITER!" Bebas Neue all-caps label

---

**Theme 22 · Korean Bento · Tier 4**
Best For: Korean BBQ, kimbap shops, Korean fried chicken, ramen bars
Palette: Korean red #E8002D · Navy #003478 · White #FFFFFF · Beige #F5F5DC · Green #228B22
Typography: Noto Sans KR (display) · Nanum Gothic (body)
Mood: Modern Seoul KBBQ, banchan lineup, K-drama-poster aesthetic
Key UI Features:
- Hanji paper CSS texture background
- KBBQ grill grate SVG hero element
- Banchan side dish carousel
- Gochujang spice level selector
- K-drama aesthetic hero layout
- K-pop playlist tie-in offer section
Call Staff Style: Korean red button with navy border, KBBQ grill-spark ring on CALLING, "직원 호출" Korean label option

---

**Theme 23 · French Patisserie · Tier 4**
Best For: Patisserie, boulangerie, French bistro, wine bars
Palette: Lilac #C8A2C8 · Champagne #F5F0E0 · Bordeaux #8B0000 · Gold #D4AF37 · Charcoal #36454F
Typography: Cormorant (display) · EB Garamond (body)
Mood: Ladurée Paris, Saturday morning boulangerie, life is beautiful
Key UI Features:
- Fleur-de-lis SVG pattern background
- Macaron colour swatch product selector
- Croissant hero with soft bokeh photography
- Handwritten CSS script accents
- Wine pairing recommendation section
- "Fait Maison" (Homemade) trust badge
Call Staff Style: Champagne button with lilac fleur-de-lis border, soft bordeaux ring on CALLING, "Appeler le Serveur" French label in EB Garamond italic

---

**Theme 24 · Middle Eastern Souk · Tier 4**
Best For: Lebanese, Moroccan, Persian, Turkish restaurants
Palette: Burgundy #8B0000 · Gold #D4AF37 · Lapis #1C4E80 · Sand #F5E6C8 · Emerald #228B22
Typography: Amiri (Arabic display) · Cairo (Arabic body) · Inter (Latin)
Mood: Bosphorus rooftop, Beirut mezze, bazaar lanterns at dusk
Key UI Features:
- Girih Islamic geometric tile pattern background
- Arabic calligraphy hero accent
- Moroccan lantern CSS animation
- Halal certification badge (prominent, above fold)
- RTL layout support toggle
- Ramadan Iftar special seasonal banner
- Mezze sharing platter builder
Call Staff Style: Burgundy button with girih tile gold border, Moroccan lantern glow ring, "نادِ الموظف" Arabic label with RTL support, emerald ACKNOWLEDGED state

---

**Theme 25 · Spanish Tapas · Tier 4**
Best For: Tapas bars, paella restaurants, sangria bars, flamenco venues
Palette: Spanish red #CC0000 · Gold #FFD700 · Sunset orange #FF6600 · Floral white #FFFAF0 · Olive #1E5631
Typography: Lobster Two (display) · Raleway (body)
Mood: Barcelona bodega, flamenco heels on stone floor, sangria pour
Key UI Features:
- Azulejo Spanish tile SVG pattern
- Flamenco dancer silhouette animation
- Tapas sharing format card layout
- Sangria builder (interactive mixer)
- Paella size selector (for 2 / 4 / 6 people)
- Guitar string hover ambient sound effect
Call Staff Style: Red button with azulejo tile border, flamenco rose petal ring burst on CALLING, "Llama al Camarero" Lobster italic label

---

### TIER 5 — REGIONAL INDIAN (Themes 26–30)

---

**Theme 26 · Bengali Fish Curry · Tier 5**
Best For: Bengali cuisine restaurants, fish curry specialists, mishti shops
Palette: Bengali blue #006994 · Mustard yellow #F5F5DC · Deep red #8B0000 · Peach #FFDAB9 · Green #228B22
Typography: Noto Serif Bengali (display) · Hind Siliguri (body)
Mood: Kolkata adda, Rabindra Sangeet in the air, ilish maach on every table
Key UI Features:
- Hilsa fish SVG pattern border
- Patachitra folk art illustrations
- Bengali script headline toggle
- Mishti-doi and sweets product grid
- River fish freshness "Caught Today" badge
- Durga Puja seasonal festival banner
Call Staff Style: Bengali blue button with mustard yellow border, patachitra folk art ring decoration, "কর্মী ডাকুন" Bengali label option

---

**Theme 27 · Kerala Backwater · Tier 5**
Best For: Kerala seafood restaurants, sadya caterers, Malabar cuisine
Palette: Kerala green #006400 · Sunset orange #FF8C00 · Backwater blue #1E90FF · Coconut cream #FFFDD0 · Coir brown #8B4513
Typography: Noto Serif Malayalam (display) · Mandali (body)
Mood: Alleppey sunrise, onam feast on banana leaf, kathakali drums
Key UI Features:
- Palm leaf SVG background pattern
- Banana leaf menu section layout
- Kathakali mask accent decoration
- Onam sadya builder (interactive)
- Houseboat hero photography
- Malayalam script headline toggle
- "100% Coconut Oil" trust badge
Call Staff Style: Coir brown button with Kerala green coconut-palm ring, "ജോലിക്കാരനെ വിളിക്കൂ" Malayalam label option, backwater blue ring on CALLING

---

**Theme 28 · Goan Beach Shack · Tier 5**
Best For: Goan seafood shacks, beach cafes, feni bars, Portuguese-influenced spots
Palette: Sunset orange #FF8C00 · Ocean blue #1E90FF · Tropical green #228B22 · Sand #F5DEB3 · Crimson #DC143C
Typography: Lobster (display) · Pacifico (hero text) · Nunito (body)
Mood: Palolem beach, prawn fry and feni at sunset, Old Goa tiles
Key UI Features:
- Sandy beach CSS texture background
- Wave animation on section dividers
- "Caught Today" seafood freshness badge
- BBQ grilling live time indicator
- Portuguese azulejo tile border accents
- Carnival Goa animated seasonal banner
- Feni cocktail menu section
Call Staff Style: Sandy button with ocean blue wave ring, "Call the Shack!" Pacifico label, carnival-energy burst on CALLING, barefoot casual feel

---

**Theme 29 · Chettinad Spice · Tier 5**
Best For: Chettinad non-veg specialists, Tamil Nadu cuisine, Karaikudi
Palette: Deep red #8B0000 · Gold #D4AF37 · Chili #FF4500 · Corn silk #FFF5DC · Plum #4A235A
Typography: Noto Serif Tamil (display) · Catamaran (body)
Mood: Authentic Karaikudi mansion dining, grinding stones, dark spice cabinets
Key UI Features:
- Stone architectural SVG pattern background
- Chili heat level visual indicator (1–5 scale)
- Heritage mansion photography style
- Tamil script headline toggle
- Kaarai spice blend product cards
- Spice sourcing story section with map
Call Staff Style: Deep red button with gold Chettinad-arch border, chili heat ring in orange-red, "உதவியாளரை அழையுங்கள்" Tamil label

---

**Theme 30 · Hyderabadi Nawabi · Tier 5**
Best For: Hyderabadi biryani specialists, Irani chai houses, Nawabi cuisine
Palette: Nizam green #1B4332 · Gold #D4AF37 · Maroon #8B0000 · Ivory #F5F0E0 · Saffron orange #FF8C00
Typography: Amiri (display) · Noto Nastaliq Urdu (Urdu text) · Hind (body)
Mood: Paradise Restaurant Hyderabad, biryani dum pukht, pearls and poetry
Key UI Features:
- Charminar arch SVG geometric pattern
- Biryani dum pukht steam CSS animation
- Urdu and Telugu script headline toggles
- Biryani dum-layers visualization (cross-section)
- Haleem seasonal availability badge
- Pearl border decorative element
- Nawabi gold loyalty tier badge
Call Staff Style: Nizam green button with gold pearl-border ring, dum-steam animation as CALLING ring, "خادم کو بلائیں" Urdu label option, royal and composed

---

### TIER 6 — MODERN (Themes 31–36)

---

**Theme 31 · Neon Street Food · Tier 6**
Best For: Street food stalls, food trucks, night markets, hawker centres
Palette: Magenta neon #FF00FF · Cyan neon #00FFFF · Yellow neon #FFD700 · Near-black #0D0D0D · Dark navy #1A1A2E
Typography: Bebas Neue (display) · Barlow Condensed (body)
Mood: Bangkok night bazaar, Taipei shilin, Mumbai Khau Galli at midnight
Key UI Features:
- Neon flicker CSS animation on hero text
- Scanline dark overlay effect
- Live "Open Now / Closed" neon status badge
- Night market ambience gallery with reflections
- Food truck GPS location tracker
- Cyberpunk-style animated order confirmation
Call Staff Style: Neon-bordered button (choose magenta or cyan per tenant), neon flicker ring on CALLING, glowing "STAFF!" all-caps neon label, max energy

---

**Theme 32 · Y2K Retro Pop · Tier 6**
Best For: Trendy cafes, Instagram dessert bars, Gen-Z viral-first brands
Palette: Pink #FF6EFF · Blue #6EE7FF · Yellow #FFFF00 · White #FFFFFF · Black #0D0D0D
Typography: Space Grotesk (display) · Cabinet Grotesk (body)
Mood: 2002 internet cafe meets 2024 viral dessert TikTok, Boba Guys vibes
Key UI Features:
- Holographic gradient CSS shimmer animation
- Y2K star burst badge decorations
- Bubbly pill-shaped CTA buttons everywhere
- Chrome hover effect on product cards
- Boba drink builder (interactive)
- Viral-first square photo grid layout
Call Staff Style: Holographic shimmer button, rainbow ring animation on CALLING, "✨ Call Staff ✨" label with Y2K star decorations on either side

---

**Theme 33 · Botanical Garden · Tier 6**
Best For: Organic restaurants, farm-to-table, vegan cafes, wellness brands
Palette: Deep forest green #2D6A4F · Mint #52B788 · Mint white #F1FAEE · Light mint #D8F3DC · Sage #95D5B2
Typography: Fraunces (display) · DM Sans (body)
Mood: Stone Barns, Farmhouse restaurant, every herb grown on the premises
Key UI Features:
- Botanical SVG leaf illustration overlay on all sections
- Farm-to-table sourcing story with farmer portraits
- Seasonal menu calendar badge (spring/summer/monsoon/winter)
- Vegan/vegetarian filter prominently first
- Hand-drawn style ingredient illustrations on cards
- Carbon footprint score per dish (optional tenant toggle)
Call Staff Style: Forest green botanical button with leaf-wreath ring animation, soft mint ring on CALLING, "Botanical Service" DM Sans label, earthy and calm

---

**Theme 34 · Industrial Craft · Tier 6**
Best For: Craft beer bars, artisan coffee, industrial-chic restaurants, tap rooms
Palette: Dark wood #3D2B1F · Aged brass #8B6914 · Chalk white #F5F5F5 · Charcoal #1C1C1C · Flame #FF6B35
Typography: Oswald (display) · IBM Plex Mono (tasting notes) · Roboto (body)
Mood: Converted warehouse tap room, serious about fermentation, regulars at the bar
Key UI Features:
- Exposed brick CSS texture background
- Live tap availability board (on/off per beer)
- IBM Plex Mono tasting notes typography
- Barrel-aged seasonal availability badge
- Metal grid card layout
- ABV / IBU beer stat display per product
Call Staff Style: Brass-finish button with aged metal texture, industrial rivet ring animation on CALLING, "BARTENDER" Oswald bold label, blue-collar directness

---

**Theme 35 · Pastel Kawaii · Tier 6**
Best For: Dessert cafes, bubble tea shops, kids-friendly spots, Gen-Z
Palette: Baby pink #FFB3C6 · Mint #B5EAD7 · Peach #FFDAC1 · Lavender #C7CEEA · Ivory #FFFFF0
Typography: Nunito (display) · Quicksand (body)
Mood: Harajuku dessert cafe, sticker packs and washi tape, everything is cute
Key UI Features:
- Pastel gradient animated background (slow colour shift)
- Kawaii character mascot hero
- Bubble tea shaking CSS animation
- "Today's Mood" drink selector
- Heart and star CSS decorative elements everywhere
- Digital loyalty stamp card
Call Staff Style: Pastel pink bubble button with heart-scatter ring on CALLING, "🌸 Call Staff 🌸" label with flower emojis in Nunito rounded, maximum cute

---

**Theme 36 · Farm Fresh · Tier 6**
Best For: Organic food, salad bars, juice counters, health kitchens
Palette: Fresh green #4CAF50 · Sunshine yellow #FFF9C4 · Carrot orange #FF7043 · White #FFFFFF · Soil brown #795548
Typography: Nunito Sans (display) · Source Sans Pro (body)
Mood: Sweetgreen meets Mumbai salad bar, clean eating, bright and energetic
Key UI Features:
- Vegetable illustration CSS border on sections
- Salad bowl builder (drag-and-drop ingredients)
- Calorie count displayed per menu item
- Organic certification badge grid
- Farm sourcing map section
- "Today's Harvest" dynamic section (admin-updated)
Call Staff Style: Fresh green button with carrot orange ring, vegetable-sprout ring animation on CALLING, "Need Help?" Source Sans Pro label, approachable and healthy

---

### TIER 7 — SEASONAL (Themes 37–44)

---

**Theme 37 · Diwali Glow · Tier 7**
Best For: Diwali festival limited edition (October–November)
Palette: Marigold #FF8C00 · Gold #D4AF37 · Deep maroon #8B0000 · Dark navy #1A1A2E · Bright gold #FFD700
Typography: Rozha One (display) · Hind (body)
Mood: Rangoli by the door, diya in every window, gifts and mithai
Key UI Features:
- Diya floating particle animation across page
- Gold glitter text-shadow effect on headings
- Marigold garland SVG dividers
- Rangoli pattern hero background
- Diwali countdown timer
- Gift hamper ordering section with festive packaging
- Firecracker sparkle animation on CTA click
Call Staff Style: Diya-glow orange button with firecracker spark ring on CALLING, marigold ring radius on ACKNOWLEDGED, "दीपावली सेवा" Hindi label option, festival warmth

---

**Theme 38 · Holi Splash · Tier 7**
Best For: Holi festival limited edition (March)
Palette: Coral #FF6B6B · Teal #4ECDC4 · Yellow #FFE66D · Mint #96E6A1 · Plum #DDA0DD
Typography: Boogaloo (display) · Nunito (body)
Mood: Colour everywhere, thandai in hand, laughter and powder clouds
Key UI Features:
- Colour powder burst CSS animation on scroll interactions
- Confetti on page load
- Holi special menu section (thandai, gujiya, Holi thali)
- Thandai flavour selector
- "Play Holi With Us" event booking form
- Multi-colour category chips
Call Staff Style: Multi-colour gradient button (shifts through Holi palette), colour-burst ring explosion on CALLING, "रंग दें! स्टाफ बुलाएं" playful Hindi label, joyful

---

**Theme 39 · Christmas Cosy · Tier 7**
Best For: December Christmas season (December 1–31)
Palette: Christmas red #CC0000 · Forest green #006400 · Gold #D4AF37 · Snow white #FFFAF0 · Cinnamon #8B4513
Typography: Mountains of Christmas (display) · Lato (body)
Mood: Fairy lights, mulled wine, ginger cookies, snow on pine needles
Key UI Features:
- Snowfall CSS particle animation
- Fairy light string navigation border decoration
- Festive seasonal menu auto-switch
- Red-and-green plaid accent tiles
- Cinnamon spice illustrated menu dividers
Call Staff Style: Warm cinnamon brown button with red berry ornaments, gentle snowdrift ring animation on CALLING state, "🎄 Call Staff 🎄" in playful festive typography

---

**Theme 40 · Eid Crescent · Tier 7**
Best For: Eid celebration, traditional Mughlai joints, halaal specialty spots
Palette: Emerald green #006400 · Antique gold #D4AF37 · Pure ivory #FFFDD0 · Midnight blue #1A1A2E · Crimson red #8B0000
Typography: Amiri (display) · Cairo (body)
Mood: Courtyard banquet under the crescent moon, fragrant biryani, lanterns glowing
Key UI Features:
- Crescent moon & lantern header accents
- Arabesque geometric SVG vector grids
- Festive discount banner (Ramazan / Eid specials)
- Detailed ingredient sourcing highlights
- Deep shadow framing for food portrait cards
Call Staff Style: Emerald green button with gold border, glowing Islamic geometric pattern ring on CALLING state, "Call Khidmat" in Amiri font

---

**Theme 41 · Monsoon Cafe · Tier 7**
Best For: Cozy tea cafes, pakoda shops, roadside snacking joints
Palette: Rain slate #5C6B73 · Chai gold #C39B62 · Steaming amber #B07D62 · Wet soil #6D4C41 · Mint leaf #81B29A
Typography: Bitter (display) · Source Serif Pro (body)
Mood: Fresh rain on dry clay, hot tea in glass tumblers, cozy window seats
Key UI Features:
- Soft rain CSS animation overlay on hero section
- Tea cup steam floating particles
- Warm yellow light bulbs styled in card outlines
- Seasonal monsoon package builders
- Hand-sketched rainy day menu illustrations
Call Staff Style: Rain slate button with chai gold border, concentric water ripple ring on CALLING state, "Call Waiter" with haptic tap feedback

---

**Theme 42 · Summer Burst · Tier 7**
Best For: Juice bars, ice cream parlors, high-energy beachside cafes
Palette: Mango orange #FF9E00 · Coconut yellow #FFD000 · Beach yellow #FFEA00 · Sky cyan #00B4D8 · Sand gold #E9D8A6
Typography: Fredoka One (display) · Nunito (body)
Mood: Sunny pool party, juicy cold mangoes, electric energy under palm leaves
Key UI Features:
- Bright dynamic CSS color wave background
- Floating tropical leaf accents
- Shake-to-choose ice cream flavor overlay
- Sunburst spinning CSS micro-animations on interactive badges
- Super bold rounded borders
Call Staff Style: Coconut yellow button with bright mango orange border, dynamic sunray ring burst on CALLING, "Sun Help" label in Fredoka font

---

**Theme 43 · Valentine Blush · Tier 7**
Best For: Romantic candlelit bistros, bakeries, date-night dining lounges
Palette: Rose red #D90429 · Velvet crimson #EF233C · Soft blush #F7CAD0 · Cream white #EDF2F4 · Night dark #2B2D42
Typography: Playfair Display (display) · Lato (body)
Mood: Soft candle glow, red roses, champagne flutes, velvet seating
Key UI Features:
- Heart particle floating background overlay
- Elegant cursive headline typography
- Romantic couple combo deal interactive cards
- Red rose SVG divider patterns
- Smooth gold hairline card framing
Call Staff Style: Velvet crimson button with soft blush border, expanding concentric hearts pulse on CALLING, "Summon Host" in Playfair italic font

---

**Theme 44 · New Year Noir · Tier 7**
Best For: High-end club lounges, gala banquets, luxury countdown diners
Palette: Charcoal black #1A1A1A · Champagne gold #E2C07D · Glitz gold #F4D35E · Platinum silver #E5E5E5 · Midnight blue #03071E
Typography: Montserrat (display) · Open Sans (body)
Mood: Toasting champagne under glittering disco ball, midnight celebration
Key UI Features:
- Golden sparkle CSS background particle shower
- Countdown to New Year live ticker widget
- Confetti pop animation on checkout or click
- Full gold glow cards with crisp black text
- Circular card grids matching high-fashion design layouts
Call Staff Style: Champagne gold button with silver starburst outline, glowing firework ring explosion on CALLING, "Ring Staff 🥂" in Montserrat font

---

### TIER 8 — SPECIAL (Themes 45–52)

---

**Theme 45 · Dark Mode Espresso · Tier 8**
Best For: Late-night diners, AMOLED devices, high-contrast night lovers
Palette: AMOLED black #000000 · Espresso brown #24140E · Roast amber #EE9B00 · Off-white text #E9D8A6 · Mint green #94D2BD
Typography: Space Grotesk (display) · Inter (body)
Mood: Late-night coffee, battery saver black, dim orange lighting
Key UI Features:
- Absolute pure black pixels layout
- Glowing neon amber accent border frames
- Monospace tasting notes badge overlays
- Ultra light assets for ultra fast loading
- Simple thumb-accessible category pill tabs
Call Staff Style: Elevated espresso brown button with roast amber border, subtle glow pulse ring, "Call Staff" in Space Grotesk bold

---

**Theme 46 · High Contrast Accessible · Tier 8**
Best For: WCAG AAA accessibility compliance, low vision friendly environments
Palette: Pure black #000000 · Pure white #FFFFFF · Electric blue #0000EE · Bright yellow #FFFF00 · Critical red #DD0000
Typography: Atkinson Hyperlegible (all text)
Mood: Universal design, extreme legibility, zero aesthetic distraction, perfect utility
Key UI Features:
- Extreme 21:1 contrast ratios on all text and elements
- High readability Atkinson font with custom letter spacing
- Bold 3px focus indicators on keyboard navigation
- Large 48px touch target buffers on all items
- Audio-guided screen reader optimized layouts
Call Staff Style: Giant high-contrast square button with 3px solid black outline, visible text "CALL STAFF" in bold all-caps (no icon-only allowed), 64px size

---

**Theme 47 · Print-Ready Menu · Tier 8**
Best For: Digital tablet view, take-away paper printouts, menu downloads
Palette: Paper white #FFFFFF · Ink black #000000 · Slate charcoal #2B2D42 · Soft beige #F4F1DE · Pale olive #E07A5F
Typography: Cormorant Garamond (display) · Times New Roman (body)
Mood: Crisp high-grade cotton paper, ink texture, structured grid elegance
Key UI Features:
- Grid alignment with precise CSS borders simulating print sheets
- CMYK digital styling optimization
- QR code integration visible at bottom of menu items
- Paper texture overlay on background grid
- Beautiful elegant italics for menu item descriptions
Call Staff Style: Flat black circular stamp button, thin dual-border rings, "Assistance Required" in Times New Roman italic

---

**Theme 48 · Kiosk Display · Tier 8**
Best For: Touchscreen tablets, self-ordering kiosks, fast-casual checkout desks
Palette: Navy space #0F172A · Neon blue #06B6D4 · Fresh cream #F8FAFC · Muted slate #64748B · Alert emerald #10B981
Typography: Inter (all headings and text)
Mood: Futuristic spaceship control dashboard, lightning fast processing, ultimate clarity
Key UI Features:
- Extra large 80px touch grids for food cards
- Step-by-step interactive checkout wizard (Pick → Customize → Checkout → Pay)
- Neon blue progress indicator path bar
- Touch indicator feedback circles on screen taps
- High brightness layout elements
Call Staff Style: Giant 96px floating button in neon blue, central top placement, pulsing outer glowing wave ring on CALLING state, "CALL ASSISTANCE" bold text

---

**Theme 49 · Delivery-First · Tier 8**
Best For: Dark kitchens, cloud kitchens, fast food delivery brands
Palette: Carbon grey #212529 · Delivery orange #FF5A09 · Ivory sand #F8F9FA · Dark grey #343A40 · Leaf green #2B9348
Typography: Outfit (display) · Inter (body)
Mood: Courier bags on bikes, steaming containers, quick order processing
Key UI Features:
- Clean single-column layout optimized for high speed vertical scrolling
- Quick add-to-cart multi-counter buttons on item listings
- "Frequently Ordered Together" checkout bundles carousel
- Prominent delivery time estimates block
- Minimalist text badges for tags and spices
Call Staff Style: Replaced by a persistent "Chat with Delivery Support" CTA in Delivery orange with custom pulsing message dot.

---

**Theme 50 · Royal Awadhi · Tier 8**
Best For: Traditional Nawabi dining halls, kebab houses, slow-cooked specialty diners
Palette: Royal navy #0D1B2A · Royal gold #E0E1DD · Sunset saffron #FFB703 · Palace maroon #600000 · Pistachio green #386641
Typography: Rozha One (display) · Lora (body)
Mood: Grand Lucknow arches, rich slow-cooked spices, brass cutlery, gold-leaf desserts
Key UI Features:
- Ornate Nawabi arch framing elements for item images
- Saffron drop down selectors with gold divider rules
- Slow simmer steam animated micro SVG graphics
- Beautiful regional text integration options
- Shimmer hover effects on main cart CTA buttons
Call Staff Style: Saffron orange button with palace maroon border, expanding gold floral pulse ring, "Summon Staff" label in Rozha One font

---

**Theme 51 · Coastal Konkan · Tier 8**
Best For: Seafood specialties, coastal beach shacks, authentic Konkan thalis
Palette: Sand gold #DDBDF6 · Marine blue #0077B6 · Sea green #03045E · Shell white #CAF0F8 · Coral red #E63946
Typography: Pacifico (display) · Mukta (body)
Mood: Sandy toes, ocean breeze, fresh fried fish with rich coconut curry
Key UI Features:
- Waves divider SVG borders between layout panels
- Floating animated seafood catcher status badge
- Coconut pattern motifs embedded in sand background
- Soft round paper cards with ocean blue headers
- Quick vegetarian vs non-vegetarian indicator banners
Call Staff Style: Marine blue button with sand gold wave overlay ring, expanding ripple ripple on CALLING, "Wave to Staff" in Mukta bold

---

**Theme 52 · White Orchid High Contrast · Tier 8**
Best For: Modern organic cafes, botanical tea salons, chic wellness spaces
Palette: Pure white #FFFFFF · Charcoal black #1C1917 · Soft lavender #E9D5FF · Orchid purple #A855F7 · Sage green #86EFAC
Typography: Outfit (display) · Inter (body)
Mood: Pristine wellness retreat, fragrant green lavender tea, clean geometric structures
Key UI Features:
- Super clean high contrast grid panels with bold 2px black line borders
- Lavender orchid highlighting tokens for buttons, selectors and tags
- Botanical outline SVGs in section headers
- Sharp square corners on all image panels and buttons
- High visual spacing structure layouts
Call Staff Style: Bold square button in orchid purple, pure white text "REQUEST SERVICE", expanding orchid square ring on CALLING state
