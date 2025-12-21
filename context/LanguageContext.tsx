import React, { createContext, useState, useContext, ReactNode } from 'react';

const translations = {
  en: {
    // ... (Navbar & Home keys remain the same) ...
    nav_home: "HOME",
    nav_tutorial: "TUTORIAL",
    nav_chat: "CHAT",
    nav_feedback: "FEEDBACK",
    nav_play: "PLAY GAME",
    home_subtitle: "Badan Warisan Malaysia Project",
    home_title_1: "The Art of",
    home_title_2: "Batu Seremban",
    home_desc: "Discover Malaysia's intangible cultural heritage. Interact with the artifact, listen to the story, and master the technique in Augmented Reality.",
    home_btn_start: "Start AR Experience",
    home_btn_history: "Read History",
    home_audio_text: "Audio Guide: Origins of the Game",
    home_audio_listen: "Listen",
    home_audio_stop: "Stop",
    
    // --- UPDATED HISTORY CONTENT ---
    hist_title: "Origins & Culture",
    hist_intro: "Batu Seremban is a traditional Malaysian game passed down through generations. It has long been a popular pastime among children, especially in rural communities, and is considered part of Malaysia’s cultural heritage.",
    
    hist_section_1: "Evolution of the \"Batu\" (stones)",
    // Using <br/> logic or separate lines for clarity in translation
    hist_p1_ancient: "Ancient Times: Small stones, beads, fruit seeds, or nutshells.",
    hist_p1_historical: "Historical: Hard wooden pieces were sometimes used.",
    hist_p1_modern: "Modern Era: Today, players use marbles or small fabric bags filled with sand or beans, as seen in this AR experience.",
    
    hist_section_sewing: "The Sewing Tradition",
    hist_p_sewing: "Traditionally, mothers taught their daughters to sew the batu bags themselves, turning the game into a lesson in needlework, patience, and craftsmanship before play even begins.",
    
    hist_section_2: "Objective of the Game",
    hist_p2: "Players throw one stone into the air and use the same hand to pick up the others from the ground, catching the thrown stone before it falls. The game progresses from simple pick-ups (Buah Satu) to more advanced techniques (Timbang, Level 8), testing agility, timing, and coordination.",
    hist_close: "Close",

    // ... (Chat, Tutorial, Game keys remain the same) ...
    chat_title: "AI Digital Historian",
    chat_subtitle: "Your personal guide to the heritage of Batu Seremban.",
    chat_welcome: "Welcome! I am the AI Digital Historian for the Batu Seremban exhibit. Please ask me anything about the game's history, rules, or cultural significance.",
    chat_placeholder: "Ask about the game's origins, rules, variations...",
    chat_loading: "Consulting the archives...",
    chat_send: "SEND",
    chat_sources: "Sources:",
    tut_title: "Tutorial",
    tut_desc: "White stone = Toss. Colored stones = Pick.",
    tut_select_level: "Select Training Level",
    tut_goal: "GOAL:",
    tut_level_prefix: "Level",
    act_ready: "READY",
    act_toss: "TOSS!",
    act_dive: "DIVE",
    act_pick: "PICK",
    act_catch: "CATCH...",
    act_got_it: "GOT IT!",
    lvl_1_title: "Buah Satu", lvl_1_desc: "Toss one, pick ONE, catch.",
    lvl_2_title: "Buah Dua", lvl_2_desc: "Toss one, pick TWO at once.",
    lvl_3_title: "Buah Tiga", lvl_3_desc: "Pick three, then pick one.",
    lvl_4_title: "Buah Empat", lvl_4_desc: "Pick ALL FOUR at once.",
    lvl_5_title: "Buah Lima", lvl_5_desc: "Place stones, then catch.",
    lvl_6_title: "Tukar", lvl_6_desc: "Exchange held stone with ground.",
    lvl_7_title: "Advanced", lvl_7_desc: "Fast pace multi-catch.",
    lvl_8_title: "Timbang", lvl_8_desc: "Sweep all stones in one motion.",
    game_level_prefix: "LEVEL",
    game_toss_btn: "TOSS",
    game_reload: "⬇️ RELOAD",
    game_wait: "WAIT...",
    game_ready: "DIP HAND HERE",
    game_toss_action: "⬆️ TOSS",
    game_level_complete: "LEVEL COMPLETE!",
    game_dropped: "DROPPED!",
    game_missed: "MISSED ACTION!",
    game_champion: "CHAMPION!",
    game_scan: "Scan Hand...",
    msg_pick_1: "PICK 1 STONE",
    msg_pick_2: "PICK 2 STONES",
    msg_pick_3: "PICK 3 STONES",
    msg_pick_4: "PICK ALL 4",
    msg_place_4: "PLACE 4 STONES",
    msg_exchange: "EXCHANGE STONE",
  },
  bm: {
    // ... (Navbar & Home keys remain the same) ...
    nav_home: "UTAMA",
    nav_tutorial: "TUTORIAL",
    nav_chat: "PERBUALAN",
    nav_feedback: "MAKLUM BALAS",
    nav_play: "MULA MAIN",
    home_subtitle: "Projek Badan Warisan Malaysia",
    home_title_1: "Seni Warisan",
    home_title_2: "Batu Seremban",
    home_desc: "Terokai warisan budaya tidak ketara Malaysia. Berinteraksi dengan artifak, dengar kisahnya, dan kuasai teknik dalam Realiti Tambah (AR).",
    home_btn_start: "Mula Pengalaman AR",
    home_btn_history: "Baca Sejarah",
    home_audio_text: "Panduan Audio: Asal Usul Permainan",
    home_audio_listen: "Dengar",
    home_audio_stop: "Berhenti",
    
    // --- UPDATED HISTORY CONTENT (TRANSLATED) ---
    hist_title: "Asal Usul & Budaya",
    hist_intro: "Batu Seremban adalah permainan tradisional Malaysia yang diwarisi turun-temurun. Ia telah lama menjadi hobi popular di kalangan kanak-kanak, terutamanya di kawasan luar bandar, dan dianggap sebahagian daripada warisan budaya Malaysia.",
    
    hist_section_1: "Evolusi \"Batu\"",
    hist_p1_ancient: "Zaman Purba: Batu kecil, manik, biji buah, atau kulit kekeras.",
    hist_p1_historical: "Sejarah: Kepingan kayu keras kadang-kala digunakan.",
    hist_p1_modern: "Era Moden: Hari ini, pemain menggunakan guli atau uncang kain kecil berisi pasir atau kacang, seperti yang dilihat dalam pengalaman AR ini.",
    
    hist_section_sewing: "Tradisi Jahitan",
    hist_p_sewing: "Secara tradisi, ibu mengajar anak perempuan mereka menjahit uncang batu sendiri, menjadikan permainan ini satu pelajaran seni jarum, kesabaran, dan pertukangan sebelum permainan bermula.",
    
    hist_section_2: "Objektif Permainan",
    hist_p2: "Pemain melambung satu batu ke udara dan menggunakan tangan yang sama untuk memungut batu lain di tanah, sambil menyambut batu yang dilambung sebelum ia jatuh. Permainan berkembang dari pungutan mudah (Buah Satu) hingga teknik yang lebih maju (Timbang, Tahap 8), menguji ketangkasan, masa, dan koordinasi.",
    hist_close: "Tutup",

    // ... (Chat, Tutorial, Game keys remain the same) ...
    chat_title: "Sejarawan Digital AI",
    chat_subtitle: "Panduan peribadi anda tentang warisan Batu Seremban.",
    chat_welcome: "Selamat datang! Saya Sejarawan Digital AI untuk pameran Batu Seremban. Tanya saya apa sahaja tentang sejarah, peraturan, atau kepentingan budaya permainan ini.",
    chat_placeholder: "Tanya tentang asal usul, peraturan, variasi...",
    chat_loading: "Sedang menyemak arkib...",
    chat_send: "HANTAR",
    chat_sources: "Sumber:",
    tut_title: "Tutorial",
    tut_desc: "Batu putih = Lambung. Batu warna = Pungut.",
    tut_select_level: "Pilih Tahap Latihan",
    tut_goal: "MATLAMAT:",
    tut_level_prefix: "Tahap",
    act_ready: "SEDIA",
    act_toss: "LAMBUNG!",
    act_dive: "TERJUN",
    act_pick: "PUNGUT",
    act_catch: "SAMBUT...",
    act_got_it: "DAPAT!",
    lvl_1_title: "Buah Satu", lvl_1_desc: "Lambung satu, pungut SATU, sambut.",
    lvl_2_title: "Buah Dua", lvl_2_desc: "Lambung satu, pungut DUA serentak.",
    lvl_3_title: "Buah Tiga", lvl_3_desc: "Pungut tiga, kemudian pungut satu.",
    lvl_4_title: "Buah Empat", lvl_4_desc: "Pungut SEMUA EMPAT serentak.",
    lvl_5_title: "Buah Lima", lvl_5_desc: "Letak batu, kemudian sambut.",
    lvl_6_title: "Tukar", lvl_6_desc: "Tukar batu di tangan dengan di tanah.",
    lvl_7_title: "Advanced", lvl_7_desc: "Tangkap berbilang dengan pantas.",
    lvl_8_title: "Timbang", lvl_8_desc: "Sauk semua batu dalam satu gerakan.",
    game_level_prefix: "TAHAP",
    game_toss_btn: "LAMBUNG",
    game_reload: "⬇️ MUAT SEMULA",
    game_wait: "TUNGGU...",
    game_ready: "LETAK TANGAN",
    game_toss_action: "⬆️ LAMBUNG",
    game_level_complete: "TAHAP SELESAI!",
    game_dropped: "JATUH!",
    game_missed: "TERLEPAS!",
    game_champion: "JUARA!",
    game_scan: "Imbas Tangan...",
    msg_pick_1: "PUNGUT 1 BATU",
    msg_pick_2: "PUNGUT 2 BATU",
    msg_pick_3: "PUNGUT 3 BATU",
    msg_pick_4: "PUNGUT 4 BATU",
    msg_place_4: "LETAK 4 BATU",
    msg_exchange: "TUKAR BATU",
  }
};

type Language = 'en' | 'bm';

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'bm' : 'en'));
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};