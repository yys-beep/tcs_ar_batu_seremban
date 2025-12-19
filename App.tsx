import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tutorial from './pages/Tutorial';
import Game from './pages/Game';
import Chat from './pages/Chat';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isGameOver, setIsGameOver] = useState(false);

  const handleGameStart = () => {
    setIsGameOver(false);
    setActiveTab('game');
  }
  
  const handleGameOver = () => {
    setIsGameOver(true);
    // Return home after 5s
    setTimeout(() => setActiveTab('home'), 5000); 
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
        return <Game key={Date.now()} onGameOver={handleGameOver} />;
      default:
        return <Home onStart={handleGameStart} />;
    }
  };
  
  const isGameActive = activeTab === 'game';

  return (
    // FIX: Changed min-h-screen to h-[100dvh] and added overflow-hidden
    // This prevents the mobile URL bar from pushing content off-screen
    <div className="bg-heritage-black h-[100dvh] w-full overflow-hidden text-white font-sans selection:bg-heritage-orange selection:text-white flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isGameActive={isGameActive} />
      
      {isGameActive && !isGameOver && (
          <button 
            onClick={() => setActiveTab('home')} 
            className="fixed top-6 right-6 z-50 bg-black/50 text-white px-4 py-2 border border-white/20 hover:bg-heritage-orange transition-colors text-xs tracking-widest"
          >
            EXIT GAME
          </button>
      )}

      {/* FIX: Main content takes remaining height properly */}
      <main className="flex-grow relative w-full h-full">
        {renderContent()}
      </main>

      {!isGameActive && <Footer />}
    </div>
  );
};

export default App;