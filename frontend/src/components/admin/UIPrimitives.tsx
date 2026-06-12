import React, { useState } from 'react';

// Design tokens
export const T = {
  bg: "#fbfbf9",
  card: "#ffffff",
  card2: "#fafaf9",
  bdr: "#e7e5e4",
  bdrH: "#d6d3d1",
  ind: "#d97706",
  em: "#16a34a",
  rose: "#dc2626",
  amb: "#ca8a04",
  tx: "#1c1917",
  mu: "#78716c",
  mu2: "#57534e",
  iA: (o: number) => `rgba(217,119,6,${o})`,
  eA: (o: number) => `rgba(22,163,74,${o})`,
  rA: (o: number) => `rgba(220,38,38,${o})`,
  aA: (o: number) => `rgba(202,138,4,${o})`,
};

export const G = {
  background: "#ffffff",
  border: `1px solid ${T.bdr}`,
  borderRadius: "12px",
};

export const ff = "var(--font-sans), sans-serif";
export const fm = "'DM Mono', monospace";

export interface BtnProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "emerald" | "rose" | "amber" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, fullWidth, style }: BtnProps) {
  const [hov, setHov] = useState(false);
  const sz = {
    sm: { padding: "5px 10px", fontSize: "10px" },
    md: { padding: "8px 14px", fontSize: "11px" },
    lg: { padding: "11px 20px", fontSize: "13px" }
  };
  const vr = {
    primary: { background: hov ? "#5254cc" : T.ind, color: "#fff" },
    emerald: { background: hov ? "#0d9668" : T.em, color: "#fff" },
    rose: { background: hov ? "#e02848" : T.rose, color: "#fff" },
    amber: { background: hov ? "#d98a08" : T.amb, color: "#fff" },
    ghost: { background: hov ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", color: T.mu2, border: `1px solid ${T.bdr}` },
    outline: { background: "transparent", color: T.ind, border: `1px solid ${T.ind}` },
    danger: { background: hov ? "rgba(244,63,94,0.2)" : "rgba(244,63,94,0.1)", color: T.rose, border: `1px solid ${T.rA(0.3)}` },
  };
  return (
    <button
      style={{
        ...sz[size], ...vr[variant], borderRadius: "8px", border: "none", cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: ff, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
        opacity: disabled ? 0.45 : 1, transition: "all 0.15s", width: fullWidth ? "100%" : "auto", ...style
      }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={disabled}
    >{children}</button>
  );
}

export function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const cols: Record<string, { bg: string; tc: string; br: string }> = {
    gray: { bg: "rgba(255,255,255,0.07)", tc: T.mu2, br: `1px solid ${T.bdr}` },
    indigo: { bg: T.iA(0.12), tc: T.ind, br: `1px solid ${T.iA(0.25)}` },
    emerald: { bg: T.eA(0.12), tc: T.em, br: `1px solid ${T.eA(0.25)}` },
    rose: { bg: T.rA(0.12), tc: T.rose, br: `1px solid ${T.rA(0.25)}` },
    amber: { bg: T.aA(0.12), tc: T.amb, br: `1px solid ${T.aA(0.25)}` },
    gold: { bg: "rgba(234,179,8,0.12)", tc: "#eab308", br: "1px solid rgba(234,179,8,0.25)" },
    blue: { bg: "rgba(59,130,246,0.12)", tc: "#60a5fa", br: "1px solid rgba(59,130,246,0.25)" },
  };
  const c = cols[color] || cols.gray;
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 700,
      letterSpacing: "0.04em", textTransform: "uppercase", background: c.bg, color: c.tc, border: c.br
    }}>{children}</span>
  );
}

export function StatusBadge({ s }: { s: string }) {
  const m: Record<string, string> = {
    available: "emerald", occupied: "rose", reserved: "amber", cleaning: "indigo",
    pending: "amber", confirmed: "blue", preparing: "amber", ready: "emerald",
    served: "gray", paid: "emerald", billed: "indigo", cancelled: "rose",
    available_menu: "emerald", unavailable: "rose", hidden: "gray"
  };
  return <Badge color={m[s] || "gray"}>{s}</Badge>;
}

export interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  active?: boolean;
  hover?: boolean;
}

export function Card({ children, style, onClick, active, hover = false }: CardProps) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...G, cursor: onClick ? "pointer" : "default", transition: "all 0.15s",
        ...(active ? { border: `1px solid ${T.iA(0.5)}`, background: T.iA(0.08) } : {}),
        ...(hover && hov && !active ? { border: `1px solid ${T.bdrH}`, background: "#fafaf9" } : {}),
        ...style
      }}
    >{children}</div>
  );
}

export interface InputProps {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
  step?: string;
  disabled?: boolean;
}

export function Input({ label, value, onChange, placeholder, type = "text", style, step, disabled }: InputProps) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...style }}>
      {label && <label style={{ fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} step={step} disabled={disabled}
        style={{
          background: disabled ? "#f5f5f4" : "#ffffff",
          border: `1px solid ${foc ? T.ind : T.bdr}`,
          borderRadius: "8px",
          padding: "8px 11px",
          color: disabled ? T.mu : T.tx,
          fontSize: "12px",
          fontFamily: ff,
          outline: "none",
          width: "100%",
          transition: "border-color 0.15s",
          boxSizing: "border-box",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.7 : 1
        }}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      />
    </div>
  );
}

export interface SelProps {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Sel({ label, value, onChange, children, style }: SelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...style }}>
      {label && <label style={{ fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{
          background: "#ffffff", border: `1px solid ${T.bdr}`, borderRadius: "8px",
          padding: "8px 11px", color: T.tx, fontSize: "12px", fontFamily: ff, outline: "none", width: "100%", cursor: "pointer"
        }}
      >{children}</select>
    </div>
  );
}

export interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ show, onClose, title, children, width = 440 }: ModalProps) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(41,37,36,0.40)", backdropFilter: "blur(6px)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          ...G, width: "100%", maxWidth: `${width}px`, maxHeight: "90vh", overflowY: "auto",
          background: "#ffffff", border: "1px solid #e7e5e4"
        }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${T.bdr}`, display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: T.mu, cursor: "pointer",
            fontSize: "20px", lineHeight: 1, padding: "0 4px"
          }}>×</button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

export function Toast({ msg, type = "success" }: { msg: string; type?: "success" | "error" | "warning"; onClose: () => void }) {
  const col = type === "success" ? T.em : type === "error" ? T.rose : T.amb;
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 999,
      background: "#ffffff", border: `1px solid ${col}25`, borderRadius: "10px",
      padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", minWidth: "280px",
      boxShadow: `0 4px 24px rgba(120,113,108,0.08)`
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: col, flexShrink: 0 }} />
      <span style={{ fontSize: "12px", color: T.tx, fontWeight: 500, flex: 1 }}>{msg}</span>
    </div>
  );
}

export function useToast() {
  const [t, setT] = useState<{ msg: string; type: "success" | "error" | "warning" } | null>(null);
  const show = (msg: string, type: "success" | "error" | "warning" = "success") => {
    setT({ msg, type });
    setTimeout(() => setT(null), 3000);
  };
  return [t, show] as const;
}

interface StatProps {
  label: string;
  value: string | number;
  trend?: string;
  up?: boolean;
  icon?: string;
  color?: string;
}

export function Stat({ label, value, trend, up, icon, color }: StatProps) {
  const col = color || T.ind;
  return (
    <Card style={{ padding: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "7px" }}>{label}</div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>{value}</div>
        {trend && <div style={{ fontSize: "10px", fontWeight: 700, color: up ? T.em : T.rose, marginTop: "4px" }}>{up ? "▲" : "▼"} {trend}</div>}
      </div>
      {icon && <div style={{
        width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
        background: `${col}18`, border: `1px solid ${col}30`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "18px"
      }}>{icon}</div>}
    </Card>
  );
}
