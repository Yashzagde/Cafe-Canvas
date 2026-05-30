import Link from "next/link";
import { Coffee, MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer id="main-footer" className="bg-[#1C1917] text-white">
      <div className="relative h-12 bg-[var(--color-bg)]">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none">
          <path d="M0 48L1440 48L1440 0C1200 32 960 44 720 32C480 20 240 40 0 24L0 48Z" fill="#1C1917" />
        </svg>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">Cafe Canvas</span>
            </div>
            <p className="text-[var(--color-text-light)] text-sm leading-relaxed">
              Crafting artisanal beverages and gourmet bites. Every cup tells a story.
            </p>
          </div>
          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)] mb-4">Menu</h4>
            <div className="flex flex-col gap-2">
              {[{ href: "/", label: "Home" }, { href: "/items", label: "Full Menu" }, { href: "/blog", label: "Blog" }, { href: "/cart", label: "Cart" }].map((l) => (
                <Link key={l.href} href={l.href} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-400)] text-sm transition-colors w-fit">{l.label}</Link>
              ))}
            </div>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)] mb-4">Contact</h4>
            <div className="flex flex-col gap-2.5 text-sm text-[var(--color-text-muted)]">
              <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-[var(--color-primary-400)] transition-colors">
                <Phone className="w-3.5 h-3.5 text-[var(--color-primary-500)] shrink-0" />+91 98765 43210
              </a>
              <a href="mailto:hello@cafecanvas.bar" className="flex items-center gap-2 hover:text-[var(--color-primary-400)] transition-colors">
                <Mail className="w-3.5 h-3.5 text-[var(--color-primary-500)] shrink-0" />hello@cafecanvas.bar
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-[var(--color-primary-500)] shrink-0" />
                <span>123 Artisan Lane, Koramangala,<br />Bangalore 560034</span>
              </div>
            </div>
          </div>
          {/* Hours */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)] mb-4">Hours</h4>
            <div className="text-sm text-[var(--color-text-muted)] space-y-1.5">
              <div className="flex justify-between"><span>Mon – Fri</span><span>8 AM – 11 PM</span></div>
              <div className="flex justify-between"><span>Sat – Sun</span><span>9 AM – 12 AM</span></div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-primary-500)] transition-colors" aria-label="Website"><Globe className="w-3.5 h-3.5" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-primary-500)] transition-colors" aria-label="Links"><ExternalLink className="w-3.5 h-3.5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text-light)]">© {new Date().getFullYear()} Cafe Canvas. All rights reserved.</p>
          <p className="text-xs text-[var(--color-text-light)]">Powered by <span className="text-[var(--color-primary-400)]">CafeCanva</span></p>
        </div>
      </div>
    </footer>
  );
}
