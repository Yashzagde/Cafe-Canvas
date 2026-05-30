import { Suspense } from "react";
import ItemsClient from "./ItemsClient";

export const metadata = {
  title: "Menu — Cafe Canvas",
  description: "Browse our complete menu of signature coffees, specialty teas, gourmet meals, and desserts. Filter by category or search for your favorites.",
};

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50" />}>
      <ItemsClient />
    </Suspense>
  );
}
