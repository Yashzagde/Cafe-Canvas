'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Coffee, ShoppingBag, Plus, Minus, Globe, Sparkles, X, User, Users, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setErrorMsg(null);

        // 1. Resolve tenant
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('id, name, subdomain')
          .eq('subdomain', storeSlug)
          .maybeSingle();

        if (tenantError) throw tenantError;

        if (!tenantData) {
          setTenant(null);
          setLoading(false);
          return;
        }

        setTenant(tenantData);

        // 2. Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('menu_categories')
          .select('id, name, icon, sort_order')
          .eq('tenant_id', tenantData.id)
          .eq('is_visible', true)
          .is('deleted_at', null)
          .order('sort_order', { ascending: true });

        if (catError) throw catError;
        setCategories(catData || []);

        // 3. Fetch menu items
        const { data: itemData, error: itemError } = await supabase
          .from('menu_items')
          .select('id, category_id, name, description, price, status, tags')
          .eq('tenant_id', tenantData.id)
          .eq('status', 'available')
          .is('deleted_at', null)
          .order('sort_order', { ascending: true });

        if (itemError) throw itemError;
        setMenuItems(itemData || []);

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
    if (!selectedTableId || !customerName.trim()) {
      alert("Please enter your name and select a table");
      return;
    }

    try {
      setPlacingOrder(true);
      setErrorMsg(null);

      // If dbPending, simulate success immediately in sandbox mode
      if (dbPending) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccessOrderRef(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
        setCart({});
        setIsCheckoutOpen(false);
        return;
      }

      // 1. Check if an active session exists for this table
      let { data: activeSession, error: sessionFindError } = await supabase
        .from('table_sessions')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('table_id', selectedTableId)
        .is('check_out_at', null)
        .maybeSingle();

      if (sessionFindError) throw sessionFindError;

      let sessionId = activeSession?.id;

      // Create new session if none exists
      if (!sessionId) {
        const { data: newSession, error: sessionCreateError } = await supabase
          .from('table_sessions')
          .insert({
            tenant_id: tenant.id,
            table_id: selectedTableId,
            check_in_at: new Date().toISOString()
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
          subtotal: totalPricePaise,
          discount_amount: 0,
          total: totalPricePaise,
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
          unit_price: item.price,
          quantity: qty,
          modifiers: [],
          kds_status: 'pending'
        };
      });

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsInsertError) throw itemsInsertError;

      // Success
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
        {/* Luxury Liquid Floating Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e05e35]/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Header Banner */}
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
      {/* Luxury Liquid Floating Background Gradients */}
      <div className="liquid-blob-1 top-10 left-10"></div>
      <div className="liquid-blob-2 top-1/3 right-10"></div>
      <div className="liquid-blob-3 bottom-10 left-20"></div>

      {/* Database Warning Alert */}
      {dbPending && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-1.5 sticky top-0 z-50 shadow-md">
          <AlertCircle size={14} />
          <span>Running in Offline Sandbox Mode. Run <code>node db_setup.js</code> to initialize live database structures.</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="h-56 relative bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#23120b] via-[#23120b]/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80" 
          alt="AETHER Cover" 
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute bottom-5 left-6 right-6 z-20 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#fcfaf4] tracking-tight flex items-center gap-2">
              {tenant.name} <Sparkles size={20} className="text-[#ca8a04] animate-pulse" />
            </h1>
            <p className="text-[#fcfaf4]/85 text-xs font-semibold flex items-center gap-1.5 mt-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.openStatus}
            </p>
          </div>
          
          {/* Language Toggle Button */}
          <button 
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fcfaf4]/10 backdrop-blur-md border border-[#fcfaf4]/20 text-xs font-bold text-[#fcfaf4] hover:bg-[#fcfaf4]/20 transition-all shadow-sm"
          >
            <Globe size={13} />
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 mt-6 relative z-20">
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
                    
                    {/* Item Image */}
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

      {/* Floating Animated Cart Bar */}
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

      {/* Diner Checkout Drawer/Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-end md:items-center p-0 md:p-4">
          <div className="bg-[#fcfaf4] w-full md:max-w-md rounded-t-3xl md:rounded-3xl border border-[#eae5d8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-slide-up">
            {/* Header */}
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

            {/* Content Form */}
            <form onSubmit={handlePlaceOrder} className="p-5 overflow-y-auto flex-1 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Table Selector */}
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

              {/* Customer Name */}
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

              {/* Guests Count */}
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

              {/* Order Notes */}
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

              {/* Bill Details Summary */}
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

              {/* Submit button */}
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

      {/* Success Dialog */}
      {successOrderRef && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#fcfaf4] w-full max-w-sm rounded-3xl border border-[#eae5d8] p-6 shadow-2xl text-center space-y-5 animate-scale-up">
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

            <button
              onClick={() => setSuccessOrderRef(null)}
              className="w-full bg-[#eae5d8] text-[#4a2d22] rounded-xl py-3 font-extrabold text-xs tracking-wider uppercase hover:bg-[#c5b293]/35 transition-colors"
            >
              {t.back_to_menu}
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="text-center py-12 text-[10px] text-stone-500/80">
        <div>{t.powered} · {tenant.name}</div>
      </footer>
    </div>
  );
}
