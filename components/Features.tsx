import React from 'react';
import { 
  Trophy, 
  Table, 
  FileSpreadsheet, 
  Users2, 
  Dna, 
  BrainCircuit,
  Zap,
  Smartphone
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "Inteligência Artificial",
      desc: "Algoritmos que geram chaves de torneio equilibradas e previnem conflitos de horário automaticamente.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Table className="w-6 h-6" />,
      title: "Tabelas em Tempo Real",
      desc: "Atualizou o placar no app? O site do campeonato é atualizado no mesmo segundo para toda a torcida.",
      color: "from-green-400 to-emerald-600"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Súmula Digital (App)",
      desc: "Árbitros registram gols e cartões pelo celular. Elimine o papel e erros de contagem manual.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: "Gestão de Atletas",
      desc: "Histórico completo, estatísticas individuais, fotos e controle de suspensões automático.",
      color: "from-orange-400 to-red-500"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Múltiplos Formatos",
      desc: "Pontos corridos, mata-mata, fase de grupos. O sistema se adapta ao regulamento da sua liga.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Site Exclusivo",
      desc: "Sua competição ganha uma página profissional automática com SEO otimizado para o Google.",
      color: "from-cyan-400 to-blue-500"
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-900/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Tecnologia de ponta para <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              o seu campeonato.
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Ferramentas profissionais que transformam a experiência de organizadores, atletas e torcedores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="group relative bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden hover:-translate-y-1">
              
              {/* Gradient Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Top Line Gradient */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>

              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-slate-800 border border-slate-700 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                <div className={`text-transparent bg-clip-text bg-gradient-to-br ${feature.color}`}>
                    {feature.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed relative z-10">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;