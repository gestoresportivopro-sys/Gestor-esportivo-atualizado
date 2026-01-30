import React from 'react';
import { Trophy, Hammer, Clock, ArrowRight, Lock } from 'lucide-react';

interface ConstructionProps {
  onLogin: () => void;
}

const Construction: React.FC<ConstructionProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center text-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="inline-flex items-center gap-3 mb-12">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl">
                <Trophy className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex flex-col text-left">
                <span className="font-bold text-2xl tracking-tight text-white leading-none">
                Gestor<span className="text-green-400">Pro</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Sports Intelligence</span>
            </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Estamos preparando o terreno <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            para o jogo começar.
          </span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Nossa plataforma de gestão esportiva está passando por ajustes finais para garantir a melhor experiência para sua liga. 
          O lançamento oficial será em breve.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <div className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-full text-slate-300">
             <Clock className="w-4 h-4 text-blue-500" />
             <span className="text-sm font-medium">Lançamento: Em breve</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-full text-slate-300">
             <Hammer className="w-4 h-4 text-green-500" />
             <span className="text-sm font-medium">Status: Em desenvolvimento</span>
          </div>
        </div>

        {/* Access Button */}
        <div className="border-t border-slate-800 pt-8">
            <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider font-bold">Já possui acesso antecipado?</p>
            <button 
                onClick={onLogin}
                className="group inline-flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl border border-slate-700 hover:border-slate-500 transition-all text-sm backdrop-blur-sm"
            >
                <Lock className="w-4 h-4 mr-2 text-slate-400 group-hover:text-green-400 transition-colors" />
                Acessar Área Restrita
                <ArrowRight className="ml-2 h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>

      <div className="absolute bottom-8 text-xs text-slate-600">
        &copy; {new Date().getFullYear()} Gestor Esportivo Pro. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default Construction;