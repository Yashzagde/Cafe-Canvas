import React from 'react';

// Design tokens
const T = {
  card: "#ffffff",
  bdr: "#e7e5e4",
  ind: "#d97706",
  em: "#16a34a",
  tx: "#1c1917",
  mu: "#78716c",
  mu2: "#57534e",
  iA: (o: number) => `rgba(217,119,6,${o})`,
};

interface SidebarProps {
  page: string;
  setPage: (page: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tenantName: string;
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "menu", label: "Menu", icon: "🍽" },
  { id: "billing", label: "Billing OS", icon: "🧾" },
  { id: "customers", label: "Customers", icon: "👥" },
  { id: "discounts", label: "Discounts", icon: "🏷" },
  { id: "analytics", label: "Analytics", icon: "📈" },
];

export default function Sidebar({
  page,
  setPage,
  sidebarOpen,
  setSidebarOpen,
  tenantName
}: SidebarProps) {
  const ff = "var(--font-sans), sans-serif";

  return (
    <aside style={{
      width: sidebarOpen ? "220px" : "64px",
      transition: "width 0.2s",
      background: T.card,
      borderRight: `1px solid ${T.bdr}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarOpen ? "20px" : "14px",
        borderBottom: `1px solid ${T.bdr}`,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer"
      }} onClick={() => setSidebarOpen(p => !p)}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: `linear-gradient(135deg,${T.ind},${T.em})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          fontWeight: 800,
          color: "#fff",
          flexShrink: 0
        }}>
          C
        </div>
        {sidebarOpen && (
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "-0.02em" }}>CafeCanva</div>
            <div style={{ fontSize: "9px", color: T.mu, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {NAV.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: sidebarOpen ? "10px 12px" : "10px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: ff,
                fontSize: "12px",
                fontWeight: 600,
                transition: "all 0.12s",
                width: "100%",
                textAlign: "left",
                background: active ? T.iA(0.15) : "transparent",
                color: active ? T.tx : T.mu2,
                justifyContent: sidebarOpen ? "flex-start" : "center"
              }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span>{n.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div style={{ padding: "16px", borderTop: `1px solid ${T.bdr}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: T.iA(0.2),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
              color: T.ind
            }}>
              YZ
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: T.tx }}>Admin User</div>
              <div style={{ fontSize: "9px", color: T.mu }}>{tenantName}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
