'use client';

import { useState, useEffect } from 'react';
import { Coffee, Download, Check, HelpCircle, ArrowLeft, Terminal, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
  const [progress, setProgress] = useState(0);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const downloadUrl = "https://cafe-canvas-yash.web.app/CafeCanvas-Store-Admin-Setup-1.0.0.zip";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!downloadStarted) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setDownloadStarted(true);
            triggerDownload();
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [downloadStarted]);

  const triggerDownload = () => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'CafeCanvas-Store-Admin-Setup-1.0.0.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen bg-[#fbfbf9] text-stone-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Ambient background glows */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none mask-radial" />

      <div className="max-w-xl w-full flex flex-col items-center gap-8 z-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header Profile */}
        <header className="text-center flex flex-col items-center gap-3">
          <div className="logo flex items-center gap-2 font-bold text-2xl tracking-tighter">
            <Coffee className="text-amber-600" />
            <span>Cafe<span className="text-amber-600">Canva</span></span>
          </div>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-black">Desktop Terminal Distribution</p>
        </header>

        {/* Download Box */}
        <div className="bg-white border border-stone-200 rounded-3xl p-8 w-full shadow-lg shadow-stone-250/10 flex flex-col items-center text-center gap-6">
          
          {/* Animated Download Badge */}
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-md shadow-amber-600/5 relative group">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-md opacity-100 animate-ping duration-1000" />
            <Download size={28} className="animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-stone-900">
              {progress < 100 ? "Preparing installer package..." : "Starting download..."}
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
              {progress < 100 
                ? "Compiling standalone desktop POS build with local sync engine..." 
                : "Your download has started. If the file did not download, click below to trigger manually."
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
            <div 
              className="bg-amber-600 h-full transition-all duration-100 rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          {/* CTA Link Buttons */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={triggerDownload}
              className="inline-flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-amber-600/20 active:scale-98 cursor-pointer"
            >
              <Download size={16} /> Download Desktop POS Installer
            </button>
            <a 
              href={downloadUrl} 
              download
              className="text-[11px] text-stone-500 hover:text-amber-700 font-bold transition-colors"
            >
              Trouble downloading? Click here to retry
            </a>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="w-full border-t border-stone-200 pt-8 text-left space-y-4">
          <h3 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
            <Terminal size={16} className="text-amber-600" />
            Installation Guide
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { step: '1', title: 'Extract the Archive', desc: 'Locate the downloaded `CafeCanvas-Store-Admin-Setup-1.0.0.zip` file in your Downloads folder and extract it.' },
              { step: '2', title: 'Run the Setup Wizard', desc: 'Double-click the extracted setup `.exe` (or use the `.dmg` package on macOS) to launch the installer.' },
              { step: '3', title: 'Launch and Operate', desc: 'Open the Cafe Canva desktop app from your shortcut to start taking orders with offline/online sync.' }
            ].map(s => (
              <div key={s.step} className="flex gap-4 bg-white p-4 border border-stone-200 rounded-2xl shadow-sm">
                <span className="w-7 h-7 rounded-full bg-stone-150 border border-stone-200/50 flex items-center justify-center font-black text-xs text-stone-700 flex-shrink-0">
                  {s.step}
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-stone-900 leading-tight">{s.title}</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System security warning */}
        <div className="w-full bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl flex gap-3 text-[10px] text-amber-800 font-semibold items-start leading-relaxed">
          <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <span>Note: On Windows/macOS, you may see a "SmartScreen" or untrusted publisher warning because standalone desktop releases are not signed with enterprise certificates. Click "Run Anyway" or "More Info" to continue.</span>
        </div>

        {/* Back link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-700 font-bold transition-colors mt-4"
        >
          <ArrowLeft size={12} /> Return to Home
        </Link>
      </div>
    </main>
  );
}
