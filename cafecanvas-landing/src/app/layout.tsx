import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
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
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

