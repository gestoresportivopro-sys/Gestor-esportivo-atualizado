import React from 'react';
import { Users, School, Medal, Target } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-500 font-bold tracking-wide uppercase text-sm mb-3">Sobre a Plataforma</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            O ecossistema completo para <br /> seu esporte.
          </h3>
          <p className="text-lg text-slate-400 leading-relaxed">
            Somos uma solução desenvolvida para transformar a maneira como competições são organizadas. 
            Do futebol de várzea às grandes ligas universitárias, nossa tecnologia elimina a burocracia para que 
            você foque no que realmente importa: <span className="font-bold text-white">o jogo.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <School className="w-6 h-6 text-blue-400" />,
              title: "Escolinhas",
              desc: "Gerencie turmas, amistosos e torneios internos com facilidade e pedagogia.",
              bg: "from-blue-500/10 to-blue-500/5",
              border: "border-blue-500/20"
            },
            {
              icon: <Users className="w-6 h-6 text-green-400" />,
              title: "Organizadores",
              desc: "Automação total para organizadores de ligas amadoras e profissionais.",
              bg: "from-green-500/10 to-green-500/5",
              border: "border-green-500/20"
            },
            {
              icon: <Medal className="w-6 h-6 text-yellow-400" />,
              title: "Federações",
              desc: "Estrutura robusta para campeonatos de grande porte e múltiplas fases.",
              bg: "from-yellow-500/10 to-yellow-500/5",
              border: "border-yellow-500/20"
            },
            {
              icon: <Target className="w-6 h-6 text-red-400" />,
              title: "Treinadores",
              desc: "Ferramentas táticas e de análise para acompanhar o desempenho dos atletas.",
              bg: "from-red-500/10 to-red-500/5",
              border: "border-red-500/20"
            }
          ].map((item, index) => (
            <div key={index} className={`bg-gradient-to-br ${item.bg} backdrop-blur-sm p-8 rounded-2xl border ${item.border} hover:scale-[1.02] transition-transform duration-300`}>
              <div className="bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg mb-6 border border-slate-800">
                {item.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;