import React, { useState } from 'react';
import { Search, MapPin, Calendar, Trophy, ArrowRight, Filter } from 'lucide-react';

const Championships: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Futebol', 'Futsal', 'Handebol', 'Vôlei'];

  const championships = [
    {
      id: 1,
      name: 'Copa Regional de Futebol Amador',
      sport: 'Futebol',
      location: 'São Paulo, SP',
      date: 'Início: 15 Out',
      teams: '32 Equipes',
      status: 'Inscrições Abertas',
      statusColor: 'bg-green-500/20 text-green-400 border-green-500/30',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Liga de Futsal Urbano 2024',
      sport: 'Futsal',
      location: 'Rio de Janeiro, RJ',
      date: 'Em andamento',
      teams: '12 Equipes',
      status: 'Rodada 4',
      statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Torneio Intermunicipal de Handebol',
      sport: 'Handebol',
      location: 'Belo Horizonte, MG',
      date: 'Final: 20 Nov',
      teams: '16 Equipes',
      status: 'Fase Final',
      statusColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      image: 'https://plus.unsplash.com/premium_photo-1664303124313-057d4a52024b?q=80&w=400&auto=format&fit=crop'
    }
  ];

  return (
    <section id="championships" className="py-20 bg-slate-950 relative border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Search */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <span className="text-green-400 font-bold tracking-wider uppercase text-xs mb-2 block flex items-center gap-2">
                <span className="w-8 h-[2px] bg-green-500 inline-block"></span> Área do Atleta
              </span>
              <h2 className="text-3xl font-bold text-white">Encontre seu próximo desafio</h2>
              <p className="text-slate-400 mt-2">Busque por competições em sua região e acompanhe tabelas em tempo real.</p>
            </div>
            
            <div className="w-full md:w-auto">
              <button className="text-blue-400 font-semibold flex items-center hover:text-blue-300 transition-colors group">
                Ver todos os campeonatos <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-2 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Busque por nome, cidade ou organizador..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto p-1 hide-scrollbar">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                    activeFilter === filter 
                      ? 'bg-slate-800 text-white border-slate-700 shadow-lg' 
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {championships.map((champ) => (
            <div key={champ.id} className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg hover:shadow-2xl hover:shadow-blue-900/10 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={champ.image} 
                  alt={champ.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4">
                  <span className={`${champ.statusColor} backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-lg border`}>
                    {champ.status}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white font-medium flex items-center gap-2">
                   <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                      <Trophy className="w-4 h-4 text-yellow-400" /> 
                   </div>
                   <span className="font-semibold">{champ.sport}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-lg text-white mb-3 line-clamp-1 group-hover:text-blue-400 transition-colors">{champ.name}</h3>
                
                <div className="space-y-3 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <MapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    {champ.location}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    {champ.date}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">{champ.teams}</span>
                  <span className="text-white text-sm font-bold flex items-center group-hover:text-blue-400 transition-colors">
                    Ver detalhes <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Championships;