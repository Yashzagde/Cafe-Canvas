"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import FeaturedItems from "@/components/home/FeaturedItems";
import BlogsPreview from "@/components/home/BlogsPreview";
import ContactInfo from "@/components/home/ContactInfo";
import ReviewsSection from "@/components/home/ReviewsSection";

export default function HomeClient({ categories, items }) {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoryCarousel categories={categories} />
        <FeaturedItems items={items} />
        <BlogsPreview />
        <ContactInfo />
        <ReviewsSection />
      </main>
      <Footer />
    </>
  );
}

