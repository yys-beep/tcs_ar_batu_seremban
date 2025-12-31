import React, { useState } from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isGameActive: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isGameActive, theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const FEEDBACK_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf4CRHpBOMzjF5krHmtn4s18ePZeyjzz44YfYa-wdWFpBCtGw/viewform?usp=dialog"; 
  const handleFeedbackClick = () => {
    window.open(FEEDBACK_FORM_URL, '_blank');
    setIsMenuOpen(false);
  };

  if (isGameActive) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 transition-colors duration-300 bg-heritage-white/80 dark:bg-heritage-black/90 backdrop-blur-xl border-b border-heritage-orange/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24"> 
            
            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => handleNavClick('home')}>
              <div className="w-14 h-14 mr-4 transition-transform duration-500 group-hover:rotate-12">
                <Logo />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-heritage-gold font-sans text-[10px] font-semibold tracking-[0.3em] uppercase leading-tight">
                  AR Guide for
                </span>
                <span className="text-heritage-black dark:text-heritage-cream font-serif font-bold text-2xl tracking-widest leading-none mt-1 group-hover:text-heritage-orange transition-colors">
                  BATU SEREMBAN
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="ml-10 flex items-center space-x-6">

                {/* --- THEME TOGGLE --- */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-heritage-orange/10 transition-colors text-heritage-gray dark:text-white/60 hover:text-heritage-orange"
                  aria-label="Toggle Theme"
                >
                  {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  )}
                </button>

                {/* --- LANGUAGE SWITCHER BUTTON --- */}
                <button 
                  onClick={toggleLanguage}
                  className="px-3 py-1 border border-heritage-gray/30 dark:border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-heritage-orange hover:text-white transition-all flex items-center gap-2"
                >
                   <span className={lang === 'en' ? 'text-heritage-orange' : 'opacity-50'}>EN</span>
                   <span className="w-[1px] h-3 bg-heritage-gray/30 dark:bg-white/30"></span>
                   <span className={lang === 'bm' ? 'text-heritage-orange' : 'opacity-50'}>BM</span>
                </button>
                {/* -------------------------------- */}

                <button onClick={() => handleNavClick('home')} className={`relative px-2 py-2 text-xs font-bold transition-all uppercase tracking-[0.2em] hover:text-heritage-orange ${activeTab === 'home' ? 'text-heritage-orange' : 'text-heritage-gray dark:text-white/60'}`}>
                  {t('nav_home')}
                </button>
                
                <button onClick={() => handleNavClick('tutorial')} className={`relative px-2 py-2 text-xs font-bold transition-all uppercase tracking-[0.2em] hover:text-heritage-orange ${activeTab === 'tutorial' ? 'text-heritage-orange' : 'text-heritage-gray dark:text-white/60'}`}>
                  {t('nav_tutorial')}
                </button>

                <button onClick={() => handleNavClick('chat')} className={`relative px-2 py-2 text-xs font-bold transition-all uppercase tracking-[0.2em] hover:text-heritage-orange ${activeTab === 'chat' ? 'text-heritage-orange' : 'text-heritage-gray dark:text-white/60'}`}>
                  {t('nav_chat')}
                </button>

                <button onClick={handleFeedbackClick} className="relative px-2 py-2 text-xs font-bold transition-all uppercase tracking-[0.2em] text-heritage-gold hover:text-heritage-orange">
                    {t('nav_feedback')}
                </button>

                <button 
                  onClick={() => handleNavClick('game')}
                  className="ml-4 group relative px-6 py-3 overflow-hidden rounded-none border border-heritage-orange/30 bg-transparent transition-all duration-300 hover:border-heritage-orange"
                >
                  <span className="relative text-heritage-orange font-bold tracking-[0.15em] uppercase text-xs group-hover:text-heritage-gold transition-colors">
                    {t('nav_play')}
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button onClick={toggleTheme} className="text-heritage-gray dark:text-heritage-stone">
                 {theme === 'light' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
              </button>
              <button onClick={() => setIsMenuOpen(true)} className="text-heritage-gray dark:text-white/60 p-2 hover:text-heritage-orange">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMenuOpen(false)}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      </div>
      <div className={`fixed top-0 left-0 h-full w-3/4 max-w-xs transition-colors duration-300 bg-heritage-white dark:bg-heritage-black border-r border-heritage-orange/20 z-50 transform transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          <div className="flex items-center justify-between mb-12 relative z-10">
             <div className="w-10 h-10"><Logo /></div>
            <button onClick={() => setIsMenuOpen(false)} className="text-heritage-gray p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
          </div>
          
          <div className="flex flex-col space-y-6 relative z-10">
            {/* Mobile Language Switcher */}
             <button onClick={toggleLanguage} className="text-left py-2 text-xl font-serif font-medium tracking-wider text-heritage-black dark:text-white border-b border-heritage-gray/10">
                Language: <span className="text-heritage-orange">{lang === 'en' ? 'English' : 'Bahasa Melayu'}</span>
             </button>

             <button onClick={() => handleNavClick('home')} className="text-left py-2 text-xl font-serif font-medium tracking-wider text-heritage-black dark:text-heritage-cream hover:text-heritage-orange">{t('nav_home')}</button>
             <button onClick={() => handleNavClick('tutorial')} className="text-left py-2 text-xl font-serif font-medium tracking-wider text-heritage-black dark:text-heritage-cream hover:text-heritage-orange">{t('nav_tutorial')}</button>
             <button onClick={() => handleNavClick('chat')} className="text-left py-2 text-xl font-serif font-medium tracking-wider text-heritage-black dark:text-heritage-cream hover:text-heritage-orange">{t('nav_chat')}</button>
             <button onClick={handleFeedbackClick} className="text-left py-2 text-xl font-serif font-medium tracking-wider text-heritage-gold">{t('nav_feedback')}</button>
          </div>

          <button onClick={() => handleNavClick('game')} className="mt-auto w-full bg-heritage-orange text-white py-4 font-bold tracking-[0.2em] uppercase text-sm hover:bg-orange-600 transition-colors">
            {t('nav_play')}
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
