"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PreRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-white">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white/70 font-medium">Redirecting to registration...</p>
      </div>
    </div>
  );
}
