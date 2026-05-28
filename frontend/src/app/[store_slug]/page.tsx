import { Coffee, ShoppingBag, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Storefront({ params }: { params: Promise<{ store_slug: string }> }) {
  const storeSlug = (await params).store_slug;

  // Mock data for the digital menu
  const menuCategories = ['Popular', 'Coffee', 'Tea', 'Pastries', 'Mains'];
  const menuItems = [
    { id: 1, name: 'Iced Caramel Macchiato', price: '$5.50', desc: 'Espresso with vanilla syrup, milk, and caramel drizzle over ice.', category: 'Coffee', img: 'https://images.unsplash.com/photo-1461023058943-0708e5c14abc?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Avocado Toast', price: '$8.00', desc: 'Smashed avocado on sourdough with chili flakes and a poached egg.', category: 'Mains', img: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=400&q=80' },
    { id: 3, name: 'Matcha Latte', price: '$4.50', desc: 'Premium matcha green tea powder blended with steamed milk.', category: 'Tea', img: 'https://images.unsplash.com/photo-1515823662972-da6a2b4d3002?auto=format&fit=crop&w=400&q=80' },
    { id: 4, name: 'Butter Croissant', price: '$3.50', desc: 'Flaky, buttery, fresh-baked daily.', category: 'Pastries', img: 'https://images.unsplash.com/photo-1549996647-190b679b33d7?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] pb-24">
      {/* Cover Image & Header */}
      <div className="h-64 bg-zinc-200 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80" 
          alt="Cafe Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-black mb-1 capitalize">{storeSlug.replace('-', ' ')}</h1>
          <p className="text-white/80 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> Open until 8:00 PM
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar sticky top-4 z-10">
          {menuCategories.map((cat, i) => (
            <button key={cat} className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap shadow-sm transition-all ${
              i === 0 ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-black'
            }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-6 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Popular Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{item.desc}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-bold text-lg">{item.price}</span>
                      <button className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                  <div className="w-28 h-28 shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Cart Button */}
      <div className="fixed bottom-6 w-full px-4 max-w-4xl left-1/2 -translate-x-1/2 z-50">
        <button className="w-full bg-[#1a1a1a] text-white rounded-2xl p-4 flex justify-between items-center shadow-2xl hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              3
            </div>
            <span className="font-bold">View Order</span>
          </div>
          <span className="font-bold text-xl">$18.00</span>
        </button>
      </div>
    </div>
  );
}
