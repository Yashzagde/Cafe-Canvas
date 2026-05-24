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
  title: "CafeCanvas | Coming Soon — The Shopify for Restaurants & Cafes",
  description: "CafeCanvas is launching soon. Pre-register for early access to India's first zero-commission restaurant platform. Own your digital store, your customers, and your revenue.",
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
      <body className="min-h-full flex flex-col bg-[#0A0F1C]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

