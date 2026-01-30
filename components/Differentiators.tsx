import React from 'react';
import { CheckCircle2, Clock, Zap, ShieldCheck } from 'lucide-react';

const Differentiators: React.FC = () => {
  return (
    <section id="differentials" className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="mb-12 lg:mb-0 relative">
             <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl blur-lg opacity-30"></div>
             {/* Handball Image */}
             <img 
               src="https://images.unsplash.com/photo-1518605339994-3ee299f1797c?q=80&w=600&auto=format&fit=crop" 
               alt="Handebol em Ação" 
               className="relative rounded-2xl shadow-2xl border border-slate-700 w-full object-cover h-[600px] hover:scale-[1.02] transition-transform duration-500"
             />
             
             {/* Floating Info Cards */}
             <div className="absolute bottom-10 right-[-20px] bg-white text-slate-900 p-6 rounded-xl shadow-lg max-w-xs hidden md:block animate-fade-in-up">
                <div className="flex items-center gap-4 mb-3">
                   <div className="bg-green-100 p-2 rounded-full">
                      <Clock className="w-6 h-6 text-green-600" />
                   </div>
                   <div>
                      <p className="font-bold text-lg">90% menos tempo</p>
                      <p className="text-xs text-slate-500">na organização das tabelas</p>
                   </div>
                </div>
             </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Por que escolher o <br/>
              <span className="text-green-400">Gestor Esportivo Pro?</span>
            </h2>

            <div className="space-y-8">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-yellow-400" />,
                  title: "Gestão Simplificada",
                  desc: "Interface limpa e objetiva. Você não precisa ser um expert em tecnologia para organizar um campeonato profissional."
                },
                {
                  icon: <Clock className="w-6 h-6 text-green-400" />,
                  title: "Economia de Tempo",
                  desc: "Tarefas que levavam horas são feitas em cliques. Deixe a IA cuidar do trabalho pesado de agendamento."
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
                  title: "Organização Profissional",
                  desc: "Transmita credibilidade para atletas e patrocinadores com um site exclusivo para seu campeonato gerado automaticamente."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                       {item.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-slate-800 rounded-xl border border-slate-700">
               <h4 className="flex items-center text-lg font-semibold mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
                  Plano Básico Gratuito
               </h4>
               <p className="text-slate-400 text-sm mb-4">
                  Comece a usar hoje mesmo sem cartão de crédito. Ideal para torneios pequenos.
               </p>
               <a href="#" className="text-green-400 hover:text-green-300 font-semibold text-sm flex items-center">
                  Ver tabela de preços <span className="ml-1">→</span>
               </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Differentiators;