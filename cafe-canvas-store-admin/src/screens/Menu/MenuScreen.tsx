import { useEffect, useState } from 'react'
import { Plus, FolderOpen, Eye, EyeOff, Pencil, Trash2, UtensilsCrossed, Image, Tag } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useMenuStore, type MenuCategory, type MenuItem } from '../../store/menu.store'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { SearchInput } from '../../components/ui/SearchInput'
import { Tabs } from '../../components/ui/Tabs'
import { Modal } from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { EmptyState } from '../../components/ui/EmptyState'
import { PriceDisplay } from '../../components/ui/PriceDisplay'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { cn, formatINRCompact, rupeesToPaise, paiseToRupees } from '../../lib/utils'
import { DIETARY_TAG_LABELS, type DietaryTag, DIETARY_TAGS } from '../../lib/constants'

type MenuTab = 'categories' | 'items' | 'modifiers'

export function MenuScreen() {
  const { tenantId } = useAuthStore()
  const {
    categories, items, modifierGroups, isLoading,
    fetchCategories, fetchItems, fetchModifiers,
    createCategory, updateCategory, deleteCategory,
    createItem, updateItem, deleteItem, toggleItemAvailability,
    selectedCategoryId, setSelectedCategory,
  } = useMenuStore()

  const [activeTab, setActiveTab] = useState<MenuTab>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  // Category form
  const [catName, setCatName] = useState('')
  const [catNameHi, setCatNameHi] = useState('')
  const [catDesc, setCatDesc] = useState('')

  // Item form
  const [itemName, setItemName] = useState('')
  const [itemNameHi, setItemNameHi] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemCategoryId, setItemCategoryId] = useState('')
  const [itemPrepTime, setItemPrepTime] = useState('')
  const [itemDietaryTags, setItemDietaryTags] = useState<string[]>([])
  const [itemFeatured, setItemFeatured] = useState(false)

  useEffect(() => {
    if (tenantId) {
      fetchCategories(tenantId)
      fetchItems(tenantId)
      fetchModifiers(tenantId)
    }
  }, [tenantId, fetchCategories, fetchItems, fetchModifiers])

  // ── Category Modal Handlers ──────────────────────────────────
  const openCategoryModal = (cat?: MenuCategory) => {
    if (cat) {
      setEditingCategory(cat)
      setCatName(cat.name)
      setCatNameHi(cat.name_hi || '')
      setCatDesc(cat.description || '')
    } else {
      setEditingCategory(null)
      setCatName('')
      setCatNameHi('')
      setCatDesc('')
    }
    setShowCategoryModal(true)
  }

  const handleSaveCategory = async () => {
    if (!tenantId || !catName.trim()) return
    if (editingCategory) {
      await updateCategory(editingCategory.id, { name: catName, name_hi: catNameHi, description: catDesc })
    } else {
      await createCategory(tenantId, { name: catName, name_hi: catNameHi, description: catDesc })
    }
    setShowCategoryModal(false)
  }

  // ── Item Modal Handlers ──────────────────────────────────────
  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setItemName(item.name)
      setItemNameHi(item.name_hi || '')
      setItemDesc(item.description || '')
      setItemPrice(paiseToRupees(item.price))
      setItemCategoryId(item.category_id)
      setItemPrepTime(item.prep_time_mins?.toString() || '')
      setItemDietaryTags(item.dietary_tags || [])
      setItemFeatured(item.is_featured)
    } else {
      setEditingItem(null)
      setItemName('')
      setItemNameHi('')
      setItemDesc('')
      setItemPrice('')
      setItemCategoryId(categories[0]?.id || '')
      setItemPrepTime('')
      setItemDietaryTags([])
      setItemFeatured(false)
    }
    setShowItemModal(true)
  }

  const handleSaveItem = async () => {
    if (!tenantId || !itemName.trim()) return
    const data = {
      name: itemName,
      name_hi: itemNameHi,
      description: itemDesc,
      price: rupeesToPaise(itemPrice),
      category_id: itemCategoryId,
      prep_time_mins: itemPrepTime ? parseInt(itemPrepTime) : undefined,
      dietary_tags: itemDietaryTags,
      is_featured: itemFeatured,
    }
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await createItem(tenantId, data)
    }
    setShowItemModal(false)
  }

  const toggleDietaryTag = (tag: string) => {
    setItemDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // ── Filtered Items ───────────────────────────────────────────
  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategoryId || item.category_id === selectedCategoryId
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const tabs = [
    { id: 'categories', label: 'Categories', icon: <FolderOpen className="w-3.5 h-3.5" />, count: categories.length },
    { id: 'items', label: 'Menu Items', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, count: items.length },
    { id: 'modifiers', label: 'Modifiers', icon: <Tag className="w-3.5 h-3.5" />, count: modifierGroups.length },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse h-8 w-48 bg-canvas-border/40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Menu Management</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">
            {categories.length} categories · {items.length} items · {modifierGroups.length} modifier groups
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'categories' && (
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => openCategoryModal()}>
              Add Category
            </Button>
          )}
          {activeTab === 'items' && (
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => openItemModal()}>
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as MenuTab)} />

      {/* ── Categories Tab ──────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<FolderOpen className="w-8 h-8" />}
                title="No categories yet"
                description="Create your first menu category to organize your items."
                action={<Button size="sm" onClick={() => openCategoryModal()}>Create Category</Button>}
              />
            </div>
          ) : (
            categories.map((cat) => (
              <Card key={cat.id} hover onClick={() => { setSelectedCategory(cat.id); setActiveTab('items') }}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-canvas-brown truncate">{cat.name}</h4>
                    {cat.name_hi && <p className="text-xs text-canvas-brown_mid">{cat.name_hi}</p>}
                    {cat.description && (
                      <p className="text-xs text-canvas-brown_light mt-1 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Badge variant={cat.is_visible ? 'success' : 'neutral'} size="sm">
                      {cat.is_visible ? 'Visible' : 'Hidden'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-canvas-border/50">
                  <span className="text-[10px] text-canvas-brown_mid font-bold">
                    {items.filter((i) => i.category_id === cat.id).length} items
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openCategoryModal(cat) }}
                      className="p-1.5 rounded hover:bg-canvas-cream text-canvas-brown_light hover:text-canvas-brown transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateCategory(cat.id, { is_visible: !cat.is_visible }) }}
                      className="p-1.5 rounded hover:bg-canvas-cream text-canvas-brown_light hover:text-canvas-brown transition-colors"
                    >
                      {cat.is_visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id) }}
                      className="p-1.5 rounded hover:bg-red-50 text-canvas-brown_light hover:text-canvas-error transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Items Tab ────────────────────────────────────────────── */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search menu items..."
              className="flex-1 max-w-sm"
            />
            <Select
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-48"
            />
          </div>

          {/* Items grid */}
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="w-8 h-8" />}
              title="No menu items found"
              description={searchQuery ? 'Try adjusting your search.' : 'Add your first menu item to get started.'}
              action={!searchQuery ? <Button size="sm" onClick={() => openItemModal()}>Add Item</Button> : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} hover onClick={() => openItemModal(item)} padding="none">
                  {/* Image area */}
                  <div className="h-32 bg-canvas-border/20 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-10 h-10 text-canvas-brown_light/40" />
                    )}
                    {item.is_featured && (
                      <Badge variant="warning" size="sm" className="absolute top-2 left-2">Featured</Badge>
                    )}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-canvas-brown/50 flex items-center justify-center">
                        <Badge variant="danger" size="md">Unavailable</Badge>
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-canvas-brown truncate">{item.name}</h4>
                        {item.description && (
                          <p className="text-[11px] text-canvas-brown_mid line-clamp-2 mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <PriceDisplay paise={item.price} compact className="shrink-0 text-canvas-terracotta" />
                    </div>
                    {/* Tags */}
                    {item.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.dietary_tags.map((tag) => {
                          const tagInfo = DIETARY_TAG_LABELS[tag as DietaryTag]
                          return tagInfo ? (
                            <span key={tag} className={cn('px-1.5 py-0.5 rounded text-[8px] font-bold', tagInfo.color)}>
                              {tagInfo.icon} {tagInfo.label}
                            </span>
                          ) : null
                        })}
                      </div>
                    )}
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-canvas-border/30">
                      <span className="text-[10px] text-canvas-brown_light font-bold">
                        {item.prep_time_mins ? `${item.prep_time_mins}min` : '—'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleItemAvailability(item.id, !item.is_available)
                        }}
                        className={cn(
                          'w-9 h-5 rounded-full transition-colors relative',
                          item.is_available ? 'bg-canvas-sage' : 'bg-canvas-brown_light'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                            item.is_available ? 'left-[18px]' : 'left-0.5'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modifiers Tab ────────────────────────────────────────── */}
      {activeTab === 'modifiers' && (
        <div className="space-y-4">
          {modifierGroups.length === 0 ? (
            <EmptyState
              icon={<Tag className="w-8 h-8" />}
              title="No modifier groups"
              description="Create modifier groups for customization options like sizes, toppings, or extras."
            />
          ) : (
            modifierGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader title={group.name} subtitle={`${group.options.length} options · ${group.is_required ? 'Required' : 'Optional'} · Select ${group.min_select}-${group.max_select}`} />
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-canvas-cream border border-canvas-border">
                      <span className="text-xs font-bold text-canvas-brown">{opt.name}</span>
                      {opt.price > 0 && (
                        <span className="text-[10px] text-canvas-terracotta font-bold">+{formatINRCompact(opt.price)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Category Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
        subtitle="Organize your menu items into categories"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Beverages" />
          <Input label="Name (Hindi)" value={catNameHi} onChange={(e) => setCatNameHi(e.target.value)} placeholder="e.g. पेय पदार्थ" />
          <Textarea label="Description" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Brief description..." rows={3} />
        </div>
      </Modal>

      {/* ── Item Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        title={editingItem ? 'Edit Menu Item' : 'New Menu Item'}
        subtitle="Add or edit a menu item with pricing and details"
        size="lg"
        footer={
          <div className="flex justify-between">
            {editingItem && (
              <Button variant="danger" size="sm" onClick={() => { deleteItem(editingItem.id); setShowItemModal(false) }}>
                Delete Item
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={() => setShowItemModal(false)}>Cancel</Button>
              <Button onClick={handleSaveItem}>{editingItem ? 'Save Changes' : 'Create Item'}</Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Masala Chai" />
          <Input label="Name (Hindi)" value={itemNameHi} onChange={(e) => setItemNameHi(e.target.value)} placeholder="e.g. मसाला चाय" />
          <Input label="Price (₹)" type="number" step="0.01" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="e.g. 120.00" suffix="₹" />
          <Select
            label="Category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={itemCategoryId}
            onChange={(e) => setItemCategoryId(e.target.value)}
            placeholder="Select category"
          />
          <Input label="Prep Time (min)" type="number" value={itemPrepTime} onChange={(e) => setItemPrepTime(e.target.value)} placeholder="e.g. 15" />
          <div className="flex items-center gap-3 self-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={itemFeatured} onChange={(e) => setItemFeatured(e.target.checked)} className="rounded border-canvas-border text-canvas-terracotta" />
              <span className="text-xs font-bold text-canvas-brown">Featured Item</span>
            </label>
          </div>
          <div className="md:col-span-2">
            <Textarea label="Description" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Describe this menu item..." rows={3} />
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-bold text-canvas-brown uppercase tracking-wider mb-2">Dietary Tags</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => {
                const info = DIETARY_TAG_LABELS[tag]
                const isSelected = itemDietaryTags.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleDietaryTag(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                      isSelected
                        ? 'bg-canvas-terracotta/10 border-canvas-terracotta/30 text-canvas-terracotta'
                        : 'bg-canvas-cream border-canvas-border text-canvas-brown_mid hover:border-canvas-champagne'
                    )}
                  >
                    {info.icon} {info.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
