import React, { useState, useRef, useEffect } from 'react';

// Premium Dark Design tokens
const T = {
  card: "#ffffff",
  bdr: "#e2e8f0",
  ind: "#d97706", // Corporate gold/amber
  em: "#16a34a",  // Clean success green
  tx: "#1e293b",  // Slate-800 text
  mu: "#64748b",  // Muted slate gray
  mu2: "#475569", // Muted slate gray dark
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
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "orders", label: "Live Orders", icon: "🛍️" },
  { id: "menu", label: "Menu Catalog", icon: "🍽" },
  { id: "tables", label: "Tables & QRs", icon: "🪑" },
  { id: "billing", label: "Billing OS", icon: "🧾" },
  { id: "customers", label: "Customers", icon: "👥" },
  { id: "discounts", label: "Discounts", icon: "🏷" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "feedback", label: "Guest Feedbacks", icon: "💬" },
  { id: "storefront", label: "Storefront", icon: "🏪" },
  { id: "audit", label: "Audit Logs", icon: "📋" },
  { id: "activity", label: "Activity Feed", icon: "⚡" },
];

export default function Sidebar({
  page,
  setPage,
  sidebarOpen,
  setSidebarOpen,
  tenantName
}: SidebarProps) {
  const ff = "var(--font-sans), sans-serif";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          background: "linear-gradient(135deg, #d97706 0%, #ca8a04 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 900,
          boxShadow: "0 2px 8px rgba(217,119,6,0.15)"
        }}>
          CC
        </div>
        <div style={{
          opacity: sidebarOpen ? 1 : 0,
          transition: "opacity 0.2s ease, width 0.2s ease",
          width: sidebarOpen ? "auto" : 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          display: "flex",
          flexDirection: "column"
        }}>
          <span style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "-0.02em", color: T.tx }}>CafeCanva</span>
          <span style={{ fontSize: "9px", color: T.mu, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Panel</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
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
                color: active ? T.ind : T.mu,
                justifyContent: sidebarOpen ? "flex-start" : "center"
              }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{n.icon}</span>
              <span style={{
                opacity: sidebarOpen ? 1 : 0,
                transition: "opacity 0.15s ease, width 0.15s ease",
                width: sidebarOpen ? "auto" : 0,
                overflow: "hidden",
                whiteSpace: "nowrap"
              }}>{n.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div ref={menuRef} style={{ padding: "12px 16px", borderTop: `1px solid ${T.bdr}`, position: "relative", zIndex: 40 }}>
          {/* Profile Context Dropdown */}
          {menuOpen && (
            <div style={{
              position: "absolute",
              bottom: "calc(100% - 6px)",
              left: "12px",
              right: "12px",
              background: "#ffffff",
              border: `1px solid ${T.bdr}`,
              borderRadius: "12px",
              padding: "6px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              zIndex: 100
            }}>
              <button
                onClick={() => {
                  setPage("settings");
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: page === "settings" ? T.iA(0.12) : "transparent",
                  color: page === "settings" ? T.ind : T.mu,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  fontFamily: ff
                }}
              >
                <span>🛠️</span>
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  setPage("activity");
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: page === "activity" ? T.iA(0.12) : "transparent",
                  color: page === "activity" ? T.ind : T.mu,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  fontFamily: ff
                }}
              >
                <span>⚡</span>
                <span>Activity Feed</span>
              </button>
            </div>
          )}

          <div 
            onClick={() => {
              console.log("[sidebar] Profile clicked, toggling menuOpen from:", menuOpen, "to:", !menuOpen);
              setMenuOpen(!menuOpen);
            }}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              transition: "background 0.15s",
              background: menuOpen ? "rgba(0, 0, 0, 0.04)" : "transparent"
            }}
          >
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(217,119,6,0.12)",
              border: `1px solid rgba(217,119,6,0.25)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              color: T.ind,
              fontSize: "11px",
              fontWeight: 800
            }}>
              {tenantName ? tenantName.substring(0, 2).toUpperCase() : "CC"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: T.tx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Operations</div>
              <div style={{ fontSize: "9px", color: T.mu, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tenantName}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
