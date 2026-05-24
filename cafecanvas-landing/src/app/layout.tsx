import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CafeCanvas | Hospitality Operating System for Restaurants & Bars",
  description: "CafeCanvas is the premium all-in-one hospitality operating system. Manage billing, real-time analytics, QR menus, inventory, and staff operations from one connected platform.",
  keywords: ["hospitality os", "restaurant billing software", "cafe POS", "bar management", "QR table ordering", "hospitality analytics"],
  authors: [{ name: "Yash Zagade", url: "https://cafecanvas.bar" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

