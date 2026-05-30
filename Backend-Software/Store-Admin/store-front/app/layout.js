import "./globals.css";

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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1C1917" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
