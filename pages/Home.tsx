import React from 'react';
import { TEAM_MEMBERS } from '../types';

interface HomeProps {
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen pt-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1599691422453-565896a66b24?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Malaysian cultural pattern background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-heritage-black via-heritage-black/50 to-heritage-black"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-6">
          <div style={{ animationDelay: '100ms' }} className="inline-block border border-heritage-orange px-4 py-1 rounded-full text-heritage-orange text-sm tracking-widest mb-6 uppercase animate-fade-in-up">
            Badan Warisan Malaysia
          </div>
          <h1 style={{ animationDelay: '250ms' }} className="text-5xl md:text-7xl font-serif font-bold text-heritage-cream mb-6 leading-tight animate-fade-in-up">
            The Art of <span className="text-heritage-orange">Batu Seremban</span>
          </h1>
          <p style={{ animationDelay: '400ms' }} className="text-xl text-heritage-gray mb-10 font-light max-w-2xl mx-auto animate-fade-in-up">
            Experience the intangible cultural heritage of Malaysia through 
            Augmented Reality. Learn, play, and preserve the legacy.
          </p>
          <div style={{ animationDelay: '550ms' }} className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up">
            <button 
              onClick={onStart}
              className="bg-heritage-orange hover:bg-orange-700 text-white px-8 py-4 transition-all duration-300 font-bold tracking-wider uppercase transform hover:scale-105"
            >
              Enter AR Experience
            </button>
            <button className="bg-transparent border border-heritage-gray hover:border-heritage-cream text-heritage-cream px-8 py-4 transition-all duration-300 tracking-wider uppercase transform hover:scale-105">
              Read Proposal
            </button>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-heritage-dark">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-serif text-heritage-orange mb-6">Executive Summary</h2>
            <p className="text-heritage-gray mb-6 leading-relaxed">
              We are developing an Augmented Reality (AR) Traditional Game Guide for Badan Warisan Malaysia (BWM), 
              focusing on Batu Seremban. This project addresses the difficulty in explaining complex rules 
              and the lack of engaging hands-on demonstrations for tourists.
            </p>
            <ul className="space-y-4 text-heritage-cream">
              <li className="flex items-start">
                <span className="text-heritage-orange mr-3 text-lg">✦</span>
                <span>Preserve cultural heritage via 3D digitization</span>
              </li>
              <li className="flex items-start">
                <span className="text-heritage-orange mr-3 text-lg">✦</span>
                <span>Interactive motion-controlled gameplay</span>
              </li>
              <li className="flex items-start">
                <span className="text-heritage-orange mr-3 text-lg">✦</span>
                <span>Enhance tourist experience at BWM Centre</span>
              </li>
            </ul>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 border border-heritage-orange/20 opacity-50 rounded-lg group-hover:border-heritage-orange/60 transition-all duration-700"></div>
            <img 
              src="https://images.unsplash.com/photo-1620912189873-5188f615e449?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Hands playing a traditional game" 
              className="w-full h-auto filter grayscale group-hover:grayscale-0 transition-all duration-700 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-heritage-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-serif text-center text-heritage-cream mb-16">
            Our <span className="text-heritage-orange">Team</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {TEAM_MEMBERS.map((member, index) => (
              <div key={index} className="group relative p-6 border border-heritage-gray/10 hover:border-heritage-orange/50 transition-all duration-300 bg-heritage-dark/50 transform hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-heritage-orange to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h3 className="text-heritage-cream font-serif font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-heritage-orange text-xs uppercase tracking-wider mb-2">{member.role}</p>
                <p className="text-heritage-gray text-xs font-mono">{member.matric}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;