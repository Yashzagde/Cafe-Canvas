import "./globals.css";
import "../storefront-themes/theme-styles.css";
import ThemeInitializer from "@/components/layout/ThemeInitializer";

export const metadata = {
  title: "Cafe Canvas — Artisanal Coffee & Gourmet Kitchen",
  description: "Browse our handcrafted menu of specialty coffees, gourmet meals, and seasonal creations. Order online or dine in at Cafe Canvas.",
  keywords: ["cafe", "digital menu", "coffee", "food ordering", "restaurant"],
  openGraph: {
    title: "Cafe Canvas — Artisanal Coffee & Gourmet Kitchen",
    description: "Browse our artisanal menu and order online.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;1,9..144,400&family=Space+Grotesk:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400&family=Cinzel:wght@500;700&family=Outfit:wght@400;500;600;700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Oswald:wght@500;700&family=Lora:ital,wght@0,400;0,600;1,400&family=EB+Garamond:ital,wght@0,400;1,400&family=Pacifico&family=Lobster&family=Amiri:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1C1917" />
      </head>
      <body className="antialiased">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}

