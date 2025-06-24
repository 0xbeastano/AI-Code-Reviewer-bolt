import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InteractiveDemo from './components/InteractiveDemo';
import ProblemSolutionMatrix from './components/ProblemSolutionMatrix';
import FeatureShowcase from './components/FeatureShowcase';
import ImplementationProcess from './components/ImplementationProcess';
import SocialProof from './components/SocialProof';
import ConversionSection from './components/ConversionSection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-dark text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10 pointer-events-none"></div>
      
      {/* Animated background elements */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] animate-pulse-glow"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-secondary-600/20 rounded-full blur-[100px] animate-pulse-glow"></div>
      
      <Navbar />
      <main>
        <HeroSection />
        <InteractiveDemo />
        <ProblemSolutionMatrix />
        <FeatureShowcase />
        <ImplementationProcess />
        <SocialProof />
        <ConversionSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;