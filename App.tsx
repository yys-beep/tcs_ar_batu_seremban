import React, { useState, useEffect, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tutorial from './pages/Tutorial';
import Game from './pages/Game';
import Chat from './pages/Chat';
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isGameOver, setIsGameOver] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGameStart = () => {
    setIsGameOver(false);
    setActiveTab('game');
  }
  
  const handleGameOver = () => {
    setIsGameOver(true);
    setTimeout(() => setActiveTab('home'), 5000); 
  }

  const handleGameExit = () => {
    setIsGameOver(false);
    setActiveTab('home');
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onStart={handleGameStart} />;
      case 'tutorial':
        return <Tutorial theme={theme} />;
      case 'chat':
        return <Chat theme={theme} />;
      case 'game':
        return <Game 
          key={Date.now()} 
          onGameOver={handleGameOver} 
          onExit={handleGameExit}
          theme={theme} 
        />;
      default:
        return <Home onStart={handleGameStart} />;
    }
  };
  
  const isGameActive = activeTab === 'game';
  const isChatActive = activeTab === 'chat';

  return (
    <LanguageProvider>
      <div className={`transition-colors duration-300 h-[100dvh] w-full overflow-y-auto overflow-x-hidden font-sans selection:bg-heritage-orange selection:text-white flex flex-col ${theme === 'dark' ? 'bg-heritage-black text-white' : 'bg-heritage-white text-heritage-black'}`}>
        
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isGameActive={isGameActive} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
        
        <main className="flex-grow relative w-full">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-heritage-orange"></div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>

        {!isGameActive && !isChatActive && <Footer />}
      </div>
    </LanguageProvider>
  );
};

export default App;
