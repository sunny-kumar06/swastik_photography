import React, { useRef, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/home/Hero';
import GallerySection from '../components/home/GallerySection';
import ServicesSection from '../components/home/ServicesSection';
import PackagesSection from '../components/home/PackagesSection';
import AboutSection from '../components/home/AboutSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import ReviewsSection from '../components/home/ReviewsSection';
import ContactSection from '../components/home/ContactSection';
import BookingSection from '../components/booking/BookingSection';
import Footer from '../components/common/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';
import PageOpeningTransition from '../components/common/PageOpeningTransition';
import { AppDataProvider } from '../context/AppDataContext';

const HomePage = () => {
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState(null);

  const scrollToBooking = () => {
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceForBooking = (service) => {
    setSelectedEventForBooking(service.category || 'Wedding');
    scrollToBooking();
  };

  const handleSelectPackageForBooking = (pkg) => {
    setSelectedPackageForBooking(pkg);
    setSelectedEventForBooking(pkg.category || 'Wedding');
    scrollToBooking();
  };

  return (
    <AppDataProvider>
      <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col selection:bg-brand-accent selection:text-white">
        {/* Luxury Cinematic Opening Transition */}
        <PageOpeningTransition />

      {/* Sticky Fixed Navbar */}
      <Navbar onBookNowClick={scrollToBooking} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero onBookNowClick={scrollToBooking} />
        <GallerySection />
        <ServicesSection onSelectServiceForBooking={handleSelectServiceForBooking} />
        <PackagesSection onSelectPackageForBooking={handleSelectPackageForBooking} />
        <AboutSection />
        <WhyChooseUs />
        <BookingSection
          preselectedEvent={selectedEventForBooking}
          preselectedPackage={selectedPackageForBooking}
        />
        <ReviewsSection />
        <ContactSection />
      </main>

      {/* Floating Action Button */}
      <WhatsAppButton />

      {/* Global Footer */}
      <Footer />
    </div>
  </AppDataProvider>
  );
};

export default HomePage;
