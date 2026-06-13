'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Receipt, Search, Grid2x2, List, Printer, CreditCard, 
  Banknote, Smartphone, Check, Coffee, Clock, User, 
  TrendingUp, Plus, Minus, LogOut, MapPin, RotateCcw, 
  Sparkles, AlertCircle, ShoppingBag, Shield
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ReceiptPreviewModal from '@/components/billing/ReceiptPreviewModal';
import type { ReceiptData } from '@/components/billing/types';
import { DEFAULT_STORE_INFO } from '@/components/billing/types';

/* ─── Seed / Offline Fallback Data ─── */
const FALLBACK_CATEGORIES = ['Coffee', 'Desserts', 'Snacks'];
const FALLBACK_MENU = [
  { id: 'a1111111-1111-1111-1111-111111111111', name: 'Classic Cappuccino', price: 240, category: 'Coffee', description: 'Rich espresso with steamed milk foam', status: 'available', allows_modifiers: true },
  { id: 'a2222222-2222-2222-2222-222222222222', name: 'Blueberry Muffin', price: 180, category: 'Desserts', description: 'Freshly baked muffin with organic berries', status: 'available', allows_modifiers: false },
  { id: 'a3333333-3333-3333-3333-333333333333', name: 'Avocado Sourdough Toast', price: 290, category: 'Snacks', description: 'Toasted sourdough with mashed avocado and sea salt', status: 'available', allows_modifiers: true },
  { id: 'm4', name: 'Matcha Latte Special', price: 320, category: 'Coffee', description: 'Ceremonial grade Uji matcha whisked with oat milk', status: 'available', allows_modifiers: true },
  { id: 'm5', name: 'Almond Butter Croissant', price: 240, category: 'Desserts', description: 'Buttery flaky pastry filled with house-roasted almond cream', status: 'available', allows_modifiers: false },
  { id: 'm6', name: 'Flat White', price: 310, category: 'Coffee', description: 'Velvety micro-foam espresso with full-cream milk', status: 'available', allows_modifiers: true }
];

const FALLBACK_MODIFIERS = [
  {
    id: 'g1',
    name: 'Milk Option',
    required: true,
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: 'o1', name: 'Full Cream', extraPrice: 0, isDefault: true },
      { id: 'o2', name: 'Oat Milk', extraPrice: 30, isDefault: false },
      { id: 'o3', name: 'Soy Milk', extraPrice: 20, isDefault: false }
    ]
  },
  {
    id: 'g2',
    name: 'Size Selection',
    required: true,
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: 'o4', name: 'Regular', extraPrice: 0, isDefault: true },
      { id: 'o5', name: 'Large', extraPrice: 50, isDefault: false }
    ]
  },
  {
    id: 'g3',
    name: 'Add-ons',
    required: false,
    minSelect: 0,
    maxSelect: 3,
    options: [
      { id: 'o6', name: 'Extra Avocado', extraPrice: 60, isDefault: false },
      { id: 'o7', name: 'Poached Egg', extraPrice: 40, isDefault: false },
      { id: 'o8', name: 'Feta Cheese', extraPrice: 50, isDefault: false }
    ]
  }
];

const FALLBACK_TABLES = [
  { id: 'd1111111-1111-1111-1111-111111111111', name: 'Table 01', capacity: 4, section: 'Indoor Main', status: 'available' },
  { id: 'd2222222-2222-2222-2222-222222222222', name: 'Table 02', capacity: 2, section: 'Indoor Bar', status: 'occupied' },
  { id: 'd3333333-3333-3333-3333-333333333333', name: 'Table 04', capacity: 6, section: 'Outdoor Patio', status: 'available' },
  { id: 'd4444444-4444-4444-4444-444444444444', name: 'Table 12', capacity: 2, section: 'Indoor Window', status: 'cleaning' }
];

interface CartItem {
  id: string;
  name: string;
  price: number; // in base units (e.g. ₹240)
  qty: number;
  notes?: string;
  modifier_selections?: Array<{ group: string; option: string; price: number }>;
}

export default function StaffPOS() {
  const router = useRouter();
  const supabase = createClient();

  /* ─── Mode and Auth States ─── */
  const [profile, setProfile] = useState<any>(null);
  const demoMode = false;
  const [loading, setLoading] = useState(true);

  /* ─── Screen Tab Navigation ─── */
  const [activeTab, setActiveTab] = useState<'tables' | 'order' | 'queue' | 'performance'>('tables');
  const [orderSubTab, setOrderSubTab] = useState<'menu' | 'cart'>('menu');

  /* ─── Database and Content States ─── */
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeOrdersQueue, setActiveOrdersQueue] = useState<any[]>([]);
  const [shiftStats, setShiftStats] = useState({
    ordersHandled: 12,
    billsSettled: 8,
    revenueGenerated: 4250,
    tipsReceived: 450
  });

  /* ─── Interactive Selections ─── */
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [tableDrawerOpen, setTableDrawerOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  
  /* ─── Modifier Selector Drawer ─── */
  const [modifierItem, setModifierItem] = useState<any>(null);
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, any>>({});
  const [modifierNotes, setModifierNotes] = useState('');

  /* ─── Cart and Checkout ─── */
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [billCounter, setBillCounter] = useState(101);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  /* ─── Billing Settings (cgst, sgst, service charge) ─── */
  const [billingSettings, setBillingSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cafe_canva_billing_settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      serviceChargeType: "percent" as "percent" | "flat",
      serviceChargeValue: 5,
    };
  });

  /* ────────────────────────────────────────────────────────
     1. AUTH CHECK & INITIAL SEEDING / DB LOADER
  ──────────────────────────────────────────────────────── */
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // A. Validate Supabase Session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.warn("No active Supabase user found. Redirecting to login.");
          router.push('/login');
          return;
        }

        // B. Fetch waiter profile
        const { data: userProfile, error: profileErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileErr || !userProfile) {
          console.error("Error retrieving user profile from DB:", profileErr);
          router.push('/login');
          return;
        }

        setProfile(userProfile);
        if (userProfile.role === 'kitchen') {
          setActiveTab('queue');
        }

        // C. Fetch Live DB Tables
        const { data: dbTables } = await supabase
          .from('tables')
          .select('*')
          .is('deleted_at', null)
          .order('name');
        
        if (dbTables && dbTables.length > 0) {
          setTables(dbTables);
        } else {
          setTables(FALLBACK_TABLES);
        }

        // D. Fetch Menu Categories
        const { data: dbCats } = await supabase
          .from('menu_categories')
          .select('*')
          .order('sort_order');
        
        if (dbCats && dbCats.length > 0) {
          setCategories(dbCats.map(c => c.name));
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }

        const { data: dbItems } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('name');
        
        if (dbItems && dbItems.length > 0) {
          // Normalize prices (stored in paise in DB; convert to ₹)
          const normalized = dbItems.map(i => ({
            ...i,
            price: i.price / 100, // stored in paise, convert to ₹
            allows_modifiers: i.allows_modifiers || i.allowsModifiers || false
          }));
          setMenuItems(normalized);
        } else {
          setMenuItems(FALLBACK_MENU);
        }

        // F. Fetch Active Branch Orders
        await refreshOrdersQueue(userProfile);

        // G. Setup Real-time Table status changes subscription
        const tablesChannel = supabase
          .channel('tables-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tables' },
            (payload) => {
              if (payload.eventType === 'UPDATE') {
                setTables(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
              }
            }
          )
          .subscribe();

        setLoading(false);

        return () => {
          supabase.removeChannel(tablesChannel);
        };

      } catch (err) {
        console.error("Database connection or loading failed:", err);
        router.push('/login');
      }
    }

    loadData();
  }, []);

  const loadFallbacks = () => {
    setTables(FALLBACK_TABLES);
    setCategories(FALLBACK_CATEGORIES);
    setMenuItems(FALLBACK_MENU);
    // Populate an initial mock queue
    setActiveOrdersQueue([
      {
        id: 'ord-101',
        table_name: 'Table 02',
        status: 'preparing',
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        items: [
          { itemName: 'Classic Cappuccino', quantity: 2, itemNotes: 'Oat Milk, Extra hot', status: 'preparing' },
          { itemName: 'Avocado Sourdough Toast', quantity: 1, itemNotes: 'Add egg', status: 'ready' }
        ]
      },
      {
        id: 'ord-102',
        table_name: 'Table 12',
        status: 'pending',
        created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        items: [
          { itemName: 'Blueberry Muffin', quantity: 1, itemNotes: '', status: 'pending' }
        ]
      }
    ]);
  };

  const refreshOrdersQueue = async (userProfile: any) => {
    if (demoMode) return;
    try {
      const activeProfile = userProfile || profile;
      if (!activeProfile) return;

      const { data: dbOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', activeProfile.tenant_id)
        .eq('location_id', activeProfile.branch_id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed'])
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;

      if (dbOrders && dbOrders.length > 0) {
        const { data: dbOrderItems } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', dbOrders.map(o => o.id));

        const formattedQueue = dbOrders.map(order => {
          const matchingTable = tables.find(t => t.id === order.table_id);
          return {
            id: order.id,
            table_name: matchingTable ? matchingTable.name : 'Table',
            status: order.status,
            created_at: order.created_at,
            items: dbOrderItems 
              ? dbOrderItems.filter(item => item.order_id === order.id).map(i => ({
                  id: i.id,
                  itemName: i.item_name,
                  quantity: i.quantity,
                  itemNotes: i.notes ?? '',
                  status: i.kds_status || order.status
                }))
              : []
          };
        });
        setActiveOrdersQueue(formattedQueue);
      } else {
        setActiveOrdersQueue([]);
      }
    } catch (err) {
      console.error("Error refreshing active kitchen orders:", err);
    }
  };

  /* ────────────────────────────────────────────────────────
     2. DYNAMIC MODIFIER LOADER & DRAWER
  ──────────────────────────────────────────────────────── */
  const openModifiersDrawer = async (item: any) => {
    setModifierItem(item);
    setModifierNotes('');
    
    // Select defaults automatically
    const initialSelections: Record<string, any> = {};

    if (demoMode) {
      setModifierGroups(FALLBACK_MODIFIERS);
      FALLBACK_MODIFIERS.forEach(g => {
        const def = g.options.find(o => o.isDefault);
        if (def) {
          initialSelections[g.id] = g.maxSelect === 1 ? def : [def];
        }
      });
      setSelectedModifiers(initialSelections);
      return;
    }

    try {
      // Query dynamic modifiers from Supabase
      const { data: dbGroups } = await supabase
        .from('modifier_groups')
        .select('*')
        .eq('item_id', item.id);

      if (dbGroups && dbGroups.length > 0) {
        const { data: dbOptions } = await supabase
          .from('modifier_options')
          .select('*')
          .in('group_id', dbGroups.map(g => g.id));

        const combined = dbGroups.map(g => {
          const groupOpts = dbOptions ? dbOptions.filter(o => o.group_id === g.id).map(o => ({
            ...o,
            extraPrice: o.extra_price / 100, // convert price to base ₹
            isDefault: o.is_default || false
          })) : [];
          return {
            id: g.id,
            name: g.name,
            required: g.required || false,
            minSelect: g.min_select || 0,
            maxSelect: g.max_select || 1,
            options: groupOpts
          };
        });

        setModifierGroups(combined);
        combined.forEach(g => {
          const def = g.options.find((o: any) => o.isDefault);
          if (def) {
            initialSelections[g.id] = g.maxSelect === 1 ? def : [def];
          }
        });
      } else {
        // Fallback if none in database for this item
        setModifierGroups(FALLBACK_MODIFIERS);
        FALLBACK_MODIFIERS.forEach(g => {
          const def = g.options.find(o => o.isDefault);
          if (def) {
            initialSelections[g.id] = g.maxSelect === 1 ? def : [def];
          }
        });
      }
    } catch (e) {
      console.warn("Failed fetching modifiers. Loading fallback modifier set.");
      setModifierGroups(FALLBACK_MODIFIERS);
      FALLBACK_MODIFIERS.forEach(g => {
        const def = g.options.find(o => o.isDefault);
        if (def) {
          initialSelections[g.id] = g.maxSelect === 1 ? def : [def];
        }
      });
    }

    setSelectedModifiers(initialSelections);
  };

  const handleSelectModifier = (group: any, option: any) => {
    setSelectedModifiers(prev => {
      const current = prev[group.id];
      if (group.maxSelect === 1) {
        return { ...prev, [group.id]: option };
      }
      
      const currentArr = Array.isArray(current) ? current : [];
      const exists = currentArr.some(o => o.id === option.id);
      if (exists) {
        return { ...prev, [group.id]: currentArr.filter(o => o.id !== option.id) };
      } else {
        if (currentArr.length >= group.maxSelect) return prev; // Limit reached
        return { ...prev, [group.id]: [...currentArr, option] };
      }
    });
  };

  const addItemWithModifiersToCart = () => {
    if (!modifierItem) return;

    // Build lists of selections
    const modifierSelections: Array<{ group: string; option: string; price: number }> = [];
    let extraCost = 0;

    Object.entries(selectedModifiers).forEach(([groupId, selection]) => {
      const group = modifierGroups.find(g => g.id === groupId);
      if (!group) return;

      if (Array.isArray(selection)) {
        selection.forEach(o => {
          modifierSelections.push({ group: group.name, option: o.name, price: o.extraPrice });
          extraCost += o.extraPrice;
        });
      } else if (selection) {
        modifierSelections.push({ group: group.name, option: selection.name, price: selection.extraPrice });
        extraCost += selection.extraPrice;
      }
    });

    const itemPrice = modifierItem.price + extraCost;
    
    setCart(prev => {
      // Create a unique cart entry including modifications hash or separate item entries
      const newItem: CartItem = {
        id: modifierItem.id + '_' + Date.now(), // Unique ID in cart
        name: modifierItem.name,
        price: itemPrice,
        qty: 1,
        notes: modifierNotes,
        modifier_selections: modifierSelections
      };
      return [...prev, newItem];
    });

    setModifierItem(null);
  };

  /* ─── Cart Calculations ─── */
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cgstAmt = Math.round(subtotal * (billingSettings.cgstPercent / 100));
  const sgstAmt = Math.round(subtotal * (billingSettings.sgstPercent / 100));
  const gstAmt = cgstAmt + sgstAmt;
  const svcAmt = billingSettings.serviceChargeType === 'flat'
    ? billingSettings.serviceChargeValue
    : Math.round(subtotal * (billingSettings.serviceChargeValue / 100));
  const grandTotal = subtotal + gstAmt + svcAmt;
  const changeDue = cashReceived ? Math.max(0, Number(cashReceived) - grandTotal) : 0;

  /* ─── Cart Actions ─── */
  const addToCart = useCallback((item: any) => {
    if (item.allows_modifiers) {
      openModifiersDrawer(item);
      return;
    }
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev =>
      prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0)
    );
  }, []);

  /* ────────────────────────────────────────────────────────
     3. KITCHEN TRANSACTION DISPATCH
  ──────────────────────────────────────────────────────── */
  const handleLoadActiveOrderToCart = async (tbl: any) => {
    setOrderSubTab('menu');
    if (demoMode) {
      const mockOrd = activeOrdersQueue.find(o => o.table_name === tbl.name && o.status !== 'served' && o.status !== 'billed');
      if (mockOrd) {
        const loaded: CartItem[] = mockOrd.items.map((i: any) => ({
          id: (i.id || 'mock-' + Math.random()) + '_' + Date.now(),
          name: i.itemName,
          price: 100,
          qty: i.quantity,
          notes: i.itemNotes || ''
        }));
        setCart(loaded);
      }
      return;
    }

    try {
      setLoading(true);
      const { data: dbOrders, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('table_id', tbl.id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (orderErr) throw orderErr;

      if (dbOrders && dbOrders.length > 0) {
        const activeOrder = dbOrders[0];
        const { data: dbOrderItems, error: itemsErr } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', activeOrder.id);

        if (itemsErr) throw itemsErr;

        if (dbOrderItems && dbOrderItems.length > 0) {
          const loadedCart: CartItem[] = dbOrderItems.map(i => {
            const baseId = i.menu_item_id || i.id;
            return {
              id: baseId + '_' + Date.now(),
              name: i.item_name,
              price: (i.unit_price || i.unit_price_paise || 0) / 100,
              qty: i.quantity,
              notes: i.notes || '',
              modifier_selections: i.modifiers || []
            };
          });
          setCart(loadedCart);
          setOrderNotes(activeOrder.notes || '');
        } else {
          setCart([]);
          setOrderNotes('');
        }
      } else {
        setCart([]);
        setOrderNotes('');
      }
    } catch (e: any) {
      console.error("Failed to load active order:", e);
      alert("Failed to load active order: " + e.message);
      setCart([]);
      setOrderNotes('');
    } finally {
      setLoading(false);
    }
  };

  const saveOrSubmitOrder = async (targetStatus: 'pending' | 'confirmed', openPayment = false) => {
    if (!selectedTable || cart.length === 0) return;
    setSubmittingOrder(true);

    try {
      if (demoMode) {
        const newMockOrderId = 'ord-' + billCounter;
        const newMockOrder = {
          id: newMockOrderId,
          table_name: selectedTable.name,
          status: targetStatus,
          created_at: new Date().toISOString(),
          items: cart.map(i => ({
            itemName: i.name,
            quantity: i.qty,
            itemNotes: i.notes || '',
            status: targetStatus
          }))
        };

        setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'occupied' } : t));
        setActiveOrdersQueue(prev => [newMockOrder, ...prev]);
        setShiftStats(prev => ({ ...prev, ordersHandled: prev.ordersHandled + 1 }));
        
        if (openPayment) {
          setShowPayment(true);
        } else {
          alert(targetStatus === 'pending' ? "Draft saved successfully! (Demo)" : "Order sent to kitchen! (Demo)");
          if (targetStatus === 'pending') {
            setCart([]);
            setOrderNotes('');
            setSelectedTable(null);
            setActiveTab('tables');
          }
        }
        setSubmittingOrder(false);
        return;
      }

      const subtotalInPaise = Math.round(subtotal * 100);
      const grandTotalInPaise = Math.round(grandTotal * 100);

      const { data: activeOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('tenant_id', profile.tenant_id)
        .eq('table_id', selectedTable.id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed'])
        .limit(1);

      let targetOrderId = '';
      if (activeOrders && activeOrders.length > 0) {
        targetOrderId = activeOrders[0].id;
        const { error: ordErr } = await supabase
          .from('orders')
          .update({
            subtotal: subtotalInPaise,
            total: grandTotalInPaise,
            status: targetStatus,
            notes: orderNotes || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetOrderId);

        if (ordErr) throw ordErr;

        const { error: delErr } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', targetOrderId);

        if (delErr) throw delErr;
      } else {
        const { data: newOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            tenant_id: profile.tenant_id,
            location_id: profile.branch_id,
            table_id: selectedTable.id,
            staff_id: profile.id,
            status: targetStatus,
            subtotal: subtotalInPaise,
            discount_amount: 0,
            total: grandTotalInPaise,
            notes: orderNotes || '',
          })
          .select()
          .single();

        if (orderErr) throw orderErr;
        targetOrderId = newOrder.id;
      }

      const itemsPayload = cart.map(i => {
        const baseItemId = i.id.split('_')[0];
        return {
          order_id: targetOrderId,
          tenant_id: profile.tenant_id,
          menu_item_id: baseItemId.length > 5 ? baseItemId : null,
          quantity: i.qty,
          unit_price: Math.round(i.price * 100),
          item_name: i.name,
          notes: i.notes || '',
          modifiers: i.modifier_selections ?? [],
        };
      });

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsErr) throw itemsErr;

      const { error: tableErr } = await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', selectedTable.id);

      if (tableErr) throw tableErr;

      await refreshOrdersQueue(profile);
      
      if (openPayment) {
        setShowPayment(true);
      } else {
        alert(targetStatus === 'pending' ? "Draft saved successfully!" : "Order sent to kitchen!");
        if (targetStatus === 'pending') {
          setCart([]);
          setOrderNotes('');
          setSelectedTable(null);
          setActiveTab('tables');
        }
      }

    } catch (e: any) {
      console.error("Order submission transaction failed:", e);
      alert("Transaction failed: " + (e.message || String(e)));
    } finally {
      setSubmittingOrder(false);
    }
  };

  const dispatchOrderToKitchen = () => saveOrSubmitOrder('confirmed', false);
  const dispatchSaveDraft = () => saveOrSubmitOrder('pending', false);
  const dispatchSettleBill = () => saveOrSubmitOrder('confirmed', true);

  const processPayment = async () => {
    if (payMethod === 'cash' && (!cashReceived || Number(cashReceived) < grandTotal)) {
      alert('Cash received must be ≥ total amount');
      return;
    }

    try {
      if (!demoMode && selectedTable) {
        const tenantId = profile.tenant_id;
        
        // 1. Get active orders for this table
        const { data: activeOrders, error: activeOrdersErr } = await supabase
          .from('orders')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('table_id', selectedTable.id)
          .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed']);

        if (activeOrdersErr) throw activeOrdersErr;
        const orderIds = (activeOrders || []).map(o => o.id);

        // 2. Fetch active session details from table_sessions
        const { data: activeSession, error: sessionErr } = await supabase
          .from('table_sessions')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('table_id', selectedTable.id)
          .is('check_out_at', null)
          .maybeSingle();

        if (sessionErr) throw sessionErr;

        // 3. Insert bill record
        const { error: billErr } = await supabase
          .from('bills')
          .insert({
            tenant_id: tenantId,
            location_id: profile.branch_id,
            order_ids: orderIds,
            table_number: selectedTable.table_number || parseInt(selectedTable.name.replace(/\D/g, '')) || 0,
            customer_name: activeSession?.customer_name || 'Walk-in Guest',
            customer_phone: activeSession?.customer_phone || null,
            subtotal: Math.round(subtotal * 100),
            cgst: Math.round(cgstAmt * 100),
            sgst: Math.round(sgstAmt * 100),
            discount_amount: 0,
            total: Math.round(grandTotal * 100),
            status: 'paid',
            payment_method: payMethod.toLowerCase(),
            created_by: profile.id,
            paid_at: new Date().toISOString()
          });

        if (billErr) throw billErr;

        // 4. Update orders status to 'paid'
        if (orderIds.length > 0) {
          const { error: ordErr } = await supabase
            .from('orders')
            .update({ status: 'paid' })
            .in('id', orderIds);
          if (ordErr) throw ordErr;
        }

        // 5. Checkout table session
        if (activeSession) {
          const { error: checkoutErr } = await supabase
            .from('table_sessions')
            .update({
              check_out_at: new Date().toISOString(),
              total_revenue: Math.round(grandTotal * 100)
            })
            .eq('id', activeSession.id);
          if (checkoutErr) throw checkoutErr;
        }

        // 6. Update table status to available
        const { error: tableErr } = await supabase
          .from('tables')
          .update({ status: 'available' })
          .eq('id', selectedTable.id);
        if (tableErr) throw tableErr;
      }

      // Update local states
      setShiftStats(prev => ({
        ...prev,
        billsSettled: prev.billsSettled + 1,
        revenueGenerated: prev.revenueGenerated + Math.round(grandTotal)
      }));

      setBillCounter(prev => prev + 1);
      setPaymentSuccess(true);
      setShowPayment(false);

      if (selectedTable) {
        setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'available' } : t));
      }

    } catch (err: any) {
      console.error("Payment settlement failed:", err);
      alert("Payment settlement failed: " + (err.message || String(err)));
    }
  };

  const handleNewOrder = () => {
    setCart([]);
    setOrderNotes('');
    setPaymentSuccess(false);
    setShowPayment(false);
    setCashReceived('');
    setSelectedTable(null);
    setActiveTab('tables');
    setOrderSubTab('menu');
  };

  /* ─── Receipt Data Builder ─── */
  const buildReceiptData = useCallback((): ReceiptData => {
    return {
      billId: `B-00${billCounter}`,
      storeName: DEFAULT_STORE_INFO.storeName,
      storeAddress: DEFAULT_STORE_INFO.storeAddress,
      storePhone: DEFAULT_STORE_INFO.storePhone,
      gstNumber: DEFAULT_STORE_INFO.gstNumber,
      fssaiNumber: DEFAULT_STORE_INFO.fssaiNumber,
      tableName: selectedTable ? selectedTable.name : 'Table 02',
      tableSection: selectedTable ? selectedTable.section : 'Indoor Main',
      items: cart.map(c => ({
        name: c.name,
        qty: c.qty,
        price: c.price,
        total: c.price * c.qty,
      })),
      customCharges: [],
      subtotal,
      gstAmount: gstAmt,
      gstPercent: billingSettings.cgstPercent + billingSettings.sgstPercent,
      cgstPercent: billingSettings.cgstPercent,
      cgstAmount: cgstAmt,
      sgstPercent: billingSettings.sgstPercent,
      sgstAmount: sgstAmt,
      serviceCharge: svcAmt,
      servicePercent: billingSettings.serviceChargeType === 'percent' ? billingSettings.serviceChargeValue : 0,
      serviceChargeType: billingSettings.serviceChargeType,
      discountPercent: 0,
      discountAmount: 0,
      couponCode: '',
      grandTotal,
      paymentMethod: payMethod,
      cashReceived: payMethod === 'cash' ? Number(cashReceived) : undefined,
      changeDue: payMethod === 'cash' ? changeDue : undefined,
      dateTime: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      footerMessage: DEFAULT_STORE_INFO.footerMessage,
    };
  }, [cart, subtotal, gstAmt, cgstAmt, sgstAmt, svcAmt, grandTotal, payMethod, cashReceived, changeDue, billCounter, billingSettings, selectedTable]);

  /* ─── Table Status Quick Updates ─── */
  const updateTableStatusDirect = async (tableId: string, newStatus: string) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
    setTableDrawerOpen(false);

    if (!demoMode) {
      await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', tableId);
    }
  };

  /* ─── Kitchen Queue served handoff actions ─── */
  const completeQueueItem = async (orderId: string, itemIdx: number) => {
    setActiveOrdersQueue(prev => 
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item: any, idx: number) => 
          idx === itemIdx ? { ...item, status: 'served' } : item
        );
        // If all items are served, mark whole order as served
        const allServed = updatedItems.every((i: any) => i.status === 'served');
        return {
          ...order,
          items: updatedItems,
          status: allServed ? 'served' : order.status
        };
      })
    );

    // Update in Supabase if needed (requires fetching the specific order item record ID)
    if (!demoMode) {
      const order = activeOrdersQueue.find(o => o.id === orderId);
      const targetItem = order?.items[itemIdx];
      if (targetItem?.id) {
        await supabase
          .from('order_items')
          .update({ status: 'served' })
          .eq('id', targetItem.id);
      }
    }
  };

  /* ─── Filter Menu ─── */
  const filteredMenu = menuItems.filter(i => {
    const matchCat = activeCat === 'All' || i.category === activeCat;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbf9] flex flex-col items-center justify-center text-stone-700 gap-5">
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-amber-600/10 border-t-amber-600 animate-spin absolute" />
          <Coffee className="w-5 h-5 text-amber-600" />
        </div>
        <span className="font-bold tracking-wider text-xs uppercase text-stone-500 animate-pulse">Syncing Cafe Canva Staff POS...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-stone-800 flex flex-col font-sans overflow-x-hidden pb-16 md:pb-0">
      
      {/* ═══ TOP NAVBAR ═══ */}
      <header className="px-6 py-4 bg-white border-b border-stone-200/80 shadow-sm flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Coffee size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-stone-900 flex items-center gap-2">
              Cafe Canva Staff
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                demoMode 
                  ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
              }`}>
                {demoMode ? 'Demo Mode' : 'Online Sync'}
              </span>
            </h1>
            <p className="text-[11px] text-stone-500 flex items-center gap-1">
              <User size={12} className="text-stone-400" />
              {profile?.name || 'Staff User'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => router.push('/login')}
          className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* ═══ MAIN SCREEN PANELS ═══ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">

        {/* ──────── TAB 1: LIVE TABLES FLOOR PLAN ──────── */}
        {activeTab === 'tables' && (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div>
              <h2 className="text-lg font-black text-stone-900">Live Floor Plan</h2>
              <p className="text-xs text-stone-500 mt-1">Tap a table to manage table status, view covers, or take orders.</p>
            </div>

            {/* Tables Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tables.map(tbl => {
                const statusColors: Record<string, string> = {
                  available: 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400 text-emerald-700',
                  occupied: 'border-rose-200 bg-rose-50/40 hover:border-rose-400 text-rose-700',
                  reserved: 'border-amber-200 bg-amber-50/40 hover:border-amber-400 text-amber-700',
                  cleaning: 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 text-indigo-700'
                };

                const statusBadges: Record<string, string> = {
                  available: 'bg-emerald-100 text-emerald-700 border border-emerald-200/50',
                  occupied: 'bg-rose-100 text-rose-700 border border-rose-200/50',
                  reserved: 'bg-amber-100 text-amber-700 border border-amber-200/50',
                  cleaning: 'bg-indigo-100 text-indigo-700 border border-indigo-200/50'
                };

                return (
                  <button
                    key={tbl.id}
                    onClick={() => {
                      setSelectedTable(tbl);
                      setTableDrawerOpen(true);
                    }}
                    className={`p-5 rounded-2xl border text-left flex flex-col gap-4 transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                      statusColors[tbl.status] || 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-bold text-sm text-stone-800">{tbl.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        statusBadges[tbl.status]
                      }`}>
                        {tbl.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-[11px] text-stone-500">
                      <span className="flex items-center gap-1">
                        👥 Cap: {tbl.capacity || 2}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        📍 {tbl.section || 'Main'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* QUICK STATS PANEL */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {([
                { label: 'Available', count: tables.filter(t => t.status === 'available').length, color: 'text-emerald-700 bg-emerald-100' },
                { label: 'Occupied', count: tables.filter(t => t.status === 'occupied').length, color: 'text-rose-700 bg-rose-100' },
                { label: 'Reserved', count: tables.filter(t => t.status === 'reserved').length, color: 'text-amber-700 bg-amber-100' },
                { label: 'Cleaning', count: tables.filter(t => t.status === 'cleaning').length, color: 'text-indigo-700 bg-indigo-100' }
              ]).map((stat, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-white flex items-center justify-between shadow-sm">
                  <span className="text-xs text-stone-500 font-bold">{stat.label}</span>
                  <span className={`text-base font-black px-2.5 py-0.5 rounded-lg ${stat.color}`}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────── TAB 2: MENU & CART ORDERING ──────── */}
        {activeTab === 'order' && (
          <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            
            {/* Left side: Menu items catalog */}
            <div className="flex-1 flex flex-col gap-4">
              
              {/* Active Selection Info Header */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block font-bold">Active Table Context</span>
                    <span className="font-black text-sm text-stone-900">
                      {selectedTable ? `${selectedTable.name} (${selectedTable.section})` : 'Select a table to start ordering'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedTable(null);
                    setActiveTab('tables');
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  Change Table
                </button>
              </div>

              {selectedTable && (
                /* Mobile toggle for Menu vs Cart */
                <div className="flex md:hidden bg-stone-100 p-1.5 rounded-xl border border-stone-200 w-full mb-1">
                  <button
                    onClick={() => setOrderSubTab('menu')}
                    type="button"
                    className={`flex-1 py-2.5 rounded-lg font-black text-center text-xs transition-all cursor-pointer ${
                      orderSubTab === 'menu' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Menu Catalog
                  </button>
                  <button
                    onClick={() => setOrderSubTab('cart')}
                    type="button"
                    className={`flex-1 py-2.5 rounded-lg font-black text-center text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      orderSubTab === 'cart' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-750'
                    }`}
                  >
                    <ShoppingBag size={14} /> View Cart ({cart.reduce((s, i) => s + i.qty, 0)})
                  </button>
                </div>
              )}

              <div className={selectedTable ? (orderSubTab === 'menu' ? 'flex flex-col gap-4' : 'hidden md:flex md:flex-col md:gap-4') : 'flex flex-col gap-4'}>
                {selectedTable ? (
                  <>
                    {/* Category Filter and Search */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      {/* Search */}
                      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-stone-200 w-full sm:max-w-xs shadow-sm">
                        <Search className="text-stone-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search menu..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="bg-transparent border-none outline-none w-full font-semibold text-xs text-stone-800 placeholder-stone-450"
                        />
                      </div>

                      {/* Quick Settings shortcut */}
                      <span className="text-xs text-stone-500 font-bold hidden sm:inline">
                        GST ({billingSettings.cgstPercent + billingSettings.sgstPercent}%) + SVC ({billingSettings.serviceChargeValue}%) applied
                      </span>
                    </div>

                    {/* Categories Row */}
                    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                      {['All', ...categories].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCat(cat)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                            activeCat === cat
                              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10'
                              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Menu Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {filteredMenu.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className="bg-white border border-stone-200/80 hover:border-amber-600/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center aspect-square transition-all hover:scale-[1.02] hover:shadow-md group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-amber-50 mb-3 flex items-center justify-center text-amber-700 border border-amber-200/50 group-hover:scale-110 transition-transform">
                            <Coffee size={20} />
                          </div>
                          <span className="font-bold text-xs text-stone-800 mb-1 leading-tight group-hover:text-amber-700 transition-colors">{item.name}</span>
                          <span className="text-stone-600 text-xs font-bold">₹{item.price}</span>
                          {item.allows_modifiers && (
                            <span className="text-[9px] mt-1.5 px-2 py-0.5 rounded bg-stone-100 text-amber-700 font-bold flex items-center gap-1">
                              <Sparkles size={8} /> Modifiers
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-dashed border-stone-300 rounded-2xl bg-stone-50/50">
                    <ShoppingBag size={48} className="text-stone-400 mb-4" />
                    <h3 className="font-black text-stone-850 text-base">No Table Active</h3>
                    <p className="text-xs text-stone-550 max-w-xs mt-1">Please select an active table on the live floor plan tab before adding items.</p>
                    <button
                      onClick={() => setActiveTab('tables')}
                      className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-600/10"
                    >
                      Go to Floor Plan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Shopping Cart order overview */}
            {selectedTable && (
              <div className={`w-full md:w-80 flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden self-start shadow-sm ${
                orderSubTab === 'cart' ? 'flex' : 'hidden md:flex'
              }`}>
                <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-amber-600" />
                    Table Cart
                  </h3>
                  <span className="text-[10px] font-bold text-stone-600 bg-stone-200/60 px-2.5 py-0.5 rounded-full">
                    Items: {cart.length}
                  </span>
                </div>

                {/* Cart Items List */}
                <div className="p-4 flex-1 max-h-[300px] overflow-y-auto space-y-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-stone-400">
                      <Receipt size={32} className="mb-2 opacity-35" />
                      <span className="text-xs font-bold">Cart is empty</span>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex justify-between items-start border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex-1 flex flex-col gap-1 pr-2">
                          <span className="font-bold text-xs text-stone-800 leading-tight">{item.name}</span>
                          
                          {/* Modifiers selected render */}
                          {item.modifier_selections && item.modifier_selections.length > 0 && (
                            <div className="flex flex-col text-[10px] text-stone-500 gap-0.5 mt-0.5">
                              {item.modifier_selections.map((sel, idx) => (
                                <span key={idx} className="flex items-center gap-1 text-amber-700">
                                  • {sel.group}: {sel.option} (+₹{sel.price})
                                </span>
                              ))}
                            </div>
                          )}

                          {item.notes && (
                            <span className="text-[10px] italic text-stone-400 mt-1 block">
                              ✏️ "{item.notes}"
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 mt-2">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-black flex items-center justify-center text-xs transition-colors"
                            >
                              −
                            </button>
                            <span className="text-xs font-bold text-stone-850 min-w-[16px] text-center">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-black flex items-center justify-center text-xs transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex flex-col gap-1">
                          <span className="font-black text-xs text-stone-900">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotals & Submit */}
                {cart.length > 0 && (
                  <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3.5">
                    
                    {/* Cooking/Order Notes */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Overall Kitchen Instructions</label>
                      <input 
                        type="text"
                        placeholder="e.g. deliver starters first..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1.5 pt-2 text-[11px] text-stone-500 border-t border-stone-200">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes ({(billingSettings.cgstPercent + billingSettings.sgstPercent)}%)</span>
                        <span>₹{gstAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Charge ({billingSettings.serviceChargeType === 'percent' ? `${billingSettings.serviceChargeValue}%` : `₹${billingSettings.serviceChargeValue}`})</span>
                        <span>₹{svcAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                        <span>Grand Total</span>
                        <span className="text-amber-700">₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={dispatchSaveDraft}
                          disabled={submittingOrder}
                          className="flex-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 disabled:opacity-40 text-stone-750 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Save Draft
                        </button>
                        <button
                          onClick={dispatchOrderToKitchen}
                          disabled={submittingOrder}
                          className="flex-[2] bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-md shadow-amber-600/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {submittingOrder ? (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-stone-200 border-t-amber-600 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Check size={16} /> Send to Kitchen
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={dispatchSettleBill}
                        disabled={submittingOrder}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CreditCard size={16} /> Settle Bill / Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ──────── TAB 3: KITCHEN ORDER QUEUE ──────── */}
        {activeTab === 'queue' && (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-stone-900">Kitchen Order Dispatch Queue</h2>
                <p className="text-xs text-stone-500 mt-1">Track preparations in the KDS. Mark ready items as served below.</p>
              </div>
              <button
                onClick={() => refreshOrdersQueue(profile)}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw size={14} /> Reload Queue
              </button>
            </div>

            {activeOrdersQueue.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-stone-300 rounded-2xl bg-stone-50/50">
                <Clock size={48} className="text-stone-400 mx-auto mb-3" />
                <h3 className="font-bold text-stone-850 text-sm">No Active Orders</h3>
                <p className="text-xs text-stone-500 mt-1">All orders are completed, billed, or voided.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOrdersQueue.map(order => {
                  const statusColors: Record<string, string> = {
                    pending: 'border-amber-200 bg-amber-50/40 text-amber-800',
                    preparing: 'border-amber-300 bg-amber-50/70 text-amber-900',
                    ready: 'border-emerald-200 bg-emerald-50/40 text-emerald-800',
                    served: 'border-stone-200 bg-stone-50/50 opacity-60'
                  };

                  const badges: Record<string, string> = {
                    pending: 'bg-amber-100 text-amber-800 border-amber-200',
                    preparing: 'bg-amber-100 text-amber-900 border-amber-300',
                    ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    served: 'bg-stone-100 text-stone-600 border-stone-200'
                  };

                  return (
                    <div 
                      key={order.id}
                      className={`p-5 rounded-2xl border-2 flex flex-col gap-4 transition-all shadow-sm ${
                        statusColors[order.status] || 'border-stone-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <span className="font-black text-sm text-stone-900">{order.table_name}</span>
                          <span className="text-[10px] text-stone-500 block mt-0.5 font-bold">
                            OrderID: {order.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                            badges[order.status]
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered list */}
                      <div className="space-y-3.5 border-t border-stone-200/80 pt-3.5">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start gap-4 text-xs">
                            <div className="flex-1">
                              <div className="font-bold text-stone-850 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-stone-100 font-black text-amber-700">
                                  {item.quantity}x
                                </span>
                                {item.itemName}
                              </div>
                              {item.itemNotes && (
                                <span className="text-[10px] italic text-stone-400 ml-6 block mt-0.5">
                                  ✏️ "{item.itemNotes}"
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {item.status === 'ready' ? (
                                <button
                                  onClick={() => completeQueueItem(order.id, idx)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Check size={10} /> Serve Item
                                </button>
                              ) : (
                                <span className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                                  badges[item.status] || 'bg-stone-100 text-stone-600'
                                }`}>
                                  {item.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] text-stone-400 flex justify-between items-center border-t border-stone-200 pt-3 mt-1.5">
                        <span>Placed: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{Math.round((Date.now() - new Date(order.created_at).getTime()) / 1000 / 60)}m ago</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────── TAB 4: PERSONAL SHIFT STATS ──────── */}
        {activeTab === 'performance' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div>
              <h2 className="text-lg font-black text-stone-900">Shift Performance Stats</h2>
              <p className="text-xs text-stone-500 mt-1">Track your orders handled, table durations, and shift performance metrics.</p>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Orders Placed', val: shiftStats.ordersHandled, unit: 'Today', icon: <ShoppingBag size={20} />, color: 'text-amber-700 border-amber-200 bg-amber-50/50' },
                { label: 'Covers Settled', val: shiftStats.billsSettled, unit: 'Tables', icon: <Check size={20} />, color: 'text-emerald-700 border-emerald-200 bg-emerald-50/50' },
                { label: 'Revenue Generated', val: `₹${shiftStats.revenueGenerated.toLocaleString()}`, unit: 'Total', icon: <TrendingUp size={20} />, color: 'text-indigo-700 border-indigo-200 bg-indigo-50/50' },
                { label: 'Tips Received', val: `₹${shiftStats.tipsReceived}`, unit: 'Tips', icon: <Sparkles size={20} />, color: 'text-amber-700 border-amber-200 bg-amber-50/50' }
              ].map((stat, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-sm ${stat.color}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{stat.label}</span>
                    {stat.icon}
                  </div>
                  <div>
                    <span className="text-2xl font-black text-stone-900 block tracking-tight">{stat.val}</span>
                    <span className="text-[10px] text-stone-400 font-bold block mt-0.5">{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* LEADERBOARD/LOG SECTION */}
            <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm">
              <h3 className="font-black text-sm text-stone-900 mb-4 flex items-center gap-2">
                <Shield size={16} className="text-amber-600" />
                Shift Activity Log
              </h3>
              
              <div className="space-y-4">
                {([
                  { action: 'Order dispatched', time: '10 min ago', details: 'cappuccino x2, Avocado Toast to Table 02' },
                  { action: 'Bill generated', time: '25 min ago', details: '₹1,240 settled for Table 04 via Card' },
                  { action: 'Table Settle request', time: '40 min ago', details: 'Table 12 Settle triggered' }
                ]).map((log, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-stone-850 block leading-tight">{log.action}</span>
                      <span className="text-[10px] text-stone-400 mt-1 block">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-bold whitespace-nowrap">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ MOCK CHECKOUT PAYMENT DRAWER / MODAL ═══ */}
      {showPayment && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-stone-150 pb-4">
              <h3 className="text-base font-black text-stone-900">Select Checkout Payment</h3>
              <button
                onClick={() => setShowPayment(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-3">
              {([
                { method: 'cash' as const, icon: <Banknote size={18} />, label: 'Cash' },
                { method: 'card' as const, icon: <CreditCard size={18} />, label: 'Card' },
                { method: 'upi' as const, icon: <Smartphone size={18} />, label: 'UPI' },
              ]).map(pm => (
                <button
                  key={pm.method}
                  onClick={() => setPayMethod(pm.method)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                    payMethod === pm.method
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  {pm.icon}
                  {pm.label}
                </button>
              ))}
            </div>

            {payMethod === 'cash' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Cash Received Amount (₹)</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xl font-bold text-center text-stone-800 outline-none focus:border-amber-600 transition-all"
                />
                {cashReceived && Number(cashReceived) >= grandTotal && (
                  <div className="text-center text-emerald-700 font-bold text-xs mt-2">
                    Change Due: ₹{(Number(cashReceived) - grandTotal).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3.5 rounded-xl text-xs transition-all"
              >
                Continue Editing
              </button>
              <button
                onClick={async () => {
                  setShowPayment(false);
                  await dispatchSaveDraft();
                }}
                className="flex-1 bg-stone-50 hover:bg-stone-100 border border-stone-250 text-stone-700 font-bold py-3.5 rounded-xl text-xs transition-all"
              >
                Save Draft
              </button>
              <button
                onClick={processPayment}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer"
              >
                Confirm Settle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PAYMENT SUCCESS BANNER ═══ */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-250 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-2 animate-bounce">
              <Check size={32} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-700">Payment Processed Successfully!</h3>
              <p className="text-xs text-stone-500 mt-1">Bill settled · {payMethod.toUpperCase()}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-stone-50 w-full flex flex-col gap-1.5 text-xs text-stone-600 border border-stone-200">
              <div className="flex justify-between">
                <span>Grand Total Paid</span>
                <span className="font-bold text-stone-900">₹{grandTotal.toLocaleString()}</span>
              </div>
              {payMethod === 'cash' && changeDue > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Change Handed Over</span>
                  <span>₹{changeDue.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                onClick={handleNewOrder}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3.5 rounded-xl text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FLOATING CART INDICATOR ON MOBILE ═══ */}
      {cart.length > 0 && activeTab === 'tables' && (
        <button
          onClick={() => setActiveTab('order')}
          className="fixed bottom-20 left-4 right-4 md:hidden bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black py-4 rounded-2xl flex items-center justify-between px-6 shadow-xl shadow-amber-600/20 animate-bounce z-40 cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs">
            <ShoppingBag size={18} /> Order Cart ({cart.reduce((s, i) => s + i.qty, 0)} items)
          </span>
          <span className="text-sm font-black">View Cart & Settle →</span>
        </button>
      )}

      {/* ═══ FLOATING CART INDICATOR ON MOBILE FOR ORDER TAB ═══ */}
      {cart.length > 0 && activeTab === 'order' && orderSubTab === 'menu' && (
        <button
          onClick={() => setOrderSubTab('cart')}
          className="fixed bottom-20 left-4 right-4 md:hidden bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black py-4 rounded-2xl flex items-center justify-between px-6 shadow-xl shadow-emerald-600/20 animate-bounce z-40 cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs">
            <ShoppingBag size={18} /> Cart ({cart.reduce((s, i) => s + i.qty, 0)} items) · ₹{subtotal.toLocaleString()}
          </span>
          <span className="text-sm font-black">Proceed to Settle →</span>
        </button>
      )}

      {/* ═══ TABLE QUICK DETAILS DRAWER (BOTTOM SHEET) ═══ */}
      {tableDrawerOpen && selectedTable && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setTableDrawerOpen(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white border-t border-stone-200 rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-5 animate-in slide-in-from-bottom duration-200 shadow-2xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-stone-900">{selectedTable.name} Details</h3>
                <span className="text-[10px] text-stone-500 font-bold mt-0.5 block">
                  📍 {selectedTable.section} · Capacity: {selectedTable.capacity} covers
                </span>
              </div>
              <button 
                onClick={() => setTableDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[9px] text-stone-400 font-bold block uppercase tracking-wider">Current Status</span>
                <span className="font-bold text-xs text-stone-850 block mt-1 uppercase tracking-tight">
                  {selectedTable.status}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[9px] text-stone-400 font-bold block uppercase tracking-wider">Active Covers</span>
                <span className="font-bold text-xs text-stone-850 block mt-1">
                  {selectedTable.status === 'occupied' ? selectedTable.capacity : 0} covers
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              {selectedTable.status === 'occupied' ? (
                <button
                  onClick={async () => {
                    setTableDrawerOpen(false);
                    await handleLoadActiveOrderToCart(selectedTable);
                    setActiveTab('order');
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/10 cursor-pointer"
                >
                  <Clock size={16} /> Continue / Edit Order
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCart([]);
                    setOrderNotes('');
                    setTableDrawerOpen(false);
                    setActiveTab('order');
                    setOrderSubTab('menu');
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/10 cursor-pointer"
                >
                  <Plus size={16} /> Take New Order
                </button>
              )}
              
              <div className="flex gap-2 w-full">
                {selectedTable.status !== 'available' && (
                  <button
                    onClick={() => updateTableStatusDirect(selectedTable.id, 'available')}
                    className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-2.5 rounded-xl text-[11px] transition-all cursor-pointer"
                  >
                    Mark Available 🟢
                  </button>
                )}
                {selectedTable.status !== 'occupied' && (
                  <button
                    onClick={() => updateTableStatusDirect(selectedTable.id, 'occupied')}
                    className="flex-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold py-2.5 rounded-xl text-[11px] transition-all cursor-pointer"
                  >
                    Mark Occupied 🔴
                  </button>
                )}
              </div>
              
              <div className="flex gap-2 w-full">
                {selectedTable.status !== 'reserved' && (
                  <button
                    onClick={() => updateTableStatusDirect(selectedTable.id, 'reserved')}
                    className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold py-2.5 rounded-xl text-[11px] transition-all cursor-pointer"
                  >
                    Mark Reserved 🟡
                  </button>
                )}
                {selectedTable.status !== 'cleaning' && (
                  <button
                    onClick={() => updateTableStatusDirect(selectedTable.id, 'cleaning')}
                    className="flex-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold py-2.5 rounded-xl text-[11px] transition-all cursor-pointer"
                  >
                    Mark Cleaning 🟣
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODIFIER DRAWER SHEET ═══ */}
      {modifierItem && (
        <div 
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-end justify-center"
          onClick={() => setModifierItem(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white border-t border-stone-200 rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider">Customize Item</span>
                <h3 className="text-base font-black text-stone-900">{modifierItem.name}</h3>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{modifierItem.description}</p>
              </div>
              <button 
                onClick={() => setModifierItem(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Render modifier groups */}
            <div className="space-y-5 my-2">
              {modifierGroups.map(group => (
                <div key={group.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-stone-800 uppercase tracking-wide">
                      {group.name} 
                      {group.required && <span className="text-amber-600 ml-1 font-bold">*Required</span>}
                    </span>
                    <span className="text-[10px] text-stone-500 font-bold">
                      {group.maxSelect === 1 ? 'Select 1' : `Select up to ${group.maxSelect}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt: any) => {
                      const sel = selectedModifiers[group.id];
                      const isSelected = group.maxSelect === 1 
                        ? sel?.id === opt.id
                        : Array.isArray(sel) && sel.some(o => o.id === opt.id);

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectModifier(group, opt)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-amber-600 bg-amber-50 text-amber-700' 
                              : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          {opt.name} {opt.extraPrice > 0 && `(+₹${opt.extraPrice})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Modifier Cooking Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-black text-stone-850 uppercase tracking-wide">Custom Item Notes</label>
                <input
                  type="text"
                  placeholder="e.g. extra foam, sugar-free..."
                  value={modifierNotes}
                  onChange={(e) => setModifierNotes(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <button
              onClick={addItemWithModifiersToCart}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3.5 rounded-xl text-xs shadow-md shadow-amber-600/20 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              Add to Cart · ₹{(modifierItem.price + Object.entries(selectedModifiers).reduce((acc, [gId, sel]) => {
                if (Array.isArray(sel)) return acc + sel.reduce((sub, o) => sub + o.extraPrice, 0);
                return acc + (sel ? sel.extraPrice : 0);
              }, 0)).toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* ═══ RECEIPT PREVIEW MODAL ═══ */}
      <ReceiptPreviewModal
        show={showReceipt}
        onClose={() => setShowReceipt(false)}
        data={buildReceiptData()}
      />

      {/* ═══ BOTTOM MOBILE TAB NAV BAR ═══ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-stone-200 flex justify-around py-3 z-45 md:hidden backdrop-blur-md">
        {[
          { tab: 'tables' as const, label: 'Floor Plan', icon: <Grid2x2 size={18} /> },
          { tab: 'order' as const, label: 'Take Order', icon: <ShoppingBag size={18} /> },
          { tab: 'queue' as const, label: 'KDS Queue', icon: <Clock size={18} /> },
          { tab: 'performance' as const, label: 'Self Stats', icon: <User size={18} /> }
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === item.tab ? 'text-amber-600' : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-black">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ═══ DESKTOP TAB NAV SIDEBAR ═══ */}
      <div className="hidden md:flex fixed top-[73px] bottom-0 left-0 w-24 bg-white border-r border-stone-200 flex-col items-center py-6 gap-6 z-30">
        {[
          { tab: 'tables' as const, label: 'Floor Plan', icon: <Grid2x2 size={20} /> },
          { tab: 'order' as const, label: 'Take Order', icon: <ShoppingBag size={20} /> },
          { tab: 'queue' as const, label: 'KDS Queue', icon: <Clock size={20} /> },
          { tab: 'performance' as const, label: 'Self Stats', icon: <User size={20} /> }
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:bg-stone-50 ${
              activeTab === item.tab 
                ? 'bg-amber-50 border border-amber-200 text-amber-600' 
                : 'border border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-bold mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ DESKTOP ADJUST PADDING ═══ */}
      <div className="hidden md:block pl-24" />
    </div>
  );
}
