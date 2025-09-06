import React from 'react';
import { Hero } from '../components/marketing/Hero';
import { Features } from '../components/marketing/Features';
import { Pricing } from '../components/marketing/Pricing';
import { MarketingHeader } from '../components/layout/MarketingHeader';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <Hero />
      <Features />
      <Pricing />
    </div>
  );
}