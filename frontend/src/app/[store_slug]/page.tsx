'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import WelcomeNotificationPopup from '@/components/WelcomeNotificationPopup';
import HeroCarousel from '@/components/HeroCarousel';
import { loadTenantTheme } from '@/lib/theme-engine';
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
  LogOut
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
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

export default function Storefront() {
  const params = useParams();
  const storeSlug = (params?.store_slug as string) || '';
  const supabase = createClient();

  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeCatId, setActiveCatId] = useState<string>('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  
  // Dynamic database states
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [dbPending, setDbPending] = useState(false);

  // Form states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCount, setCustomerCount] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [successOrderRef, setSuccessOrderRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Loyalty & OTP Login states
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
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
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('id, name, slug')
          .eq('slug', storeSlug)
          .maybeSingle();

        if (tenantError) throw tenantError;

        if (!tenantData) {
          setTenant(null);
          setLoading(false);
          return;
        }

        // Map slug to subdomain for UI compatibility if needed
        setTenant({
          id: tenantData.id,
          name: tenantData.name,
          subdomain: tenantData.slug,
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
        
        // Map canonical columns to legacy UI keys
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
          .select('id, name, capacity, section, status')
          .eq('tenant_id', tenantData.id)
          .is('deleted_at', null)
          .order('name', { ascending: true });

        if (tableError) throw tableError;
        setTables(tableData || []);
        if (tableData && tableData.length > 0) {
          setSelectedTableId(tableData[0].id);
        }

        setDbPending(false);
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
          action: 'send',
          phone: loginPhone,
          tenantId: tenant?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setOtpError(data.error || 'Failed to dispatch OTP.');
      }
    } catch (err) {
      setOtpError('Failed to communicate with OTP service.');
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
  };

  const handleSubmitFeedback = async () => {
    if (!tenant) return;
    setSubmittingFeedback(true);
    try {
      // Get a random active waiter in this tenant to attach
      const { data: staffMembers } = await supabase
        .from('users')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('role', 'staff')
        .limit(1);
      
      const assocStaffId = staffMembers && staffMembers.length > 0 ? staffMembers[0].id : null;

      // Insert feedback
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

      // Generate a dynamic 10% coupon code
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

  const filteredItems = menuItems.filter(
    item => activeCatId === 'All' || item.category_id === activeCatId
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId || !customerName.trim() || !tenant) {
      alert("Please enter your name and select a table");
      return;
    }

    try {
      setPlacingOrder(true);
      setErrorMsg(null);

      if (dbPending) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccessOrderRef(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
        setCart({});
        setIsCheckoutOpen(false);
        return;
      }

      // 1. Check table session
      let { data: activeSession, error: sessionFindError } = await supabase
        .from('table_sessions')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('table_id', selectedTableId)
        .is('session_end', null)
        .maybeSingle();

      if (sessionFindError) throw sessionFindError;

      let sessionId = activeSession?.id;

      if (!sessionId) {
        const { data: newSession, error: sessionCreateError } = await supabase
          .from('table_sessions')
          .insert({
            tenant_id: tenant.id,
            table_id: selectedTableId,
            opened_by: '00000000-0000-0000-0000-000000000000', // anonymous customer
            session_start: new Date().toISOString()
          })
          .select('id')
          .single();

        if (sessionCreateError) throw sessionCreateError;
        sessionId = newSession.id;
      }

      // 2. Insert order
      const { data: newOrder, error: orderInsertError } = await supabase
        .from('orders')
        .insert({
          tenant_id: tenant.id,
          table_id: selectedTableId,
          table_session_id: sessionId,
          customer_name: customerName,
          customer_count: customerCount,
          subtotal_paise: totalPricePaise,
          discount_paise: 0,
          total_paise: totalPricePaise,
          notes: orderNotes || null,
          status: 'pending'
        })
        .select('id')
        .single();

      if (orderInsertError) throw orderInsertError;

      // 3. Insert order items
      const orderItemsToInsert = Object.entries(cart).map(([itemId, qty]) => {
        const item = menuItems.find(i => i.id === itemId)!;
        return {
          order_id: newOrder.id,
          menu_item_id: item.id,
          item_name: item.name,
          unit_price_paise: item.price,
          quantity: qty,
          modifiers: [],
          kds_status: 'pending'
        };
      });

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsInsertError) throw itemsInsertError;

      setSuccessOrderRef(newOrder.id.substring(0, 8).toUpperCase());
      setCart({});
      setIsCheckoutOpen(false);
    } catch (err: any) {
      console.error("Order submission failed:", err.message);
      setErrorMsg(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] text-[#4a2d22] flex flex-col justify-center items-center gap-4">
        <Coffee className="w-12 h-12 text-[#e05e35] animate-spin" />
        <span className="font-extrabold text-sm tracking-widest uppercase opacity-75">Loading Menu Canvas...</span>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] text-[#4a2d22] flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#eae5d8] shadow-md space-y-6">
          <div className="w-16 h-16 bg-[#fbeee7] rounded-2xl flex items-center justify-center text-[#e05e35] mx-auto">
            <Coffee size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#4a2d22]">Store Not Found</h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            The restaurant store you are trying to access does not exist or has been disabled. Please check the URL or contact the owner.
          </p>
          <a
            href="https://cafecanvas.bar"
            className="inline-block bg-[#e05e35] text-[#fcfaf4] font-extrabold px-6 py-3.5 rounded-xl hover:opacity-90 transition-all text-xs tracking-wider uppercase shadow-md"
          >
            Go to CafeCanva Home
          </a>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] text-[#4a2d22] flex flex-col justify-between relative overflow-x-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e05e35]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="h-56 relative bg-stone-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#23120b] via-[#23120b]/40 to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80" 
            alt="Cover" 
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute bottom-5 left-6 right-6 z-20 flex justify-between items-end">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#fcfaf4] tracking-tight flex items-center gap-2">
                {tenant.name} <Sparkles size={20} className="text-[#ca8a04] animate-pulse" />
              </h1>
            </div>
          </div>
        </div>

        <main className="max-w-md mx-auto px-4 py-16 text-center flex-1 flex flex-col justify-center items-center gap-6 relative z-20">
          <div className="w-16 h-16 bg-[#fbeee7] rounded-2xl flex items-center justify-center text-[#e05e35] mx-auto border border-[#e05e35]/10">
            <Sparkles size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-[#4a2d22]">Menu Under Construction</h2>
            <p className="text-stone-500 text-xs leading-relaxed px-4">
              We are working hard to set up our digital menu catalog. Please check back soon or ask our staff for assistance!
            </p>
          </div>
        </main>

        <footer className="text-center py-8 text-[10px] text-stone-500/80">
          <div>{t.powered} · {tenant.name}</div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf4] text-[#4a2d22] pb-32 relative overflow-x-hidden">
      {/* Liquid Floating Background Gradients */}
      <div className="liquid-blob-1 top-10 left-10"></div>
      <div className="liquid-blob-2 top-1/3 right-10"></div>
      <div className="liquid-blob-3 bottom-10 left-20"></div>

      {dbPending && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-1.5 sticky top-0 z-50 shadow-md">
          <AlertCircle size={14} />
          <span>Running in Offline Sandbox Mode. Run <code>node db_setup.js</code> to initialize live database structures.</span>
        </div>
      )}

      {/* Header Banner / Hero Carousel */}
      <div className="relative mb-6">
        <HeroCarousel cafeName={tenant.name} />
        
        {/* Controls Overlay */}
        <div className="absolute top-4 left-6 right-6 z-20 flex justify-between items-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4A3728]/45 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.openStatus}</span>
          </div>
          
          <button 
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4A3728]/45 backdrop-blur-md border border-white/10 text-xs font-bold text-white hover:bg-[#4A3728]/60 transition-all shadow-sm"
          >
            <Globe size={13} />
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 mt-6 relative z-20">
        {/* Loyalty Profile Section */}
        {customerPhone ? (
          <div className="bg-[#ffffff] border border-amber-200 rounded-3xl p-5 shadow-lg space-y-4 mb-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#e2e8f0]/60 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#d97706]">Loyalty Profile</span>
                <h4 className="font-extrabold text-sm text-[#1e293b]">{customerProfile?.name || 'Valued Guest'}</h4>
                <p className="text-[10px] text-[#1e293b]/40 font-semibold">{customerPhone}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#ca8a04]">Reward Points</span>
                <p className="text-lg font-black text-[#ca8a04]">
                  {Math.floor((customerProfile?.total_spend || 0) / 1000)} <span className="text-[10px] font-normal text-stone-400">pts</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-[#1e293b]/40 font-semibold">{customerProfile?.visit_count || 1} visits</span>
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

            {/* Exclusive Offers */}
            {offers.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1e293b]/40">Your Exclusive Offers</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {offers.map(o => (
                    <div key={o.id} className="bg-amber-50/40 border border-amber-100/70 rounded-2xl p-3 flex justify-between items-center gap-3">
                      <div>
                        <h5 className="font-bold text-xs text-[#d97706]">{o.title}</h5>
                        <p className="text-[10px] text-[#1e293b]/60 mt-0.5">{o.description}</p>
                      </div>
                      <div className="shrink-0 bg-[#d97706] text-white px-2.5 py-1 rounded-xl text-xs font-black">
                        {o.discount_percent}% OFF
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#ffffff] border border-[#eae5d8] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h4 className="font-black text-sm text-[#4a2d22]">Unlock Special Loyalty Offers</h4>
              <p className="text-stone-500 text-[11px] mt-0.5">Verify your WhatsApp number to check active discounts and points.</p>
            </div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl cursor-pointer transition-all whitespace-nowrap shadow-sm self-stretch sm:self-auto text-center"
            >
              Login / Verify
            </button>
          </div>
        )}

        {/* Categories Chip Filters */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 sticky top-4 z-30 scrollbar-none">
          <button 
            onClick={() => setActiveCatId('All')}
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm border transition-all ${
              activeCatId === 'All' 
                ? 'bg-[#e05e35] text-[#fcfaf4] border-[#e05e35] scale-105' 
                : 'bg-white/80 backdrop-blur-sm border-[#eae5d8] text-[#4a2d22] hover:border-[#e05e35]/40'
            }`}
          >
            {t.all}
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCatId(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm border transition-all ${
                activeCatId === cat.id 
                  ? 'bg-[#e05e35] text-[#fcfaf4] border-[#e05e35] scale-105' 
                  : 'bg-white/80 backdrop-blur-sm border-[#eae5d8] text-[#4a2d22] hover:border-[#e05e35]/40'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl font-black tracking-tight mb-5 flex items-center gap-2">
              {activeCatId === 'All' ? t.popular : categories.find(c => c.id === activeCatId)?.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => {
                const qty = cart[item.id] || 0;
                return (
                  <div 
                    key={item.id} 
                    className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-[#eae5d8] flex gap-4 transition-all duration-300 hover:shadow-md hover:border-[#c5b293]"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                       <div>
                        <h3 className="font-extrabold text-[#4a2d22] text-sm md:text-base">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-stone-500 text-[11px] md:text-xs mt-1 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-black text-sm md:text-base text-[#4a2d22]">
                          ₹{(item.price / 100).toFixed(2)}
                        </span>
                        
                        {qty > 0 ? (
                          <div className="flex items-center gap-2 bg-[#fbeee7] rounded-full px-2 py-1 border border-[#e05e35]/20">
                            <button 
                              onClick={() => handleQtyChange(item.id, -1)}
                              className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#e05e35] hover:bg-[#e05e35] hover:text-[#fcfaf4] transition-colors"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="font-bold text-xs text-[#e05e35] px-1">{qty}</span>
                            <button 
                              onClick={() => handleQtyChange(item.id, 1)}
                              className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#e05e35] hover:bg-[#e05e35] hover:text-[#fcfaf4] transition-colors"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleQtyChange(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-[#fbeee7] text-[#e05e35] flex items-center justify-center hover:bg-[#e05e35] hover:text-[#fcfaf4] transition-all hover:scale-105 active:scale-95"
                          >
                            <Plus size={15} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 relative rounded-xl overflow-hidden border border-[#eae5d8] bg-stone-100 flex items-center justify-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <Coffee className="w-8 h-8 text-stone-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 w-full px-4 max-w-2xl left-1/2 -translate-x-1/2 z-50 animate-scale-up">
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full brand-gradient text-[#fcfaf4] rounded-2xl p-4 flex justify-between items-center shadow-xl hover:opacity-95 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#fcfaf4]/20 flex items-center justify-center font-black text-sm">
                {totalItems}
              </div>
              <span className="font-extrabold text-sm tracking-wide uppercase">{t.viewOrder}</span>
            </div>
            <span className="font-black text-base md:text-lg">
              ₹{totalPriceRupees.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Diner Checkout Drawer */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-end md:items-center p-0 md:p-4">
          <div className="bg-[#fcfaf4] w-full md:max-w-md rounded-t-3xl md:rounded-3xl border border-[#eae5d8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-slide-up">
            <div className="p-5 border-b border-[#eae5d8] flex justify-between items-center bg-[#fbeee7]/55">
              <h3 className="font-black text-base md:text-lg text-[#4a2d22] flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#e05e35]" />
                {t.checkout_title}
              </h3>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200/50 flex items-center justify-center text-stone-500"
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
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  {t.select_table}
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#eae5d8] bg-white text-sm font-bold text-[#4a2d22] focus:outline-none focus:border-[#e05e35] transition-colors"
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
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#eae5d8] bg-white text-sm font-bold text-[#4a2d22] focus:outline-none focus:border-[#e05e35] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  {t.number_of_guests}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomerCount(c => Math.max(1, c - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-[#eae5d8] flex items-center justify-center font-black text-[#4a2d22] hover:bg-stone-50"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-white border border-[#eae5d8] rounded-xl py-2 text-center font-bold text-sm flex items-center justify-center gap-2 text-[#4a2d22]">
                    <Users size={15} className="text-stone-400" />
                    <span>{customerCount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomerCount(c => c + 1)}
                    className="w-10 h-10 rounded-xl bg-white border border-[#eae5d8] flex items-center justify-center font-black text-[#4a2d22] hover:bg-stone-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#eae5d8] bg-white text-sm font-bold text-[#4a2d22] focus:outline-none focus:border-[#e05e35] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbeee7]/55 border border-[#eae5d8] space-y-2">
                <div className="flex justify-between text-xs font-bold text-stone-500">
                  <span>Cart Subtotal</span>
                  <span>₹{totalPriceRupees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-stone-500">
                  <span>CGST (2.5%) + SGST (2.5%)</span>
                  <span className="text-[#e05e35]">Incl. in bill</span>
                </div>
                <div className="h-px bg-[#eae5d8] my-1"></div>
                <div className="flex justify-between text-sm font-black text-[#4a2d22]">
                  <span>Total Amount</span>
                  <span>₹{totalPriceRupees.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="w-full brand-gradient text-[#fcfaf4] rounded-xl py-3.5 font-extrabold text-sm tracking-wide uppercase shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
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
          <div className="bg-[#fcfaf4] w-full max-w-sm rounded-3xl border border-[#eae5d8] p-6 shadow-2xl text-center space-y-5 animate-scale-up overflow-y-auto max-h-[90vh]">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#4a2d22]">{t.success_title}</h3>
              <p className="text-stone-500 text-xs font-semibold px-4">{t.success_msg}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 inline-block mx-auto min-w-[200px]">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">{t.order_ref}</span>
              <span className="text-lg font-black text-[#4a2d22] tracking-wider mt-0.5 block">{successOrderRef}</span>
            </div>

            {/* Guest Feedback loop */}
            {!feedbackSubmitted ? (
              <div className="border-t border-[#eae5d8]/70 pt-4 space-y-3 text-left">
                <h4 className="font-black text-xs text-[#4a2d22] uppercase tracking-wider text-center">Rate Your Dining Experience</h4>
                <div className="flex gap-2.5 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((ratingVal) => (
                    <button
                      key={ratingVal}
                      type="button"
                      onClick={() => setFeedbackRating(ratingVal)}
                      className="text-[#ca8a04] hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        size={28} 
                        className={ratingVal <= feedbackRating ? 'fill-[#ca8a04] text-[#ca8a04]' : 'text-stone-200'} 
                      />
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-stone-500">
                  <div>
                    <label className="block mb-1">Food Score</label>
                    <select 
                      value={foodRating} 
                      onChange={e => setFoodRating(Number(e.target.value))}
                      className="w-full bg-white border border-[#eae5d8] rounded-xl px-2 py-1.5 outline-none font-bold"
                    >
                      {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Service Score</label>
                    <select 
                      value={serviceRating} 
                      onChange={e => setServiceRating(Number(e.target.value))}
                      className="w-full bg-white border border-[#eae5d8] rounded-xl px-2 py-1.5 outline-none font-bold"
                    >
                      {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Comments</label>
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    placeholder="Tell us about the service or food..."
                    className="w-full bg-white border border-[#eae5d8] rounded-xl p-2.5 text-xs outline-none resize-none font-semibold"
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
                  className="w-full bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl py-2.5 font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit & Get 10% Coupon'}
                </button>
              </div>
            ) : (
              <div className="border-t border-[#eae5d8]/70 pt-4 text-center space-y-2.5 animate-scale-up">
                <h4 className="font-black text-sm text-green-600">Review Submitted!</h4>
                <p className="text-stone-500 text-[10px] font-semibold">Thank you! Here is your 10% coupon code for your next order:</p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl inline-block font-mono font-black text-sm text-[#d97706] tracking-widest shadow-inner">
                  {claimedCoupon}
                </div>
              </div>
            )}

            <button
              onClick={handleCloseSuccessRef}
              className="w-full bg-[#eae5d8]/50 text-[#4a2d22] rounded-xl py-3 font-extrabold text-xs tracking-wider uppercase hover:bg-[#c5b293]/30 transition-colors cursor-pointer"
            >
              {t.back_to_menu}
            </button>
          </div>
        </div>
      )}

      {/* Customer OTP Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-[#fcfaf4] w-full max-w-sm rounded-3xl border border-[#eae5d8] p-6 shadow-2xl space-y-4 relative">
            <button 
              onClick={() => { setIsLoginOpen(false); setOtpSent(false); setOtpError(null); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-stone-200/50 flex items-center justify-center text-stone-500 cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="text-center space-y-1 pb-2 border-b border-[#eae5d8]/50">
              <h3 className="text-base font-black text-[#4a2d22] flex items-center justify-center gap-1.5">
                <User size={18} className="text-[#d97706]" />
                <span>Loyalty Club Login</span>
              </h3>
              <p className="text-stone-500 text-[10px] font-semibold">Verify via WhatsApp OTP for special rates & rewards.</p>
            </div>

            {otpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{otpError}</span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs font-bold text-stone-500">
                <div className="space-y-1.5">
                  <label className="block">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="Enter 10-digit number"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#eae5d8] bg-white text-sm font-bold text-[#4a2d22] focus:outline-none focus:border-[#d97706]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl py-3 font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                >
                  {otpLoading ? 'Sending...' : 'Send OTP Verification'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-bold text-stone-500">
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
                    className="w-full px-3 py-2.5 rounded-xl border border-[#eae5d8] bg-white text-sm font-bold text-[#4a2d22] focus:outline-none focus:border-[#d97706] tracking-widest text-center"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 border border-[#eae5d8] text-stone-500 rounded-xl py-2.5 font-bold text-xs cursor-pointer hover:bg-stone-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="flex-1 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl py-2.5 font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="text-center py-12 text-[10px] text-stone-500/80">
        <div>{t.powered} · {tenant.name}</div>
      </footer>

      {/* Pre-Visit Notification System */}
      <WelcomeNotificationPopup cafeName={tenant.name} />
    </div>
  );
}
