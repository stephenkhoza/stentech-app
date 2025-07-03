import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import HeroCarousel from '../components/sections/HeroCarousel';
import './Home.css';
import StatsSection from '../components/sections/StatsSection';
import ServicesIntroSection from '../components/sections/ServicesIntroSection';
import ServicesSection from '../components/sections/ServicesSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import SupplyStoreSection from '../components/sections/SupplyStoreSection';
import PeaceOfMindSection from '../components/sections/PeaceOfMindSection';
import CustomerSupportSection from '../components/sections/CustomerSupportSection';
import CTASection from '../components/sections/CTASection';

const Home = () => {
  AOS.init();
  return (
    <div>
      <HeroCarousel />
      <StatsSection />
      <ServicesIntroSection />
      <ServicesSection />
      <FeaturesSection />
      <SupplyStoreSection />
      <PeaceOfMindSection />
      <CustomerSupportSection />
      <CTASection />
      {/* Other sections here */}
    </div>
  );
};

export default Home;
