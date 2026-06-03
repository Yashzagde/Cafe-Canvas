import React, { useState } from 'react';
import {
  Card, Btn, Input, Sel, Modal, Badge, T, ff, fm
} from './UIPrimitives';

interface Discount {
  id: string;
  name: string;
  type: 'percent' | 'flat';
  value: number;
  validUntil: string;
  active: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount: string;
  uses: number;
  maxUses: number;
  active: boolean;
}

interface DiscountsTabProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  discounts: Discount[];
  setDiscounts: React.Dispatch<React.SetStateAction<Discount[]>>;
}

const INIT_COUPONS = [
  { id: "cp1", code: "AETHER20", discount: "20% OFF", uses: 48, maxUses: 100, active: true }
];

export default function DiscountsTab({
  toast,
  discounts,
  setDiscounts
}: DiscountsTabProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(INIT_COUPONS);
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newDisc, setNewDisc] = useState({ name: "", type: "percent" as const, value: "", validUntil: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", maxUses: "" });

  const addDiscount = () => {
    if (!newDisc.name || !newDisc.value) { toast("Name and value required", "error"); return; }
    const id = "d" + (discounts.length + 1);
    setDiscounts(p => [...p, { id, name: newDisc.name, type: newDisc.type, value: Number(newDisc.value), validUntil: newDisc.validUntil || "—", active: true }]);
    setShowAddDiscount(false);
    setNewDisc({ name: "", type: "percent", value: "", validUntil: "" });
    toast("Discount created!", "success");
  };

  const addCoupon = () => {
    if (!newCoupon.code || !newCoupon.discount) { toast("Code and discount required", "error"); return; }
    const id = "cp" + (coupons.length + 1);
    setCoupons(p => [...p, { id, code: newCoupon.code.toUpperCase(), discount: newCoupon.discount, uses: 0, maxUses: Number(newCoupon.maxUses) || 100, active: true }]);
    setShowAddCoupon(false);
    setNewCoupon({ code: "", discount: "", maxUses: "" });
    toast("Coupon created!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Discounts & Coupons</h2>
        <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Manage promotions, flash sales, and coupon codes</p>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: T.tx }}>Active Discounts</div>
          <Btn size="sm" onClick={() => setShowAddDiscount(true)}>+ New Discount</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {discounts.map(d => (
            <Card key={d.id} style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: T.tx }}>{d.name}</div>
                <Badge color={d.active ? "emerald" : "gray"}>{d.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: T.ind, fontFamily: fm, marginBottom: "6px" }}>
                {d.type === "percent" ? `${d.value}%` : `₹${d.value}`}
              </div>
              <div style={{ fontSize: "10px", color: T.mu }}>Valid until: {d.validUntil}</div>
              <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                <Btn size="sm" variant={d.active ? "danger" : "emerald"} onClick={() => {
                  setDiscounts(p => p.map(x => x.id === d.id ? { ...x, active: !x.active } : x));
                  toast(d.active ? "Discount deactivated" : "Discount activated", "success");
                }}>
                  {d.active ? "Deactivate" : "Activate"}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: T.tx }}>Coupon Codes</div>
          <Btn size="sm" onClick={() => setShowAddCoupon(true)}>+ New Coupon</Btn>
        </div>
        <Card style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.bdr}`, background: "rgba(255,255,255,0.03)" }}>
                  {["Code", "Discount", "Uses", "Max Uses", "Status", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${T.bdr}` }}>
                    <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 800, color: T.ind, fontFamily: fm, letterSpacing: "0.04em" }}>{c.code}</td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: T.tx, fontWeight: 600 }}>{c.discount}</td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: T.mu2, fontFamily: fm }}>{c.uses}</td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: T.mu2, fontFamily: fm }}>{c.maxUses}</td>
                    <td style={{ padding: "12px 14px" }}><Badge color={c.active ? "emerald" : "gray"}>{c.active ? "Active" : "Expired"}</Badge></td>
                    <td style={{ padding: "12px 14px" }}>
                      <Btn size="sm" variant={c.active ? "danger" : "emerald"} onClick={() => {
                        setCoupons(p => p.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
                        toast(c.active ? "Coupon deactivated" : "Coupon activated", "success");
                      }}>
                        {c.active ? "Deactivate" : "Activate"}
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Discount Modal */}
      <Modal show={showAddDiscount} onClose={() => setShowAddDiscount(false)} title="New Discount">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Discount Name" value={newDisc.name} onChange={e => setNewDisc(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Happy Hour 10%" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Sel label="Type" value={newDisc.type} onChange={e => setNewDisc(p => ({ ...p, type: e.target.value as any }))}>
              <option value="percent">Percentage</option>
              <option value="flat">Flat Amount</option>
            </Sel>
            <Input label="Value" type="number" value={newDisc.value} onChange={e => setNewDisc(p => ({ ...p, value: e.target.value }))} placeholder="0" />
          </div>
          <Input label="Valid Until" value={newDisc.validUntil} onChange={e => setNewDisc(p => ({ ...p, validUntil: e.target.value }))} placeholder="e.g. 31 Dec 2026" />
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addDiscount} fullWidth>Create Discount</Btn>
            <Btn variant="ghost" onClick={() => setShowAddDiscount(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* Add Coupon Modal */}
      <Modal show={showAddCoupon} onClose={() => setShowAddCoupon(false)} title="New Coupon Code">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Coupon Code" value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))} placeholder="e.g. SUMMER25" />
          <Input label="Discount Label" value={newCoupon.discount} onChange={e => setNewCoupon(p => ({ ...p, discount: e.target.value }))} placeholder="e.g. 25% OFF" />
          <Input label="Max Uses" type="number" value={newCoupon.maxUses} onChange={e => setNewCoupon(p => ({ ...p, maxUses: e.target.value }))} placeholder="100" />
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addCoupon} fullWidth>Create Coupon</Btn>
            <Btn variant="ghost" onClick={() => setShowAddCoupon(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
