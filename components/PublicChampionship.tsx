import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Search, Share2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface PublicChampionshipProps {
  championshipId: number | string;
  onBack: () => void;
}

// Reuse types or define specific ones for public view
interface PublicTeam {
  id: number;
  name: string;
  logo_url: string | null;
  coach: string;
  team_sponsors: { name: string, logo_url: string }[];
}

interface PublicChampData {
  id: number;
  name: string;
  sport: string;
  location: string;
  description: string;
  logo_url: string | null;
  cover_url: string | null;
  config: any;
}

const PublicChampionship: React.FC<PublicChampionshipProps> = ({ championshipId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [champ, setChamp] = useState<PublicChampData | null>(null);
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [activeTab, setActiveTab] = useState<'standings' | 'matches' | 'teams'>('standings');

  useEffect(() => {
    fetchData();
  }, [championshipId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Championship Details
      const { data: champData, error: champError } = await supabase
        .from('campeonatos')
        .select('*')
        .eq('id', championshipId)
        .single();

      if (champError) throw champError;
      setChamp(champData);

      // 2. Fetch Teams with Sponsors
      // Note: We use the relational query syntax provided Supabase foreign keys are set up
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, team_sponsors(*)')
        .eq('championship_id', championshipId);

      if (teamError) {
          // Fallback if relation fails (optional robustness)
          const { data: simpleTeams } = await supabase.from('teams').select('*').eq('championship_id', championshipId);
          setTeams((simpleTeams || []).map((t:any) => ({...t, team_sponsors: []})));
      } else {
          setTeams(teamData || []);
      }

    } catch (err) {
      console.error("Error loading public data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // In a real app, this would copy the URL
    alert("Link copiado para a área de transferência!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!champ) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Campeonato não encontrado</h2>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* --- HERO SECTION --- */}
      <div className="relative bg-slate-900 pb-20">
        {/* Cover Image */}
        <div className="h-48 md:h-64 lg:h-80 w-full relative overflow-hidden">
          {champ.cover_url ? (
            <img src={champ.cover_url} className="w-full h-full object-cover opacity-60" alt="Capa" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900 opacity-80">
                {/* Abstract Pattern */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all z-20"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Content Overlay */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-20 z-10 flex flex-col md:flex-row items-end md:items-end gap-6">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-1.5 rounded-2xl shadow-2xl flex-shrink-0 mx-auto md:mx-0">
            {champ.logo_url ? (
              <img src={champ.logo_url} className="w-full h-full object-contain rounded-xl bg-slate-50" />
            ) : (
              <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-12 h-12 text-slate-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-grow text-center md:text-left mb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1 justify-center md:justify-start">
               <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-fit mx-auto md:mx-0">
                 {champ.sport}
               </span>
               <span className="text-green-400 text-xs font-semibold flex items-center justify-center md:justify-start">
                 <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Em Andamento
               </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">{champ.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-sm">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-500"/> {champ.location || 'Local a definir'}</span>
                <span className="flex items-center"><Users className="w-4 h-4 mr-1 text-slate-500"/> {teams.length} Equipes</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-4 flex gap-3 mx-auto md:mx-0">
             <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl backdrop-blur-md border border-white/10 transition-all">
                <Share2 className="w-5 h-5" />
             </button>
             {champ.config?.publicInscription && (
                 <button className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all">
                    Inscrever Equipe
                 </button>
             )}
          </div>
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-sm">
         <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto hide-scrollbar">
            {[
                { id: 'standings', label: 'Classificação' },
                { id: 'matches', label: 'Jogos & Resultados' },
                { id: 'teams', label: 'Equipes & Elencos' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === tab.id 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
         </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* TAB: STANDINGS */}
        {activeTab === 'standings' && (
            <div className="animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 w-16 text-center">Pos</th>
                                    <th className="px-6 py-4">Equipe</th>
                                    <th className="px-4 py-4 text-center" title="Pontos">P</th>
                                    <th className="px-4 py-4 text-center hidden sm:table-cell" title="Jogos">J</th>
                                    <th className="px-4 py-4 text-center hidden sm:table-cell" title="Vitórias">V</th>
                                    <th className="px-4 py-4 text-center hidden sm:table-cell" title="Empates">E</th>
                                    <th className="px-4 py-4 text-center hidden sm:table-cell" title="Derrotas">D</th>
                                    <th className="px-4 py-4 text-center hidden md:table-cell" title="Saldo de Gols">SG</th>
                                    <th className="px-6 py-4 text-center hidden lg:table-cell">Últimos 5</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {teams.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                                            A tabela será gerada assim que os jogos começarem.
                                        </td>
                                    </tr>
                                ) : (
                                    teams.map((team, index) => (
                                        <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-center font-bold text-slate-700">{index + 1}º</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3 border border-slate-200 overflow-hidden">
                                                        {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover"/> : <Shield className="w-4 h-4 text-slate-400"/>}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{team.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-slate-900">0</td>
                                            <td className="px-4 py-4 text-center text-slate-600 hidden sm:table-cell">0</td>
                                            <td className="px-4 py-4 text-center text-slate-600 hidden sm:table-cell">0</td>
                                            <td className="px-4 py-4 text-center text-slate-600 hidden sm:table-cell">0</td>
                                            <td className="px-4 py-4 text-center text-slate-600 hidden sm:table-cell">0</td>
                                            <td className="px-4 py-4 text-center text-slate-600 hidden md:table-cell">0</td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <div className="flex items-center justify-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="w-2 h-2 rounded-full bg-slate-200"></div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex gap-4 text-xs text-slate-500 px-2">
                    <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div> Classificação</span>
                    <span className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div> Rebaixamento</span>
                </div>
            </div>
        )}

        {/* TAB: MATCHES */}
        {activeTab === 'matches' && (
            <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Calendar className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Tabela de Jogos</h3>
                <p className="text-slate-500 max-w-md">O organizador ainda não divulgou a tabela de jogos oficial para esta competição.</p>
            </div>
        )}

        {/* TAB: TEAMS */}
        {activeTab === 'teams' && (
            <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                    <div key={team.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                                {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-contain"/> : <Shield className="w-8 h-8 text-slate-300"/>}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{team.name}</h3>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Técnico: {team.coach}</p>
                            </div>
                        </div>
                        
                        {/* Team Sponsors Section */}
                        {team.team_sponsors && team.team_sponsors.length > 0 ? (
                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Patrocínio</p>
                                <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
                                    {team.team_sponsors.map((sponsor, idx) => (
                                        <div key={idx} className="flex-shrink-0 group relative" title={sponsor.name}>
                                            <div className="h-8 w-auto min-w-[30px] bg-slate-50 rounded border border-slate-200 p-1 flex items-center justify-center">
                                                {sponsor.logo_url ? (
                                                    <img src={sponsor.logo_url} className="h-full w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" />
                                                ) : (
                                                    <span className="text-[8px] font-bold text-slate-400 px-1">{sponsor.name.substring(0,2)}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-400 italic">Sem patrocinadores</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

      </div>

      {/* --- FOOTER SPONSORS --- */}
      <div className="bg-white border-t border-slate-200 mt-20 py-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Parceiros Oficiais do Campeonato</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  {/* Mock Sponsors for the Event */}
                  <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><div className="w-8 h-8 bg-blue-600 rounded-lg"></div> SportsBet</div>
                  <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><div className="w-8 h-8 bg-red-600 rounded-full"></div> Cola-Cola</div>
                  <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><div className="w-8 h-8 bg-green-600 rounded-tr-xl"></div> Unimedica</div>
                  <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><div className="w-8 h-8 bg-yellow-500 rotate-45"></div> Banco XP</div>
              </div>
          </div>
      </div>
      
      <div className="bg-slate-900 py-6 text-center">
          <p className="text-slate-500 text-sm">
              Gestão realizada através do <span className="text-white font-bold">Gestor<span className="text-green-400">Pro</span></span>
          </p>
      </div>
    </div>
  );
};

// Helper Icon
const Shield = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

export default PublicChampionship;
