import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full transition-colors duration-300 bg-heritage-cream dark:bg-heritage-black border-t border-heritage-gray/10 py-12 px-6 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Left Side: Project Branding */}
        <div className="text-center md:text-left">
          <p className="text-heritage-orange font-serif font-bold text-xl tracking-wider">BATU SEREMBAN AR</p>
          <p className="text-heritage-gray dark:text-heritage-stone text-sm mt-1">Preserving Malaysian Heritage • BWM Project 2025</p>
        </div>

        {/* Right Side: Credits */}
        <div className="text-heritage-gray dark:text-heritage-stone text-xs text-center md:text-right space-y-1">
          <p className="font-bold">University of Malaya</p>
          <p>© 2025 Digital Heritage Group</p>
          <p className="opacity-60 italic">Thinking and Communication Skills Project</p>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
