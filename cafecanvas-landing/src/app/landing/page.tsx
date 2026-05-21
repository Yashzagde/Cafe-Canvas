'use client';

import Hero from './sections/Hero';
import ProblemStory from './sections/ProblemStory';
import TransformationJourney from './sections/TransformationJourney';
import FeaturesStory from './sections/FeaturesStory';
import HowItWorks from './sections/HowItWorks';
import ResultsShowcase from './sections/ResultsShowcase';
import Testimonials from './sections/Testimonials';
import FinalCTA from './sections/FinalCTA';

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-white via-orange-50/20 to-white min-h-screen text-gray-900">
      {/* HERO SECTION */}
      <Hero />
      
      {/* THE PROBLEM: A RESTAURANT OWNER'S STORY */}
      <ProblemStory />
      
      {/* THE TRANSFORMATION */}
      <TransformationJourney />
      
      {/* FEATURES WITH STORY */}
      <FeaturesStory />
      
      {/* HOW IT WORKS */}
      <HowItWorks />
      
      {/* REAL RESULTS */}
      <ResultsShowcase />
      
      {/* TESTIMONIALS */}
      <Testimonials />
      
      {/* CTA SECTION */}
      <FinalCTA />
    </div>
  );
}
