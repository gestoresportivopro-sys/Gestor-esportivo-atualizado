import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
       {/* Background decorative blob */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-blue-600/20 to-green-500/20 rounded-full blur-[120px] opacity-40"></div>
       
       {/* Grid overlay */}
       <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Pronto para profissionalizar <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">seu campeonato?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de organizadores que já modernizaram suas competições. 
            Crie sua conta gratuita em menos de 2 minutos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] transition-all transform hover:-translate-y-1 flex items-center justify-center">
                Criar meu campeonato
                <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-10 rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center">
                Ver demonstração
            </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Cancelamento grátis
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Suporte humanizado
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;