const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

/**
 * Centralized API client for the store-front.
 * All components should use this instead of raw fetch.
 */
export async function fetchAPI(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ═══ Menu API ═══
export async function getCategories() {
  // Public endpoint — fetch all visible categories
  try {
    const res = await fetchAPI("/store-admin/menu/categories");
    return res.data || [];
  } catch {
    return getMockCategories();
  }
}

export async function getMenuItems(categoryId = null) {
  try {
    const query = categoryId ? `?categoryId=${categoryId}` : "";
    const res = await fetchAPI(`/store-admin/menu/items${query}`);
    return res.data || [];
  } catch {
    return getMockMenuItems(categoryId);
  }
}

export async function getMenuItem(id) {
  try {
    const items = await getMenuItems();
    return items.find((item) => item.id === id) || null;
  } catch {
    return getMockMenuItems().find((item) => item.id === id) || null;
  }
}

export async function getItemModifiers(itemId) {
  try {
    const res = await fetchAPI(`/store-admin/menu/items/${itemId}/modifiers`);
    return res.data || [];
  } catch {
    return [];
  }
}

// ═══ Blog API ═══
export async function getBlogs() {
  try {
    const res = await fetchAPI("/store-admin/settings/blogs");
    return (res.data || []).filter((b) => b.isPublished);
  } catch {
    return getMockBlogs();
  }
}

export async function getBlogBySlug(slug) {
  const blogs = await getBlogs();
  return blogs.find((b) => b.slug === slug) || null;
}

// ═══ Store Info API ═══
export async function getStoreDetails() {
  try {
    const res = await fetchAPI("/store-admin/settings/store");
    return res.data || null;
  } catch {
    return {
      storeName: "Cafe Canvas",
      address: "123 Artisan Lane, Koramangala, Bangalore",
      phone: "+91 98765 43210",
      email: "hello@cafecanvas.bar",
    };
  }
}

// ═══ Mock Data (fallback when API is unavailable) ═══
function getMockCategories() {
  return [
    { id: "cat-1", name: "Signature Coffee", sortOrder: 1, isVisible: true },
    { id: "cat-2", name: "Specialty Tea", sortOrder: 2, isVisible: true },
    { id: "cat-3", name: "Fresh Juices", sortOrder: 3, isVisible: true },
    { id: "cat-4", name: "Breakfast", sortOrder: 4, isVisible: true },
    { id: "cat-5", name: "Sandwiches", sortOrder: 5, isVisible: true },
    { id: "cat-6", name: "Desserts", sortOrder: 6, isVisible: true },
    { id: "cat-7", name: "Pasta & Bowls", sortOrder: 7, isVisible: true },
    { id: "cat-8", name: "Smoothies", sortOrder: 8, isVisible: true },
  ];
}

function getMockMenuItems(categoryId = null) {
  const items = [
    { id: "item-1", categoryId: "cat-1", name: "Hazelnut Latte", description: "Rich espresso with steamed milk and hazelnut syrup, topped with microfoam", price: 280, imageUrl: null, status: "available", allowsModifiers: true },
    { id: "item-2", categoryId: "cat-1", name: "Cappuccino Classico", description: "Traditional Italian cappuccino with velvety foam art", price: 220, imageUrl: null, status: "available", allowsModifiers: true },
    { id: "item-3", categoryId: "cat-1", name: "Mocha Indulgence", description: "Belgian chocolate meets premium espresso with whipped cream", price: 310, imageUrl: null, status: "available", allowsModifiers: true },
    { id: "item-4", categoryId: "cat-2", name: "Matcha Zen Latte", description: "Ceremonial-grade matcha whisked with oat milk", price: 260, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-5", categoryId: "cat-2", name: "Masala Chai Royale", description: "House-blend spiced chai with fresh ginger and cardamom", price: 180, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-6", categoryId: "cat-3", name: "Tropical Sunrise", description: "Mango, passion fruit, and pineapple blended fresh", price: 240, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-7", categoryId: "cat-4", name: "Avocado Toast Supreme", description: "Sourdough topped with smashed avocado, poached egg, and chili flakes", price: 350, imageUrl: null, status: "available", allowsModifiers: true },
    { id: "item-8", categoryId: "cat-4", name: "Acai Power Bowl", description: "Acai blend topped with granola, banana, berries, and honey drizzle", price: 380, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-9", categoryId: "cat-5", name: "Grilled Panini Deluxe", description: "Pesto chicken with sun-dried tomatoes and mozzarella", price: 320, imageUrl: null, status: "available", allowsModifiers: true },
    { id: "item-10", categoryId: "cat-5", name: "Club Sandwich", description: "Triple-decker with grilled chicken, bacon, lettuce, and garlic aioli", price: 340, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-11", categoryId: "cat-6", name: "Tiramisu", description: "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone", price: 290, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-12", categoryId: "cat-6", name: "Molten Chocolate Cake", description: "Warm chocolate lava cake with vanilla bean ice cream", price: 340, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-13", categoryId: "cat-7", name: "Pesto Penne", description: "Penne tossed in house-made basil pesto with cherry tomatoes and parmesan", price: 360, imageUrl: null, status: "available", allowsModifiers: true },
    { id: "item-14", categoryId: "cat-7", name: "Buddha Bowl", description: "Quinoa, roasted veggies, chickpeas, tahini drizzle, and micro greens", price: 390, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-15", categoryId: "cat-8", name: "Berry Bliss Smoothie", description: "Mixed berries, banana, Greek yogurt, and a drizzle of honey", price: 260, imageUrl: null, status: "available", allowsModifiers: false },
    { id: "item-16", categoryId: "cat-8", name: "Green Detox", description: "Spinach, kale, apple, ginger, and lemon", price: 280, imageUrl: null, status: "available", allowsModifiers: false },
  ];
  if (categoryId) return items.filter((i) => i.categoryId === categoryId);
  return items;
}

function getMockBlogs() {
  return [
    {
      id: "blog-1",
      title: "The Art of Pour-Over Coffee",
      slug: "art-of-pour-over-coffee",
      content: "Discover the meditative ritual of pour-over brewing. From selecting the right beans to mastering the technique, we walk you through every step of creating the perfect cup.\n\n## Choosing Your Beans\nStart with freshly roasted, single-origin beans. We recommend a medium roast from Ethiopia or Colombia for their bright, fruity notes.\n\n## The Technique\n1. Grind your beans to a medium-coarse consistency\n2. Pre-wet the filter and warm your vessel\n3. Add grounds and create a small well in the center\n4. Begin the bloom pour — just enough water to saturate the grounds\n5. Wait 30-45 seconds for the bloom\n6. Continue pouring in slow, concentric circles\n\n## Water Temperature\nAim for 195-205°F (90-96°C). Too hot and you'll over-extract; too cool and the flavors won't develop fully.",
      heroImageUrl: null,
      isPublished: true,
      publishedAt: "2026-05-20T10:00:00Z",
    },
    {
      id: "blog-2",
      title: "5 Breakfast Bowls to Start Your Day Right",
      slug: "5-breakfast-bowls",
      content: "Transform your mornings with these nutrient-packed breakfast bowls that are as beautiful as they are delicious.\n\n## 1. Acai Dream Bowl\nBlend frozen acai with banana and a splash of oat milk. Top with granola, sliced strawberries, and a drizzle of honey.\n\n## 2. Savory Grain Bowl\nQuinoa base with roasted sweet potato, avocado, a soft-boiled egg, and everything bagel seasoning.\n\n## 3. Tropical Paradise\nMango smoothie base topped with coconut flakes, kiwi, and chia seeds.\n\n## 4. Berry Protein Bowl\nGreek yogurt blended with mixed berries, topped with nuts and a scoop of protein granola.\n\n## 5. Green Goddess\nSpinach and banana blend with matcha, topped with sliced almonds and goji berries.",
      heroImageUrl: null,
      isPublished: true,
      publishedAt: "2026-05-15T10:00:00Z",
    },
    {
      id: "blog-3",
      title: "Behind the Menu: Our Seasonal Specials",
      slug: "seasonal-specials-summer-2026",
      content: "Every season, our chefs craft a new collection of dishes inspired by the freshest local ingredients. Here's a peek behind the curtain at our summer 2026 lineup.\n\n## Inspiration\nThis summer, we're drawing from the vibrant street food culture of Southeast Asia, combined with locally sourced Indian produce.\n\n## New Additions\n- **Mango Sticky Rice Latte** — Thai-inspired sweet mango and coconut cream latte\n- **Tandoori Paneer Wrap** — Smoky tandoori paneer with mint chutney and pickled onions\n- **Kokum Cooler** — Refreshing kokum sherbet with a sparkling twist\n\nAll items are available starting June 1st. Follow us for weekly specials!",
      heroImageUrl: null,
      isPublished: true,
      publishedAt: "2026-05-28T10:00:00Z",
    },
  ];
}

// ═══ Formatting Helpers ═══
export function formatPrice(paise) {
  return `₹${(paise / 1).toFixed(0)}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function readingTime(content) {
  const words = (content || "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getItemEmoji(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("coffee") || n.includes("latte") || n.includes("cappuccino") || n.includes("mocha")) return "☕";
  if (n.includes("tea") || n.includes("chai") || n.includes("matcha")) return "🍵";
  if (n.includes("juice") || n.includes("smoothie") || n.includes("detox") || n.includes("sunrise")) return "🥤";
  if (n.includes("toast") || n.includes("bowl") || n.includes("breakfast") || n.includes("acai")) return "🥑";
  if (n.includes("sandwich") || n.includes("panini") || n.includes("club")) return "🥪";
  if (n.includes("tiramisu") || n.includes("cake") || n.includes("dessert")) return "🍰";
  if (n.includes("pasta") || n.includes("penne")) return "🍝";
  if (n.includes("buddha") || n.includes("salad")) return "🥗";
  if (n.includes("berry") || n.includes("bliss")) return "🫐";
  return "🍽️";
}

