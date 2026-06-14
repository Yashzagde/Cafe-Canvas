'use client'

interface FooterSectionProps {
  tenant: {
    name: string; phone: string | null; address: string
  }
  config: {
    footer_description: string | null; footer_hours: string | null
    footer_address: string | null; footer_phone: string | null; footer_email: string | null
  } | null
}

export function FooterSection({ tenant, config }: FooterSectionProps) {
  const phone = config?.footer_phone || tenant.phone || ''
  const address = config?.footer_address || tenant.address || ''
  const hours = config?.footer_hours || 'Open daily: 8:00 AM - 11:00 PM'

  return (
    <footer className="bg-gray-950 text-gray-400 py-12 px-6 border-t border-gray-900 mt-16">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About column */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg">{tenant.name}</h3>
          <p className="text-xs leading-relaxed">
            {config?.footer_description || `Premium dining experience powered by CafeCanvas OS.`}
          </p>
        </div>

        {/* Timings column */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Hours</h4>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{hours}</p>
        </div>

        {/* Contact column */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Contact Us</h4>
          <div className="text-xs space-y-1.5 leading-relaxed">
            {address && <p>📍 {address}</p>}
            {phone && <p>📞 {phone}</p>}
            {config?.footer_email && <p>✉️ {config.footer_email}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto border-t border-gray-900 mt-10 pt-6 text-center text-[10px] tracking-wider uppercase opacity-60">
        © {new Date().getFullYear()} {tenant.name}. Powered by CafeCanvas OS.
      </div>
    </footer>
  )
}
