import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Card, Btn, Input, Sel, Modal, Badge, Stat, T, ff, fm
} from './UIPrimitives';

interface Customer {
  id: string;
  name: string;
  phone: string;
  visits: number;
  spend: number; // rupees
  last: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
}

interface CustomersTabProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  dbPending: boolean;
  tenantId: string;
}

export default function CustomersTab({
  toast,
  customers,
  setCustomers,
  dbPending,
  tenantId
}: CustomersTabProps) {
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "", tier: "Bronze" as const });

  const tierColors = { Platinum: "indigo", Gold: "gold", Silver: "gray", Bronze: "amber" };
  const tiers = ["All", "Platinum", "Gold", "Silver", "Bronze"];

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTier = tierFilter === "All" || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const addCustomer = async () => {
    if (!newCust.name || !newCust.phone) { toast("Name and phone are required", "error"); return; }
    
    try {
      let insertedId = "c" + Date.now();

      if (!dbPending) {
        const { data, error } = await supabase
          .from('customers')
          .insert({
            tenant_id: tenantId,
            name: newCust.name,
            phone: newCust.phone,
            visit_count: 1,
            total_spend: 0
          })
          .select('id')
          .single();

        if (error) throw error;
        insertedId = data.id;
      }

      setCustomers(p => [...p, { id: insertedId, name: newCust.name, phone: newCust.phone, visits: 1, spend: 0, last: "Today", tier: newCust.tier }]);
      setShowAdd(false);
      setNewCust({ name: "", phone: "", tier: "Bronze" });
      toast("Customer added!", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const totalSpend = customers.reduce((s, c) => s + c.spend, 0);
  const totalVisits = customers.reduce((s, c) => s + c.visits, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Customer CRM</h2>
          <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Loyalty tiers, spend analytics, and engagement tracking</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}>+ Add Customer</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <Stat label="Total Customers" value={customers.length} icon="👥" color={T.ind} />
        <Stat label="Total Visits" value={totalVisits.toLocaleString()} icon="📊" color={T.em} />
        <Stat label="Total Spend" value={`₹${totalSpend.toLocaleString()}`} icon="₹" color={T.amb} />
        <Stat label="Avg Spend" value={`₹${customers.length > 0 ? Math.round(totalSpend / customers.length).toLocaleString() : 0}`} icon="📈" color={T.ind} />
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <Input placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: "6px" }}>
          {tiers.map(t => (
            <Btn key={t} size="sm" variant={tierFilter === t ? "primary" : "ghost"} onClick={() => setTierFilter(t)}>
              {t}
            </Btn>
          ))}
        </div>
      </div>

      <Card style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.bdr}`, background: "rgba(255,255,255,0.03)" }}>
                {["Customer", "Phone", "Tier", "Visits", "Total Spend", "Last Visit"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${T.bdr}` }}>
                  <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 600, color: T.tx }}>{c.name}</td>
                  <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2, fontFamily: fm }}>{c.phone}</td>
                  <td style={{ padding: "12px 14px" }}><Badge color={tierColors[c.tier]}>{c.tier}</Badge></td>
                  <td style={{ padding: "12px 14px", fontSize: "12px", color: T.tx, fontFamily: fm }}>{c.visits}</td>
                  <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 700, color: T.em, fontFamily: fm }}>₹{c.spend.toFixed(2)}</td>
                  <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2 }}>{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Add Customer">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Name" value={newCust.name} onChange={e => setNewCust(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
          <Input label="Phone" value={newCust.phone} onChange={e => setNewCust(p => ({ ...p, phone: e.target.value }))} placeholder="9876543200" />
          <Sel label="Tier" value={newCust.tier} onChange={e => setNewCust(p => ({ ...p, tier: e.target.value as any }))}>
            {["Bronze", "Silver", "Gold", "Platinum"].map(t => <option key={t}>{t}</option>)}
          </Sel>
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addCustomer} fullWidth>Add Customer</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
