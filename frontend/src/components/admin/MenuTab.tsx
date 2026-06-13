import React, { useState, useEffect } from 'react';
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
  image_url?: string | null;
}

interface MenuTabProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  dbPending: boolean;
  tenantId: string;
}

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
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: "", price: 0, cat: "Coffee", status: "available", desc: "", image_url: null });
  const [delId, setDelId] = useState<string | null>(null);

  // Dynamic Categories states
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editCategory, setEditCategory] = useState<{ id: string; name: string } | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load categories from database
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .order('name', { ascending: true });
      if (error) throw error;
      setDbCategories(data || []);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadCategories();
    }
  }, [tenantId]);

  // Derived category list (All + dynamic database categories)
  const categoryNames = ["All", ...dbCategories.map(c => c.name)];

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
            category_id: catData?.id || null,
            image_url: editItem.image_url || null
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
            category_id: categoryId,
            image_url: newItem.image_url || null
          })
          .select('id')
          .single();

        if (error) throw error;
        insertedId = insertedItem.id;
      }

      setMenu(p => [...p, { ...newItem, id: insertedId, price: Number(newItem.price) } as MenuItem]);
      setShowAdd(false);
      setNewItem({ name: "", price: 0, cat: dbCategories[0]?.name || "Coffee", status: "available", desc: "", image_url: null });
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

  // Add Category Handler
  const handleAddCategory = async (catName: string) => {
    if (!catName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({
          tenant_id: tenantId,
          name: catName,
          is_visible: true
        })
        .select()
        .single();
      if (error) throw error;
      setDbCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast("Category added successfully!", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  // Rename Category Handler
  const saveRenameCategory = async () => {
    if (!editCategory || !editCategory.name.trim()) return;
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({ name: editCategory.name })
        .eq('id', editCategory.id);
      if (error) throw error;

      // Update local state
      const oldName = dbCategories.find(dc => dc.id === editCategory.id)?.name;
      setDbCategories(p => p.map(dc => dc.id === editCategory.id ? editCategory : dc));
      
      // Update menu items locally that use this category
      if (oldName) {
        setMenu(p => p.map(i => i.cat === oldName ? { ...i, cat: editCategory.name } : i));
        if (cat === oldName) setCat(editCategory.name);
      }
      setEditCategory(null);
      toast("Category renamed successfully!", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  // Delete Category Handler
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      const oldName = dbCategories.find(dc => dc.id === id)?.name;
      setDbCategories(p => p.filter(dc => dc.id !== id));
      if (oldName) {
        // Move local menu items in this category to Uncategorized
        setMenu(p => p.map(i => i.cat === oldName ? { ...i, cat: "Uncategorized" } : i));
        if (cat === oldName) setCat("All");
      }
      setDeleteCatId(null);
      toast("Category deleted successfully!", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `menu-item-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      if (mode === 'add') {
        setNewItem(p => ({ ...p, image_url: publicUrl }));
      } else {
        setEditItem(p => p ? { ...p, image_url: publicUrl } : null);
      }
      toast("Image uploaded successfully!", "success");
    } catch (err: any) {
      toast("Upload failed: " + err.message, "error");
    } finally {
      setUploadingImage(false);
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
        {/* Categories Sidebar */}
        <Card style={{ padding: "16px", height: "fit-content" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>Categories</span>
            <button 
              onClick={() => setShowAddCat(true)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 800, color: T.ind }}
              title="Add Category"
            >
              + Add
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {categoryNames.map(c => (
              <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px", width: "100%" }}>
                <button onClick={() => setCat(c)}
                  style={{
                    flex: 1, textAlign: "left", padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: ff,
                    fontSize: "12px", fontWeight: 600, transition: "all 0.12s",
                    background: cat === c ? T.iA(0.15) : "transparent",
                    color: cat === c ? T.tx : T.mu2
                  }}>
                  {c}
                  <span style={{ float: "right", fontSize: "10px", color: T.mu, marginLeft: "6px" }}>
                    {c === "All" ? menu.length : menu.filter(i => i.cat === c).length}
                  </span>
                </button>
                
                {c !== "All" && (
                  <div style={{ display: "flex", gap: "2px" }}>
                    <button 
                      onClick={() => {
                        const catObj = dbCategories.find(dc => dc.name === c);
                        if (catObj) setEditCategory(catObj);
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "10px", padding: "4px", color: T.mu }}
                      title="Rename Category"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => {
                        const catObj = dbCategories.find(dc => dc.name === c);
                        if (catObj) setDeleteCatId(catObj.id);
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "10px", padding: "4px", color: "red" }}
                      title="Delete Category"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Menu Items Grid */}
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
                    height: "100px", 
                    backgroundImage: item.image_url ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.65)), url(${item.image_url})` : `linear-gradient(135deg,${T.iA(0.12)},rgba(16,185,129,0.08))`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: "12px", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative"
                  }}>
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <StatusBadge s={item.status === "available" ? "available" : "unavailable"} />
                    </div>
                    <div style={{ 
                      fontSize: "10px", fontWeight: 700, 
                      color: item.image_url ? '#ffffffd0' : T.iA(0.9), 
                      textTransform: "uppercase", letterSpacing: "0.06em" 
                    }}>{item.cat}</div>
                    <div style={{ 
                      fontSize: "13px", fontWeight: 800, 
                      color: item.image_url ? '#ffffff' : T.tx, 
                      marginTop: "2px" 
                    }}>{item.name}</div>
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

      {/* Dynamic Category Modals */}
      <Modal show={showAddCat} onClose={() => setShowAddCat(false)} title="Add Category">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input 
            label="Category Name" 
            value={newCatName} 
            onChange={e => setNewCatName(e.target.value)} 
            placeholder="e.g. Desserts" 
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={async () => {
              await handleAddCategory(newCatName);
              setShowAddCat(false);
              setNewCatName("");
            }} fullWidth>Add Category</Btn>
            <Btn variant="ghost" onClick={() => setShowAddCat(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>

      <Modal show={!!editCategory} onClose={() => setEditCategory(null)} title="Rename Category">
        {editCategory && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Input 
              label="Category Name" 
              value={editCategory.name} 
              onChange={e => setEditCategory(p => p ? { ...p, name: e.target.value } : null)} 
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <Btn onClick={saveRenameCategory} fullWidth>Save Changes</Btn>
              <Btn variant="ghost" onClick={() => setEditCategory(null)} fullWidth>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal show={!!deleteCatId} onClose={() => setDeleteCatId(null)} title="Confirm Delete Category">
        <p style={{ fontSize: "13px", color: T.mu2, marginBottom: "20px" }}>
          Are you sure you want to delete this category? Any items in this category will be moved to "Uncategorized".
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn variant="danger" onClick={() => deleteCatId && deleteCategory(deleteCatId)} fullWidth>Delete Category</Btn>
          <Btn variant="ghost" onClick={() => setDeleteCatId(null)} fullWidth>Cancel</Btn>
        </div>
      </Modal>

      {/* Edit Item Modal */}
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
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Sel label="Category" value={editItem.cat} onChange={e => setEditItem(p => (p ? { ...p, cat: e.target.value } : null))}>
                {dbCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </Sel>
              
              {/* Item Image Upload */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: T.mu, letterSpacing: "0.06em" }}>Item Image</label>
                {editItem.image_url ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", padding: "6px", borderRadius: "8px", border: `1px solid ${T.bdr}` }}>
                    <img src={editItem.image_url} alt="Item Preview" style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "6px" }} />
                    <button
                      type="button"
                      onClick={() => setEditItem(p => p ? { ...p, image_url: null } : null)}
                      style={{ background: "none", border: "none", color: "red", cursor: "pointer", fontSize: "10px", fontWeight: 705, padding: 0 }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ position: "relative", border: `1px dashed ${T.bdr}`, borderRadius: "8px", padding: "8px", textAlign: "center", background: "#f8fafc" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'edit')}
                      disabled={uploadingImage}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "10px", fontWeight: 700, color: T.mu }}>
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Input label="Description" value={editItem.desc} onChange={e => setEditItem(p => (p ? { ...p, desc: e.target.value } : null))} />
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <Btn onClick={saveEdit} fullWidth>Save Changes</Btn>
              <Btn variant="ghost" onClick={() => setEditItem(null)} fullWidth>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Add Menu Item">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Item Name" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Flat White" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input label="Price (₹)" type="number" value={newItem.price || ''} onChange={e => setNewItem(p => ({ ...p, price: Number(e.target.value) }))} placeholder="0" />
            <Sel label="Category" value={newItem.cat} onChange={e => setNewItem(p => ({ ...p, cat: e.target.value }))}>
              {dbCategories.length > 0 ? (
                dbCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
              ) : (
                ["Coffee", "Tea", "Food", "Bakery", "Drinks"].map(c => <option key={c} value={c}>{c}</option>)
              )}
            </Sel>
          </div>

          {/* Item Image Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: T.mu, letterSpacing: "0.06em" }}>Item Image</label>
            {newItem.image_url ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", padding: "6px", borderRadius: "8px", border: `1px solid ${T.bdr}` }}>
                <img src={newItem.image_url} alt="Item Preview" style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "6px" }} />
                <button
                  type="button"
                  onClick={() => setNewItem(p => ({ ...p, image_url: null }))}
                  style={{ background: "none", border: "none", color: "red", cursor: "pointer", fontSize: "10px", fontWeight: 705, padding: 0 }}
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div style={{ position: "relative", border: `1px dashed ${T.bdr}`, borderRadius: "8px", padding: "8px", textAlign: "center", background: "#f8fafc" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'add')}
                  disabled={uploadingImage}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                />
                <span style={{ fontSize: "10px", fontWeight: 700, color: T.mu }}>
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </span>
              </div>
            )}
          </div>

          <Input label="Description" value={newItem.desc} onChange={e => setNewItem(p => ({ ...p, desc: e.target.value }))} placeholder="Short description…" />
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addItem} fullWidth>Add Item</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Item Confirm */}
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
