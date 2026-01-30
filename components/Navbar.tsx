import React, { useState, useEffect } from 'react';
import { Menu, X, Trophy, LogIn, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onNavigateHome: () => void;
  onLogin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    onNavigateHome();
    setIsOpen(false);
    
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-slate-900/80 backdrop-blur-md border-slate-800 py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div onClick={onNavigateHome} className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
            <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-xl">
                    <Trophy className="h-6 w-6 text-green-400" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white leading-none">
                Gestor<span className="text-green-400">Pro</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Sports Intelligence</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {['championships', 'features', 'plans'].map((item) => (
                <a 
                    key={item}
                    href={`#${item}`} 
                    onClick={(e) => handleNavClick(e, item)} 
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                >
                    {item === 'championships' ? 'Campeonatos' : item === 'features' ? 'Recursos' : 'Planos'}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all group-hover:w-full"></span>
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-slate-300 hover:text-white font-medium px-4 py-2 transition-colors flex items-center text-sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </button>
            <button 
                onClick={(e) => handleNavClick(e, 'plans')} 
                className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-2.5 px-6 rounded-full transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] transform hover:-translate-y-0.5 text-sm flex items-center"
            >
              Criar Conta <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 absolute w-full animate-fade-in shadow-2xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <a href="#championships" onClick={(e) => handleNavClick(e, 'championships')} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
              Campeonatos
            </a>
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
              Funcionalidades
            </a>
            <a href="#plans" onClick={(e) => handleNavClick(e, 'plans')} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
              Planos e Preços
            </a>
            <div className="border-t border-slate-800 my-4 pt-4 px-4">
              <button 
                onClick={() => { onLogin(); setIsOpen(false); }} 
                className="w-full text-center text-slate-300 hover:text-white py-3 rounded-xl font-medium border border-slate-700 hover:bg-slate-800 mb-3 flex items-center justify-center"
              >
                <LogIn className="w-4 h-4 mr-2" /> Acessar Conta
              </button>
              <button onClick={(e) => handleNavClick(e, 'plans')} className="w-full bg-green-500 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg hover:bg-green-400 transition-colors">
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;