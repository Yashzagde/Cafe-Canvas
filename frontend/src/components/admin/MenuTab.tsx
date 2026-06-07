import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Card, Btn, Input, Sel, Modal, StatusBadge, T, ff, fm
} from './UIPrimitives';

interface MenuItem {
  id: string;
  name: string;
  price: number; // in rupees
  cat: string;
  status: 'available' | 'unavailable' | 'hidden';
  desc: string;
}

interface MenuTabProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  dbPending: boolean;
  tenantId: string;
}

const MENU_CAT = ["All", "Coffee", "Tea", "Food", "Bakery", "Drinks"];

export default function MenuTab({
  toast,
  menu,
  setMenu,
  dbPending,
  tenantId
}: MenuTabProps) {
  const supabase = createClient();
  const [cat, setCat] = useState("All");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: "", price: 0, cat: "Coffee", status: "available", desc: "" });
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = menu.filter(i => (cat === "All" || i.cat === cat) && (!search || i.name.toLowerCase().includes(search.toLowerCase())));

  const toggle = async (id: string) => {
    const target = menu.find(i => i.id === id);
    if (!target) return;
    const nextStatus = target.status === "available" ? "unavailable" : "available";
    const nextAvailable = nextStatus === "available";

    try {
      if (!dbPending) {
        const { error } = await supabase
          .from('menu_items')
          .update({ is_available: nextAvailable })
          .eq('id', id);
        if (error) throw error;
      }
      setMenu(p => p.map(i => i.id === id ? { ...i, status: nextStatus } : i));
      toast("Item availability updated", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      if (!dbPending) {
        const { data: catData } = await supabase
          .from('menu_categories')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('name', editItem.cat)
          .maybeSingle();

        const { error } = await supabase
          .from('menu_items')
          .update({
            name: editItem.name,
            price: Math.round(editItem.price * 100),
            is_available: editItem.status === 'available',
            description: editItem.desc,
            category_id: catData?.id || null
          })
          .eq('id', editItem.id);
        
        if (error) throw error;
      }

      setMenu(p => p.map(i => i.id === editItem.id ? editItem : i));
      setEditItem(null);
      toast("Menu item saved successfully", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.price) { toast("Name and price are required", "error"); return; }
    
    try {
      let insertedId = "m" + Date.now();
      
      if (!dbPending) {
        let { data: catData } = await supabase
          .from('menu_categories')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('name', newItem.cat)
          .maybeSingle();

        let categoryId = catData?.id;

        if (!categoryId) {
          const { data: newCat, error: catErr } = await supabase
            .from('menu_categories')
            .insert({ tenant_id: tenantId, name: newItem.cat, is_visible: true })
            .select('id')
            .single();
          if (catErr) throw catErr;
          categoryId = newCat.id;
        }

        const { data: insertedItem, error } = await supabase
          .from('menu_items')
          .insert({
            tenant_id: tenantId,
            name: newItem.name,
            price: Math.round(newItem.price * 100),
            is_available: newItem.status === 'available',
            description: newItem.desc,
            category_id: categoryId
          })
          .select('id')
          .single();

        if (error) throw error;
        insertedId = insertedItem.id;
      }

      setMenu(p => [...p, { ...newItem, id: insertedId, price: Number(newItem.price) } as MenuItem]);
      setShowAdd(false);
      setNewItem({ name: "", price: 0, cat: "Coffee", status: "available", desc: "" });
      toast("Menu item added!", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      if (!dbPending) {
        const { error } = await supabase
          .from('menu_items')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      }

      setMenu(p => p.filter(i => i.id !== id));
      setDelId(null);
      toast("Item removed from menu", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Menu Management</h2>
          <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Configure categories, items, modifiers, and pricing</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}>+ Add Menu Item</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
        <Card style={{ padding: "16px", height: "fit-content" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Categories</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {MENU_CAT.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{
                  textAlign: "left", padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: ff,
                  fontSize: "12px", fontWeight: 600, transition: "all 0.12s",
                  background: cat === c ? T.iA(0.15) : "transparent",
                  color: cat === c ? T.tx : T.mu2
                }}>
                {c}
                <span style={{ float: "right", fontSize: "10px", color: T.mu }}>
                  {c === "All" ? menu.length : menu.filter(i => i.cat === c).length}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <div style={{ gridColumn: "span 3" }}>
          <div style={{ marginBottom: "14px" }}>
            <Input placeholder="Search menu items…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <Card style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ color: T.mu, fontSize: "13px" }}>No items found</div>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {filtered.map(item => (
                <Card key={item.id} style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{
                    height: "80px", background: `linear-gradient(135deg,${T.iA(0.12)},rgba(16,185,129,0.08))`,
                    padding: "12px", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative"
                  }}>
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <StatusBadge s={item.status === "available" ? "available" : "unavailable"} />
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: T.iA(0.9), textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.cat}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: T.tx, marginTop: "2px" }}>{item.name}</div>
                  </div>
                  <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <p style={{ fontSize: "10px", color: T.mu2, lineHeight: 1.4, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", width: "100%" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: T.tx, fontFamily: fm }}>₹{item.price.toFixed(2)}</span>
                      <div style={{ display: "flex", gap: "5px", marginLeft: "auto" }}>
                        <Btn size="sm" variant="ghost" onClick={() => toggle(item.id)}>
                          {item.status === "available" ? "Disable" : "Enable"}
                        </Btn>
                        <Btn size="sm" variant="outline" onClick={() => setEditItem({ ...item })}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => setDelId(item.id)}>✕</Btn>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={!!editItem} onClose={() => setEditItem(null)} title="Edit Menu Item">
        {editItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Input label="Item Name" value={editItem.name} onChange={e => setEditItem(p => (p ? { ...p, name: e.target.value } : null))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input label="Price (₹)" type="number" value={editItem.price} onChange={e => setEditItem(p => (p ? { ...p, price: Number(e.target.value) } : null))} />
              <Sel label="Status" value={editItem.status} onChange={e => setEditItem(p => (p ? { ...p, status: e.target.value as any } : null))}>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="hidden">Hidden</option>
              </Sel>
            </div>
            <Input label="Description" value={editItem.desc} onChange={e => setEditItem(p => (p ? { ...p, desc: e.target.value } : null))} />
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <Btn onClick={saveEdit} fullWidth>Save Changes</Btn>
              <Btn variant="ghost" onClick={() => setEditItem(null)} fullWidth>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Add Menu Item">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Item Name" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Flat White" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input label="Price (₹)" type="number" value={newItem.price || ''} onChange={e => setNewItem(p => ({ ...p, price: Number(e.target.value) }))} placeholder="0" />
            <Sel label="Category" value={newItem.cat} onChange={e => setNewItem(p => ({ ...p, cat: e.target.value }))}>
              {["Coffee", "Tea", "Food", "Bakery", "Drinks"].map(c => <option key={c}>{c}</option>)}
            </Sel>
          </div>
          <Input label="Description" value={newItem.desc} onChange={e => setNewItem(p => ({ ...p, desc: e.target.value }))} placeholder="Short description…" />
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addItem} fullWidth>Add Item</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal show={!!delId} onClose={() => setDelId(null)} title="Confirm Delete">
        <p style={{ fontSize: "13px", color: T.mu2, marginBottom: "20px" }}>
          This will permanently remove the item from your menu. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn variant="rose" onClick={() => delId && deleteItem(delId)} fullWidth>Delete Item</Btn>
          <Btn variant="ghost" onClick={() => setDelId(null)} fullWidth>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}
