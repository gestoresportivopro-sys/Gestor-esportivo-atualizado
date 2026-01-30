import React from 'react';
import { Check, Star } from 'lucide-react';
import { PlanType } from '../App';

interface PlansProps {
  onSelectPlan: (plan: PlanType) => void;
}

const Plans: React.FC<PlansProps> = ({ onSelectPlan }) => {
  const plans: PlanType[] = [
    {
      name: "Starter",
      price: "Grátis",
      period: "30 dias",
      isFree: true,
      features: [
        "1 Campeonato ativo",
        "Até 8 equipes",
        "Tabelas automáticas",
        "Súmula digital básica",
        "Link público do campeonato"
      ]
    },
    {
      name: "Pro",
      price: "R$ 49,90",
      period: "/mês",
      features: [
        "Até 5 campeonatos ativos",
        "Até 32 equipes por torneio",
        "Gestão financeira básica",
        "Súmula com estatísticas",
        "IA para geração de confrontos",
        "Suporte via chat"
      ]
    },
    {
      name: "Elite",
      price: "R$ 89,90",
      period: "/mês",
      features: [
        "Campeonatos ilimitados",
        "Equipes ilimitadas",
        "Site personalizado (White Label)",
        "App exclusivo para atletas",
        "API de integração",
        "Gestor financeiro completo",
        "Suporte Prioritário 24/7"
      ]
    }
  ];

  return (
    <section id="plans" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-green-400 font-semibold tracking-wide uppercase text-sm mb-2">Planos e Preços</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Escolha o plano ideal para sua liga
          </h3>
          <p className="text-lg text-slate-400">
            Comece gratuitamente e evolua conforme seu campeonato cresce. Sem contratos de fidelidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 ${
                idx === 1 
                ? 'bg-slate-800 border-2 border-blue-500 shadow-2xl scale-105 z-10' 
                : 'bg-slate-900/50 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              {idx === 1 && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center shadow-lg">
                  <Star className="w-3 h-3 mr-1 fill-white" /> Mais Popular
                </div>
              )}

              <div className="mb-6">
                <h4 className={`text-xl font-bold mb-2 ${idx === 1 ? 'text-white' : 'text-slate-300'}`}>
                  {plan.name}
                </h4>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-500 ml-2">{plan.period}</span>
                </div>
                {plan.isFree && <p className="text-green-400 text-sm mt-2 font-medium">Cartão de crédito não necessário</p>}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start">
                    <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${idx === 1 ? 'text-blue-400' : 'text-green-500'}`} />
                    <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onSelectPlan(plan)}
                className={`w-full py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 ${
                  idx === 1 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {plan.isFree ? 'Começar Grátis' : 'Assinar Agora'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Plans;