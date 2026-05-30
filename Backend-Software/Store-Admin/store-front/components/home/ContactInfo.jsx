"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";

export default function ContactInfo() {
  return (
    <section id="contact" className="py-14 bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-600)] mb-1 block">📍 Find Us</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">Visit Our Cafe</h2>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto card-flat overflow-hidden"
        >
          {/* Map placeholder */}
          <div className="w-full h-48 bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-50)] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-[var(--color-primary-500)] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">Koramangala, Bangalore</p>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary-600)] font-medium hover:underline mt-1 inline-flex items-center gap-1">
                Open in Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          {/* Info rows */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="tel:+919876543210" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-warm)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[var(--color-primary-600)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Call Us</p>
                <p className="text-sm font-semibold text-[var(--color-text)]">+91 98765 43210</p>
              </div>
            </a>
            <a href="mailto:hello@cafecanvas.bar" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-warm)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[var(--color-primary-600)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                <p className="text-sm font-semibold text-[var(--color-text)]">hello@cafecanvas.bar</p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[var(--color-primary-600)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Address</p>
                <p className="text-sm font-semibold text-[var(--color-text)]">123 Artisan Lane, Koramangala</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[var(--color-primary-600)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Hours</p>
                <p className="text-sm font-semibold text-[var(--color-text)]">8 AM – 11 PM Daily</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
