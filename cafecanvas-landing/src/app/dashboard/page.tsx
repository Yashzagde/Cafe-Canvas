"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("billing"); // billing, analytics, staff, qr-manager
  const [posCart, setPosCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Sample menu items for the POS Billing Simulator
  const menuItems = [
    { id: 1, name: "Double Espresso", price: 160, category: "Beverages" },
    { id: 2, name: "Vanilla Latte", price: 210, category: "Beverages" },
    { id: 3, name: "Avocado Toast", price: 340, category: "Food" },
    { id: 4, name: "Margherita Pizza", price: 420, category: "Food" },
    { id: 5, name: "Garlic Bread with Cheese", price: 180, category: "Food" },
    { id: 6, name: "Craft IPA Beer", price: 320, category: "Bar" },
    { id: 7, name: "Old Fashioned Cocktail", price: 450, category: "Bar" },
    { id: 8, name: "Sparkling Water", price: 90, category: "Beverages" },
  ];

  // Redirect to login if user is not authenticated or needs onboarding
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth");
      } else if (profile && !profile.onboarded) {
        router.push("/onboarding");
      }
    }
  }, [user, profile, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // POS Add to Cart
  const addToCart = (item: { id: number; name: string; price: number }) => {
    setPosCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => setPosCart([]);

  // Compute POS totals
  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18); // 18% GST standard in India
  const total = subtotal + gst;

  if (loading || !user || !profile || !profile.onboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { businessName, businessType, ownerName, phone, email, gstNumber, address, cityState, outletsCount, staffSize } = profile.onboardingDetails!;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-tight text-white">
            Cafe<span className="text-orange-500">Canvas</span>
          </span>
          <span className="h-5 w-px bg-gray-800" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-200">{businessName}</span>
            <span className="text-xs text-orange-400 capitalize">{businessType} • Active Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-sm font-semibold rounded-md border border-gray-700 transition cursor-pointer"
          >
            🏢 Workspace Settings
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-sm font-semibold rounded-md transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-gray-800 bg-gray-900/50 p-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">Operational Core</p>
          <button
            onClick={() => setActiveTab("billing")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "billing" ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500" : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            💵 Smart POS Billing
          </button>
          <button
            onClick={() => setActiveTab("qr-manager")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "qr-manager" ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500" : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            📱 QR Menu Ordering
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "analytics" ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500" : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            📊 Analytics & Insights
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "staff" ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500" : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            👥 Staff Management
          </button>

          <div className="mt-auto p-3.5 bg-gray-900 border border-gray-800 rounded-lg flex flex-col gap-1">
            <p className="text-xs text-gray-500">Current Operator</p>
            <p className="text-sm font-bold text-gray-200">{ownerName}</p>
            <p className="text-xs text-orange-400 truncate">{email}</p>
          </div>
        </aside>

        {/* Dashboard Content Panel */}
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === "billing" && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Menu items list */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Live POS Terminal</h3>
                      <p className="text-sm text-gray-400">Simulate guest table transactions</p>
                    </div>
                    <span className="text-xs bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full font-bold uppercase">
                      Active Session
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="p-4 bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 rounded-xl flex justify-between items-center text-left transition cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-gray-200">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-500">₹{item.price}</p>
                          <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                            + Add
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* POS Receipt Sidebar */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col h-[520px]">
                  <div className="border-b border-gray-850 pb-4 mb-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-200">Table Order Receipt</h4>
                      <p className="text-xs text-gray-500">GST Registration: {gstNumber}</p>
                    </div>
                    {posCart.length > 0 && (
                      <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-400 cursor-pointer">
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {posCart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm gap-2">
                        <span className="text-3xl">🧾</span>
                        <p>No items added to receipt yet.</p>
                      </div>
                    ) : (
                      posCart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-semibold text-gray-200">{item.name}</p>
                            <p className="text-xs text-gray-400">
                              ₹{item.price} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded flex items-center justify-center cursor-pointer font-bold"
                            >
                              -
                            </button>
                            <span className="w-4 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-6 h-6 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded flex items-center justify-center cursor-pointer font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-gray-850 pt-4 mt-4 space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{gst}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-dashed border-gray-800">
                      <span>Total Amount</span>
                      <span className="text-orange-500">₹{total}</span>
                    </div>
                  </div>

                  <button
                    disabled={posCart.length === 0}
                    onClick={() => {
                      alert(`Mock transaction processed successfully!\nAmount: ₹${total}\nGSTIN: ${gstNumber}`);
                      clearCart();
                    }}
                    className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition cursor-pointer"
                  >
                    💳 Generate Invoice & Settle Pay
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "qr-manager" && (
              <motion.div
                key="qr-manager"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-4xl"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white">QR Menu Manager</h3>
                  <p className="text-sm text-gray-400">Manage table QR ordering, customized menu design, and layouts</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="p-6 bg-white rounded-2xl mb-4 border-4 border-orange-500">
                      {/* Simple mock QR design using pure CSS shapes */}
                      <div className="w-32 h-32 bg-gray-950 flex flex-wrap p-1">
                        <div className="w-10 h-10 border-4 border-white m-1" />
                        <div className="w-10 h-10 border-4 border-white m-1 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white" />
                        </div>
                        <div className="w-10 h-10 border-4 border-white m-1" />
                        <div className="w-10 h-10 flex flex-wrap m-1">
                          <div className="w-4 h-4 bg-white m-0.5" />
                          <div className="w-4 h-4 bg-white m-0.5" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-bold text-lg text-white">Table 04 Scan Code</h4>
                    <p className="text-xs text-gray-400 max-w-xs mt-1">
                      Scans automatically route to the {businessName} digital smart menu.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <button className="px-4 py-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-bold rounded-lg cursor-pointer">
                        Download PDF Grid
                      </button>
                      <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded-lg cursor-pointer">
                        Customize Design
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                      <h4 className="font-bold text-white mb-2">QR Ordering Settings</h4>
                      <label className="flex items-center gap-3 text-sm text-gray-300">
                        <input type="checkbox" defaultChecked className="accent-orange-500 rounded" />
                        Enable self-checkout payment at table
                      </label>
                      <label className="flex items-center gap-3 text-sm text-gray-300 mt-2">
                        <input type="checkbox" defaultChecked className="accent-orange-500 rounded" />
                        Auto-print QR orders to Kitchen Display System (KDS)
                      </label>
                    </div>

                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                      <h4 className="font-bold text-white mb-2">Digital Menu Customization</h4>
                      <p className="text-xs text-gray-400 mb-3">Matching theme configured based on {businessType}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["Warm Amber", "Charcoal Luxe", "Soft Mint"].map((themeName, idx) => (
                          <button
                            key={idx}
                            className={`p-2 text-xs font-semibold rounded border ${
                              idx === 0 ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-gray-800 bg-gray-850 hover:bg-gray-800"
                            } text-center cursor-pointer`}
                          >
                            {themeName}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white">Analytics Hub</h3>
                  <p className="text-sm text-gray-400">Aggregated insights for {outletsCount} outlet(s)</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Today's Sales</p>
                    <p className="text-2xl font-black text-white mt-1">₹42,850</p>
                    <span className="text-xs text-green-500 font-bold">↑ 12% vs last Saturday</span>
                  </div>
                  <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Orders</p>
                    <p className="text-2xl font-black text-white mt-1">18 Orders</p>
                    <span className="text-xs text-gray-400">Across tables and deliveries</span>
                  </div>
                  <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg. Table Spend</p>
                    <p className="text-2xl font-black text-white mt-1">₹850</p>
                    <span className="text-xs text-green-500 font-bold">↑ 4% this month</span>
                  </div>
                </div>

                {/* Custom Pure CSS Chart */}
                <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
                  <h4 className="font-bold text-white mb-4">Peak Ordering Hours</h4>
                  <div className="flex items-end h-48 gap-3 pt-6 border-b border-gray-800">
                    {[
                      { time: "12 PM", height: "h-[30%]" },
                      { time: "2 PM", height: "h-[65%]" },
                      { time: "4 PM", height: "h-[20%]" },
                      { time: "6 PM", height: "h-[45%]" },
                      { time: "8 PM", height: "h-[95%]" },
                      { time: "10 PM", height: "h-[80%]" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className={`w-full ${item.height} bg-orange-500 rounded-t-md hover:bg-orange-400 transition cursor-pointer`} />
                        <span className="text-[10px] text-gray-500 whitespace-nowrap mb-[-24px]">{item.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-6" />
                </div>
              </motion.div>
            )}

            {activeTab === "staff" && (
              <motion.div
                key="staff"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Staff Roster</h3>
                    <p className="text-sm text-gray-400">Total staff size: {staffSize} employees</p>
                  </div>
                  <button className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white rounded-lg cursor-pointer">
                    + Add Employee
                  </button>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-950 text-gray-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Shift</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850">
                      {[
                        { name: "Rahul Sharma", role: "Head Chef", shift: "Morning (09:00 - 18:00)", status: "Active" },
                        { name: "Anjali Deshmukh", role: "Cashier", shift: "Evening (17:00 - 02:00)", status: "Active" },
                        { name: "Vikram Singh", role: "Waiter / Server", shift: "Morning (10:00 - 19:00)", status: "On Leave" },
                        { name: "Pooja Patel", role: "Inventory Manager", shift: "Flexible Shift", status: "Active" },
                      ].slice(0, Math.max(2, staffSize)).map((employee, idx) => (
                        <tr key={idx}>
                          <td className="p-4 font-semibold text-gray-200">{employee.name}</td>
                          <td className="p-4">{employee.role}</td>
                          <td className="p-4">{employee.shift}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                employee.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {employee.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Profile/Workspace Details Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full relative"
            >
              <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">
                🏢 Workspace Settings
              </h3>
              
              <div className="space-y-3.5 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Business Name</p>
                  <p className="text-base text-gray-200 font-bold mt-0.5">{businessName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Type</p>
                    <p className="text-sm text-gray-200 font-semibold mt-0.5">{businessType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Outlets</p>
                    <p className="text-sm text-gray-200 font-semibold mt-0.5">{outletsCount} Location(s)</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">GSTIN</p>
                  <p className="text-sm text-gray-200 font-semibold mt-0.5">{gstNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Address</p>
                  <p className="text-sm text-gray-300 mt-0.5">
                    {address}, {cityState}
                  </p>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between text-xs text-gray-500">
                  <span>Owner: {ownerName}</span>
                  <span>Phone: {phone}</span>
                </div>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full mt-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-sm font-semibold rounded-lg border border-gray-700 transition cursor-pointer"
              >
                Close Settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
