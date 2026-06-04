'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, ArrowRight, BarChart3, ChefHat, Smartphone, X, Check, 
  Building2, ShieldCheck, Mail, Phone, MapPin, Award, Store,
  Layers, Users, TrendingUp, HelpCircle, FileText, Lock, Globe,
  MessageSquare, Calendar, Sparkles, ChevronDown, ChevronRight, Play,
  Zap, Heart, Eye, ArrowUpRight, DollarSign, Clock, ShieldAlert,
  Activity, Laptop, RefreshCw, CheckCircle2, AlertOctagon, HelpCircle as HelpIcon,
  Sliders, Smartphone as PhoneIcon, HeartHandshake, Eye as EyeIcon, Scale
} from 'lucide-react';

// Pricing Plans Data
const pricingPlans = [
  {
    key: 'starter',
    name: 'Starter Suite',
    price: '2,900',
    description: 'Perfect for boutique cafes, independent bakeries, and cloud kitchens looking to digitize.',
    features: [
      'Single Location Support',
      'Up to 5 Staff User Accounts',
      'Dynamic Web QR Menu & Ordering',
      'Standard KDS Integration',
      'Paise-Precision Cashier POS',
      'Direct WhatsApp Bill Sharing',
      'Standard Daily CSV Reports'
    ]
  },
  {
    key: 'growth',
    name: 'Growth Suite',
    price: '8,900',
    description: 'The optimal choice for growing restaurants, busy bars, and lounges needing central control.',
    features: [
      'Up to 5 Branch Locations',
      'Up to 50 Staff User Accounts (Hard Cap)',
      'Custom Domain Mapping with SSL',
      'Multi-Terminal Real-time POS',
      'Advanced KDS with Waiter App',
      'Razorpay Payment Gateway API',
      'Automated SMS & WhatsApp Alerts',
      'Dynamic Inventory tracking & alerts',
      'Monthly PDF Billing & Invoices',
      'Priority 24/7 Slack Support'
    ],
    popular: true
  },
  {
    key: 'professional',
    name: 'Professional Hub',
    price: '19,900',
    description: 'Designed for high-volume multi-chain brands and elite hospitality groups.',
    features: [
      'Up to 15 Branch Locations',
      'Up to 200 Staff User Accounts',
      'Fully Branded Storefront Theme Engine',
      'Dedicated Customer Accounts & Portals',
      'Advanced CRM & Loyalty Rewards',
      'Staff Attendance with GPS & Selfie',
      'Hourly Heatmaps & Revenue Analytics',
      'Supplier Integration & PO Builder',
      'Dedicated Account Manager'
    ]
  },
  {
    key: 'enterprise',
    name: 'Enterprise Custom',
    price: 'Custom',
    description: 'Bespoke solutions for restaurant conglomerates and global franchise groups.',
    features: [
      'Unlimited Branch Locations',
      'Unlimited Staff Accounts',
      'Complete White-label App Build',
      'Custom API Webhook integrations',
      'Custom Database Replication & Clusters',
      '99.99% SLA Performance Contract',
      'Dedicated DevOps Engineer Node'
    ]
  }
];

// Luxury Themes List
const luxuryThemes = [
  { id: 'liquid-glass', name: 'Liquid Glass', primaryBg: 'bg-[#F3EFE9]', accentBg: 'bg-[#E8A598]', primary: '#F3EFE9', accent: '#E8A598', desc: 'Minimalist frosted overlays with soft rose glow.', previewColor: 'from-[#FAF6F0] via-[#E8A598]/20 to-[#FAF6F0]' },
  { id: 'luxury-gold', name: 'Luxury Gold', primaryBg: 'bg-[#F2EAD3]', accentBg: 'bg-[#C9A84C]', primary: '#F2EAD3', accent: '#C9A84C', desc: 'Warm amber tones and rich brushed gold accents.', previewColor: 'from-[#FAF6F0] via-[#C9A84C]/30 to-[#FAF6F0]' },
  { id: 'matcha-zen', name: 'Matcha Zen', primaryBg: 'bg-[#EDF4EC]', accentBg: 'bg-[#15803D]', primary: '#EDF4EC', accent: '#15803D', desc: 'Organic sage greens and tranquil bamboo textures.', previewColor: 'from-[#FAF6F0] via-green-100 to-[#FAF6F0]' },
  { id: 'rajasthani-royal', name: 'Rajasthani Royal', primaryBg: 'bg-[#FDF3E7]', accentBg: 'bg-[#C2410C]', primary: '#FDF3E7', accent: '#C2410C', desc: 'Saffron orange, deep marigold, and copper patterns.', previewColor: 'from-[#FAF6F0] via-orange-100 to-[#FAF6F0]' },
  { id: 'maharashtrian-heritage', name: 'Maharashtrian Heritage', primaryBg: 'bg-[#FDF2F4]', accentBg: 'bg-[#BE123C]', primary: '#FDF2F4', accent: '#BE123C', desc: 'Rich saffron reds and royal blue borders.', previewColor: 'from-[#FAF6F0] via-rose-100 to-[#FAF6F0]' },
  { id: 'italian-trattoria', name: 'Italian Trattoria', primaryBg: 'bg-[#FDF2F2]', accentBg: 'bg-[#15803D]', primary: '#FDF2F2', accent: '#15803D', desc: 'Tuscan olive and rich sun-dried tomato accents.', previewColor: 'from-[#FAF6F0] via-red-100 to-[#FAF6F0]' },
  { id: 'japanese-sakura', name: 'Japanese Sakura', primaryBg: 'bg-[#FDF2F8]', accentBg: 'bg-[#DB2777]', primary: '#FDF2F8', accent: '#DB2777', desc: 'Soft cherry blossom pink and dark slate stone.', previewColor: 'from-[#FAF6F0] via-pink-100 to-[#FAF6F0]' },
  { id: 'mughal-garden', name: 'Mughal Garden', primaryBg: 'bg-[#ECF8F4]', accentBg: 'bg-[#047857]', primary: '#ECF8F4', accent: '#047857', desc: 'Deep emerald greens and delicate white marble.', previewColor: 'from-[#FAF6F0] via-emerald-100 to-[#FAF6F0]' },
  { id: 'classic-cafe', name: 'Classic Cafe', primaryBg: 'bg-[#FAF6F0]', accentBg: 'bg-[#78350F]', primary: '#FAF6F0', accent: '#78350F', desc: 'Warm cream foundations and dark espresso brown.', previewColor: 'from-[#FAF6F0] via-amber-100 to-[#FAF6F0]' },
  { id: 'modern-bistro', name: 'Modern Bistro', primaryBg: 'bg-[#F1F5F9]', accentBg: 'bg-[#0F172A]', primary: '#F1F5F9', accent: '#0F172A', desc: 'Monochrome charcoal, cool steel, and cobalt lines.', previewColor: 'from-[#FAF6F0] via-slate-200 to-[#FAF6F0]' }
];

// Dual-Language Dictionary
const translations = {
  en: {
    logo: "CafeCanvas",
    navSolutions: "Solutions",
    navFeatures: "Features",
    navStorefront: "Storefront",
    navPricing: "Pricing",
    navThemes: "Themes",
    navFAQ: "FAQ",
    btnBookDemo: "Book Demo",
    btnStartTrial: "Start Free Trial",
    btnWatchTour: "Watch Product Tour",
    btnSignIn: "Console Sign In",
    
    // Section 1: Hero
    heroBadge: "Restaurant Operating System · Live",
    heroTitle1: "Run Your Entire Restaurant",
    heroTitle2: "From One Platform",
    heroSub: "Manage billing, staff, inventory, storefronts, analytics, reservations, loyalty and operations from a single system.",
    statTables: "1000+ Tables Managed",
    statStaff: "50+ Staff Per Store",
    statBranch: "Multi Branch Ready",
    statOps: "Real Time Operations",

    // Section 2: Problem
    probHeadline: "Restaurant Owners Deserve Better Tools",
    probSub: "Running a modern hospitality venue shouldn't mean managing a patchwork of systems.",
    oldWayTitle: "The Legacy Patchwork",
    newWayTitle: "The CafeCanvas OS Way",
    oldWayItems: [
      "Stitching together 4+ software subscriptions that don't speak to each other.",
      "Manual cash drawers prone to rounding errors and float leakages.",
      "Food cost leakages and ingredient shrinkage detected only at week-end audits.",
      "Unverifiable staff rosters, shift histories, and attendance logs.",
      "Paying high aggregator commissions instead of owning your domain menu."
    ],
    newWayItems: [
      "Single integrated dashboard covering POS, KDS, Staff, and Custom Storefronts.",
      "Paise-precision billing with automatic CGST (2.5%) + SGST (2.5%) splits.",
      "Instant stock ingredient deductions mapped directly to kitchen orders.",
      "Geofenced shift rosters with biometric selfie check-in verification.",
      "Zero commission digital menus deployed directly on your custom domain."
    ],

    // Section 3: Features
    featuresTitle: "The Operating System for Modern Hospitality",
    featuresSub: "Say goodbye to scattered checkouts and disconnected tables.",

    // Section 4: Showcase
    showcaseTitle: "Restaurant OS Showcase",
    showcaseSub: "Observe live computations and database updates across your terminals in real-time.",
    showcaseOrders: "Live Orders",
    showcaseRevenue: "Revenue Ledger",
    showcaseTables: "Table Status",
    showcaseInventory: "Stock Count",
    showcaseStaff: "Roster Activity",

    // Section 5: Storefront
    storefrontTitle: "Digital Menu & Storefront",
    storefrontSub: "Push menu updates, event schedules, and photos instantly to your brand home page.",

    // Section 6: Staff App
    staffTitle: "Empower Floor Staff & Cashiers",
    staffSub: "A mobile-first companion for geofenced rosters, selfie attendance, and table routing.",

    // Section 7: How It Works
    howItWorksTitle: "Zero to Live in 9 Operational Steps",
    howItWorksSub: "Our secure approval flow gets your restaurant up and running smoothly.",

    // Section 8: Industries
    indTitle: "Engineered for Every Hospitality Node",
    indSub: "Configured to accommodate specific operational workflows.",

    // Section 9: Why CafeCanvas
    whyTitle: "Restoring Digital Sovereignty to Restaurant Owners",
    whyStory: "CafeCanvas was founded to shift the power dynamic in the food and beverage industry. For years, intermediate aggregators and complex software networks have eaten into restaurant margins, isolated customer databases, and locked domain menus. We believe you should own your brand, map your custom domains, audit your staff parameters, and monitor your paise-precision financials without paying commissions. CafeCanvas is not a QR Menu widget or a simple checkout screen—it is the digital spine of your hospitality operations.",

    // Section 10: Themes
    themeTitle: "Elegantly Crafted Brand Themes",
    themeSub: "Select from 10 high-end templates optimized with dynamic CSS variables.",

    // Section 11: Pricing
    pricingTitle: "Honest, Transparent Pricing",
    pricingSub: "Zero commission cuts. Select a tier matching your operational footprint.",

    // Section 12: Testimonials
    testTitle: "SaaS Validation From The Floor",
    testSub: "Real feedback from restaurant, cafe, and lounge owners.",

    // Section 13: FAQ
    faqTitle: "Frequently Asked Questions",
    faqSub: "Understand the parameters and licensing of the CafeCanvas SaaS platform.",

    // Section 14: Final CTA
    ctaTitle: "Ready To Run Your Restaurant Smarter?",
    ctaSub: "Join progressive hospitality brands managing their operations, staff rosters, and storefronts on CafeCanvas.",

    // Section 15: Footer
    footerDesc: "The next-generation unified Operating System built for luxury hospitality. CGST + SGST tax split compliant."
  },
  hi: {
    logo: "कैफ़ेकैनवास",
    navSolutions: "समाधान",
    navFeatures: "विशेषताएं",
    navStorefront: "स्टोरफ्रंट",
    navPricing: "मूल्य निर्धारण",
    navThemes: "थीम्स",
    navFAQ: "प्रश्नोत्तरी",
    btnBookDemo: "डेमो बुक करें",
    btnStartTrial: "निःशुल्क परीक्षण",
    btnWatchTour: "प्रोडक्ट टूर देखें",
    btnSignIn: "लॉगिन करें",
    
    // Section 1: Hero
    heroBadge: "रेस्टोरेंट ऑपरेटिंग सिस्टम · लाइव",
    heroTitle1: "अपने पूरे रेस्टोरेंट को",
    heroTitle2: "एक ही प्लेटफॉर्म से चलाएं",
    heroSub: "एक ही सुरक्षित प्रणाली से बिलिंग, स्टाफ, लाइव इन्वेंट्री, स्टोरफ्रंट, एनालिटिक्स, बुकिंग और ऑपरेशन्स का प्रबंधन करें।",
    statTables: "1000+ टेबल प्रबंधित",
    statStaff: "50+ स्टाफ प्रति स्टोर",
    statBranch: "मल्टी ब्रांच सक्षम",
    statOps: "रियल-टाइम ऑपरेशन्स",

    // Section 2: Problem
    probHeadline: "रेस्टोरेंट मालिकों को बेहतर टूल्स की आवश्यकता है",
    probSub: "आधुनिक रेस्टोरेंट चलाने के लिए कई तरह के टूल्स के बिखराव से छुटकारा पाएं।",
    oldWayTitle: "पुराना अव्यवस्थित तरीका",
    newWayTitle: "कैफ़ेकैनवास ऑपरेटिंग सिस्टम",
    oldWayItems: [
      "4+ से अधिक अलग-अलग सॉफ्टवेयर जिनका आपस में कोई संपर्क नहीं है।",
      "मैनुअल बिलिंग जिसमें पैसों की गड़बड़ी और हिसाब में अंतर होने का खतरा हो।",
      "स्टॉक का नुकसान जिसे केवल सप्ताह के अंत में ऑडिट करने पर ही पकड़ा जा सके।",
      "स्टाफ की हाजिरी और शिफ्ट का कोई प्रामाणिक रिकॉर्ड न होना।",
      "ऑर्डर एग्रीगेटर्स को भारी कमीशन देना और अपने ब्रांड का अस्तित्व खोना।"
    ],
    newWayItems: [
      "एक ही डैशबोर्ड में पीओएस (POS), केडीएस (KDS), स्टाफ और स्टोरफ्रंट का एकीकरण।",
      "पैसे-परिशुद्धता (paise-precision) बिलिंग और स्वचालित CGST (2.5%) + SGST (2.5%) विभाजन।",
      "किचन में ऑर्डर जाने पर सामग्री का स्टॉक से तुरंत और स्वचालित रूप से घटना।",
      "भौगोलिक सीमा (geofenced) और बायोमेट्रिक सेल्फी के साथ हाजिरी की पुष्टि।",
      "बिना किसी कमीशन के अपने स्वयं के डोमेन पर डिजिटल मेनू का त्वरित प्रकाशन।"
    ],

    // Section 3: Features
    featuresTitle: "आधुनिक रेस्टोरेंट के लिए एक संपूर्ण ऑपरेटिंग सिस्टम",
    featuresSub: "बिखरे हुए कैशियर और अव्यवस्थित टेबलों की झंझटों को समाप्त करें।",

    // Section 4: Showcase
    showcaseTitle: "रेस्टोरेंट ओएस शोकेस",
    showcaseSub: "वास्तविक समय में अपने टर्मिनलों पर लाइव डेटा और वित्तीय बदलावों का निरीक्षण करें।",
    showcaseOrders: "लाइव ऑर्डर",
    showcaseRevenue: "राजस्व खाता",
    showcaseTables: "टेबल की स्थिति",
    showcaseInventory: "स्टॉक गणना",
    showcaseStaff: "स्टाफ गतिविधि",

    // Section 5: Storefront
    storefrontTitle: "डिजिटल मेनू और स्टोरफ्रंट",
    storefrontSub: "मेनू में बदलाव, इवेंट की जानकारी और तस्वीरें तुरंत अपनी वेबसाइट पर प्रकाशित करें।",

    // Section 6: Staff App
    staffTitle: "स्टाफ और वेटर्स को सशक्त बनाएं",
    staffSub: "स्टाफ की उपस्थिति, टेबल असाइनमेंट और ऑर्डर प्रबंधन के लिए एक मोबाइल-फर्स्ट ऐप।",

    // Section 7: How It Works
    howItWorksTitle: "9 आसान चरणों में रेस्टोरेंट लाइव करें",
    howItWorksSub: "हमारी सुरक्षित प्रमाणीकरण प्रक्रिया आपके रेस्टोरेंट को सुरक्षित रूप से सेटअप करती है।",

    // Section 8: Industries
    indTitle: "हर प्रकार के रेस्टोरेंट के लिए विशेष समाधान",
    indSub: "विभिन्न उद्योगों की विशिष्ट आवश्यकताओं के अनुरूप डिज़ाइन किया गया।",

    // Section 9: Why CafeCanvas
    whyTitle: "रेस्टोरेंट मालिकों को डिजिटल संप्रभुता लौटाना",
    whyStory: "कैफ़ेकैनवास की स्थापना खाद्य और पेय उद्योग में शक्ति संतुलन को बदलने के लिए की गई थी। सालों से, मध्यस्थ एग्रीगेटर्स और जटिल सॉफ्टवेयर नेटवर्क रेस्टोरेंट के मुनाफे को कम कर रहे हैं, ग्राहकों के डेटाबेस को ब्लॉक कर रहे हैं। हमारा मानना है कि आपको अपने ब्रांड का मालिकाना हक मिलना चाहिए, कस्टम डोमेन का उपयोग करना चाहिए, बिना कमीशन दिए पैसे-परिशुद्धता के साथ अपने वित्तीय डेटा की निगरानी करनी चाहिए। कैफ़ेकैनवास केवल एक क्यूआर मेनू या चेकआउट स्क्रीन नहीं है—यह आपके पूरे रेस्टोरेंट की रीढ़ है।",

    // Section 10: Themes
    themeTitle: "शानदार और प्रीमियम स्टोरफ्रंट थीम्स",
    themeSub: "डायनामिक सीएसएस वेरिएबल्स के साथ अनुकूलित 10 शानदार थीम्स में से चुनें।",

    // Section 11: Pricing
    pricingTitle: "ईमानदार और स्पष्ट मूल्य निर्धारण",
    pricingSub: "कोई गुप्त शुल्क नहीं, कोई कमीशन कट नहीं। अपने रेस्टोरेंट के आकार के अनुसार पैकेज चुनें।",

    // Section 12: Testimonials
    testTitle: "हमारे ग्राहकों के अनुभव",
    testSub: "रेस्टोरेंट, कैफे और लाउंज मालिकों की वास्तविक विकास गाथाएं।",

    // Section 13: FAQ
    faqTitle: "सामान्यतः पूछे जाने वाले प्रश्न",
    faqSub: "कैफ़ेकैनवास सास (SaaS) प्लेटफॉर्म की सुविधाओं और उपयोग की शर्तों को समझें।",

    // Section 14: Final CTA
    ctaTitle: "क्या आप अपने रेस्टोरेंट को अधिक समझदारी से चलाने के लिए तैयार हैं?",
    ctaSub: "उन रेस्टोरेंट ब्रांड्स में शामिल हों जो कैफ़ेकैनवास के साथ अपने व्यवसाय और विकास का प्रबंधन कर रहे हैं।",

    // Section 15: Footer
    footerDesc: "लक्ज़री आतिथ्य सत्कार के लिए बनाया गया नेक्स्ट-जेनरेशन ऑपरेटिंग सिस्टम। CGST + SGST नियमों के अनुकूल।"
  }
};

export default function Home() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selector States
  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'orders' | 'revenue' | 'tables' | 'inventory' | 'staff'>('orders');

  // Simulated Live Metrics
  const [liveOrders, setLiveOrders] = useState([
    { id: '#2041', item: 'Espresso Macchiato', status: 'preparing', time: '1m ago', table: 'T-04' },
    { id: '#2040', item: 'Truffle Fettuccine + CGST', status: 'ready', time: '3m ago', table: 'T-12' },
    { id: '#2039', item: 'Smoked Salmon Croissant', status: 'served', time: '7m ago', table: 'T-02' }
  ]);
  const [liveRevenue, setLiveRevenue] = useState(4829500); // 48,295.00 INR in paise
  const [activeTablesCount, setActiveTablesCount] = useState(14);
  const [stockIngredients, setStockIngredients] = useState([
    { name: 'Oat Milk', val: 42, unit: 'Liters', status: 'Optimal' },
    { name: 'Single-Origin Coffee Beans', val: 18.5, unit: 'kg', status: 'Optimal' },
    { name: 'Truffle Oil', val: 1.2, unit: 'Liters', status: 'Reorder Alert' }
  ]);
  const [staffRoster, setStaffRoster] = useState([
    { name: 'Rohan Sharma', role: 'Cashier', checkIn: '08:45 AM', verified: 'GPS + Selfie verified' },
    { name: 'Priya Iyer', role: 'Head Barista', checkIn: '09:00 AM', verified: 'GPS + Selfie verified' },
    { name: 'Kabir Dev', role: 'Floor Manager', checkIn: '08:58 AM', verified: 'GPS + Selfie verified' }
  ]);

  // Form State
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    gstin: '',
    fssaiNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    businessType: 'cafe',
    expectedStaffCount: '5',
    expectedBranchCount: '1',
    planKey: 'growth',
  });

  // Simulated Live updates (Sockets Simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Live Orders Update
      setLiveOrders(prev => {
        const updated = [...prev];
        const randomIdx = Math.floor(Math.random() * updated.length);
        if (updated[randomIdx].status === 'preparing') {
          updated[randomIdx].status = 'ready';
        } else if (updated[randomIdx].status === 'ready') {
          updated[randomIdx].status = 'served';
        } else {
          updated[randomIdx].status = 'preparing';
          updated[randomIdx].id = '#' + (parseInt(updated[randomIdx].id.replace('#', '')) + 3).toString();
          updated[randomIdx].time = 'Just now';
        }
        return updated;
      });

      // 2. Live Revenue Accumulator (in paise)
      setLiveRevenue(r => r + Math.floor(Math.random() * 45000 + 15000));

      // 3. Tables Fluctuation
      setActiveTablesCount(t => {
        const diff = Math.random() > 0.5 ? 1 : -1;
        const target = t + diff;
        return target >= 6 && target <= 28 ? target : 14;
      });

      // 4. Stock Ingredient depletion
      setStockIngredients(prev => {
        return prev.map(ing => {
          if (ing.name.includes('Coffee Beans')) {
            const newVal = parseFloat((ing.val - 0.05).toFixed(2));
            return { ...ing, val: newVal > 5 ? newVal : 20.0 };
          }
          if (ing.name.includes('Oat Milk')) {
            const newVal = ing.val - 1;
            return { ...ing, val: newVal > 10 ? newVal : 45 };
          }
          return ing;
        });
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!form.businessName.trim()) {
        setErrorMsg('Please enter your business/brand name.');
        return;
      }
    } else if (currentStep === 2) {
      if (form.gstin && form.gstin.trim().length !== 15) {
        setErrorMsg('GSTIN must be exactly 15 characters if provided.');
        return;
      }
    }
    setErrorMsg(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ownerName || !form.email || !form.phone) {
      setErrorMsg('Owner name, email, and primary contact number are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/tenants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.error || 'Failed to register onboarding request.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during verification submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setSuccess(false);
    setErrorMsg(null);
    setForm({
      businessName: '',
      ownerName: '',
      phone: '',
      email: '',
      gstin: '',
      fssaiNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      businessType: 'cafe',
      expectedStaffCount: '5',
      expectedBranchCount: '1',
      planKey: 'growth',
    });
  };

  const handleOpenRegistration = (planKey: string) => {
    setForm(prev => ({ ...prev, planKey }));
    setShowModal(true);
  };

  // Helper shortcut for translations
  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || translations['en'][key];
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2D211A] font-sans antialiased overflow-x-hidden relative selection:bg-[#C9A84C]/20 selection:text-[#78350F]">
      
      {/* BACKGROUND DECORATIVE LIQUID GLASS BLOBS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="liquid-blob-1 top-[15%] left-[-10%]" />
        <div className="liquid-blob-2 top-[45%] right-[-15%]" />
        <div className="liquid-blob-3 bottom-[10%] left-[5%]" />
      </div>

      {/* FIXED FLOATING LANGUAGE SELECTOR & NAVIGATION ACTIONS */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#FAF7F2]/90 backdrop-blur-md border border-[#E5D2C0] shadow-xl p-2 rounded-2xl">
        <button 
          onClick={() => setLang('en')} 
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            lang === 'en' ? 'bg-[#C6783A] text-white shadow-md' : 'text-[#5D4B41] hover:bg-white/50'
          }`}
        >
          EN
        </button>
        <button 
          onClick={() => setLang('hi')} 
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            lang === 'hi' ? 'bg-[#C6783A] text-white shadow-md' : 'text-[#5D4B41] hover:bg-white/50'
          }`}
        >
          हिंदी
        </button>
      </div>

      {/* Sticky Premium Glass Navbar */}
      <nav className="sticky top-0 w-full backdrop-blur-lg bg-[#FAF7F2]/80 border-b border-[#E5D2C0]/50 py-4 px-6 flex justify-between items-center z-40 max-w-7xl mx-auto rounded-b-3xl shadow-sm">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#C6783A] to-[#B39034] flex items-center justify-center shadow-md shadow-[#C6783A]/25 border border-white/20 transition-transform group-hover:scale-105">
            <Coffee className="text-[#FAF6F0] w-4.5 h-4.5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#2D211A] uppercase">
            Cafe<span className="text-[#C6783A]">Canva</span>
          </span>
        </Link>

        {/* Links Navigation Menu */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-[#5D4B41]">
          <a href="#solutions" className="hover:text-[#C6783A] transition-colors">{t('navSolutions')}</a>
          <a href="#features" className="hover:text-[#C6783A] transition-colors">{t('navFeatures')}</a>
          <a href="#storefront" className="hover:text-[#C6783A] transition-colors">{t('navStorefront')}</a>
          <a href="#themes" className="hover:text-[#C6783A] transition-colors">{t('navThemes')}</a>
          <a href="#pricing" className="hover:text-[#C6783A] transition-colors">{t('navPricing')}</a>
          <a href="#faq" className="hover:text-[#C6783A] transition-colors">{t('navFAQ')}</a>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="hidden sm:inline-block px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider text-[#5D4B41] hover:bg-[#FAF6F0] border border-transparent hover:border-[#E5D2C0] transition-all"
          >
            {t('btnSignIn')}
          </Link>
          <button 
            onClick={() => handleOpenRegistration('growth')}
            className="px-4 py-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white shadow-lg shadow-[#C6783A]/15 hover:shadow-[#C6783A]/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            {t('btnStartTrial')}
          </button>
        </div>
      </nav>

      {/* SECTION 1: FULL SCREEN HERO WITH CINEMATIC CAFE BACKGROUND */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden z-10 px-6 py-12">
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/10 via-[#FAF7F2]/75 to-[#FAF7F2] z-10" />
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-25 filter sepia-[20%] brightness-[95%]"
          >
            <source src="/assets/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Hero Copy (Luxury Glass Panel) */}
        <div className="relative z-20 max-w-5xl text-center mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-[#E5D2C0] backdrop-blur-md text-[10px] font-black tracking-widest text-[#C6783A] uppercase shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6783A] animate-pulse"></span>
            {t('heroBadge')}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#2D211A]"
          >
            {t('heroTitle1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6783A] via-[#B39034] to-[#E29A8A]">
              {t('heroTitle2')}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm md:text-base text-[#5D4B41] max-w-3xl mx-auto leading-relaxed font-medium"
          >
            {t('heroSub')}
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2"
          >
            <button 
              onClick={() => handleOpenRegistration('growth')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg shadow-[#C6783A]/20 hover:scale-[1.02] transition-transform active:scale-[0.98] cursor-pointer"
            >
              {t('btnStartTrial')} <ArrowRight size={14} />
            </button>
            <a 
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white/80 border border-[#E5D2C0] backdrop-blur-md rounded-2xl font-black text-[11px] uppercase tracking-wider text-[#5D4B41] hover:bg-[#FAF6F0] transition-colors text-center shadow-sm"
            >
              {t('btnBookDemo')}
            </a>
            <a 
              href="#storefront" 
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider text-[#5D4B41] hover:text-[#C6783A] transition-colors"
            >
              <Play size={12} fill="currentColor" /> {t('btnWatchTour')}
            </a>
          </motion.div>

          {/* Statistics Strip */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto"
          >
            {[
              { label: t('statTables'), val: "10,000+" },
              { label: t('statStaff'), val: "50 Cap" },
              { label: t('statBranch'), val: "Centralized" },
              { label: t('statOps'), val: "Socket Sync" }
            ].map((st, i) => (
              <div key={i} className="bg-white/40 border border-[#E5D2C0]/40 backdrop-blur-md p-5 rounded-2xl text-center space-y-1 shadow-sm">
                <div className="text-xl font-extrabold text-[#C6783A]">{st.val}</div>
                <div className="text-[10px] text-[#5D4B41] font-bold uppercase tracking-widest">{st.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM (OLD WAY VS CAFECANVAS) */}
      <section id="solutions" className="relative max-w-6xl mx-auto px-6 py-24 border-t border-[#E5D2C0]/40 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A] tracking-tight">{t('probHeadline')}</h2>
          <p className="text-[11px] text-[#C6783A] font-black uppercase tracking-widest leading-relaxed">{t('probSub')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Old Way Card */}
          <div className="bg-[#FAF1E5]/60 border border-[#E5D2C0]/40 p-8 rounded-3xl flex flex-col justify-between space-y-8 shadow-sm">
            <div className="space-y-4">
              <span className="inline-flex px-3 py-1 bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-200">
                {t('oldWayTitle')}
              </span>
              <p className="text-xs text-[#5D4B41] leading-relaxed font-medium">
                Hospitality operators are forced to buy and maintain multiple independent subscriptions to run their registers, waiters, schedules, and website.
              </p>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-[#E5D2C0]/60">
              {(translations[lang].oldWayItems || translations['en'].oldWayItems).map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs text-[#5D4B41] font-semibold items-start">
                  <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Way Card (CafeCanvas) */}
          <div className="bg-gradient-to-br from-white to-[#FAF6F0] border-2 border-[#C6783A]/30 p-8 rounded-3xl flex flex-col justify-between space-y-8 shadow-xl shadow-[#C6783A]/5">
            <div className="space-y-4">
              <span className="inline-flex px-3 py-1 bg-[#FAF1E5] text-[#C6783A] text-[9px] font-black uppercase tracking-widest rounded-lg border border-[#C6783A]/25">
                {t('newWayTitle')}
              </span>
              <p className="text-xs text-[#2D211A] leading-relaxed font-bold">
                A single unified restaurant operating system. Everything coordinates instantly via web sockets and direct backend trigger nodes.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#E5D2C0]/60">
              {(translations[lang].newWayItems || translations['en'].newWayItems).map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs text-[#2D211A] font-bold items-start">
                  <Check size={16} className="text-[#C6783A] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHAT IS CAFECANVAS (Ecosystem Features Grid) */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-[#E5D2C0]/40 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A]">{t('featuresTitle')}</h2>
          <p className="text-[11px] text-[#C6783A] font-black uppercase tracking-widest">{t('featuresSub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Store className="text-[#C6783A]" />, title: 'Restaurant POS', desc: 'Paise-precision checkouts, split tax configs, table layouts, discounts and offline resilience.', hiTitle: 'रेस्टोरेंट पीओएस', hiDesc: 'पैसे-परिशुद्धता चेकआउट, टैक्स विभाजन, टेबल लेआउट, डिस्काउंट और ऑफलाइन लचीलापन।' },
            { icon: <Layers className="text-[#B39034]" />, title: 'Inventory Control', desc: 'Auto-ingredient deduction during preparing states, reorder alerts, and supplier nodes.', hiTitle: 'इन्वेंट्री नियंत्रण', hiDesc: 'ऑर्डर तैयार होने की स्थिति में सामग्री की ऑटो-कटौती, रीऑर्डर अलर्ट और सप्लायर नोड्स।' },
            { icon: <Users className="text-[#E29A8A]" />, title: 'Geofenced Staff Roster', desc: 'Clock-in geofence parameters, biometric selfie checks, shift records, and role validations.', hiTitle: 'स्टाफ रोस्टर प्रबंधन', hiDesc: 'हाजिरी के लिए जीपीएस पैमाना, बायोमेट्रिक सेल्फी सत्यापन, शिफ्ट रिकॉर्ड और भूमिका सत्यापन।' },
            { icon: <Globe className="text-[#C6783A]" />, title: 'Brand Storefront Builder', desc: 'Zero commission menus deployed on custom subdomains with dynamic Vercel SSL aliasing.', hiTitle: 'स्टोरफ्रंट बिल्डर', hiDesc: 'बिना किसी कमीशन के डिजिटल मेनू, डायनामिक एसएसएल डोमेन के साथ लाइव होने के लिए तैयार।' },
            { icon: <ChefHat className="text-[#B39034]" />, title: 'Kitchen Display (KDS)', desc: 'Realtime order processing queue synced with socket relay updates to KDS monitors.', hiTitle: 'किचन डिस्प्ले सिस्टम (KDS)', hiDesc: 'वास्तविक समय में ऑर्डर की स्थिति, सीधे किचेन स्क्रीन से पीओएस और वेटर्स तक ऑटो-सिंक।' },
            { icon: <BarChart3 className="text-[#E29A8A]" />, title: 'Analytics Ledger', desc: 'Hourly revenue tracking in paise, top selling product heatmaps, and staff audit reports.', hiTitle: 'राजस्व और डेटा रिपोर्टिंग', hiDesc: 'पैसे में राजस्व ट्रैकिंग, सबसे अधिक बिकने वाले आइटमों की रिपोर्ट, और कर्मचारी उपस्थिति रिपोर्ट्स।' },
            { icon: <Sliders className="text-[#C6783A]" />, title: 'Flexible Modifiers', desc: 'Chain ingredient options, custom meal choices, tax exceptions, and combo sets easily.', hiTitle: 'मेनू मॉडिफायर्स', hiDesc: 'खाद्य सामग्री के विकल्प, विशेष भोजन संयोजन, टैक्स छूट नियम और अन्य लचीली सेटिंग्स।' },
            { icon: <PhoneIcon className="text-[#B39034]" />, title: 'WhatsApp Integration', desc: 'Push digital receipt notifications, campaign messages, and onboarding OTP verification.', hiTitle: 'व्हाट्सएप एकीकरण', hiDesc: 'व्हाट्सएप पर बिल भेजने, अभियान संदेश और ग्राहकों के लिए ओटीपी लॉगिन की सुविधा।' },
            { icon: <HeartHandshake className="text-[#E29A8A]" />, title: 'CRM & Loyalty', desc: 'Retain customer purchase frequencies, loyalty points calculations, and discount codes.', hiTitle: 'लॉयल्टी और ग्राहक संबंध', hiDesc: 'ग्राहकों की खरीद इतिहास का डेटा, लॉयल्टी पॉइंट्स कैलकुलेटर और स्पेशल कूपन कोड।' },
            { icon: <Calendar className="text-[#C6783A]" />, title: 'Table Reservations', desc: 'Allows customers to reserve dining layouts directly from storefront mapped to POS monitors.', hiTitle: 'टेबल बुकिंग और रिजर्वेशन', hiDesc: 'ग्राहक स्टोरफ्रंट से टेबल बुक कर सकते हैं, जो कैशियर स्क्रीन पर लाइव अपडेट हो जाता है।' },
            { icon: <MessageSquare className="text-[#B39034]" />, title: 'Feedback & Reviews', desc: 'Capture customer dining ratings and cache reviews directly to storefront home listings.', hiTitle: 'फीडबैक और रिव्यूज', hiDesc: 'ग्राहकों से सीधा फीडबैक प्राप्त करें, और स्टोरफ्रंट वेबसाइट पर सीधे रिव्यूज प्रदर्शित करें।' },
            { icon: <Building2 className="text-[#E29A8A]" />, title: 'Multi-Branch Engine', desc: 'Manage central menus, franchise rules, billing audits, and inventory moves across outlets.', hiTitle: 'मल्टी-ब्रांच नियंत्रण', hiDesc: 'एक स्थान से अपने सभी रेस्टोरेंट आउटलेट्स के मेनू, फ्रेंचाइजी नियम और स्टॉक का नियंत्रण करें।' }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#E5D2C0]/50 p-7 rounded-3xl space-y-4 hover:border-[#C6783A]/30 transition-all shadow-sm group hover:-translate-y-1 duration-300">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF6F0] border border-[#E5D2C0]/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                {item.icon}
              </div>
              <h3 className="text-xs font-black text-[#2D211A] uppercase tracking-wider">
                {lang === 'hi' ? item.hiTitle : item.title}
              </h3>
              <p className="text-[11px] text-[#5D4B41] leading-relaxed font-semibold">
                {lang === 'hi' ? item.hiDesc : item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: RESTAURANT OS SHOWCASE (Dynamic Interactive Console Preview) */}
      <section className="bg-[#FAF1E5]/40 border-y border-[#E5D2C0]/50 py-24 z-10 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black uppercase text-[#C6783A] tracking-widest">{t('showcaseTitle')}</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A] leading-tight">{t('showcaseSub')}</h2>
              <p className="text-xs text-[#5D4B41] font-semibold leading-relaxed">
                Choose a module to inspect terminal updates. All transactions execute in paise (e.g. CGST 2.5% + SGST 2.5% split) and update cashier grids instantly.
              </p>

              {/* Showcase Navigation */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { key: 'orders', label: t('showcaseOrders') },
                  { key: 'revenue', label: t('showcaseRevenue') },
                  { key: 'tables', label: t('showcaseTables') },
                  { key: 'inventory', label: t('showcaseInventory') },
                  { key: 'staff', label: t('showcaseStaff') }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveShowcaseTab(tab.key as any)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      activeShowcaseTab === tab.key 
                        ? 'bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white border-transparent shadow-md' 
                        : 'bg-white border-[#E5D2C0] text-[#5D4B41] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Glass Console Interface */}
            <div className="lg:col-span-7 bg-white border border-[#E5D2C0] p-6 rounded-3xl shadow-xl relative min-h-[340px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E5D2C0]/50 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    <span className="text-[9px] uppercase tracking-widest font-black text-[#5D4B41]">POS Terminal Monitor node</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#C6783A] font-black">WS // status: connected</div>
                </div>

                {/* TAB 1: Live Orders */}
                {activeShowcaseTab === 'orders' && (
                  <div className="space-y-3">
                    <div className="text-[9px] font-bold uppercase text-[#C6783A] mb-1">Active Kitchen Display Queue</div>
                    {liveOrders.map(o => (
                      <div key={o.id} className="p-3 bg-[#FAF7F2] border border-[#E5D2C0]/30 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-[#2D211A]">{o.item}</div>
                          <span className="text-[9px] text-[#5D4B41] font-mono">{o.id} · Table {o.table}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          o.status === 'served' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : o.status === 'ready'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: Live Revenue Ledger */}
                {activeShowcaseTab === 'revenue' && (
                  <div className="space-y-6 py-6 text-center">
                    <div className="text-[9px] font-bold uppercase text-[#5D4B41]">Today's Accumulated Net Volume (INR)</div>
                    <div className="text-4xl font-extrabold text-[#2D211A] tracking-tight">
                      ₹{(liveRevenue / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-[10px] border-t border-[#E5D2C0]/50 pt-4">
                      <div>
                        <div className="text-stone-400 font-bold uppercase">CGST (2.5%)</div>
                        <div className="font-black text-[#5D4B41] font-mono">₹{((liveRevenue * 0.025) / 100).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-stone-400 font-bold uppercase">SGST (2.5%)</div>
                        <div className="font-black text-[#5D4B41] font-mono">₹{((liveRevenue * 0.025) / 100).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Table Layouts */}
                {activeShowcaseTab === 'tables' && (
                  <div className="space-y-4">
                    <div className="text-[9px] font-bold uppercase text-[#5D4B41]">Table Roster Grid status</div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
                        const status = num === 2 ? 'billed' : num === 4 || num === 7 ? 'ordered' : 'empty';
                        return (
                          <div key={num} className={`p-3 rounded-xl border text-[10px] font-bold uppercase ${
                            status === 'billed' 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : status === 'ordered'
                              ? 'bg-orange-50 border-orange-200 text-orange-700'
                              : 'bg-stone-50 border-[#E5D2C0] text-stone-400'
                          }`}>
                            T-0{num}
                            <div className="text-[7px] font-black mt-0.5">{status}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-[#5D4B41] italic text-center">
                      Active: {activeTablesCount} sessions running across dining zones
                    </p>
                  </div>
                )}

                {/* TAB 4: Live Inventory */}
                {activeShowcaseTab === 'inventory' && (
                  <div className="space-y-3">
                    <div className="text-[9px] font-bold uppercase text-[#5D4B41] mb-1">Ingredient Stocks Monitoring</div>
                    {stockIngredients.map((ing, i) => (
                      <div key={i} className="p-3 bg-[#FAF7F2] border border-[#E5D2C0]/30 rounded-xl flex items-center justify-between text-xs font-semibold text-[#5D4B41]">
                        <div>{ing.name}</div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-[#2D211A]">{ing.val} {ing.unit}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            ing.status === 'Optimal' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 animate-pulse'
                          }`}>
                            {ing.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 5: Staff Attendance Roster */}
                {activeShowcaseTab === 'staff' && (
                  <div className="space-y-3">
                    <div className="text-[9px] font-bold uppercase text-[#5D4B41] mb-1">Shift attendance logs (Enforcing 50 limit)</div>
                    {staffRoster.map((st, i) => (
                      <div key={i} className="p-3 bg-[#FAF7F2] border border-[#E5D2C0]/30 rounded-xl flex items-center justify-between text-xs font-semibold">
                        <div>
                          <div className="text-[#2D211A] font-bold">{st.name} ({st.role})</div>
                          <div className="text-[9px] text-stone-400 mt-0.5">Clocked in: {st.checkIn}</div>
                        </div>
                        <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-100 rounded-lg">
                          {st.verified}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5D2C0]/50 pt-3 mt-4 flex items-center justify-between text-[10px] text-stone-400 font-bold">
                <span>✓ Database Trigger Checks active</span>
                <span>Node: IND-MUM-01</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: DIGITAL MENU & STOREFRONT */}
      <section id="storefront" className="max-w-6xl mx-auto px-6 py-24 border-t border-[#E5D2C0]/40 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase text-[#C6783A] tracking-widest">{t('storefrontTitle')}</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A] leading-tight">{t('storefrontSub')}</h2>
            <p className="text-xs text-[#5D4B41] font-semibold leading-relaxed">
              Every amendment to menu matrix entries, pricing rules, photos, or blogs in the Tenant Admin dashboard immediately compiles and pushes updates to your customer-facing storefront site.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: 'Secure Table QR Menus', desc: 'Generate encrypted QR codes mapped to dining tables containing tenant and branch identifiers.' },
                { title: 'Custom Subdomain & Domain Mapping', desc: 'Deploy store catalogs at order.mybrand.com using Vercel DNS alias certificates automatically.' },
                { title: 'Full Storefront Blogs & Events Listings', desc: 'Post stories, chef events, or special holiday hours directly onto your storefront to keep clients engaged.' }
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#E5D2C0] flex items-center justify-center text-[#C6783A] shrink-0 shadow-sm text-xs font-black">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-[#2D211A] font-bold text-xs uppercase tracking-wider">{f.title}</h4>
                    <p className="text-[#5D4B41] text-[11px] mt-0.5 leading-normal font-semibold">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storefront Preview Card mockup */}
          <div className="bg-white border border-[#E5D2C0] p-8 rounded-3xl shadow-xl flex flex-col justify-between min-h-[380px]">
            <div className="flex items-center justify-between border-b border-[#E5D2C0]/50 pb-4">
              <span className="text-[9px] uppercase tracking-widest font-black text-stone-400">Live Customer Storefront Menu</span>
              <span className="text-[9px] font-mono text-[#C6783A] font-black">artisanalbrew.cafecanvas.bar</span>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-black text-[#2D211A] uppercase tracking-widest">Beverage Menu Matrix</div>
              <div className="space-y-3">
                {[
                  { name: 'Oat Milk Salted Caramel Latte', desc: 'Organic oat base, double shot espresso, caramel drizzle', price: '₹280' },
                  { name: 'Cold Brew Rose Tonic', desc: '18-hour cold brew concentrate, tonic water, rose essence', price: '₹240' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF7F2] border border-[#E5D2C0]/30 rounded-2xl flex items-center justify-between text-xs font-bold">
                    <div>
                      <div className="text-[#2D211A]">{item.name}</div>
                      <div className="text-[9px] text-[#5D4B41] font-medium mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-[#C6783A]">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E5D2C0]/50 pt-4 flex items-center justify-between text-[9px] font-black uppercase text-[#5D4B41]">
              <span>✓ Instant SSL Active</span>
              <span className="px-3 py-1 bg-[#C6783A]/10 text-[#C6783A] rounded-lg border border-[#C6783A]/20">
                Self-Checkout Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: STAFF APP MOBILE MOCKUP */}
      <section className="bg-[#FAF1E5]/40 border-y border-[#E5D2C0]/50 py-24 z-10 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Phone/Tablet Mockup */}
            <div className="lg:col-span-6 bg-white border border-[#E5D2C0] p-6 rounded-3xl shadow-xl max-w-sm mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5D2C0]/50 pb-4">
                <span className="text-[9px] font-black uppercase text-[#5D4B41] tracking-widest">Waitstaff Companion POS</span>
                <span className="text-[8px] font-black text-green-700 bg-green-50 px-2 py-0.5 border border-green-200 rounded">
                  SHIFT ON
                </span>
              </div>

              <div className="p-4 bg-[#FAF7F2] border border-[#E5D2C0]/40 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase">
                  <span>Duty Location boundary</span>
                  <span className="text-[#C6783A]">Inside geofence</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-[#E5D2C0]/50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF1E5] flex items-center justify-center font-bold text-[#C6783A]">
                    AS
                  </div>
                  <div>
                    <div className="font-bold text-[#2D211A]">Arjun Singh</div>
                    <div className="text-[9px] text-[#5D4B41] font-mono mt-0.5">Check-in: 08:31 AM · Approved</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FAF7F2] border border-[#E5D2C0]/40 rounded-2xl space-y-3 text-xs">
                <div className="text-[9px] text-[#5D4B41] font-bold uppercase">Assigned Service Stations</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-black">
                  <div className="p-2 bg-stone-100 border border-stone-200 text-stone-400 rounded-lg">Zone A (Empty)</div>
                  <div className="p-2 bg-[#C6783A]/10 border border-[#C6783A]/35 text-[#C6783A] rounded-lg">Zone B (Active)</div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">Zone C (Billed)</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-[10px] font-black uppercase text-[#C6783A] tracking-widest">{t('staffTitle')}</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A] leading-tight">{t('staffSub')}</h2>
              <p className="text-xs text-[#5D4B41] font-semibold leading-relaxed">
                Provide waitstaff and branch managers with an integrated mobile app interface. Staff clock-ins use precise GPS boundary logs and selfie photo capture, with automatic shift status sharing back to the admin center.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-4">
                {[
                  { title: "Attendance Tracking", desc: "Clock-in and shifts history." },
                  { title: "GPS Geofencing", desc: "Enforce location checks." },
                  { title: "Selfie Verification", desc: "Prevent proxy check-ins." },
                  { title: "Table Roster Sync", desc: "Waiter table mapping." }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border border-[#E5D2C0]/50 rounded-2xl shadow-sm">
                    <h5 className="text-[#2D211A] font-bold text-xs uppercase tracking-wider">{item.title}</h5>
                    <p className="text-stone-400 text-[10px] mt-1 leading-normal">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: HOW IT WORKS (9 Step Grid) */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-[#E5D2C0]/40 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A]">{t('howItWorksTitle')}</h2>
          <p className="text-[11px] text-[#C6783A] font-black uppercase tracking-widest">{t('howItWorksSub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-4 text-left">
          {[
            { step: '01', title: 'Create Account', desc: 'Provide base registration credentials.' },
            { step: '02', title: 'Submit Details', desc: 'Input FSSAI and address info.' },
            { step: '03', title: 'Audit Check', desc: 'Super Admin audits details.' },
            { step: '04', title: 'Tenant Set', desc: 'Supabase node compiles defaults.' },
            { step: '05', title: 'Add Staff', desc: 'Enforce maximum 50 limits.' },
            { step: '06', title: 'Upload Menu', desc: 'Build modifier configurations.' },
            { step: '07', title: 'Gen QRs', desc: 'Export secure tables tokens.' },
            { step: '08', title: 'Publish Web', desc: 'Link custom domains aliases.' },
            { step: '09', title: 'Store Live', desc: 'Transactions route to POS.' }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#E5D2C0]/50 p-4 rounded-2xl flex flex-col justify-between min-h-[160px] relative shadow-sm hover:border-[#C6783A]/30 transition-all">
              <span className="text-2xl font-black text-[#C6783A]/15 font-mono">{item.step}</span>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-[#2D211A] uppercase tracking-wider">{item.title}</h4>
                <p className="text-[9px] text-[#5D4B41] font-semibold leading-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: INDUSTRIES */}
      <section className="bg-[#FAF1E5]/40 border-y border-[#E5D2C0]/50 py-24 z-10 relative text-center">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A]">{t('indTitle')}</h2>
            <p className="text-[11px] text-[#C6783A] font-black uppercase tracking-widest">{t('indSub')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: 'Fine Dining Restaurants', desc: 'Full table billing & CGST + SGST splits' },
              { title: 'Modern Cafes & Roasteries', desc: 'Quick QR menus & barista KDS boards' },
              { title: 'Cocktail Bars & Pubs', desc: 'Open tab sessions & geofenced staff' },
              { title: 'Bespoke Lounges', desc: 'Reservation layouts synced to POS' },
              { title: 'Cloud Kitchen networks', desc: 'Instant ingredient deductions' },
              { title: 'Artisanal Bakeries', desc: 'Roster control & receipt updates' },
              { title: 'Food Courts & Plazas', desc: 'Multi-terminal central ledger' },
              { title: 'Restaurant Chains', desc: 'Central menu overrides & franchise limits' }
            ].map((ind, i) => (
              <div key={i} className="bg-white border border-[#E5D2C0]/50 p-6 rounded-2xl flex flex-col justify-between min-h-[120px] text-center hover:border-[#C6783A]/30 transition-all shadow-sm">
                <h4 className="text-[11px] font-black text-[#2D211A] uppercase tracking-wider">{ind.title}</h4>
                <p className="text-[9px] text-[#5D4B41] font-semibold leading-normal mt-2">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: WHY CAFECANVAS (Philosophical Storytelling) */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-8 z-10 relative">
        <span className="text-[10px] font-black uppercase text-[#C6783A] tracking-widest">Platform Core Philosophy</span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A] tracking-tight">{t('whyTitle')}</h2>
        <p className="text-xs md:text-sm text-[#5D4B41] leading-relaxed max-w-3xl mx-auto font-semibold">
          {t('whyStory')}
        </p>
      </section>

      {/* SECTION 10: INTERACTIVE THEME SHOWCASE CAROUSEL */}
      <section id="themes" className="bg-[#FAF1E5]/40 border-y border-[#E5D2C0]/50 py-24 z-10 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A]">{t('themeTitle')}</h2>
            <p className="text-[11px] text-[#C6783A] font-black uppercase tracking-widest">{t('themeSub')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Theme list selector */}
            <div className="bg-white border border-[#E5D2C0] rounded-3xl p-6 space-y-1.5 max-h-[380px] overflow-y-auto shadow-sm">
              {luxuryThemes.map((theme, i) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveThemeIdx(i)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeThemeIdx === i 
                      ? 'bg-[#C6783A]/10 text-[#78350F] border border-[#C6783A]/40' 
                      : 'text-[#5D4B41] hover:bg-[#FAF7F2] border border-transparent'
                  }`}
                >
                  <span>{theme.name}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>

            {/* Simulated Live Theme Preview */}
            <div className="lg:col-span-2 bg-white border border-[#E5D2C0] p-8 rounded-3xl flex flex-col justify-between min-h-[380px] relative overflow-hidden shadow-xl transition-all duration-500">
              {/* Dynamic Accent Background Radial Gradient */}
              <div 
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: luxuryThemes[activeThemeIdx].accent }}
              />

              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-widest font-black text-stone-400">
                  CSS Variable Engine · Preview: {luxuryThemes[activeThemeIdx].name}
                </span>
                <h3 className="text-lg font-extrabold text-[#2D211A] leading-tight">
                  {luxuryThemes[activeThemeIdx].desc}
                </h3>
              </div>

              {/* Preview UI Demo Card inside the preview */}
              <div className="p-6 bg-[#FAF7F2]/60 border border-[#E5D2C0]/50 rounded-2xl space-y-4 backdrop-blur-md">
                <div className="flex justify-between items-center text-xs font-bold text-[#5D4B41]">
                  <span>Active Brand Accent</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#2D211A]">{luxuryThemes[activeThemeIdx].accent}</span>
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/40 transition-all duration-500 shadow-inner" 
                      style={{ backgroundColor: luxuryThemes[activeThemeIdx].accent }}
                    />
                  </div>
                </div>
                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-700"
                    style={{ backgroundColor: luxuryThemes[activeThemeIdx].accent, width: '70%' }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => handleOpenRegistration('growth')}
                  className="px-5 py-3 bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  Deploy with {luxuryThemes[activeThemeIdx].name}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 border-t border-[#E5D2C0]/40 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A]">{t('pricingTitle')}</h2>
          <p className="text-[11px] text-[#C6783A] font-black uppercase tracking-widest">{t('pricingSub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.key} 
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between min-h-[540px] relative transition-all shadow-sm ${
                plan.popular 
                  ? 'border-2 border-[#C6783A] shadow-xl shadow-[#C6783A]/5 scale-[1.02]' 
                  : 'border-[#E5D2C0]'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/20 shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-4 text-left">
                <div className="text-[10px] font-black uppercase text-[#C6783A] tracking-widest">{plan.name}</div>
                <div className="text-3xl font-black text-[#2D211A]">
                  {plan.price === 'Custom' ? 'Custom' : `₹${plan.price}`}
                  {plan.price !== 'Custom' && <span className="text-[10px] text-stone-400 font-bold uppercase ml-1">/mo</span>}
                </div>
                <p className="text-[11px] text-[#5D4B41] leading-relaxed font-semibold">{plan.description}</p>
                
                <hr className="border-[#E5D2C0]/50" />

                <div className="space-y-2.5">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2 text-[10px] text-[#5D4B41] font-bold">
                      <Check size={12} className="text-[#C6783A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleOpenRegistration(plan.key)}
                className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center mt-6 ${
                  plan.popular 
                    ? 'bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white shadow-md' 
                    : 'bg-[#FAF7F2] border border-[#E5D2C0] text-[#5D4B41] hover:bg-[#FAF1E5]'
                }`}
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 12: TESTIMONIALS */}
      <section className="bg-[#FAF1E5]/40 border-y border-[#E5D2C0]/50 py-24 z-10 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A]">{t('testTitle')}</h2>
            <p className="text-[11px] text-[#C6783A] font-black uppercase tracking-widest">{t('testSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                text: 'CafeCanvas allowed us to ditch three separate subscriptions. We map our tableside orders directly to our custom subdomain storefront, saving thousands of rupees in aggregator commission fees. The system is extremely fast and robust.', 
                author: 'Amit Patel', 
                store: 'Bandra Brews Coffeehouse' 
              },
              { 
                text: 'The paise-precision POS checks split taxes automatically. Roster allocations for our 45 staff members are geofenced securely. The live KDS updates are extremely clean, and customer accounts manage their loyalty rewards directly.', 
                author: 'Preeti Sharma', 
                store: 'AETHER Café & Lounge' 
              },
              { 
                text: 'Editing menu variables instantly in the admin console and having it publish to the storefront menu is a game changer. We configured the Mughal Garden theme with custom CSS variables to match our luxury theme.', 
                author: 'Karan Malhotra', 
                store: 'The Golden Goblet Pub & Bistro' 
              }
            ].map((test, i) => (
              <div key={i} className="bg-white border border-[#E5D2C0]/60 p-8 rounded-3xl space-y-5 flex flex-col justify-between shadow-sm">
                <p className="text-xs text-[#5D4B41] leading-relaxed font-semibold italic">"{test.text}"</p>
                <div>
                  <div className="font-black text-[#2D211A] text-xs uppercase tracking-wider">{test.author}</div>
                  <div className="text-[9px] text-[#C6783A] font-mono mt-1">{test.store}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 13: FAQ (10 Accordions) */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 border-t border-[#E5D2C0]/40 z-10">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2D211A]">{t('faqTitle')}</h2>
          <p className="text-[11px] text-[#C6783A] font-black uppercase tracking-widest">{t('faqSub')}</p>
        </div>

        <div className="space-y-4">
          {[
            { 
              q: 'Is CafeCanvas a POS or a QR menu?', 
              a: 'CafeCanvas is a complete Multi-Tenant Restaurant Operating System. It covers everything from paise-precision cashier POS terminals and geofenced staff attendance rosters to automated storefront menus mapped to your custom domains.' 
            },
            { 
              q: 'How does the staff limit work?', 
              a: 'Every tenant is limited to registering up to 50 active staff profiles in their database table records. This check is enforced directly at the Postgres database trigger level to protect resources.' 
            },
            { 
              q: 'Do you charge transaction commission cuts?', 
              a: 'No, we do not charge commissions on checkout transactions. Payments are routed directly to your integrated Razorpay credentials without intermediate cuts.' 
            },
            { 
              q: 'What is the tax configuration?', 
              a: 'The platform enforces Indian tax split configurations (CGST 2.5% + SGST 2.5% default) computed as integers representing paise to prevent float rounding errors.' 
            },
            { 
              q: 'Can I link my own custom domain?', 
              a: 'Yes! Growth, Professional, and Enterprise plans allow you to link custom domains (e.g. order.mybrand.com) mapped using Vercel DNS alias certificates.' 
            },
            { 
              q: 'What happens when I edit menu items?', 
              a: 'All changes to menu descriptions, prices, or photos in the admin console are automatically pushed to public storefronts instantly using Supabase WebSocket channels.' 
            },
            { 
              q: 'Is geofence selfie check-in mandatory?', 
              a: 'Attendance logs can be geofenced to physical outlet coordinates with selfie checks enabled or disabled from the store settings dashboard.' 
            },
            { 
              q: 'How do I get approved as a tenant?', 
              a: 'After completing the self-onboarding request form, our Super Admins verify your GSTIN/FSSAI registration credentials and activate your database node within 24 hours.' 
            },
            { 
              q: 'What themes are available for storefronts?', 
              a: 'We provide 10 luxury theme layouts (Matcha Zen, Rajasthani Royal, Mughal Garden, Classic Cafe, Modern Bistro, etc.) customized easily via CSS variables.' 
            },
            { 
              q: 'Can I change my plan later?', 
              a: 'Yes, subscription tiers can be modified, upgraded, or downgraded at any time directly through the tenant admin settings drawer.' 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E5D2C0]/50 rounded-2xl overflow-hidden transition-all shadow-sm">
              <button
                onClick={() => setActiveFaqIdx(activeFaqIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-[#2D211A] cursor-pointer"
              >
                <span>{item.q}</span>
                {activeFaqIdx === idx ? <ChevronDown size={14} className="text-[#C6783A]" /> : <ChevronRight size={14} className="text-stone-400" />}
              </button>
              {activeFaqIdx === idx && (
                <div className="p-5 pt-0 text-[11px] text-[#5D4B41] font-semibold leading-relaxed border-t border-[#E5D2C0]/40 bg-[#FAF7F2]/30">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 14: FINAL CTA */}
      <section className="bg-[#FAF1E5]/40 border-t border-[#E5D2C0]/50 py-24 relative overflow-hidden z-10 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight text-[#2D211A]">
            {t('ctaTitle')}
          </h2>
          
          <p className="text-xs md:text-sm text-[#5D4B41] max-w-2xl mx-auto leading-relaxed font-semibold">
            {t('ctaSub')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => handleOpenRegistration('growth')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-xl shadow-[#C6783A]/20 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
            >
              {t('btnStartTrial')}
            </button>
            <Link 
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-[#E5D2C0] rounded-2xl font-black text-[11px] uppercase tracking-wider text-[#5D4B41] hover:bg-[#FAF6F0] transition-colors text-center shadow-sm"
            >
              {t('btnSignIn')}
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 15: FOOTER */}
      <footer className="w-full bg-white py-16 border-t border-[#E5D2C0] relative z-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-xs font-semibold text-[#5D4B41]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-[#2D211A]">
              <div className="w-8 h-8 rounded-xl bg-[#C6783A] flex items-center justify-center">
                <Coffee className="text-white w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-[#2D211A]">Cafe<span className="text-[#C6783A]">Canva</span></span>
            </div>
            <p className="text-[10px] text-stone-400 leading-relaxed font-semibold">
              {t('footerDesc')}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-[#2D211A] uppercase tracking-widest">Solutions</h4>
            <div className="flex flex-col gap-2 font-bold text-stone-400">
              <a href="#features" className="hover:text-[#C6783A] transition-colors">Restaurant POS</a>
              <a href="#features" className="hover:text-[#C6783A] transition-colors">Waiter Mobile App</a>
              <a href="#storefront" className="hover:text-[#C6783A] transition-colors">Interactive QR Menu</a>
              <a href="#themes" className="hover:text-[#C6783A] transition-colors">Theme Engine</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-[#2D211A] uppercase tracking-widest">System Details</h4>
            <div className="flex flex-col gap-2 font-bold text-stone-400">
              <a href="#pricing" className="hover:text-[#C6783A] transition-colors">Plan Pricing</a>
              <a href="#faq" className="hover:text-[#C6783A] transition-colors">FAQ</a>
              <Link href="/superadmin" className="hover:text-[#C6783A] transition-colors">Platform Admin Login</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-[#2D211A] uppercase tracking-widest">Compliance</h4>
            <div className="text-[10px] leading-relaxed text-stone-400">
              CafeCanvas complies with FSSAI regulations and standard GST splits. All financial ledger reports compile in paise.
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-[#E5D2C0]/50 text-center text-[10px] text-stone-400 font-bold uppercase tracking-wider">
          © {new Date().getFullYear()} CafeCanvas OS. Built for modern food and beverage businesses.
        </div>
      </footer>

      {/* MULTI-STEP ONBOARDING REGISTRATION MODAL WIZARD */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D211A]/40 backdrop-blur-md transition-all">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E5D2C0] w-full max-w-xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 right-6 text-stone-400 hover:text-[#2D211A] p-2 hover:bg-stone-50 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {!success ? (
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-[#C6783A]/10 text-[#C6783A] flex items-center justify-center border border-[#C6783A]/20 shadow-sm">
                      <Store size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#2D211A] uppercase tracking-wider">Create Tenant Account</h3>
                      <p className="text-xs text-stone-400 mt-1">Step {currentStep} of 3: Enter details</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1 bg-[#FAF7F2] rounded-full mb-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#C6783A] to-[#B39034] transition-all duration-300"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 font-semibold text-left">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    {/* STEP 1: BUSINESS BASE INFO */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Business / Brand Name</label>
                          <input 
                            type="text" 
                            name="businessName"
                            required
                            placeholder="e.g. Bandra Brews Coffeehouse"
                            value={form.businessName}
                            onChange={handleChange}
                            className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Business Type</label>
                            <select 
                              name="businessType"
                              value={form.businessType}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-3 py-2.5 text-xs text-[#5D4B41] focus:outline-none focus:border-[#C6783A]"
                            >
                              <option value="cafe">Cafe / Roastery</option>
                              <option value="restaurant">Restaurant / Dining</option>
                              <option value="bar">Bar / Pub / Lounge</option>
                              <option value="bakery">Bakery / Patisserie</option>
                              <option value="cloud_kitchen">Cloud Kitchen</option>
                              <option value="other">Other Operations</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Plan Tier</label>
                            <select 
                              name="planKey"
                              value={form.planKey}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-3 py-2.5 text-xs text-[#5D4B41] focus:outline-none focus:border-[#C6783A]"
                            >
                              <option value="starter">Starter Suite (1 Outlet)</option>
                              <option value="growth">Growth Suite (5 Outlets)</option>
                              <option value="professional">Professional Hub (15 Outlets)</option>
                              <option value="enterprise">Enterprise Custom</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Expected Staff Limit</label>
                            <input 
                              type="number" 
                              name="expectedStaffCount"
                              min="1"
                              max="50"
                              value={form.expectedStaffCount}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Expected Branch Count</label>
                            <input 
                              type="number" 
                              name="expectedBranchCount"
                              min="1"
                              value={form.expectedBranchCount}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button 
                            type="button"
                            onClick={handleNextStep}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                          >
                            Next Step <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: CREDENTIALS & LOCATION INFO */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">GSTIN (Optional)</label>
                            <input 
                              type="text" 
                              name="gstin"
                              placeholder="15-character ID"
                              maxLength={15}
                              value={form.gstin}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A] font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">FSSAI Number (Optional)</label>
                            <input 
                              type="text" 
                              name="fssaiNumber"
                              placeholder="FSSAI Registration"
                              value={form.fssaiNumber}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A] font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Street Address</label>
                          <input 
                            type="text" 
                            name="address"
                            placeholder="Registered Outlet Address"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">City</label>
                            <input 
                              type="text" 
                              name="city"
                              placeholder="City"
                              value={form.city}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">State</label>
                            <input 
                              type="text" 
                              name="state"
                              placeholder="State"
                              value={form.state}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Country</label>
                            <input 
                              type="text" 
                              name="country"
                              value={form.country}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-between">
                          <button 
                            type="button"
                            onClick={handlePrevStep}
                            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-[#5D4B41] transition-all"
                          >
                            Back
                          </button>
                          <button 
                            type="button"
                            onClick={handleNextStep}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                          >
                            Next Step <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: OWNER INFO */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Owner / Administrator Full Name</label>
                          <input 
                            type="text" 
                            name="ownerName"
                            required
                            placeholder="e.g. Yash Zagde"
                            value={form.ownerName}
                            onChange={handleChange}
                            className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Primary Email Address</label>
                            <input 
                              type="email" 
                              name="email"
                              required
                              placeholder="owner@cafebrand.com"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#5D4B41] uppercase tracking-wider">Primary Contact Number</label>
                            <input 
                              type="tel" 
                              name="phone"
                              required
                              placeholder="Mobile with country code"
                              value={form.phone}
                              onChange={handleChange}
                              className="w-full bg-[#FAF7F2] border border-[#E5D2C0] rounded-xl px-4 py-2.5 text-xs text-[#2D211A] focus:outline-none focus:border-[#C6783A] font-mono"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-[#FAF7F2] border border-[#E5D2C0]/50 rounded-2xl flex gap-3 text-[10px] text-[#5D4B41] font-semibold leading-relaxed">
                          <ShieldCheck size={20} className="text-[#C6783A] shrink-0" />
                          <span>
                            Security Alert: All submitted request entries undergo verification. Approved tenants will receive an email confirmation with administrative access keys within 24 hours.
                          </span>
                        </div>

                        <div className="pt-4 flex justify-between">
                          <button 
                            type="button"
                            onClick={handlePrevStep}
                            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-[#5D4B41] transition-all"
                          >
                            Back
                          </button>
                          <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-[#C6783A]/10"
                          >
                            {loading ? 'Submitting...' : 'Complete Self-Onboarding'}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                /* Onboarding Success Panel */
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-[#C6783A] flex items-center justify-center mx-auto shadow-sm">
                    <Award size={32} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-[#2D211A] uppercase tracking-wider">Registration Request Sent</h3>
                    <p className="text-xs text-[#5D4B41] leading-relaxed px-4">
                      Onboarding credentials for <strong className="text-[#2D211A]">{form.businessName}</strong> have been submitted to the CafeCanvas queue.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF7F2] border border-[#E5D2C0] rounded-2xl text-left space-y-3 text-xs">
                    <div className="flex gap-2">
                      <Building2 size={16} className="text-[#C6783A] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#2D211A] uppercase text-[10px]">Verification Audit Pending</div>
                        <div className="text-[#5D4B41] text-[10px] mt-0.5 font-semibold">Our Super Admins are reviewing your business details and FSSAI credentials.</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Mail size={16} className="text-[#B39034] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#2D211A] uppercase text-[10px]">Credentials Dispatch</div>
                        <div className="text-[#5D4B41] text-[10px] mt-0.5 font-semibold">Your admin console access tokens will be emailed to {form.email}.</div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCloseModal}
                    className="w-full py-3.5 bg-gradient-to-tr from-[#C6783A] to-[#B39034] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:opacity-95"
                  >
                    Return to Homepage
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
