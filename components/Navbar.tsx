import React, { useState } from 'react';
import { Logo } from './Logo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isGameActive: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isGameActive }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = ['home', 'tutorial', 'chat'];

  // REPLACE THIS WITH YOUR ACTUAL GOOGLE FORM LINK
  const FEEDBACK_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf4CRHpBOMzjF5krHmtn4s18ePZeyjzz44YfYa-wdWFpBCtGw/viewform?usp=dialog"; 

  if (isGameActive) {
    return null; 
  }

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  // New function to handle external feedback link
  const handleFeedbackClick = () => {
    window.open(FEEDBACK_FORM_URL, '_blank'); // Opens in new tab
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-heritage-black/90 backdrop-blur-xl border-b border-heritage-orange/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24"> 
            
            {/* Brand Logo & Title */}
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => handleNavClick('home')}>
              <div className="w-14 h-14 mr-4 transition-transform duration-500 group-hover:rotate-12">
                <Logo />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-heritage-gold font-sans text-[10px] font-semibold tracking-[0.3em] uppercase leading-tight drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                  AR Guide for
                </span>
                <span className="text-heritage-cream font-serif font-bold text-2xl tracking-widest leading-none mt-1 group-hover:text-white transition-colors">
                  BATU SEREMBAN
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="ml-10 flex items-baseline space-x-8">
                {/* Standard Internal Tabs */}
                {navItems.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleNavClick(tab)}
                    className={`relative px-2 py-2 text-xs font-bold transition-all duration-500 uppercase tracking-[0.2em] group overflow-hidden
                      ${activeTab === tab ? 'text-heritage-orange' : 'text-heritage-gray hover:text-heritage-cream'}`}
                  >
                    <span className="relative z-10">{tab}</span>
                    <span className={`absolute bottom-0 left-0 h-[1px] bg-heritage-orange transition-all duration-500 ease-out
                      ${activeTab === tab ? 'w-full' : 'w-0 group-hover:w-full'}`}
                    ></span>
                  </button>
                ))}

                {/* NEW: Feedback Link (External) */}
                <button
                    onClick={handleFeedbackClick}
                    className="relative px-2 py-2 text-xs font-bold transition-all duration-500 uppercase tracking-[0.2em] group overflow-hidden text-heritage-gold hover:text-white"
                >
                    <span className="relative z-10">Feedback</span>
                    <span className="absolute bottom-0 left-0 h-[1px] bg-heritage-gold w-0 group-hover:w-full transition-all duration-500 ease-out"></span>
                </button>

                {/* Play Game Button */}
                <button 
                  onClick={() => handleNavClick('game')}
                  className="ml-8 group relative px-6 py-3 overflow-hidden rounded-none border border-heritage-orange/30 bg-transparent transition-all duration-300 hover:border-heritage-orange"
                >
                  <span className="absolute inset-0 w-0 bg-heritage-orange transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></span>
                  <span className="relative text-heritage-orange font-bold tracking-[0.15em] uppercase text-xs group-hover:text-heritage-gold transition-colors">
                    Play Game
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(true)} className="text-heritage-gray p-2 hover:text-heritage-orange transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      </div>
      <div 
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-heritage-black border-r border-heritage-orange/20 z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 flex flex-col h-full relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex items-center justify-between mb-12 relative z-10">
             <div className="w-10 h-10">
                <Logo />
             </div>
            <button onClick={() => setIsMenuOpen(false)} className="text-heritage-gray p-2 hover:text-heritage-orange transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="flex flex-col space-y-6 relative z-10">
            {navItems.map((tab) => (
              <button
                key={tab}
                onClick={() => handleNavClick(tab)}
                className={`text-left py-2 text-xl font-serif font-medium tracking-wider transition-all duration-300 ${activeTab === tab ? 'text-heritage-orange translate-x-2' : 'text-heritage-cream hover:text-white hover:translate-x-2'}`}
              >
                {tab}
              </button>
            ))}

            {/* NEW: Mobile Feedback Link */}
            <button
                onClick={handleFeedbackClick}
                className="text-left py-2 text-xl font-serif font-medium tracking-wider text-heritage-gold hover:text-white hover:translate-x-2 transition-all duration-300"
            >
                Feedback
            </button>
          </div>

          <button 
            onClick={() => handleNavClick('game')}
            className="mt-auto w-full bg-heritage-orange text-white py-4 font-bold tracking-[0.2em] uppercase text-sm hover:bg-orange-600 transition-colors"
          >
            Start Experience
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;