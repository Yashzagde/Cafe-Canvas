'use client';

import { useState } from 'react';
import { 
  Download, 
  Laptop, 
  Smartphone, 
  ArrowLeft, 
  Terminal, 
  ShieldAlert, 
  Sparkles, 
  Globe, 
  Monitor, 
  ChefHat, 
  Receipt,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

// Hindi and English translation content
const content = {
  en: {
    title: 'Cafe Canvas App Center',
    subtitle: 'Equip your restaurant with our high-performance suite of desktop and mobile applications. Real-time sync, offline operation, and premium UI.',
    desktopApps: 'Desktop Operations',
    mobileApps: 'Mobile & Tablet App Ecosystem',
    backHome: 'Return to Home',
    warningTitle: 'System Security Notice',
    warningText: 'On Windows and Android, you may see untrusted publisher or developer mode warnings because these builds are compiled locally and not signed with enterprise certificates. Click "Run Anyway" or "Allow Install" to proceed.',
    features: {
      sync: 'Real-time database sync via Supabase Edge API.',
      offline: 'Local DB fallback (Dexie/Hive) for uninterrupted billing.',
      compliance: 'GST, SGST, CGST calculation and receipt generation built-in.'
    },
    apps: [
      {
        id: 'desktop-admin',
        name: 'Store Admin Dashboard (PC)',
        category: 'desktop',
        desc: 'Standalone admin console with full offline database capabilities, automated billing engine, and inventory control panels.',
        size: '78.3 MB',
        version: 'v1.0.0 (Stable)',
        btnText: 'Download for Windows (.exe)',
        url: 'https://store3.gofile.io/download/web/1a5d5118-1ead-491a-83ab-58d1542a9799/CafeCanvas%20Store%20Admin%20Setup%201.0.0.exe',
        icon: Monitor,
        accent: 'from-amber-500/20 to-orange-600/10'
      },
      {
        id: 'mobile-admin',
        name: 'Store Admin Mobile Dashboard',
        category: 'mobile',
        desc: 'Track sales, approve registrations, manage staff accounts, and view real-time operations on the go from your phone or tablet.',
        size: '10.5 MB',
        version: 'v1.0.0',
        btnText: 'Download Android APK (.apk)',
        url: 'https://cafecanvas.bar/download/store_admin_mobile.apk',
        icon: UserCheck,
        accent: 'from-blue-500/20 to-cyan-600/10'
      },
      {
        id: 'staff-pos',
        name: 'Staff POS App',
        category: 'mobile',
        desc: 'Waiters and cashiers interface. Blazing fast order taking, table booking layout, and local Bluetooth printer receipt printing.',
        size: '12.3 MB',
        version: 'v1.0.0',
        btnText: 'Download POS App (.apk)',
        url: 'https://cafecanvas.bar/download/staff_pos.apk',
        icon: Receipt,
        accent: 'from-orange-500/20 to-rose-600/10'
      },
      {
        id: 'kds',
        name: 'Kitchen Display System (KDS)',
        category: 'mobile',
        desc: 'Order management terminal for chefs. Real-time updates, item sorting by category, cooking time trackers, and alert triggers.',
        size: '11.8 MB',
        version: 'v1.0.0',
        btnText: 'Download KDS App (.apk)',
        url: 'https://cafecanvas.bar/download/kitchen_display.apk',
        icon: ChefHat,
        accent: 'from-emerald-500/20 to-teal-600/10'
      },
      {
        id: 'customer-storefront',
        name: 'Customer Storefront App',
        category: 'mobile',
        desc: 'Self-ordering app for guests. QR table linking, full interactive digital menu, active reward points tracking, and payment gateways.',
        size: '9.7 MB',
        version: 'v1.0.0',
        btnText: 'Download Storefront (.apk)',
        url: 'https://cafecanvas.bar/download/customer_storefront.apk',
        icon: Sparkles,
        accent: 'from-purple-500/20 to-indigo-600/10'
      }
    ]
  },
  hi: {
    title: 'कैफे कैनवास ऐप केंद्र',
    subtitle: 'अपने रेस्तरां को हमारे डेस्कटॉप और मोबाइल अनुप्रयोगों के उच्च-प्रदर्शन सुइट से लैस करें। रीयल-टाइम सिंक, ऑफ़लाइन संचालन और प्रीमियम यूजर इंटरफेस।',
    desktopApps: 'डेस्कटॉप संचालन',
    mobileApps: 'मोबाइल और टैबलेट ऐप पारिस्थितिकी तंत्र',
    backHome: 'होम पर वापस जाएं',
    warningTitle: 'सिस्टम सुरक्षा सूचना',
    warningText: 'विंडोज और एंड्रॉइड पर, आपको असुरक्षित प्रकाशक या डेवलपर मोड की चेतावनी दिखाई दे सकती है क्योंकि ये बिल्ड स्थानीय रूप से संकलित हैं और एंटरप्राइज प्रमाणपत्रों के साथ हस्ताक्षरित नहीं हैं। जारी रखने के लिए "फिर भी चलाएं" या "इंस्टॉल की अनुमति दें" पर क्लिक करें।',
    features: {
      sync: 'सुपाबेस एज एपीआई (Supabase Edge API) के माध्यम से रीयल-टाइम डेटाबेस सिंक।',
      offline: 'निर्बाध बिलिंग के लिए स्थानीय डेटाबेस बैकअप (Dexie/Hive)।',
      compliance: 'जीएसटी (GST), एसजीएसटी (SGST), सीजीएसटी (CGST) गणना और रसीद निर्माण अंतर्निहित है।'
    },
    apps: [
      {
        id: 'desktop-admin',
        name: 'स्टोर एडमिन डैशबोर्ड (पीसी)',
        category: 'desktop',
        desc: 'पूर्ण ऑफ़लाइन डेटाबेस क्षमताओं, स्वचालित बिलिंग इंजन और इन्वेंट्री नियंत्रण पैनलों के साथ स्टैंडअलोन एडमिन कंसोल।',
        size: '78.3 MB',
        version: 'v1.0.0 (स्थिर)',
        btnText: 'विंडोज के लिए डाउनलोड करें (.exe)',
        url: 'https://store3.gofile.io/download/web/1a5d5118-1ead-491a-83ab-58d1542a9799/CafeCanvas%20Store%20Admin%20Setup%201.0.0.exe',
        icon: Monitor,
        accent: 'from-amber-500/20 to-orange-600/10'
      },
      {
        id: 'mobile-admin',
        name: 'स्टोर एडमिन मोबाइल डैशबोर्ड',
        category: 'mobile',
        desc: 'बिक्री ट्रैक करें, पंजीकरण स्वीकृत करें, कर्मचारियों के खाते प्रबंधित करें और अपने फोन या टैबलेट से रीयल-टाइम संचालन देखें।',
        size: '10.5 MB',
        version: 'v1.0.0',
        btnText: 'एंड्रॉइड एपीके डाउनलोड करें (.apk)',
        url: 'https://cafecanvas.bar/download/store_admin_mobile.apk',
        icon: UserCheck,
        accent: 'from-blue-500/20 to-cyan-600/10'
      },
      {
        id: 'staff-pos',
        name: 'स्टाफ पीओएस ऐप',
        category: 'mobile',
        desc: 'वेटर्स और कैशियर्स के लिए इंटरफ़ेस। बेहद तेज़ ऑर्डर लेना, टेबल बुकिंग लेआउट और स्थानीय ब्लूटूथ प्रिंटर रसीद प्रिंटिंग।',
        size: '12.3 MB',
        version: 'v1.0.0',
        btnText: 'पीओएस ऐप डाउनलोड करें (.apk)',
        url: 'https://cafecanvas.bar/download/staff_pos.apk',
        icon: Receipt,
        accent: 'from-orange-500/20 to-rose-600/10'
      },
      {
        id: 'kds',
        name: 'किचन डिस्प्ले सिस्टम (KDS)',
        category: 'mobile',
        desc: 'शेफ के लिए ऑर्डर प्रबंधन टर्मिनल। रीयल-टाइम अपडेट, श्रेणी के आधार पर आइटम सॉर्टिंग, खाना पकाने के समय के ट्रैकर्स और अलर्ट।',
        size: '11.8 MB',
        version: 'v1.0.0',
        btnText: 'KDS ऐप डाउनलोड करें (.apk)',
        url: 'https://cafecanvas.bar/download/kitchen_display.apk',
        icon: ChefHat,
        accent: 'from-emerald-500/20 to-teal-600/10'
      },
      {
        id: 'customer-storefront',
        name: 'ग्राहक स्टोरफ्रंट ऐप',
        category: 'mobile',
        desc: 'मेहमानों के लिए सेल्फ-ऑर्डरिंग ऐप। क्यूआर टेबल लिंकिंग, पूर्ण डिजिटल मेनू, सक्रिय रिवॉर्ड पॉइंट ट्रैकिंग और भुगतान गेटवे।',
        size: '9.7 MB',
        version: 'v1.0.0',
        btnText: 'स्टोरफ्रंट ऐप डाउनलोड करें (.apk)',
        url: 'https://cafecanvas.bar/download/customer_storefront.apk',
        icon: Sparkles,
        accent: 'from-purple-500/20 to-indigo-600/10'
      }
    ]
  }
};

export default function DownloadsAppPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = content[lang];

  return (
    <main className="min-h-screen text-stone-100 flex flex-col items-center justify-start p-4 md:p-8 relative overflow-hidden font-sans bg-stone-950">
      
      {/* Restaurant background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105 filter blur-[2px]"
        style={{ 
          backgroundImage: "url('/assets/restaurant_bg.png')",
        }} 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-950/85 to-stone-950/95 backdrop-blur-[6px] pointer-events-none" />

      {/* Floating Ambient Liquid Blobs behind Glass Panels */}
      <div className="liquid-blob-1 opacity-20 top-20 left-10 animate-pulse" />
      <div className="liquid-blob-2 opacity-15 bottom-20 right-10" />
      <div className="liquid-blob-3 opacity-15 top-1/2 left-1/3" />

      <div className="max-w-6xl w-full flex flex-col gap-8 z-10 py-6 md:py-10 animate-fade-in">
        
        {/* Navigation & Language Switcher Bar */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-amber-500 transition-colors font-bold group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {t.backHome}
          </Link>

          {/* Bilingual Switcher */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-white/10 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer"
          >
            <Globe size={14} className="text-amber-500" />
            <span>{lang === 'en' ? 'हिंदी (IN)' : 'English (US)'}</span>
          </button>
        </div>

        {/* Hero Section */}
        <header className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
          <div className="space-y-3 max-w-2xl">
            <div className="logo flex items-center justify-center md:justify-start gap-2.5 font-extrabold text-3xl md:text-4xl tracking-tighter">
              <img src="/logo.png" alt="Cafe Canvas Logo" className="w-9 h-9 object-contain" />
              <span>Cafe<span className="text-amber-500">Canva</span></span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
              {t.title}
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Value Props Mini Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-col gap-3 flex-shrink-0 md:max-w-xs w-full sm:w-auto">
            {[
              { id: '1', text: t.features.sync },
              { id: '2', text: t.features.offline },
              { id: '3', text: t.features.compliance }
            ].map(f => (
              <div 
                key={f.id} 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-md flex items-center gap-2.5 text-[11px] font-semibold text-stone-300 shadow-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Liquid Glass Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Desktop App (Highlight) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h2 className="text-xs uppercase tracking-widest font-black text-amber-500 flex items-center gap-2 pl-1">
              <Laptop size={14} />
              {t.desktopApps}
            </h2>

            {t.apps.filter(app => app.category === 'desktop').map(app => {
              const IconComponent = app.icon;
              return (
                <div 
                  key={app.id}
                  className={`relative overflow-hidden bg-gradient-to-br ${app.accent} bg-stone-900/60 border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col gap-6`}
                >
                  {/* Decorative glass shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {app.version}
                      </span>
                      <h3 className="text-xl font-black text-white tracking-tight mt-2">
                        {app.name}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-md">
                      <IconComponent size={24} />
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {app.desc}
                  </p>

                  <div className="flex items-center gap-6 text-[10px] text-stone-400 font-bold border-t border-white/5 pt-4">
                    <div>
                      <span>Size: </span>
                      <span className="text-stone-200">{app.size}</span>
                    </div>
                    <div>
                      <span>Platform: </span>
                      <span className="text-stone-200">Windows 10/11</span>
                    </div>
                  </div>

                  <a 
                    href={app.url}
                    download
                    className="inline-flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-amber-600/20 hover:shadow-amber-500/30 active:scale-98 cursor-pointer text-center"
                  >
                    <Download size={15} />
                    {app.btnText}
                  </a>
                </div>
              );
            })}

            {/* Installation warning container */}
            <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl flex gap-3 text-[11px] text-amber-400 font-semibold items-start leading-relaxed backdrop-blur-md">
              <ShieldAlert size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs">{t.warningTitle}</h4>
                <p className="text-stone-300 font-medium leading-relaxed">{t.warningText}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Mobile App Grid */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="text-xs uppercase tracking-widest font-black text-amber-500 flex items-center gap-2 pl-1">
              <Smartphone size={14} />
              {t.mobileApps}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {t.apps.filter(app => app.category === 'mobile').map(app => {
                const IconComponent = app.icon;
                return (
                  <div 
                    key={app.id}
                    className={`relative overflow-hidden bg-gradient-to-br ${app.accent} bg-stone-900/40 border border-white/5 hover:border-amber-500/30 rounded-3xl p-5 md:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between gap-5`}
                  >
                    {/* Glass shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/3 to-white/0 pointer-events-none" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-stone-300 border border-white/10">
                          {app.version}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-stone-200">
                          <IconComponent size={18} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-white tracking-tight leading-snug">
                          {app.name}
                        </h3>
                        <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-3">
                          {app.desc}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-white/5 pt-3">
                      <div className="flex items-center justify-between text-[9px] text-stone-400 font-bold">
                        <span>Size: {app.size}</span>
                        <span>OS: Android 8.0+</span>
                      </div>
                      
                      <a 
                        href={app.url}
                        download
                        className="inline-flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 hover:border-amber-500/30 text-white font-bold py-2.5 px-4 border border-white/10 rounded-xl text-[11px] transition-all active:scale-98 cursor-pointer text-center"
                      >
                        <Download size={13} />
                        {app.btnText}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <footer className="w-full text-center border-t border-white/5 pt-8 mt-4 text-[10px] text-stone-500 font-bold space-y-1">
          <p>© {new Date().getFullYear()} Cafe Canvas OS. All rights reserved.</p>
          <p>Powered by Next.js 15, Supabase, Tailwind CSS 4, and TypeScript.</p>
        </footer>

      </div>
    </main>
  );
}
