import React, { useState } from 'react';
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
        return <Tutorial />;
      case 'chat':
        return <Chat />;
      case 'game':
        return <Game 
          key={Date.now()} 
          onGameOver={handleGameOver} 
          onExit={handleGameExit} 
        />;
      default:
        return <Home onStart={handleGameStart} />;
    }
  };
  
  const isGameActive = activeTab === 'game';
  const isChatActive = activeTab === 'chat';

  return (
    <LanguageProvider>
      <div className="bg-heritage-black h-[100dvh] w-full overflow-y-auto overflow-x-hidden text-white font-sans selection:bg-heritage-orange selection:text-white flex flex-col">
        
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isGameActive={isGameActive} />
        
        {/* Exit Button - Top Left on Mobile, Top Right on Desktop */}
        {isGameActive && !isGameOver && (
            <button 
              onClick={handleGameExit} 
              className="fixed top-4 left-4 md:top-6 md:right-6 md:left-auto z-50 bg-black/60 backdrop-blur-md text-white px-4 py-2 border border-white/20 rounded-full hover:bg-heritage-orange transition-colors text-[10px] md:text-xs font-bold tracking-widest shadow-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              EXIT
            </button>
        )}

        <main className="flex-grow relative w-full">
          {renderContent()}
        </main>

        {!isGameActive && !isChatActive && <Footer />}
      </div>
    </LanguageProvider>
  );
};

export default App;