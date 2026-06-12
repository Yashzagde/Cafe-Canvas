'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import WelcomeNotificationPopup from '@/components/WelcomeNotificationPopup';
import HeroCarousel from '@/components/HeroCarousel';
import { loadTenantTheme } from '@/lib/theme-engine';
import { getThemeDesign } from '@/lib/theme-designs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Globe, 
  Sparkles, 
  X, 
  User, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Star,
  LogOut,
  Home,
  BookOpen,
  QrCode,
  Truck,
  Package,
  Tag,
  Info,
  Phone,
  Image as ImageIcon,
  Briefcase,
  Search,
  Bell,
  MapPin,
  Clock,
  Mail,
  Heart,
  ChevronRight,
  Map
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  public_id?: string;
  theme_id?: string;
  hero_image_url?: string | null;
  hero_image_url_2?: string | null;
  hero_image_url_3?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_title_2?: string | null;
  hero_subtitle_2?: string | null;
  hero_title_3?: string | null;
  hero_subtitle_3?: string | null;
  logo_url?: string | null;
  footer_description?: string | null;
  footer_hours?: string | null;
  footer_address?: string | null;
  footer_phone?: string | null;
  footer_email?: string | null;
}

interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number; // in paise
  image_url?: string;
  status: 'available' | 'unavailable' | 'hidden';
  tags?: string[];
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  section: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location_id: string;
}

const TRANSLATIONS = {
  en: {
    titleSuffix: 'Digital Menu',
    openStatus: 'Open until 10:00 PM',
    viewOrder: 'View Active Order',
    popular: 'Popular Items',
    all: 'All Categories',
    added: 'Added to cart!',
    powered: 'Powered by CafeCanva',
    total: 'Subtotal',
    select_table: 'Select Table',
    enter_name: 'Enter Your Name',
    number_of_guests: 'Number of Guests',
    notes: 'Special Instructions (optional)',
    checkout_title: 'Diner Checkout',
    confirm_order: 'Confirm & Place Order',
    close: 'Close',
    placing_order: 'Placing order...',
    success_title: 'Order Placed Successfully!',
    success_msg: 'Your order has been sent to the kitchen. Please wait at your table.',
    order_ref: 'Order Reference',
    back_to_menu: 'Back to Menu'
  },
  hi: {
    titleSuffix: 'डिजिटल मेनू',
    openStatus: 'रात १०:०० बजे तक खुला है',
    viewOrder: 'ऑर्डर देखें',
    popular: 'लोकप्रिय व्यंजन',
    all: 'सभी श्रेणियां',
    added: 'कार्ट में जोड़ा गया!',
    powered: 'कैफेकैनवास द्वारा संचालित',
    total: 'कुल राशि',
    select_table: 'मेज का चयन करें',
    enter_name: 'अपना नाम दर्ज करें',
    number_of_guests: 'अतिथियों की संख्या',
    notes: 'विशेष निर्देश (वैकल्पिक)',
    checkout_title: 'ग्राहक चेकआउट',
    confirm_order: 'ऑर्डर की पुष्टि करें',
    close: 'बंद करें',
    placing_order: 'ऑर्डर भेजा जा रहा है...',
    success_title: 'ऑर्डर सफलतापूर्वक भेजा गया!',
    success_msg: 'आपका ऑर्डर रसोई में भेज दिया गया है। कृपया अपनी मेज पर प्रतीक्षा करें।',
    order_ref: 'ऑर्डर संदर्भ',
    back_to_menu: 'मेनू पर वापस जाएं'
  }
};

const LOADING_MESSAGES = [
  "Setting up your table...",
  "Brewing fresh menu selections...",
  "Arranging the Chef's specials...",
  "Warming up the kitchen...",
  "Serving you shortly..."
];

export default function Storefront() {
  const params = useParams();
  const storeSlug = (params?.store_slug as string) || '';
  const supabase = createClient();

  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeCatId, setActiveCatId] = useState<string>('All');

  
  // Dynamic database states
  const [loading, setLoading] = useState(true);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  // Form/Checkout/Table session states
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerCount, setCustomerCount] = useState<number>(1);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);
  const [successOrderRef, setSuccessOrderRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeTablesCount, setActiveTablesCount] = useState<number>(0);


  // Loyalty & OTP Login states
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [previousOrders, setPreviousOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [staffCallCooldown, setStaffCallCooldown] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [wouldRevisit, setWouldRevisit] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [claimedCoupon, setClaimedCoupon] = useState<string | null>(null);

  // SPA Active Tab
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'dine-in' | 'delivery' | 'products' | 'blogs' | 'account' | 'offers' | 'about' | 'contact' | 'gallery' | 'careers'>('home');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStaffCalling, setIsStaffCalling] = useState(false);

  // Home Delivery states
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Immediate (30-45 mins)');
  
  // Careers Application state
  const [careerRole, setCareerRole] = useState<string | null>(null);
  const [careerName, setCareerName] = useState('');
  const [careerPhone, setCareerPhone] = useState('');
  const [careerExperience, setCareerExperience] = useState('');
  const [careerSubmitted, setCareerSubmitted] = useState(false);

  const t = TRANSLATIONS[lang];

  // Helper to read cookies on client
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Load tenant theme dynamically
  useEffect(() => {
    if (tenant) {
      const themeId = (tenant as any).theme_id || 'theme-02';
      loadTenantTheme(themeId).catch(console.error);
    }
  }, [tenant]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setErrorMsg(null);

        // 1. Resolve tenant
        let query = supabase.from('tenants').select(`
          id,
          name,
          slug,
          public_id,
          logo_url,
          storefront_config (
            theme_id,
            hero_image_url,
            hero_image_url_2,
            hero_image_url_3,
            footer_description,
            footer_hours,
            footer_address,
            footer_phone,
            footer_email
          )
        `);
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(storeSlug);
        
        if (isUuid) {
          query = query.eq('public_id', storeSlug);
        } else {
          query = query.eq('slug', storeSlug);
        }

        const { data: tenantData, error: tenantError } = await query.maybeSingle();

        if (tenantError) throw tenantError;

        if (!tenantData) {
          setTenant(null);
          setLoading(false);
          return;
        }

        const configData = (tenantData as any).storefront_config;
        const resolvedThemeId = Array.isArray(configData)
          ? configData[0]?.theme_id
          : configData?.theme_id;

        const heroUrl = Array.isArray(configData) ? configData[0]?.hero_image_url : configData?.hero_image_url;
        const heroUrl2 = Array.isArray(configData) ? configData[0]?.hero_image_url_2 : configData?.hero_image_url_2;
        const heroUrl3 = Array.isArray(configData) ? configData[0]?.hero_image_url_3 : configData?.hero_image_url_3;
        const heroTitle = Array.isArray(configData) ? configData[0]?.hero_title : configData?.hero_title;
        const heroSubtitle = Array.isArray(configData) ? configData[0]?.hero_subtitle : configData?.hero_subtitle;
        const heroTitle2 = Array.isArray(configData) ? configData[0]?.hero_title_2 : configData?.hero_title_2;
        const heroSubtitle2 = Array.isArray(configData) ? configData[0]?.hero_subtitle_2 : configData?.hero_subtitle_2;
        const heroTitle3 = Array.isArray(configData) ? configData[0]?.hero_title_3 : configData?.hero_title_3;
        const heroSubtitle3 = Array.isArray(configData) ? configData[0]?.hero_subtitle_3 : configData?.hero_subtitle_3;
        const footerDescription = Array.isArray(configData) ? configData[0]?.footer_description : configData?.footer_description;
        const footerHours = Array.isArray(configData) ? configData[0]?.footer_hours : configData?.footer_hours;
        const footerAddress = Array.isArray(configData) ? configData[0]?.footer_address : configData?.footer_address;
        const footerPhone = Array.isArray(configData) ? configData[0]?.footer_phone : configData?.footer_phone;
        const footerEmail = Array.isArray(configData) ? configData[0]?.footer_email : configData?.footer_email;

        setTenant({
          id: tenantData.id,
          name: tenantData.name,
          subdomain: tenantData.slug,
          public_id: tenantData.public_id,
          theme_id: resolvedThemeId || 'theme-02',
          hero_image_url: heroUrl || null,
          hero_image_url_2: heroUrl2 || null,
          hero_image_url_3: heroUrl3 || null,
          hero_title: heroTitle || null,
          hero_subtitle: heroSubtitle || null,
          hero_title_2: heroTitle2 || null,
          hero_subtitle_2: heroSubtitle2 || null,
          hero_title_3: heroTitle3 || null,
          hero_subtitle_3: heroSubtitle3 || null,
          logo_url: tenantData.logo_url || null,
          footer_description: footerDescription || null,
          footer_hours: footerHours || null,
          footer_address: footerAddress || null,
          footer_phone: footerPhone || null,
          footer_email: footerEmail || null
        });

        // 2. Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('menu_categories')
          .select('id, name, sort_order')
          .eq('tenant_id', tenantData.id)
          .eq('is_visible', true)
          .order('sort_order', { ascending: true });

        if (catError) throw catError;
        setCategories(catData || []);

        // 3. Fetch menu items
        const { data: itemData, error: itemError } = await supabase
          .from('menu_items')
          .select('id, category_id, name, description, price, is_available, dietary_tags, image_url')
          .eq('tenant_id', tenantData.id)
          .eq('is_available', true)
          .order('sort_order', { ascending: true });

        if (itemError) throw itemError;
        
        const mappedItems: MenuItem[] = (itemData || []).map((item: any) => ({
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          status: item.is_available ? 'available' : 'unavailable',
          tags: item.dietary_tags || [],
        }));
        
        setMenuItems(mappedItems);

        // 4. Fetch tables
        const { data: tableData, error: tableError } = await supabase
          .from('tables')
          .select('id, name, capacity, section, status, location_id')
          .eq('tenant_id', tenantData.id)
          .is('deleted_at', null)
          .order('name', { ascending: true });

        if (tableError) throw tableError;
        setTables(tableData || []);
        
        let initialTableId = '';
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const urlTableId = searchParams.get('table') || searchParams.get('table_id');
          if (urlTableId && tableData?.some(t => t.id === urlTableId)) {
            initialTableId = urlTableId;
            setActiveTab('dine-in');
          }
        }
        
        if (!initialTableId && tableData && tableData.length > 0) {
          initialTableId = tableData[0].id;
        }
        
        if (initialTableId) {
          setSelectedTableId(initialTableId);
        }

        // 5. Fetch active table sessions count
        const { count: activeCount, error: activeError } = await supabase
          .from('table_sessions')
          .select('id', { count: 'exact', head: true })
          .is('ended_at', null);

        if (!activeError) {
          setActiveTablesCount(activeCount || 0);
        }

      } catch (err: any) {
        console.error("Database fetch failed:", err.message);
        setErrorMsg(err.message || "Failed to load store catalog.");
        setTenant(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [storeSlug]);

  // Load Customer Profile and Offers
  useEffect(() => {
    async function loadCustomerData() {
      if (!tenant) return;
      const phoneVal = getCookie('customer_phone');
      setCustomerPhone(phoneVal);

      if (phoneVal) {
        const { data: cust } = await supabase
          .from('customers')
          .select('*')
          .eq('tenant_id', tenant.id)
          .eq('phone', phoneVal)
          .maybeSingle();
        
        if (cust) {
          setCustomerProfile(cust);
          if (cust.name && cust.name !== 'Storefront Guest' && !customerName) {
            setCustomerName(cust.name);
          }
        }

        // Fetch previous orders
        setLoadingOrders(true);
        try {
          const { data: ords } = await supabase
            .from('orders')
            .select(`
              id,
              created_at,
              status,
              total,
              notes,
              order_items (
                id,
                item_name,
                quantity,
                unit_price
              )
            `)
            .eq('tenant_id', tenant.id)
            .eq('customer_phone', phoneVal)
            .order('created_at', { ascending: false })
            .limit(10);

          setPreviousOrders(ords || []);
        } catch (err) {
          console.error("Failed to load previous orders:", err);
        } finally {
          setLoadingOrders(false);
        }
      }

      // Fetch active offers
      const { data: activeOffers } = await supabase
        .from('customer_offers')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .gt('valid_until', new Date().toISOString());

      if (activeOffers) {
        setOffers(activeOffers);
      }
    }

    loadCustomerData();
  }, [tenant, customerPhone]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(loginPhone)) {
      setOtpError('Please enter a valid 10-digit phone number.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch('/api/customer/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick_checkin',
          phone: `+91${loginPhone}`,
          tenantId: tenant?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setCustomerPhone(data.phone);
        setIsLoginOpen(false);
        setLoginPhone('');
        
        // Refresh customer profile
        if (tenant) {
          const { data: cust } = await supabase
            .from('customers')
            .select('*')
            .eq('tenant_id', tenant.id)
            .eq('phone', data.phone)
            .maybeSingle();
          if (cust) {
            setCustomerProfile(cust);
          }
        }
      } else {
        setOtpError(data.error || 'Failed to login.');
      }
    } catch (err) {
      setOtpError('Failed to communicate with login service.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(loginOtp)) {
      setOtpError('Please enter a 6-digit OTP code.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch('/api/customer/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone: loginPhone,
          otp: loginOtp,
          tenantId: tenant?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setCustomerPhone(data.phone);
        setIsLoginOpen(false);
        setOtpSent(false);
        setLoginOtp('');
        setLoginPhone('');
      } else {
        setOtpError(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setOtpError('Failed to verify OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogoutCustomer = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'customer_phone=; Max-Age=0; path=/;';
      document.cookie = 'customer_tenant_id=; Max-Age=0; path=/;';
    }
    setCustomerPhone(null);
    setCustomerProfile(null);
    setPreviousOrders([]);
  };

  const handleCallStaff = async () => {
    if (!selectedTableId || !tenant) return;
    if (staffCallCooldown > 0) return;
    
    setIsStaffCalling(true);
    try {
      const tableObj = tables.find(t => t.id === selectedTableId);
      const tableName = tableObj ? tableObj.name : 'Unknown';
      const publicId = tenant.public_id || tenant.id;

      // Broadcast the staff call to the Store Admin on the public channel
      const channel = supabase.channel(`public-calls:${publicId}`);
      await new Promise<void>((resolve, reject) => {
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              const res = await channel.send({
                type: 'broadcast',
                event: 'staff_call',
                payload: {
                  tableId: selectedTableId,
                  tableName: tableName,
                  publicId: publicId,
                  locationId: tableObj?.location_id || null,
                  calledAt: new Date().toISOString()
                }
              });
              if (res === 'ok' || res === 'sent') {
                resolve();
              } else {
                reject(new Error('Failed to broadcast: ' + res));
              }
            } catch (err) {
              reject(err);
            }
          }
        });
      });
      
      setStaffCallCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      console.error('Call staff failed:', err.message);
      alert('Failed to call staff. Please try again.');
    } finally {
      setTimeout(() => setIsStaffCalling(false), 2000);
    }
  };

  useEffect(() => {
    if (staffCallCooldown > 0) {
      const timer = setTimeout(() => setStaffCallCooldown(p => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [staffCallCooldown]);

  const handleSubmitFeedback = async () => {
    if (!tenant) return;
    setSubmittingFeedback(true);
    try {
      const { data: staffMembers } = await supabase
        .from('users')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('role', 'staff')
        .limit(1);
      
      const assocStaffId = staffMembers && staffMembers.length > 0 ? staffMembers[0].id : null;

      const { error: feedbackError } = await supabase
        .from('customer_feedback')
        .insert({
          tenant_id: tenant.id,
          table_id: selectedTableId || null,
          customer_name: customerName || 'Guest Diner',
          phone: customerPhone || null,
          rating_overall: feedbackRating,
          rating_food: foodRating,
          rating_service: serviceRating,
          comment: feedbackComment.trim() || null,
          would_revisit: wouldRevisit,
          staff_id: assocStaffId
        });

      if (feedbackError) throw feedbackError;

      const couponCode = `CF-${Math.floor(100000 + Math.random() * 900000)}`;
      const { error: couponError } = await supabase
        .from('offer_codes')
        .insert({
          tenant_id: tenant.id,
          code: couponCode,
          description: '10% guest feedback reward',
          discount_type: 'percentage',
          discount_value: 10,
          min_order_paise: 0,
          applicable_to: 'all',
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usage_limit: 1,
          is_active: true
        });

      if (couponError) throw couponError;

      setClaimedCoupon(couponCode);
      setFeedbackSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit feedback:', err.message);
      alert('Could not submit feedback: ' + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCloseSuccessRef = () => {
    setSuccessOrderRef(null);
    setFeedbackSubmitted(false);
    setClaimedCoupon(null);
    setFeedbackComment('');
    setFeedbackRating(5);
    setFoodRating(5);
    setServiceRating(5);
  };

  const handleQtyChange = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const totalPricePaise = Object.entries(cart).reduce((sum, [id, q]) => {
    const item = menuItems.find(i => i.id === id);
    return sum + (item ? item.price * q : 0);
  }, 0);

  const totalPriceRupees = totalPricePaise / 100;

  // Search, category and veg/non-veg filter combination
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = activeCatId === 'All' || item.category_id === activeCatId;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchVeg = !vegOnly || item.tags?.some(tag => tag.toLowerCase() === 'veg' || tag.toLowerCase() === 'vegetarian');
      return matchCat && matchSearch && matchVeg;
    });
  }, [menuItems, activeCatId, searchQuery, vegOnly]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId || !customerName.trim() || !tenant) {
      alert("Please enter your name and select a table");
      return;
    }

    try {
      setPlacingOrder(true);
      setErrorMsg(null);

      // 1. Check table session
      let { data: activeSession, error: sessionFindError } = await supabase
        .from('table_sessions')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('table_id', selectedTableId)
        .is('ended_at', null)
        .maybeSingle();

      if (sessionFindError) throw sessionFindError;

      let sessionId = activeSession?.id;

      if (!sessionId) {
        const { data: newSession, error: sessionCreateError } = await supabase
          .from('table_sessions')
          .insert({
            tenant_id: tenant.id,
            table_id: selectedTableId,
            customer_name: customerName,
            customer_phone: customerPhone || null,
            started_at: new Date().toISOString(),
            pax: customerCount
          })
          .select('id')
          .single();

        if (sessionCreateError) throw sessionCreateError;
        sessionId = newSession.id;
      }

      // Find the location_id from the selected table
      const selectedTableObj = tables.find(t => t.id === selectedTableId);
      const locationId = selectedTableObj?.location_id || 'd1000000-0000-0000-0000-000000000001';

      // 2. Insert order
      const { data: newOrder, error: orderInsertError } = await supabase
        .from('orders')
        .insert({
          tenant_id: tenant.id,
          location_id: locationId,
          table_id: selectedTableId,
          customer_name: customerName,
          customer_phone: customerPhone || null,
          subtotal: totalPricePaise,
          tax_amount: 0,
          discount_amount: 0,
          total: totalPricePaise,
          notes: orderNotes || null,
          status: 'pending',
          order_type: 'dine_in'
        })
        .select('id')
        .single();

      if (orderInsertError) throw orderInsertError;

      // 3. Insert order items
      const orderItemsToInsert = Object.entries(cart).map(([itemId, qty]) => {
        const item = menuItems.find(i => i.id === itemId)!;
        return {
          tenant_id: tenant.id,
          order_id: newOrder.id,
          menu_item_id: item.id,
          item_name: item.name,
          unit_price: item.price,
          quantity: qty,
          modifiers: []
        };
      });

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsInsertError) throw itemsInsertError;

      setSuccessOrderRef(newOrder.id.substring(0, 8).toUpperCase());
      setCart({});
      setIsCheckoutOpen(false);
      
      // Reload previous orders
      if (customerPhone) {
        const { data: ords } = await supabase
          .from('orders')
          .select(`
            id, created_at, status, total, notes,
            order_items (id, item_name, quantity, unit_price)
          `)
          .eq('tenant_id', tenant.id)
          .eq('customer_phone', customerPhone)
          .order('created_at', { ascending: false })
          .limit(10);
        setPreviousOrders(ords || []);
      }
    } catch (err: any) {
      console.error("Order submission failed:", err.message);
      setErrorMsg(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      alert("Please enter a delivery address.");
      return;
    }
    alert(`Delivery order placed successfully! Address: ${deliveryAddress}. Slot: ${deliverySlot}`);
    setCart({});
    setActiveTab('home');
  };

  const handleCareerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerName.trim() || !careerPhone.trim()) {
      alert("Please fill in required fields.");
      return;
    }
    setCareerSubmitted(true);
    setTimeout(() => {
      setCareerSubmitted(false);
      setCareerRole(null);
      setCareerName('');
      setCareerPhone('');
      setCareerExperience('');
    }, 3000);
  };

  // Get dynamic styles from active theme config
  const themeId = tenant?.theme_id || 'theme-02';
  const themeDesign = useMemo(() => getThemeDesign(themeId), [themeId]);
  const isDark = themeDesign.isDark;
  const cardClass = themeDesign.cardClass;
  const buttonClass = themeDesign.buttonClass;
  const themeNumber = parseInt(themeId.replace('theme-', '')) || 2;

  if (loading) {
    return (
      <div className="min-h-screen w-full relative bg-[#0C0A09] text-stone-100 flex flex-col justify-center items-center overflow-hidden font-sans">
        {/* Soft elegant background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_65%)] z-0 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '4s' }} />

        {/* Glassmorphic Loader Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="z-10 flex flex-col items-center p-8 rounded-[2.5rem] bg-stone-900/60 backdrop-blur-md border border-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.6)] max-w-xs w-full text-center gap-6"
        >
          {/* Animated Spinner & Cup */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Outer Rotating Segmented Ring */}
            <motion.div 
              className="absolute inset-0 rounded-full border border-stone-800/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            />
            <motion.div 
              className="absolute inset-0 rounded-full border-t-2 border-r-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
            />
            
            {/* Floating Logo Box */}
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 2.2, 
                ease: "easeInOut", 
                repeat: Infinity 
              }}
              className="w-14 h-14 bg-gradient-to-br from-amber-500/10 to-amber-500/25 rounded-2xl border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            >
              <Coffee className="w-7 h-7 stroke-[1.5]" />
            </motion.div>
            
            {/* Subtle sparkle effect */}
            <motion.div
              className="absolute top-2 right-2 text-amber-400/90"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Texts Section */}
          <div className="space-y-2.5 w-full">
            <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-stone-500 block">
              Cafe Canvas
            </span>
            <div className="h-6 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={loadingMsgIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="text-stone-300 text-[13px] font-medium tracking-wide"
                >
                  {LOADING_MESSAGES[loadingMsgIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Loading Progress Line */}
          <div className="w-32 h-[3px] bg-stone-800 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 2.5, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md bg-card-bg p-8 rounded-3xl border border-border-color shadow-md space-y-6">
          <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand mx-auto">
            <Coffee size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Store Not Found</h1>
          <p className="text-sm text-foreground/60 leading-relaxed">
            The restaurant store you are trying to access does not exist or has been disabled. Please check the URL or contact the owner.
          </p>
          <a
            href="https://cafecanvas.bar"
            className="inline-block bg-brand text-white font-extrabold px-6 py-3.5 rounded-xl hover:opacity-90 transition-all text-xs tracking-wider uppercase shadow-md"
          >
            Go to CafeCanva Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-stone-100 dark:bg-stone-950 flex justify-center items-start ${isDark ? 'dark' : ''}`}>
      <div className="w-full max-w-md min-h-screen bg-background text-foreground pb-24 relative overflow-x-hidden border-x border-border-color/10 shadow-2xl flex flex-col">
        {/* Background patterns based on active theme */}
        {themeDesign.renderBackground()}

        {/* Top Navbar / Brand Header (Mobile-Only) */}
        <header className="bg-card-bg/80 backdrop-blur-md border-b border-border-color sticky top-0 z-40 transition-all">
          <div className="w-full px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand border border-brand/10">
                <Coffee size={22} className="animate-pulse" />
              </div>
              <div>
                <h1 className="font-extrabold text-xs tracking-tight text-foreground flex items-center gap-1.5">
                  {tenant.name}
                </h1>
                <p className="text-[9px] text-foreground/50 tracking-wider uppercase font-extrabold">Menu Canvas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
                className="px-2.5 py-1.5 rounded-full border border-border-color text-[10px] font-bold hover:bg-stone-50 transition-all flex items-center gap-1"
              >
                <Globe size={11} />
                {lang === 'en' ? 'हिं' : 'EN'}
              </button>
              
              {customerPhone ? (
                <button 
                  onClick={() => setActiveTab('account')}
                  className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm"
                >
                  {customerProfile?.name ? customerProfile.name[0] : <User size={14} />}
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="px-3.5 py-1.5 bg-brand text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-sm"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Container */}
      <main className="w-full px-4 mt-4 relative z-10 flex-1">
        
        {/* Dynamic Tab Switching */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* 1. Hero Carousel */}
              <HeroCarousel 
                cafeName={tenant.name} 
                heroImageUrl={tenant.hero_image_url}
                heroImageUrl2={tenant.hero_image_url_2}
                heroImageUrl3={tenant.hero_image_url_3}
                heroTitle={tenant.hero_title}
                heroSubtitle={tenant.hero_subtitle}
                heroTitle2={tenant.hero_title_2}
                heroSubtitle2={tenant.hero_subtitle_2}
                heroTitle3={tenant.hero_title_3}
                heroSubtitle3={tenant.hero_subtitle_3}
              />

              {/* 2. Horizontal Categories Strip */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground/50">Explore Categories</h3>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => { setActiveCatId(cat.id); setActiveTab('menu'); }}
                      className="px-5 py-3 rounded-2xl bg-card-bg border border-border-color text-xs font-extrabold whitespace-nowrap shadow-sm hover:border-brand/40 transition-all flex items-center gap-2"
                    >
                      <Coffee className="w-3.5 h-3.5 text-brand" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Featured Dishes Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-lg md:text-xl text-foreground">Chef Bestsellers</h3>
                  <button onClick={() => setActiveTab('menu')} className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
                    View Full Menu <ChevronRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.slice(0, 4).map(item => (
                    <div key={item.id} className={`${cardClass} p-4 flex gap-4 transition-all duration-300 hover:shadow-md`}>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-extrabold text-foreground text-sm">{item.name}</h4>
                          {item.description && <p className="text-foreground/60 text-[11px] mt-1 line-clamp-2">{item.description}</p>}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-black text-sm text-foreground">₹{(item.price / 100).toFixed(2)}</span>
                          <button 
                            onClick={() => handleQtyChange(item.id, 1)}
                            className={`w-7 h-7 rounded-full ${buttonClass} flex items-center justify-center`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="w-20 h-20 shrink-0 relative rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Coffee className="w-6 h-6 text-stone-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Google Reviews Section */}
              <div className="space-y-4">
                <h3 className="font-black text-lg md:text-xl text-foreground text-center">Diner Google Reviews</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Amit Sharma', text: 'Best coffee and filter tea in town. The ambiance is exceptional, and QR ordering is super fast!', rating: 5 },
                    { name: 'Priya Patel', text: 'Loved the wood fired pizzas and desserts. Very cozy space, friendly waiters. Highly recommended!', rating: 5 },
                    { name: 'Vikram Singh', text: 'A perfect workplace cafe. High speed internet, amazing cold brews, and healthy food bowls.', rating: 5 }
                  ].map((rev, index) => (
                    <div key={index} className={`${cardClass} p-5 space-y-3`}>
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-[#ca8a04] text-[#ca8a04]" />
                        ))}
                      </div>
                      <p className="text-xs text-foreground/75 leading-relaxed italic">"{rev.text}"</p>
                      <div className="font-extrabold text-[11px] uppercase tracking-wider text-brand">{rev.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Brand Story Teaser */}
              <div className={`${cardClass} p-6 flex flex-col md:flex-row gap-6 items-center`}>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h3 className="font-black text-lg md:text-xl text-foreground">Our Culinary Canvas</h3>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    Founded with a passion for creative culinary expression, {tenant.name} blends artisanal baking, micro-roasted specialty coffees, and organic regional delicacies. Every plate is crafted as a canvas of flavor and heritage.
                  </p>
                  <button onClick={() => setActiveTab('about')} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider ${buttonClass}`}>
                    Read Our Story
                  </button>
                </div>
                <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" alt="Cafe interior" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* 6. Instagram Grid (6 Posts) */}
              <div className="space-y-4">
                <h3 className="font-black text-lg md:text-xl text-foreground text-center">Instagram Feed</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80'
                  ].map((url, i) => (
                    <a key={i} href="https://instagram.com" target="_blank" rel="noreferrer" className="block relative aspect-square rounded-xl overflow-hidden border border-border-color group">
                      <img src={url} alt={`Insta post ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                        View Post
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* 7. Blog Preview Cards */}
              <div className="space-y-4">
                <h3 className="font-black text-lg md:text-xl text-foreground">Bite-sized Food Stories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'The Science of Perfect Coffee Extraction', excerpt: 'Discover brew ratios, temperatures, and water quality secrets from our Head Barista.', date: '05 Jun', time: '4 min read', image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=400&q=80' },
                    { title: 'Crafting Sourdough: Sourdough Bread Demystified', excerpt: 'Why long fermentation makes bread healthier, tastier, and easier to digest.', date: '28 May', time: '5 min read', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80' }
                  ].map((blog, i) => (
                    <div key={i} className={`${cardClass} overflow-hidden flex flex-col`}>
                      <div className="h-40 relative">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-brand text-white text-[9px] font-extrabold uppercase px-2 py-1 rounded-md">{blog.date}</span>
                      </div>
                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-foreground">{blog.title}</h4>
                          <p className="text-foreground/60 text-[11px] leading-relaxed">{blog.excerpt}</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-border-color/40 pt-3 mt-3">
                          <span className="text-[10px] text-foreground/40 font-bold">{blog.time}</span>
                          <button onClick={() => setActiveTab('blogs')} className="text-xs font-bold text-brand hover:underline">Read Story</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div 
              key="menu" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Menu Headers & Filters */}
              <div className={`${cardClass} p-5 space-y-4`}>
                <div className="flex flex-col md:flex-row justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      type="text" 
                      placeholder="Search for coffee, sourdough, combos..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-background border border-border-color rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-brand"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none text-foreground/75">
                      <input 
                        type="checkbox" 
                        checked={vegOnly} 
                        onChange={e => setVegOnly(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                      <span>Vegetarian Only 🟢</span>
                    </label>
                  </div>
                </div>

                {/* Categories Chip Filters */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  <button 
                    onClick={() => setActiveCatId('All')}
                    className={`px-4 py-2 rounded-full text-[11px] font-extrabold whitespace-nowrap shadow-sm border transition-all ${
                      activeCatId === 'All' 
                        ? 'bg-brand text-white border-brand' 
                        : 'bg-background border-border-color text-foreground hover:border-brand/40'
                    }`}
                  >
                    {t.all}
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setActiveCatId(cat.id)}
                      className={`px-4 py-2 rounded-full text-[11px] font-extrabold whitespace-nowrap shadow-sm border transition-all ${
                        activeCatId === cat.id 
                          ? 'bg-brand text-white border-brand' 
                          : 'bg-background border-border-color text-foreground hover:border-brand/40'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div 
                      key={item.id} 
                      className={`${cardClass} p-4 flex gap-4 transition-all duration-300 hover:shadow-md`}
                    >
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-foreground text-sm">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-foreground/60 text-[11px] mt-1 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <span className="font-black text-sm text-foreground">
                            ₹{(item.price / 100).toFixed(2)}
                          </span>
                          
                          {qty > 0 ? (
                            <div className="flex items-center gap-2 bg-brand-light rounded-full px-2 py-1 border border-brand/20">
                              <button 
                                onClick={() => handleQtyChange(item.id, -1)}
                                className="w-6 h-6 rounded-full bg-card-bg flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-colors"
                              >
                                <Minus size={11} strokeWidth={3} />
                              </button>
                              <span className="font-bold text-xs text-brand px-1">{qty}</span>
                              <button 
                                onClick={() => handleQtyChange(item.id, 1)}
                                className="w-6 h-6 rounded-full bg-card-bg flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-colors"
                              >
                                <Plus size={11} strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleQtyChange(item.id, 1)}
                              className={`w-7 h-7 rounded-full ${buttonClass} flex items-center justify-center`}
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 relative rounded-xl overflow-hidden border border-border-color bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Coffee className="w-6 h-6 text-stone-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'dine-in' && (
            <motion.div 
              key="dine-in" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className={`${cardClass} p-6 space-y-6`}>
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand mx-auto">
                    <QrCode size={24} />
                  </div>
                  <h3 className="font-black text-base md:text-lg text-foreground">Table Dining & Order Logs</h3>
                  <p className="text-xs text-foreground/60">Scan QR codes at tables or select table below to place order directly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider block">Table Number</label>
                    <select
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                    >
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.section})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider block">Diner Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border-color/40 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-foreground/40">Assistance Alert</span>
                    <h5 className="text-xs font-bold text-foreground mt-0.5">Need help from our team?</h5>
                  </div>
                  <button 
                    onClick={handleCallStaff}
                    disabled={staffCallCooldown > 0}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                      staffCallCooldown > 0 
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                    }`}
                  >
                    {staffCallCooldown > 0 ? `Called (${staffCallCooldown}s)` : `${activeTablesCount} – 🛎️ Call Staff`}
                  </button>
                </div>
              </div>

              {/* Active Orders Tracker */}
              {previousOrders.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-black text-sm uppercase tracking-wider text-foreground/60">Live Kitchen status</h4>
                  <div className="space-y-3">
                    {previousOrders.slice(0, 3).map(ord => (
                      <div key={ord.id} className={`${cardClass} p-4 space-y-3`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-stone-400">#REF-{ord.id.substring(0,8).toUpperCase()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            ['served', 'completed'].includes(ord.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>{ord.status}</span>
                        </div>
                        <div className="space-y-1">
                          {ord.order_items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-xs text-foreground/85">
                              <span>{item.item_name} <span className="text-stone-400">x{item.quantity}</span></span>
                              <span>₹{(item.unit_price * item.quantity / 100).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border-color/30 text-xs font-bold">
                          <span>Total Paid</span>
                          <span>₹{(ord.total / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'delivery' && (
            <motion.div 
              key="delivery" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className={`${cardClass} p-6 space-y-6`}>
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand mx-auto">
                    <Truck size={24} />
                  </div>
                  <h3 className="font-black text-base md:text-lg text-foreground">Home Delivery Service</h3>
                  <p className="text-xs text-foreground/60">Fresh meals and artisanal coffees delivered directly to your doorstep.</p>
                </div>

                <form onSubmit={handleDeliverySubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider block">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                      <textarea 
                        required
                        placeholder="Enter full building, street and location details..."
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        className="w-full bg-background border border-border-color rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none resize-none h-20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider block">Time Slot</label>
                      <select 
                        value={deliverySlot}
                        onChange={e => setDeliverySlot(e.target.value)}
                        className="w-full bg-background border border-border-color rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                      >
                        <option>Immediate (30-45 mins)</option>
                        <option>Lunch (12:30 PM - 2:00 PM)</option>
                        <option>Evening Snack (4:30 PM - 6:00 PM)</option>
                        <option>Dinner (7:30 PM - 9:00 PM)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider block">Contact Number</label>
                      <input 
                        type="tel" 
                        required
                        pattern="[0-9]{10}"
                        placeholder="10-digit mobile number"
                        className="w-full bg-background border border-border-color rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className={`w-full py-3.5 ${buttonClass} text-xs font-extrabold uppercase tracking-widest shadow-md`}
                  >
                    Confirm Delivery Order (₹{totalPriceRupees.toFixed(2)})
                  </button>
                </form>
              </div>

              {/* Delivery Tracking timeline */}
              <div className={`${cardClass} p-5 space-y-4`}>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-brand">Real-time Tracker</h4>
                <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100 dark:before:bg-stone-800">
                  <div className="relative flex items-start gap-4">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"></span>
                    <div>
                      <h5 className="font-bold text-xs text-foreground">Order Placed & Confirmed</h5>
                      <p className="text-[10px] text-foreground/50">Kitchen is preparing your items.</p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-4 opacity-50">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-stone-300"></span>
                    <div>
                      <h5 className="font-bold text-xs text-foreground">Quality Check & Packaged</h5>
                      <p className="text-[10px] text-foreground/50">Fresh hot food sealed safely.</p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-4 opacity-50">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-stone-300"></span>
                    <div>
                      <h5 className="font-bold text-xs text-foreground">Out for Delivery</h5>
                      <p className="text-[10px] text-foreground/50">Rider is heading to your destination.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-foreground">Signature Specials & Combos</h3>
                <p className="text-xs text-foreground/60">Curated specialty combinations and seasonal favorites from our head chef.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'combo1', name: 'Barista Morning Combo', desc: 'Craft Cappuccino + Butter Croissant + Fresh Sourdough slice with jam.', price: 34900, tags: ['Bestseller', 'Breakfast'], image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
                  { id: 'combo2', name: 'Chef Special Thali Combo', desc: 'Authentic regional curry, local rice, dal makhani, butter tandoori roti, and sweet lassi.', price: 49900, tags: ['Festive', 'Heavy Meal'], image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80' }
                ].map(item => (
                  <div key={item.id} className={`${cardClass} overflow-hidden flex flex-col justify-between`}>
                    <div>
                      <div className="h-44 relative bg-stone-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          {item.tags.map(t => (
                            <span key={t} className="bg-brand text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-extrabold text-sm text-foreground">{item.name}</h4>
                        <p className="text-foreground/60 text-[11px] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 flex justify-between items-center border-t border-border-color/30 mt-3">
                      <span className="font-black text-sm text-foreground">₹{(item.price / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'blogs' && (
            <motion.div 
              key="blogs" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-foreground">Canvas Food Chronicles</h3>
                <p className="text-xs text-foreground/60">Stories of farm sourcing, baking artisan techniques, and barista science.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'The Science of Perfect Coffee Extraction', excerpt: 'Discover brew ratios, temperatures, and water quality secrets from our Head Barista.', date: '05 Jun 2026', author: 'Vikram Barista', tags: ['Coffee', 'Brewing'], image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=400&q=80' },
                  { title: 'Crafting Sourdough: Sourdough Bread Demystified', excerpt: 'Why long fermentation makes bread healthier, tastier, and easier to digest.', date: '28 May 2026', author: 'Chef Maria', tags: ['Baking', 'Sourdough'], image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80' },
                  { title: 'Behind The Scenes: Sourcing Single Origin Tea Leaves', excerpt: 'A journey into high-altitude organic tea farms of Darjeeling and Assam.', date: '12 May 2026', author: 'Sourcing Team', tags: ['Tea', 'Sourcing'], image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80' },
                  { title: 'Sweets & Celebrations: Regional Dessert Crafts', excerpt: 'The cultural stories behind Gulab Jamun, Puran Poli and Shahi Tukda.', date: '01 May 2026', author: 'Patissier Chef', tags: ['Dessert', 'Culture'], image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80' }
                ].map((blog, i) => (
                  <div key={i} className={`${cardClass} overflow-hidden flex flex-col justify-between`}>
                    <div className="h-44 relative bg-stone-100">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex gap-1.5">
                          {blog.tags.map(t => (
                            <span key={t} className="text-[8px] font-black uppercase text-brand tracking-widest">{t}</span>
                          ))}
                        </div>
                        <h4 className="font-extrabold text-sm text-foreground leading-snug">{blog.title}</h4>
                        <p className="text-foreground/60 text-[11px] leading-relaxed line-clamp-3">{blog.excerpt}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-border-color/30 pt-3 text-[10px] text-stone-400 font-bold mt-4">
                        <span>By {blog.author}</span>
                        <span>{blog.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div 
              key="account" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {customerPhone ? (
                <div className="space-y-6">
                  {/* Loyalty Card */}
                  <div className="bg-card-bg border border-brand/35 rounded-3xl p-5 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-border-color/60 pb-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand">Loyalty Profile</span>
                        <h4 className="font-extrabold text-sm text-foreground">{customerProfile?.name || 'Valued Guest'}</h4>
                        <p className="text-[10px] text-foreground/40 font-semibold">{customerPhone}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-accent">Reward Points</span>
                        <p className="text-lg font-black text-accent">
                          {Math.floor((customerProfile?.total_spent || 0) / 1000)} <span className="text-[10px] font-normal text-stone-400">pts</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-foreground/40 font-semibold">{customerProfile?.total_visits || 1} visits</span>
                          <button 
                            onClick={handleLogoutCustomer} 
                            className="text-[9px] text-rose-600 font-extrabold hover:underline flex items-center gap-0.5"
                          >
                            <LogOut size={10} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Previous Orders */}
                  <div className="space-y-4">
                    <h3 className="font-black text-base uppercase tracking-wider text-foreground/50">Your Previous Orders</h3>
                    {loadingOrders ? (
                      <div className="text-center py-6 text-xs text-foreground/40 font-bold">Loading orders...</div>
                    ) : previousOrders.length > 0 ? (
                      <div className="space-y-3 pr-1">
                        {previousOrders.map(order => (
                          <div key={order.id} className={`${cardClass} p-4 space-y-3 text-xs`}>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-stone-400 font-bold">
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                ['served', 'completed'].includes(order.status)
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : order.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-amber-50 text-amber-600'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-stone-600">
                                  <span>{item.item_name} <span className="text-stone-400 font-medium">x{item.quantity}</span></span>
                                  <span>₹{(item.unit_price * item.quantity / 100).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center border-t border-border-color/40/60 pt-2 font-bold text-stone-800">
                              <span>Total Paid</span>
                              <span>₹{(order.total / 100).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-card-bg border border-border-color rounded-3xl text-xs text-foreground/40 font-bold">
                        No previous orders found for this phone number.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`${cardClass} p-8 text-center space-y-4 max-w-sm mx-auto`}>
                  <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand mx-auto">
                    <User size={22} />
                  </div>
                  <h3 className="font-black text-base text-foreground">Check Loyalty & Orders</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">Login to view accumulated reward points, active coupons and trace previous dining logs.</p>
                  <button 
                    onClick={() => setIsLoginOpen(true)}
                    className={`w-full py-3 ${buttonClass} text-xs font-bold uppercase tracking-wider shadow-sm`}
                  >
                    Login / Register
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'offers' && (
            <motion.div 
              key="offers" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-foreground">Active Deals & Coupons</h3>
                <p className="text-xs text-foreground/60">Exclusive savings for our online diners and premium members.</p>
              </div>

              {offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map(o => (
                    <div key={o.id} className={`${cardClass} p-5 flex justify-between items-center gap-3`}>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-brand">{o.title}</h4>
                        <p className="text-xs text-foreground/60">{o.description}</p>
                      </div>
                      <div className="shrink-0 bg-brand text-white px-3 py-1.5 rounded-xl text-xs font-black">
                        {o.discount_percent}% OFF
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Welcome 10% Discount', code: 'WELCOME10', desc: 'Claim 10% discount on your first online order of beverages and pastries.' },
                    { title: 'Mid-week Barista Treat', code: 'COFFEE50', desc: 'Get 50% off on second cup of any hot brew ordered on Wednesdays.' },
                    { title: 'Weekend Combo Saver', code: 'SAVER200', desc: 'Flat ₹200 off on ordering any signature combo above ₹999.' }
                  ].map((deal, idx) => (
                    <div key={idx} className={`${cardClass} p-5 space-y-4 flex flex-col justify-between`}>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-foreground">{deal.title}</h4>
                        <p className="text-[11px] text-foreground/60 leading-relaxed">{deal.desc}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-border-color/30 pt-3">
                        <span className="font-mono text-xs font-extrabold text-brand tracking-wider bg-brand-light px-2.5 py-1 rounded-lg">{deal.code}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(deal.code);
                            alert(`Code "${deal.code}" copied!`);
                          }}
                          className="text-xs font-bold text-brand hover:underline"
                        >
                          Copy Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div 
              key="about" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-foreground">Our Brand Story</h3>
                <p className="text-xs text-foreground/60">The vision, team and certifications behind {tenant.name}.</p>
              </div>

              <div className={`${cardClass} p-6 space-y-4`}>
                <h4 className="font-black text-sm uppercase tracking-wider text-brand">Crafted with Passion</h4>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  {tenant.name} was established in 2024 to redefine regional dining and micro-roasting hospitality. We source our coffee beans directly from high-altitude plantations in Chikmagalur and bake our sourdough bread fresh every morning.
                </p>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  Our professional kitchens operate under strict hygiene regulations. FSSAI certified and regularly audited, we promise fresh ingredients and clean dining spaces.
                </p>
              </div>

              {/* FSSAI Mock Certificate */}
              <div className={`${cardClass} p-5 flex items-center justify-between gap-4 border-l-4 border-amber-500`}>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-stone-700">FSSAI Hygiene Certification</h4>
                  <p className="text-[10px] text-stone-400">Registration Number: #12724999000104</p>
                </div>
                <div className="w-10 h-10 bg-amber-50 flex items-center justify-center text-amber-600 rounded-xl font-black text-xs border border-amber-200 shrink-0">
                  Govt
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div 
              key="contact" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-foreground">Contact & Assistance</h3>
                <p className="text-xs text-foreground/60">Find our locations, hours, and direct connection details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${cardClass} p-5 space-y-4`}>
                  <h4 className="font-extrabold text-sm text-foreground">Operating Details</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-brand shrink-0" />
                      <div>
                        <h5 className="font-bold text-stone-700">Timings</h5>
                        <p className="text-[11px] text-stone-400">Mon - Sun: 08:30 AM - 10:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-brand shrink-0" />
                      <div>
                        <h5 className="font-bold text-stone-700">Phone</h5>
                        <p className="text-[11px] text-stone-400">+91 98765 43210</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-brand shrink-0" />
                      <div>
                        <h5 className="font-bold text-stone-700">Email Address</h5>
                        <p className="text-[11px] text-stone-400">hello@cafecanvas.bar</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback form */}
                <div className={`${cardClass} p-5 space-y-4`}>
                  <h4 className="font-extrabold text-sm text-foreground">Send Us Message</h4>
                  <form onSubmit={e => { e.preventDefault(); alert("Message sent successfully!"); }} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required 
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    />
                    <textarea 
                      placeholder="Your thoughts..." 
                      rows={2} 
                      required 
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none resize-none"
                    />
                    <button type="submit" className={`w-full py-2 ${buttonClass} text-xs font-bold uppercase`}>Send</button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div 
              key="gallery" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-foreground">Canvas Ambiance</h3>
                <p className="text-xs text-foreground/60">A photo journey through our sourdough kitchen, espresso bar and events.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80'
                ].map((url, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border-color shadow-sm relative group">
                    <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'careers' && (
            <motion.div 
              key="careers" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-foreground">Join Our Culinary Team</h3>
                <p className="text-xs text-foreground/60">We are always looking for passionate baristas, sourdough bakers and customer servers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { role: 'Head Barista', type: 'Full-time', loc: 'Chikmagalur Premium Blend Store', salary: '₹35,000 - ₹45,000 / month' },
                  { role: 'Sourdough Baker', type: 'Full-time', loc: 'Artisan Oven Section', salary: '₹30,000 - ₹38,000 / month' },
                  { role: 'Guest Relations Host', type: 'Part-time', loc: 'Boutique Lounge', salary: '₹18,000 - ₹24,000 / month' }
                ].map((job, idx) => (
                  <div key={idx} className={`${cardClass} p-5 flex flex-col justify-between gap-4`}>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="bg-brand-light text-brand text-[8px] font-black uppercase px-2 py-0.5 rounded-full">{job.type}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-foreground">{job.role}</h4>
                      <p className="text-[10px] text-foreground/60 font-semibold">{job.loc}</p>
                    </div>
                    
                    <div className="space-y-3 pt-3 border-t border-border-color/30">
                      <span className="text-[11px] font-bold text-foreground">{job.salary}</span>
                      <button 
                        onClick={() => setCareerRole(job.role)}
                        className={`w-full py-2 ${buttonClass} text-[10px] font-bold uppercase`}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Job Application Modal Overlay */}
              {careerRole && (
                <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-4">
                  <div className="bg-background w-full max-w-sm rounded-3xl border border-border-color p-6 shadow-2xl relative space-y-4">
                    <button 
                      onClick={() => setCareerRole(null)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-stone-200/50 flex items-center justify-center text-foreground/60"
                    >
                      <X size={16} />
                    </button>
                    
                    <div className="text-center space-y-1">
                      <Briefcase size={20} className="text-brand mx-auto" />
                      <h4 className="font-black text-sm text-foreground">Apply for {careerRole}</h4>
                      <p className="text-[10px] text-foreground/50">Submit details, our recruitment team will call within 48 hours.</p>
                    </div>

                    {careerSubmitted ? (
                      <div className="text-center py-4 space-y-2 text-emerald-600">
                        <CheckCircle2 size={32} className="mx-auto animate-bounce" />
                        <h5 className="font-bold text-xs">Application Submitted!</h5>
                      </div>
                    ) : (
                      <form onSubmit={handleCareerSubmit} className="space-y-3 text-xs font-bold text-foreground/60">
                        <div className="space-y-1">
                          <label>Full Name</label>
                          <input 
                            type="text" 
                            required 
                            value={careerName}
                            onChange={e => setCareerName(e.target.value)}
                            placeholder="e.g. Rahul Sen"
                            className="w-full bg-background border border-border-color rounded-xl px-3 py-2 outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label>Mobile Number</label>
                          <input 
                            type="tel" 
                            required 
                            pattern="[0-9]{10}"
                            value={careerPhone}
                            onChange={e => setCareerPhone(e.target.value)}
                            placeholder="10-digit number"
                            className="w-full bg-background border border-border-color rounded-xl px-3 py-2 outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label>Experience details</label>
                          <textarea 
                            value={careerExperience}
                            onChange={e => setCareerExperience(e.target.value)}
                            placeholder="Current cafe, years of experience etc."
                            rows={2}
                            className="w-full bg-background border border-border-color rounded-xl px-3 py-2 outline-none resize-none font-bold"
                          />
                        </div>
                        <button type="submit" className={`w-full py-2.5 ${buttonClass} text-xs font-bold uppercase shadow-sm`}>
                          Submit Application
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card-bg/95 backdrop-blur-md border-t border-border-color/80 h-16 flex items-center justify-around z-30 shadow-lg">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center justify-center w-12 h-12 gap-0.5 transition-all ${
            activeTab === 'home' ? 'text-brand scale-110' : 'text-foreground/45'
          }`}
        >
          <Home size={18} />
          <span className="text-[9px] font-extrabold tracking-wide uppercase">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('menu')} 
          className={`flex flex-col items-center justify-center w-12 h-12 gap-0.5 transition-all ${
            activeTab === 'menu' ? 'text-brand scale-110' : 'text-foreground/45'
          }`}
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-extrabold tracking-wide uppercase">Menu</span>
        </button>
        <button 
          onClick={() => setActiveTab('dine-in')} 
          className={`flex flex-col items-center justify-center w-12 h-12 gap-0.5 transition-all ${
            activeTab === 'dine-in' ? 'text-brand scale-110' : 'text-foreground/45'
          }`}
        >
          <QrCode size={18} />
          <span className="text-[9px] font-extrabold tracking-wide uppercase">Orders</span>
        </button>
        <button 
          onClick={() => setActiveTab('account')} 
          className={`flex flex-col items-center justify-center w-12 h-12 gap-0.5 transition-all ${
            activeTab === 'account' ? 'text-brand scale-110' : 'text-foreground/45'
          }`}
        >
          <User size={18} />
          <span className="text-[9px] font-extrabold tracking-wide uppercase">Profile</span>
        </button>
      </nav>

      {/* Diner Checkout Drawer */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-end md:items-center p-0 md:p-4">
          <div className="bg-background w-full md:max-w-md rounded-t-3xl md:rounded-3xl border border-border-color shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-slide-up">
            <div className="p-5 border-b border-border-color flex justify-between items-center bg-brand-light/55">
              <h3 className="font-black text-base md:text-lg text-foreground flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand" />
                {t.checkout_title}
              </h3>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200/50 flex items-center justify-center text-foreground/60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-5 overflow-y-auto flex-1 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 block">
                  {t.select_table}
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-color bg-card-bg text-sm font-bold text-foreground focus:outline-none focus:border-brand transition-colors"
                  required
                >
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({table.section} - Cap: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 block">
                  {t.enter_name}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-color bg-card-bg text-sm font-bold text-foreground focus:outline-none focus:border-brand transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 block">
                  {t.number_of_guests}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomerCount(c => Math.max(1, c - 1))}
                    className="w-10 h-10 rounded-xl bg-card-bg border border-border-color flex items-center justify-center font-black text-foreground hover:bg-brand-light/25"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-card-bg border border-border-color rounded-xl py-2 text-center font-bold text-sm flex items-center justify-center gap-2 text-foreground">
                    <Users size={15} className="text-stone-400" />
                    <span>{customerCount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomerCount(c => c + 1)}
                    className="w-10 h-10 rounded-xl bg-card-bg border border-border-color flex items-center justify-center font-black text-foreground hover:bg-brand-light/25"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 block">
                  {t.notes}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-stone-400">
                    <FileText size={16} />
                  </span>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Extra spicy, make it hot, no sugar etc."
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-color bg-card-bg text-sm font-bold text-foreground focus:outline-none focus:border-brand transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-light/55 border border-border-color space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground/60">
                  <span>Cart Subtotal</span>
                  <span>₹{totalPriceRupees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-foreground/60">
                  <span>CGST (2.5%) + SGST (2.5%)</span>
                  <span className="text-brand">Incl. in bill</span>
                </div>
                <div className="h-px bg-stone-200 my-1"></div>
                <div className="flex justify-between text-sm font-black text-foreground">
                  <span>Total Amount</span>
                  <span>₹{totalPriceRupees.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className={`w-full py-3.5 ${buttonClass} text-xs font-extrabold uppercase tracking-wide shadow-lg flex items-center justify-center gap-2`}
              >
                {placingOrder ? (
                  <>
                    <Coffee className="w-4 h-4 animate-spin" />
                    {t.placing_order}
                  </>
                ) : (
                  t.confirm_order
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Dialog & Post-payment feedback loop */}
      {successOrderRef && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-background w-full max-w-sm rounded-3xl border border-border-color p-6 shadow-2xl text-center space-y-5 animate-scale-up overflow-y-auto max-h-[90vh]">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-foreground">{t.success_title}</h3>
              <p className="text-foreground/60 text-xs font-semibold px-4">{t.success_msg}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-light/25 border border-stone-200 inline-block mx-auto min-w-[200px]">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">{t.order_ref}</span>
              <span className="text-lg font-black text-foreground tracking-wider mt-0.5 block">{successOrderRef}</span>
            </div>

            {/* Guest Feedback loop */}
            {!feedbackSubmitted ? (
              <div className="border-t border-border-color/70 pt-4 space-y-3 text-left">
                <h4 className="font-black text-xs text-foreground uppercase tracking-wider text-center">Rate Your Dining Experience</h4>
                <div className="flex gap-2.5 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((ratingVal) => (
                    <button
                      key={ratingVal}
                      type="button"
                      onClick={() => setFeedbackRating(ratingVal)}
                      className="text-accent hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        size={28} 
                        className={ratingVal <= feedbackRating ? 'fill-[#ca8a04] text-accent' : 'text-stone-200'} 
                      />
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-foreground/60">
                  <div>
                    <label className="block mb-1">Food Score</label>
                    <select 
                      value={foodRating} 
                      onChange={e => setFoodRating(Number(e.target.value))}
                      className="w-full bg-card-bg border border-border-color rounded-xl px-2 py-1.5 outline-none font-bold"
                    >
                      {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Service Score</label>
                    <select 
                      value={serviceRating} 
                      onChange={e => setServiceRating(Number(e.target.value))}
                      className="w-full bg-card-bg border border-border-color rounded-xl px-2 py-1.5 outline-none font-bold"
                    >
                      {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground/60 mb-1">Comments</label>
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    placeholder="Tell us about the service or food..."
                    className="w-full bg-card-bg border border-border-color rounded-xl p-2.5 text-xs outline-none resize-none font-semibold"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="revisit"
                    checked={wouldRevisit}
                    onChange={e => setWouldRevisit(e.target.checked)}
                    className="w-4 h-4 accent-[#d97706] cursor-pointer"
                  />
                  <label htmlFor="revisit" className="text-xs font-semibold text-stone-600 cursor-pointer select-none">I would visit this cafe again</label>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  disabled={submittingFeedback}
                  className="w-full bg-brand hover:bg-brand/90 text-white rounded-xl py-2.5 font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit & Get 10% Coupon'}
                </button>
              </div>
            ) : (
              <div className="border-t border-border-color/70 pt-4 text-center space-y-2.5 animate-scale-up">
                <h4 className="font-black text-sm text-green-600">Review Submitted!</h4>
                <p className="text-foreground/60 text-[10px] font-semibold">Thank you! Here is your 10% coupon code for your next order:</p>
                <div className="p-3 bg-amber-50 border border-brand/35 rounded-2xl inline-block font-mono font-black text-sm text-brand tracking-widest shadow-inner">
                  {claimedCoupon}
                </div>
              </div>
            )}

            <button
              onClick={handleCloseSuccessRef}
              className="w-full bg-stone-100 text-foreground rounded-xl py-3 font-extrabold text-xs tracking-wider uppercase hover:bg-stone-200 transition-colors cursor-pointer"
            >
              {t.back_to_menu}
            </button>
          </div>
        </div>
      )}

      {/* Customer OTP Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-background w-full max-w-sm rounded-3xl border border-border-color p-6 shadow-2xl space-y-4 relative">
            <button 
              onClick={() => { setIsLoginOpen(false); setOtpSent(false); setOtpError(null); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-stone-200/50 flex items-center justify-center text-foreground/60 cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="text-center space-y-1 pb-2 border-b border-border-color/50">
              <h3 className="text-base font-black text-foreground flex items-center justify-center gap-1.5">
                <User size={18} className="text-brand" />
                <span>Loyalty Club Login</span>
              </h3>
              <p className="text-foreground/60 text-[10px] font-semibold">Verify via WhatsApp OTP for special rates & rewards.</p>
            </div>

            {otpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{otpError}</span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs font-bold text-foreground/60">
                <div className="space-y-1.5">
                  <label className="block">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="Enter 10-digit number"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-color bg-card-bg text-sm font-bold text-foreground focus:outline-none focus:border-[#d97706]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-brand hover:bg-brand/90 text-white rounded-xl py-3 font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                >
                  {otpLoading ? 'Sending...' : 'Send OTP Verification'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-bold text-foreground/60">
                <div className="space-y-1.5">
                  <label className="block">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="Enter OTP code"
                    value={loginOtp}
                    onChange={e => setLoginOtp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-color bg-card-bg text-sm font-bold text-foreground focus:outline-none focus:border-[#d97706] tracking-widest text-center"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 border border-border-color text-foreground/60 rounded-xl py-2.5 font-bold text-xs cursor-pointer hover:bg-brand-light/25"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="flex-1 bg-brand hover:bg-brand/90 text-white rounded-xl py-2.5 font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer (links, hours, socials, copyright) */}
      <footer className="bg-card-bg/60 border-t border-border-color/60 mt-12 py-10 text-xs text-foreground/60">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {(tenant as any)?.logo_url && (
                <img src={(tenant as any).logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white/80 border border-border-color/30" />
              )}
              <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider">{tenant.name}</h4>
            </div>
            <p className="text-[11px] leading-relaxed">
              {(tenant as any)?.footer_description || 'Serving organic micro-roasted coffees and artisan sourdough breads daily from our boutique kitchen.'}
            </p>
            {(tenant as any)?.footer_address && (
              <p className="text-[11px] leading-relaxed flex items-start gap-1">
                <span className="shrink-0 mt-0.5">📍</span>
                {(tenant as any).footer_address}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-foreground uppercase text-[11px] tracking-wider">Quick Links</h5>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => setActiveTab('about')} className="text-left hover:text-brand transition-colors">About Us</button>
              <button onClick={() => setActiveTab('contact')} className="text-left hover:text-brand transition-colors">Contact Details</button>
              <button onClick={() => setActiveTab('gallery')} className="text-left hover:text-brand transition-colors">Cafe Gallery</button>
              <button onClick={() => setActiveTab('careers')} className="text-left hover:text-brand transition-colors">Job Openings</button>
            </div>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-foreground uppercase text-[11px] tracking-wider">Contact</h5>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => setActiveTab('menu')} className="text-left hover:text-brand transition-colors">Digital Menu</button>
              <button onClick={() => setActiveTab('dine-in')} className="text-left hover:text-brand transition-colors">Dine-in QR</button>
              {(tenant as any)?.footer_phone && (
                <a href={`tel:${(tenant as any).footer_phone}`} className="hover:text-brand transition-colors flex items-center gap-1">
                  📞 {(tenant as any).footer_phone}
                </a>
              )}
              {(tenant as any)?.footer_email && (
                <a href={`mailto:${(tenant as any).footer_email}`} className="hover:text-brand transition-colors flex items-center gap-1">
                  ✉️ {(tenant as any).footer_email}
                </a>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-foreground uppercase text-[11px] tracking-wider">Operating Hours</h5>
            {(tenant as any)?.footer_hours ? (
              <p className="text-[11px] whitespace-pre-line">{(tenant as any).footer_hours}</p>
            ) : (
              <>
                <p className="text-[11px]">Monday - Sunday<br />08:30 AM - 10:00 PM</p>
                <p className="text-[11px] text-[#ca8a04]">Kitchen closes at 09:30 PM</p>
              </>
            )}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 border-t border-border-color/30 mt-8 pt-6 text-center text-[10px] tracking-wider uppercase font-extrabold">
          © {new Date().getFullYear()} {tenant.name} · {t.powered}
        </div>
      </footer>

      {/* Pre-Visit Notification System */}
      <WelcomeNotificationPopup cafeName={tenant.name} tenantId={tenant.id} />

      {/* Floating Call Staff Action Button (Dynamic Per Theme) */}
      {selectedTableId && (
        <div className="fixed bottom-24 right-4 md:right-[calc(50%-200px)] z-40">
          <AnimatePresence>
            {isStaffCalling && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute bottom-16 right-0 bg-stone-900 border border-stone-800 text-white rounded-2xl p-4 shadow-2xl w-48 text-center space-y-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 mx-auto animate-bounce">
                  🛎️
                </div>
                <h5 className="text-[11px] font-black uppercase tracking-wider">Calling your staff...</h5>
                <p className="text-[9px] text-stone-400">Please wait at table</p>
              </motion.div>
            )}
          </AnimatePresence>

          {themeDesign.renderCallStaffButton({
            onClick: handleCallStaff,
            disabled: staffCallCooldown > 0,
            cooldown: staffCallCooldown,
            isCalling: isStaffCalling
          })}
        </div>
      )}
      </div>
    </div>
  );
}
