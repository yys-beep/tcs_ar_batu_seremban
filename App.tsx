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
    // Optional: add a delay before showing the exit button or automatically returning home
    setTimeout(() => setActiveTab('home'), 5000); // Return home after 5s
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
        return <Game key={Date.now()} onGameOver={handleGameOver} />; // Use key to force re-mount
      default:
        return <Home onStart={handleGameStart} />;
    }
  };
  
  const isGameActive = activeTab === 'game';

  return (
    <div className="bg-heritage-black min-h-screen text-white font-sans selection:bg-heritage-orange selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isGameActive={isGameActive} />
      
      {isGameActive && !isGameOver && (
          <button 
            onClick={() => setActiveTab('home')} 
            className="fixed top-6 right-6 z-50 bg-black/50 text-white px-4 py-2 border border-white/20 hover:bg-heritage-orange transition-colors text-xs tracking-widest"
          >
            EXIT GAME
          </button>
      )}

      <main>
        {renderContent()}
      </main>

      {!isGameActive && <Footer />}
    </div>
  );
};

export default App;
