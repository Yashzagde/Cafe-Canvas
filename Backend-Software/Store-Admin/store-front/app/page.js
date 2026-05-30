import HomeClient from "./HomeClient";
import { getCategories, getMenuItems } from "@/utils/api";

export const metadata = {
  title: "Cafe Canvas — Artisanal Coffee & Gourmet Kitchen",
  description: "Browse our handcrafted menu of specialty coffees, gourmet meals, and seasonal creations. Order online or dine in at Cafe Canvas.",
};

export default async function HomePage() {
  // Fetch data server-side for SEO
  let categories, items;
  try {
    [categories, items] = await Promise.all([
      getCategories(),
      getMenuItems(),
    ]);
  } catch {
    categories = [];
    items = [];
  }

  return <HomeClient categories={categories} items={items} />;
}
