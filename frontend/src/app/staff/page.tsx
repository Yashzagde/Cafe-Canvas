import { Receipt, Search, Plus, Grid2x2, List } from 'lucide-react';

export default function StaffPOS() {
  const menuCategories = ['All', 'Coffee', 'Tea', 'Pastries', 'Mains'];
  const menuItems = [
    { id: 1, name: 'Iced Caramel Macchiato', price: '$5.50', category: 'Coffee' },
    { id: 2, name: 'Avocado Toast', price: '$8.00', category: 'Mains' },
    { id: 3, name: 'Matcha Latte', price: '$4.50', category: 'Tea' },
    { id: 4, name: 'Butter Croissant', price: '$3.50', category: 'Pastries' },
    { id: 5, name: 'Americano', price: '$3.00', category: 'Coffee' },
    { id: 6, name: 'Eggs Benedict', price: '$12.00', category: 'Mains' },
  ];

  return (
    <div className="h-screen flex bg-zinc-100 text-zinc-900 overflow-hidden font-sans">
      
      {/* Left side: Menu Items (POS) */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4 bg-zinc-100 px-4 py-2 rounded-full flex-1 max-w-md">
            <Search className="text-zinc-500" size={20} />
            <input 
              type="text" 
              placeholder="Search menu..." 
              className="bg-transparent border-none outline-none w-full font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200"><Grid2x2 size={20}/></button>
            <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100"><List size={20}/></button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="p-4 flex gap-2 overflow-x-auto hide-scrollbar">
          {menuCategories.map((cat, i) => (
            <button key={cat} className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${
              i === 0 ? 'bg-[#ff6b35] text-white shadow-md shadow-orange-500/20' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
          {menuItems.map(item => (
            <button key={item.id} className="bg-white border-2 border-zinc-100 hover:border-[#ff6b35] rounded-2xl p-4 flex flex-col items-center justify-center text-center aspect-square transition-all hover:shadow-lg group">
              <div className="w-16 h-16 rounded-full bg-orange-50 mb-3 flex items-center justify-center text-[#ff6b35] group-hover:scale-110 transition-transform">
                <Receipt size={24} />
              </div>
              <span className="font-bold text-sm mb-1">{item.name}</span>
              <span className="text-zinc-500 font-medium">{item.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right side: Current Order (Cart) */}
      <div className="w-96 bg-white border-l shadow-2xl z-10 flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
          <h2 className="text-xl font-black">Current Order</h2>
          <span className="text-sm font-bold text-zinc-500 bg-zinc-200 px-3 py-1 rounded-full">#096</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Item 1 */}
          <div className="flex justify-between items-center group">
            <div>
              <div className="font-bold">2x Iced Caramel Macchiato</div>
              <div className="text-sm text-zinc-500 cursor-pointer hover:text-[#ff6b35]">+ Add note</div>
            </div>
            <div className="font-bold text-lg">$11.00</div>
          </div>
          
          {/* Item 2 */}
          <div className="flex justify-between items-center group">
            <div>
              <div className="font-bold">1x Avocado Toast</div>
              <div className="text-sm text-zinc-500 cursor-pointer hover:text-[#ff6b35]">+ Add note</div>
            </div>
            <div className="font-bold text-lg">$8.00</div>
          </div>
        </div>

        {/* Summary & Checkout */}
        <div className="p-6 bg-zinc-50 border-t">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Subtotal</span>
              <span>$19.00</span>
            </div>
            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Tax (8%)</span>
              <span>$1.52</span>
            </div>
            <div className="flex justify-between text-2xl font-black mt-4 pt-4 border-t">
              <span>Total</span>
              <span>$20.52</span>
            </div>
          </div>
          
          <button className="w-full bg-[#ff6b35] hover:bg-[#e85b24] text-white text-xl font-black py-5 rounded-2xl shadow-xl shadow-orange-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
            Charge $20.52
          </button>
        </div>
      </div>
    </div>
  );
}
