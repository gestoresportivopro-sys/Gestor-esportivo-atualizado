import React from 'react';
import { ArrowRight, PlayCircle, Trophy, Users, BarChart3, ShieldCheck } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-slate-950 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
         {/* Grid Pattern */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
         
         {/* Glowing Orbs */}
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Content */}
          <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wide mb-8 shadow-[0_0_10px_rgba(74,222,128,0.1)] backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              A Nova Era da Gestão Esportiva
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
              Ligas Profissionais <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-indigo-500">
                Geridas por IA.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Elimine planilhas e burocracia. Crie tabelas automáticas, gerencie inscrições e engaje atletas com uma plataforma completa e inteligente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="flex items-center justify-center bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_40px_rgba(74,222,128,0.5)] transform hover:-translate-y-1">
                Criar Campeonato Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <button className="flex items-center justify-center bg-slate-800/50 hover:bg-slate-800 text-white font-semibold py-4 px-8 rounded-xl border border-slate-700 backdrop-blur-sm transition-all hover:border-slate-500">
                <PlayCircle className="mr-2 h-5 w-5 text-blue-400" />
                Como Funciona
              </button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-wrap justify-center lg:justify-start gap-8 opacity-80">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-400 font-medium">Dados Seguros</span>
               </div>
               <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-400 font-medium">+2000 Ligas</span>
               </div>
               <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-400 font-medium">Súmula Digital</span>
               </div>
            </div>
          </div>

          {/* Visual Mockup */}
          <div className="lg:col-span-6 relative perspective-1000">
             {/* Floating Elements */}
             <div className="absolute top-0 right-0 p-4 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-20 animate-float-slow transform rotate-6 hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-400">Campeão 2024</p>
                      <p className="font-bold text-white">Lions FC</p>
                   </div>
                </div>
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                   <div className="w-full h-full bg-blue-500"></div>
                </div>
             </div>

             <div className="absolute bottom-10 left-[-20px] p-4 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-20 animate-float-delayed transform -rotate-3 hidden md:block">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   <p className="text-xs font-bold text-white uppercase tracking-wider">Ao Vivo • Final</p>
                </div>
                <div className="mt-2 flex items-center gap-4">
                   <span className="text-xl font-bold text-white">RED</span>
                   <span className="px-2 py-1 bg-slate-900 rounded text-green-400 font-mono font-bold">3 - 2</span>
                   <span className="text-xl font-bold text-white">BLU</span>
                </div>
             </div>

             {/* Main Dashboard Image */}
             <div className="relative rounded-2xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden group transform transition-transform hover:scale-[1.02] duration-700">
                <div className="absolute top-0 w-full h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                {/* Mockup Content using CSS/HTML for sharpness instead of image */}
                <div className="p-6 pt-12">
                   <div className="flex gap-6">
                      <div className="w-1/4 space-y-3">
                         <div className="h-20 bg-slate-800 rounded-xl animate-pulse"></div>
                         <div className="h-8 bg-slate-800/50 rounded-lg w-3/4"></div>
                         <div className="h-8 bg-slate-800/50 rounded-lg w-full"></div>
                         <div className="h-8 bg-slate-800/50 rounded-lg w-2/3"></div>
                      </div>
                      <div className="w-3/4 space-y-4">
                         <div className="h-32 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-xl border border-blue-500/20 p-4">
                            <div className="flex justify-between items-end h-full">
                               <div className="w-8 h-1/3 bg-blue-500/50 rounded-t"></div>
                               <div className="w-8 h-2/3 bg-blue-500/80 rounded-t shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                               <div className="w-8 h-1/2 bg-blue-500/60 rounded-t"></div>
                               <div className="w-8 h-3/4 bg-blue-500/90 rounded-t"></div>
                               <div className="w-8 h-1/4 bg-blue-500/40 rounded-t"></div>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="h-24 bg-slate-800 rounded-xl border border-slate-700"></div>
                            <div className="h-24 bg-slate-800 rounded-xl border border-slate-700"></div>
                         </div>
                      </div>
                   </div>
                </div>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;