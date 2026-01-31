import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, Home, PlusCircle, BarChart2, FileText, Share2, Settings, HelpCircle, LogIn, LogOut, 
  Menu, X, Search, Bell, User, Calendar, MapPin, Upload, ChevronRight, Layers, Users, 
  Dna, Image as ImageIcon, Video, MessageSquare, Save, Printer, Trash2, Lock, CheckCircle, AlertCircle,
  Info, Camera, Shield, UserPlus, Phone, Globe, Facebook, Instagram, Mail, Award, AlertTriangle, PlayCircle,
  ChevronUp, ChevronDown, Loader2, MoreVertical, Database, Copy, Check, Edit, ExternalLink, CalendarDays,
  Briefcase, RefreshCw, Timer, CreditCard, Hash, Fingerprint, ArrowLeft
} from 'lucide-react';
import { UserType } from '../App';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
  onViewPublicPage: (id: number | string) => void;
}

// --- TYPES ---

type ViewState = 'list' | 'create_selection' | 'create_form' | 'manage';
type ManageTab = 'home' | 'teams' | 'athletes' | 'matches' | 'stats' | 'media' | 'settings';
type CreateStep = 'info' | 'rules' | 'scoring' | 'contact' | 'visual';

interface Sponsor {
  id: string;
  name: string;
  logo: string | null;
}

interface Athlete {
  id: string;
  team_id: number;
  name: string;
  nickname?: string;
  birth_date?: string;
  document?: string;
  phone?: string;
  position?: string;
  jersey_number?: number;
  photo_url: string | null;
}

interface Team {
  id: number;
  name: string;
  coach: string;
  assistant?: string;
  founded_at?: string;
  contact_phone?: string;
  logo_url: string | null;
  played?: number;
  points?: number;
  team_sponsors?: { name: string, logo_url: string }[];
  total_athletes?: number;
}

interface Match {
  id: string;
  championship_id: number;
  round: number;
  home_team_id: number;
  away_team_id: number;
  home_score: number | null;
  away_score: number | null;
  date: string | null;
  location: string | null;
  status: 'scheduled' | 'finished' | 'live';
  home_team?: Team; 
  away_team?: Team; 
}

interface ChampionshipConfig {
    id: number | string;
    name: string;
    sport: string; 
    type: string; 
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    logo: string | null;
    cover: string | null;
    organizerPhone: string;
    organizerEmail: string;
    organizerSite: string;
    organizerInsta: string;
    organizerFace: string;
    rulesText: string;
    pointsWin: number;
    pointsDraw: number;
    pointsLoss: number;
    suspensionYellow: number;
    suspensionRed: number;
    suspensionBlue: number; 
    tieBreakers: string[]; 
    prizes: { first: string, second: string, third: string };
    publicInscription: boolean;
    showStatsPublicly: boolean;
    allowComments: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onViewPublicPage }) => {
  // --- STATE ---
  const [view, setView] = useState<ViewState>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [manageTab, setManageTab] = useState<ManageTab>('home');
  const [createStep, setCreateStep] = useState<CreateStep>('info');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Database Missing State
  const [dbMissing, setDbMissing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State for Championship
  const initialFormState: ChampionshipConfig = {
      id: 0,
      name: '', sport: 'Futebol', type: 'Fase de Grupos + Mata-mata',
      startDate: '', endDate: '', location: '', description: '',
      logo: null, cover: null,
      organizerPhone: '', organizerEmail: user.email, organizerSite: '', organizerInsta: '', organizerFace: '',
      rulesText: '',
      pointsWin: 3, pointsDraw: 1, pointsLoss: 0,
      suspensionYellow: 3, suspensionRed: 1, suspensionBlue: 0,
      tieBreakers: ['Vitórias', 'Saldo de Gols', 'Gols Pró', 'Confronto Direto'],
      prizes: { first: '', second: '', third: '' },
      publicInscription: false, showStatsPublicly: true, allowComments: true
  };

  const [champForm, setChampForm] = useState<ChampionshipConfig>(initialFormState);
  const [currentChamp, setCurrentChamp] = useState<ChampionshipConfig | null>(null);
  const [myChampionships, setMyChampionships] = useState<ChampionshipConfig[]>([]);

  // --- TEAM MANAGEMENT STATE ---
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamModalTab, setTeamModalTab] = useState<'info' | 'roster'>('info');
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  
  // --- ATHLETE MANAGEMENT STATE ---
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(false);
  const [isAthleteFormOpen, setIsAthleteFormOpen] = useState(false); 
  const [athleteForm, setAthleteForm] = useState<Partial<Athlete>>({
      name: '', nickname: '', birth_date: '', document: '', phone: '', position: '', jersey_number: undefined, photo_url: null
  });

  // --- MATCH MANAGEMENT STATE ---
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [generatingMatches, setGeneratingMatches] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoreForm, setScoreForm] = useState({ home: '', away: '', status: 'finished' });
  
  // Team Form State
  const [teamForm, setTeamForm] = useState({ 
    name: '', 
    coach: '', 
    assistant: '', 
    foundedAt: '', 
    contact: '', 
    logo: null as string | null,
    sponsors: [] as Sponsor[]
  });

  // --- SQL SCRIPT CONSTANT ---
  const sqlScript = `-- SETUP COMPLETO (Copie e execute no SQL Editor do Supabase)

-- 1. Tabela de Perfis
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  plan text default 'Starter'
);

-- 2. Tabela de Campeonatos
create table if not exists public.campeonatos (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  name text not null,
  sport text,
  type text,
  start_date date,
  end_date date,
  location text,
  description text,
  logo_url text,
  cover_url text,
  config jsonb default '{}'::jsonb
);

-- 3. Tabela de Times
create table if not exists public.teams (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  championship_id bigint references public.campeonatos on delete cascade not null,
  name text not null,
  coach text,
  assistant text,
  founded_at date,
  contact_phone text,
  logo_url text
);

-- 4. Tabela de Patrocinadores
create table if not exists public.team_sponsors (
  id uuid default gen_random_uuid() primary key,
  team_id bigint references public.teams on delete cascade not null,
  name text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Atletas (ESSENCIAL)
create table if not exists public.athletes (
  id uuid default gen_random_uuid() primary key,
  team_id bigint references public.teams on delete cascade not null,
  name text not null,
  nickname text,
  birth_date date,
  document text,
  phone text,
  position text,
  jersey_number int,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabela de Jogos
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  championship_id bigint references public.campeonatos on delete cascade not null,
  round int not null,
  home_team_id bigint references public.teams(id) on delete set null,
  away_team_id bigint references public.teams(id) on delete set null,
  home_score int,
  away_score int,
  status text default 'scheduled',
  date timestamp with time zone,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Segurança (RLS)
alter table public.profiles enable row level security;
alter table public.campeonatos enable row level security;
alter table public.teams enable row level security;
alter table public.team_sponsors enable row level security;
alter table public.athletes enable row level security;
alter table public.matches enable row level security;

-- Policies (Permitir tudo para o dono)
drop policy if exists "Usuario ver proprio perfil" on public.profiles;
create policy "Usuario ver proprio perfil" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Usuario atualizar proprio perfil" on public.profiles;
create policy "Usuario atualizar proprio perfil" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Usuario criar proprio perfil" on public.profiles;
create policy "Usuario criar proprio perfil" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Usuario gerenciar seus campeonatos" on public.campeonatos;
create policy "Usuario gerenciar seus campeonatos" on public.campeonatos using (auth.uid() = user_id);

drop policy if exists "Usuario gerenciar seus times" on public.teams;
create policy "Usuario gerenciar seus times" on public.teams using (auth.uid() = user_id);

drop policy if exists "Usuario gerenciar patrocinadores" on public.team_sponsors;
create policy "Usuario gerenciar patrocinadores" on public.team_sponsors using (exists (select 1 from public.teams t where t.id = team_sponsors.team_id and t.user_id = auth.uid()));

drop policy if exists "Usuario gerenciar atletas" on public.athletes;
create policy "Usuario gerenciar atletas" on public.athletes using (exists (select 1 from public.teams t where t.id = athletes.team_id and t.user_id = auth.uid()));

drop policy if exists "Usuario gerenciar jogos" on public.matches;
create policy "Usuario gerenciar jogos" on public.matches using (exists (select 1 from public.campeonatos c where c.id = matches.championship_id and c.user_id = auth.uid()));

-- 8. Gatilho de Novo Usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, plan)
  values (new.id, new.raw_user_meta_data->>'full_name', 'Starter')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`;

  // --- SUPABASE INTEGRATION ---

  // Check DB Health on Mount
  useEffect(() => {
    const checkDb = async () => {
        // We attempt to select from 'athletes' specifically to catch the missing table error
        const { error } = await supabase.from('athletes').select('id').limit(1);
        if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
            console.warn("Tabela 'athletes' não encontrada. Exibindo setup.");
            setDbMissing(true);
        }
    };
    checkDb();
  }, []);

  useEffect(() => {
    fetchChampionships();
  }, [user.id]);

  useEffect(() => {
      if (view === 'manage' && (manageTab === 'teams' || manageTab === 'matches') && currentChamp) {
          fetchTeams(currentChamp.id);
      }
      if (view === 'manage' && manageTab === 'matches' && currentChamp) {
          fetchMatches(currentChamp.id);
      }
  }, [view, manageTab, currentChamp]);

  useEffect(() => {
      if (isTeamModalOpen && teamModalTab === 'roster' && editingTeamId) {
          fetchAthletes(editingTeamId);
      }
  }, [isTeamModalOpen, teamModalTab, editingTeamId]);

  const fetchChampionships = async () => {
    setLoading(true);
    setDbMissing(false);
    try {
      const { data, error } = await supabase
        .from('campeonatos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedChamps: ChampionshipConfig[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          sport: row.sport,
          type: row.type,
          startDate: row.start_date || '',
          endDate: row.end_date || '',
          location: row.location || '',
          description: row.description || '',
          logo: row.logo_url,
          cover: row.cover_url,
          organizerPhone: row.config?.organizerPhone || '',
          organizerEmail: row.config?.organizerEmail || '',
          organizerSite: row.config?.organizerSite || '',
          organizerInsta: row.config?.organizerInsta || '',
          organizerFace: row.config?.organizerFace || '',
          rulesText: row.config?.rulesText || '',
          pointsWin: row.config?.pointsWin ?? 3,
          pointsDraw: row.config?.pointsDraw ?? 1,
          pointsLoss: row.config?.pointsLoss ?? 0,
          suspensionYellow: row.config?.suspensionYellow ?? 3,
          suspensionRed: row.config?.suspensionRed ?? 1,
          suspensionBlue: row.config?.suspensionBlue ?? 0,
          tieBreakers: row.config?.tieBreakers || ['Vitórias'],
          prizes: row.config?.prizes || { first: '', second: '', third: '' },
          publicInscription: row.config?.publicInscription ?? false,
          showStatsPublicly: row.config?.showStatsPublicly ?? true,
          allowComments: row.config?.allowComments ?? true,
        }));
        setMyChampionships(mappedChamps);
      }
    } catch (error: any) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn("Tabelas não encontradas. Solicitando setup.");
          setDbMissing(true);
          setMyChampionships([]); 
      } else {
          console.error('Erro ao buscar campeonatos:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (champId: string | number) => {
      setLoadingTeams(true);
      try {
          const { data, error } = await supabase
            .from('teams')
            .select('*, team_sponsors(*)')
            .eq('championship_id', champId)
            .order('name', { ascending: true });

          if (error) throw error;

          if (data) {
              setTeams(data.map((t: any) => ({
                  id: t.id,
                  name: t.name,
                  coach: t.coach || '',
                  assistant: t.assistant || '',
                  founded_at: t.founded_at || '',
                  contact_phone: t.contact_phone || '',
                  logo_url: t.logo_url,
                  team_sponsors: t.team_sponsors || []
              })));
          }
      } catch (err: any) {
          if (err.code === 'PGRST205' || err.code === '42P01') {
             // If teams table missing, probably need setup
             setDbMissing(true);
          }
          console.error("Erro ao buscar times:", err);
      } finally {
          setLoadingTeams(false);
      }
  };

  const fetchAthletes = async (teamId: number) => {
      setLoadingAthletes(true);
      try {
          const { data, error } = await supabase
              .from('athletes')
              .select('*')
              .eq('team_id', teamId)
              .order('name', { ascending: true });
          
          if (error) throw error;
          
          if (data) {
              setAthletes(data);
          } else {
              setAthletes([]);
          }
      } catch (err: any) {
          console.error("Erro ao buscar atletas:", err);
          if (err.code === 'PGRST205' || err.code === '42P01') {
              // Table doesn't exist. Trigger DB Setup view.
              setIsTeamModalOpen(false); // Close modal
              setDbMissing(true);
          }
      } finally {
          setLoadingAthletes(false);
      }
  };

  const fetchMatches = async (champId: number | string) => {
      setLoadingMatches(true);
      try {
          const { data, error } = await supabase
              .from('matches')
              .select(`
                  *,
                  home_team:home_team_id(name, logo_url),
                  away_team:away_team_id(name, logo_url)
              `)
              .eq('championship_id', champId)
              .order('round', { ascending: true })
              .order('id', { ascending: true });

          if (error) throw error;
          if (data) setMatches(data as any);
      } catch (err: any) {
          if (err.code !== '42P01') {
              console.error("Erro ao buscar jogos:", err);
          }
      } finally {
          setLoadingMatches(false);
      }
  };

  const handleGenerateMatches = async () => {
      if (teams.length < 2) {
          alert("É necessário ter pelo menos 2 times para gerar a tabela.");
          return;
      }
      if (!window.confirm("Isso apagará qualquer jogo existente e gerará uma nova tabela 'Todos contra Todos'. Deseja continuar?")) {
          return;
      }

      setGeneratingMatches(true);
      try {
          const { error: delError } = await supabase
              .from('matches')
              .delete()
              .eq('championship_id', currentChamp!.id);
          
          if (delError && delError.code !== '42P01') throw delError;

          const rounds = [];
          const teamIds = teams.map(t => t.id);
          
          if (teamIds.length % 2 !== 0) teamIds.push(-1); 

          const numTeams = teamIds.length;
          const numRounds = numTeams - 1;
          const halfSize = numTeams / 2;
          const matchesPayload = [];

          for (let round = 0; round < numRounds; round++) {
              for (let i = 0; i < halfSize; i++) {
                  const team1 = teamIds[i];
                  const team2 = teamIds[numTeams - 1 - i];

                  if (team1 !== -1 && team2 !== -1) {
                      const home = (round % 2 === 0) ? team1 : team2;
                      const away = (round % 2 === 0) ? team2 : team1;

                      matchesPayload.push({
                          championship_id: currentChamp!.id,
                          round: round + 1,
                          home_team_id: home,
                          away_team_id: away,
                          status: 'scheduled'
                      });
                  }
              }
              const fixed = teamIds[0];
              const rotating = teamIds.slice(1);
              const last = rotating.pop();
              if (last) rotating.unshift(last);
              teamIds.splice(0, teamIds.length, fixed, ...rotating);
          }

          const { error: insertError } = await supabase.from('matches').insert(matchesPayload);
          if (insertError) throw insertError;

          await fetchMatches(currentChamp!.id);
          alert("Tabela de jogos gerada com sucesso!");

      } catch (err: any) {
          console.error("Erro ao gerar tabela:", err);
          if (err.code === 'PGRST205' || err.code === '42P01') setDbMissing(true);
      } finally {
          setGeneratingMatches(false);
      }
  };

  // --- SCORE & SPONSOR HANDLERS ---
  const handleOpenScoreModal = (match: Match) => {
      setSelectedMatch(match);
      setScoreForm({
          home: match.home_score?.toString() || '',
          away: match.away_score?.toString() || '',
          status: match.status
      });
      setIsScoreModalOpen(true);
  };

  const handleSaveScore = async () => {
      if (!selectedMatch) return;
      setSaving(true);
      try {
          const { error } = await supabase
              .from('matches')
              .update({
                  home_score: scoreForm.home === '' ? null : parseInt(scoreForm.home),
                  away_score: scoreForm.away === '' ? null : parseInt(scoreForm.away),
                  status: scoreForm.status
              })
              .eq('id', selectedMatch.id);

          if (error) throw error;
          setIsScoreModalOpen(false);
          fetchMatches(currentChamp!.id);
      } catch (err) {
          console.error("Erro ao salvar placar:", err);
      } finally {
          setSaving(false);
      }
  };

  const handleAddSponsor = () => {
    if (teamForm.sponsors.length >= 4) return;
    setTeamForm(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, { id: Math.random().toString(36).substr(2, 9), name: '', logo: null }]
    }));
  };

  const handleRemoveSponsor = (id: string) => {
    setTeamForm(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter(s => s.id !== id)
    }));
  };

  const handleSponsorChange = (id: string, field: 'name' | 'logo', value: string) => {
    setTeamForm(prev => ({
      ...prev,
      sponsors: prev.sponsors.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const handleSponsorUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSponsorChange(id, 'logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ATHLETE HANDLERS ---
  const handleAthleteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAthleteForm(prev => ({ ...prev, photo_url: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveAthlete = async () => {
      if (!athleteForm.name) return alert("Nome do atleta é obrigatório");
      if (!editingTeamId) return alert("Equipe não identificada");

      setSaving(true);
      try {
          const payload = {
              team_id: editingTeamId,
              name: athleteForm.name,
              nickname: athleteForm.nickname,
              birth_date: athleteForm.birth_date || null,
              document: athleteForm.document,
              phone: athleteForm.phone,
              position: athleteForm.position,
              jersey_number: athleteForm.jersey_number,
              photo_url: athleteForm.photo_url
          };

          if (athleteForm.id) {
              const { error } = await supabase.from('athletes').update(payload).eq('id', athleteForm.id);
              if (error) throw error;
          } else {
              const { error } = await supabase.from('athletes').insert([payload]);
              if (error) throw error;
          }

          setIsAthleteFormOpen(false);
          setAthleteForm({ name: '', nickname: '', birth_date: '', document: '', phone: '', position: '', jersey_number: undefined, photo_url: null });
          fetchAthletes(editingTeamId);
      } catch (err: any) {
          console.error("Erro ao salvar atleta:", err);
          if (err.code === 'PGRST205' || err.code === '42P01') {
              setIsTeamModalOpen(false);
              setDbMissing(true);
          } else {
              alert("Erro: " + err.message);
          }
      } finally {
          setSaving(false);
      }
  };

  const handleDeleteAthlete = async (id: string) => {
      if (!window.confirm("Remover atleta do elenco?")) return;
      try {
          const { error } = await supabase.from('athletes').delete().eq('id', id);
          if (error) throw error;
          if (editingTeamId) fetchAthletes(editingTeamId);
      } catch (err) {
          console.error("Erro ao excluir:", err);
      }
  };

  const getPositions = (sport: string) => {
      switch(sport) {
          case 'Futebol':
          case 'Society': return ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meio-Campo', 'Atacante'];
          case 'Futsal': return ['Goleiro', 'Fixo', 'Ala', 'Pivô'];
          case 'Vôlei de Quadra': return ['Levantador', 'Ponteiro', 'Oposto', 'Central', 'Líbero'];
          case 'Basquete': return ['Armador', 'Ala-Armador', 'Ala', 'Ala-Pivô', 'Pivô'];
          case 'Handebol': return ['Goleiro', 'Ponta', 'Meia', 'Central', 'Pivô'];
          default: return ['Atleta'];
      }
  };

  const handleSaveTeam = async () => {
      if (!teamForm.name) return alert("Nome da equipe é obrigatório");
      if (!teamForm.coach) return alert("Nome do técnico é obrigatório");
      if (!currentChamp) return;
      if (!user?.id) return alert("Sessão inválida. Faça login novamente.");

      setSaving(true);
      
      const basePayload = {
          name: teamForm.name,
          coach: teamForm.coach,
          contact_phone: teamForm.contact,
          logo_url: teamForm.logo,
          championship_id: currentChamp.id,
          user_id: user.id
      };
      
      const fullPayload = {
          ...basePayload,
          assistant: teamForm.assistant,
          founded_at: teamForm.foundedAt || null,
      };

      try {
          let savedTeamId = editingTeamId;

          if (editingTeamId) {
              const { error: updateError } = await supabase.from('teams').update(fullPayload).eq('id', editingTeamId);
              if (updateError) throw updateError;
          } else {
              const { data: insertedData, error: insertError } = await supabase.from('teams').insert([fullPayload]).select().single();
              if (insertError) throw insertError;
              savedTeamId = insertedData.id;
          }

          if (savedTeamId && teamForm.sponsors.length > 0) {
              await supabase.from('team_sponsors').delete().eq('team_id', savedTeamId);
              const sponsorsPayload = teamForm.sponsors.map(s => ({
                  team_id: savedTeamId,
                  name: s.name,
                  logo_url: s.logo
              }));
              await supabase.from('team_sponsors').insert(sponsorsPayload);
          }

          setIsTeamModalOpen(false);
          setTeamForm({ name: '', coach: '', assistant: '', foundedAt: '', contact: '', logo: null, sponsors: [] });
          setEditingTeamId(null);
          setTeamModalTab('info');
          fetchTeams(currentChamp.id); 
      } catch (err: any) {
          console.error("Erro ao salvar time:", err);
          if (err.code === 'PGRST205' || err.code === '42P01') {
              setIsTeamModalOpen(false);
              setDbMissing(true);
          } else {
              alert("Erro: " + (err.message || "Erro desconhecido"));
          }
      } finally {
          setSaving(false);
      }
  };

  const handleEditTeam = (team: Team) => {
      const mappedSponsors: Sponsor[] = team.team_sponsors?.map(s => ({
          id: Math.random().toString(36).substr(2, 9),
          name: s.name,
          logo: s.logo_url
      })) || [];

      setTeamForm({
          name: team.name,
          coach: team.coach,
          assistant: team.assistant || '',
          foundedAt: team.founded_at || '',
          contact: team.contact_phone || '',
          logo: team.logo_url,
          sponsors: mappedSponsors
      });
      setEditingTeamId(team.id);
      setTeamModalTab('info');
      setIsTeamModalOpen(true);
  };

  const handleDeleteTeam = async (id: number) => {
      if (!window.confirm("Tem certeza? Isso removerá a equipe do campeonato.")) return;
      try {
          const { error } = await supabase.from('teams').delete().eq('id', id);
          if (error) throw error;
          if (currentChamp) fetchTeams(currentChamp.id);
      } catch (err) {
          console.error("Erro ao deletar:", err);
      }
  };

  const handleSaveChampionship = async () => {
      if (!champForm.name) return alert("Nome é obrigatório");
      setSaving(true);
      try {
        const payload: any = {
          name: champForm.name,
          sport: champForm.sport,
          type: champForm.type,
          start_date: champForm.startDate || null,
          end_date: champForm.endDate || null,
          location: champForm.location,
          description: champForm.description,
          logo_url: champForm.logo, 
          cover_url: champForm.cover,
          config: { ...champForm }, // Storing all config in jsonb for simplicity
          user_id: user.id
        };

        if (!champForm.id || champForm.id === 0) {
           const { error } = await supabase.from('campeonatos').insert([payload]).select().single();
           if(error) throw error;
        } else {
           const { error } = await supabase.from('campeonatos').update(payload).eq('id', champForm.id).select().single();
           if(error) throw error;
        }

        await fetchChampionships();
        if (view === 'manage') {
            setCurrentChamp(champForm);
            alert("Alterações salvas com sucesso!");
        } else {
            setView('list');
        }
      } catch (error: any) {
        console.error("Erro ao salvar:", error);
        if (error.code === 'PGRST205' || error.code === '42P01') {
            setDbMissing(true);
        } else {
            alert("Erro ao salvar campeonato: " + error.message);
        }
      } finally {
        setSaving(false);
      }
  };

  const handleDeleteChampionship = async (id: number | string) => {
      if (!window.confirm("Tem certeza que deseja excluir este campeonato? Todas as equipes, jogos e dados serão perdidos permanentemente.")) return;
      
      setLoading(true);
      try {
          const { error } = await supabase.from('campeonatos').delete().eq('id', id);
          if (error) throw error;
          // Remove from local state immediately to update UI without refetch
          setMyChampionships(prev => prev.filter(c => c.id !== id));
      } catch (error: any) {
          console.error("Erro ao excluir:", error);
          alert("Erro ao excluir campeonato: " + (error.message || "Erro desconhecido"));
      } finally {
          setLoading(false);
      }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const renderDbSetup = () => (
      <div className="p-8 max-w-5xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600">
                      <Database className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                      <h2 className="text-2xl font-bold text-amber-900 mb-2">Configuração do Banco de Dados Necessária</h2>
                      <p className="text-amber-800/80 mb-6 leading-relaxed">
                          Detectamos que algumas tabelas (como 'athletes' ou 'matches') estão faltando no seu projeto Supabase. 
                          Para corrigir, execute o script abaixo no SQL Editor do Supabase.
                      </p>

                      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl mb-6">
                          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                              <span className="text-slate-400 text-xs font-mono">setup_db.sql</span>
                              <button 
                                  onClick={handleCopySql}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center transition-all ${copiedSql ? 'bg-green-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                              >
                                  {copiedSql ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                                  {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                              </button>
                          </div>
                          <div className="p-4 overflow-x-auto max-h-96">
                              <pre className="text-blue-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                {sqlScript}
                              </pre>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <button 
                              onClick={() => window.location.reload()}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center"
                          >
                              <RefreshCw className="w-5 h-5 mr-2" /> Já executei, recarregar
                          </button>
                          <button 
                              onClick={() => setDbMissing(false)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all"
                          >
                              Cancelar
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-200">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-2xl flex flex-col`}>
          <div className="h-20 flex items-center px-6 bg-slate-950 border-b border-slate-800">
             <Trophy className="h-8 w-8 text-green-500 mr-3" />
             <div><span className="font-bold text-xl text-white block leading-none">Gestor <span className="text-green-500">Pro</span></span></div>
             <button className="md:hidden ml-auto text-white" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
          </div>
          <nav className="flex-1 py-8 space-y-1 px-4 overflow-y-auto">
             <button onClick={() => setView('list')} className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${view === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><Home className="w-5 h-5 mr-3"/> Meus Campeonatos</button>
             <button onClick={() => setView('create_selection')} className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${view.startsWith('create') ? 'bg-green-600 text-white' : 'hover:bg-slate-800'}`}><PlusCircle className="w-5 h-5 mr-3"/> Criar Campeonato</button>
             <div className="pt-8 pb-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Gestão</div>
             <button onClick={() => setDbMissing(true)} className="w-full flex items-center px-4 py-3 rounded-xl text-amber-400 hover:bg-amber-500/10 transition-colors mt-2 text-xs"><Database className="w-4 h-4 mr-3" /> Instalar/Atualizar BD</button>
             <button onClick={onLogout} className="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-2"><LogOut className="w-5 h-5 mr-3" /> Sair</button>
          </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
             <div className="flex items-center">
                 <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4 text-slate-500"><Menu className="w-6 h-6" /></button>
                 <h1 className="text-xl font-bold text-slate-800">{view === 'manage' ? currentChamp?.name : 'Painel'}</h1>
             </div>
             <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block"><p className="text-sm font-bold text-slate-900">{user.name}</p><p className="text-[11px] font-semibold text-green-600 uppercase">{user.plan}</p></div>
                 <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white"><User className="w-5 h-5" /></div>
             </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative p-6">
            {dbMissing ? renderDbSetup() : (
                <>
                    {view === 'list' && (
                        <div className="max-w-7xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold text-slate-800">Meus Campeonatos</h2>
                                <button onClick={() => setView('create_selection')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center"><PlusCircle className="w-5 h-5 mr-2" /> Novo</button>
                            </div>
                            {loading ? <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" /> : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {myChampionships.map(champ => (
                                        <div key={champ.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                                            <div className="h-40 bg-slate-100 relative">
                                                {champ.cover ? <img src={champ.cover} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-12 h-12 opacity-50"/></div>}
                                            </div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-center mb-4">
                                                     <h3 className="font-bold text-xl line-clamp-1 text-slate-800">{champ.name}</h3>
                                                     <button onClick={() => onViewPublicPage(champ.id)} className="text-slate-400 hover:text-blue-500" title="Ver página pública"><ExternalLink className="w-4 h-4"/></button>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => { setCurrentChamp(champ); setChampForm(champ); setManageTab('home'); setView('manage'); }} 
                                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 hover:bg-blue-700 flex items-center justify-center"
                                                    >
                                                        <Settings className="w-4 h-4 mr-2" /> Gerenciar
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => { setCurrentChamp(champ); setChampForm(champ); setManageTab('settings'); setView('manage'); }}
                                                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                                                        title="Editar Configurações"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => handleDeleteChampionship(champ.id)}
                                                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                                        title="Excluir Campeonato"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {view === 'create_selection' && (
                         <div className="max-w-4xl mx-auto text-center py-20">
                             <h2 className="text-3xl font-bold mb-10">Escolha o formato</h2>
                             <div className="grid grid-cols-2 gap-8">
                                 <button onClick={() => { setChampForm({...initialFormState, sport: 'Futebol', id: 0}); setCreateStep('info'); setView('create_form'); }} className="bg-white p-10 rounded-3xl border hover:border-blue-500 shadow-lg group"><Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" /><h3 className="text-2xl font-bold">Campeonato Simples</h3></button>
                                 <button onClick={() => { setChampForm({...initialFormState, sport: 'Múltiplo', id: 0}); setCreateStep('info'); setView('create_form'); }} className="bg-white p-10 rounded-3xl border hover:border-green-500 shadow-lg group"><Layers className="w-16 h-16 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" /><h3 className="text-2xl font-bold">Olimpíada / Jogos</h3></button>
                             </div>
                         </div>
                    )}

                    {view === 'create_form' && (
                        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                             <h2 className="text-2xl font-bold mb-6">Novo Campeonato</h2>
                             <div className="space-y-4">
                                 <label className="block text-sm font-bold text-slate-700">Nome</label>
                                 <input value={champForm.name} onChange={e => setChampForm({...champForm, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Nome do campeonato" />
                                 <button onClick={handleSaveChampionship} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mt-4">{saving ? 'Salvando...' : 'Salvar e Continuar'}</button>
                             </div>
                        </div>
                    )}

                    {view === 'manage' && currentChamp && (
                        <div className="flex flex-col h-full">
                            {/* Manage Tabs */}
                            <div className="bg-white border-b border-slate-200 px-6 py-4 mb-6 rounded-xl flex gap-4 overflow-x-auto">
                                {[
                                    { id: 'home', label: 'Visão Geral', icon: Home },
                                    { id: 'teams', label: 'Equipes', icon: Shield },
                                    { id: 'athletes', label: 'Atletas', icon: Users }, // Added Athlete Tab explicitly for visibility
                                    { id: 'matches', label: 'Jogos', icon: Dna },
                                    { id: 'settings', label: 'Configurações', icon: Settings },
                                ].map(tab => (
                                    <button key={tab.id} onClick={() => setManageTab(tab.id as ManageTab)} className={`flex items-center px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${manageTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
                                        <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {manageTab === 'home' && (
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                        <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Equipes</h4>
                                        <p className="text-4xl font-extrabold text-slate-900">{teams.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                        <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Jogos</h4>
                                        <p className="text-4xl font-extrabold text-slate-900">{matches.length}</p>
                                    </div>
                                </div>
                            )}

                            {(manageTab === 'teams' || manageTab === 'athletes') && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold">Gestão de Equipes</h3>
                                        <button onClick={() => { setIsTeamModalOpen(true); setEditingTeamId(null); setTeamForm({ name: '', coach: '', assistant: '', foundedAt: '', contact: '', logo: null, sponsors: [] }); setTeamModalTab('info'); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center"><PlusCircle className="w-5 h-5 mr-2" /> Nova Equipe</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        {teams.map(team => (
                                            <div key={team.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">{team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover"/> : <Shield className="w-6 h-6 text-slate-300"/>}</div>
                                                    <div><h4 className="font-bold">{team.name}</h4><p className="text-xs text-slate-500">{team.coach}</p></div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditTeam(team)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4"/></button>
                                                    <button onClick={() => handleDeleteTeam(team.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {manageTab === 'matches' && (
                                <div>
                                    <div className="flex justify-between mb-6">
                                        <h3 className="text-xl font-bold">Tabela de Jogos</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => fetchMatches(currentChamp.id)} className="px-4 py-2 border rounded-xl font-bold text-sm">Atualizar</button>
                                            <button onClick={handleGenerateMatches} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center"><Dna className="w-4 h-4 mr-2"/> Gerar Tabela</button>
                                        </div>
                                    </div>
                                    {matches.length === 0 ? (
                                        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200"><CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4"/><p className="text-slate-500">Nenhum jogo gerado.</p></div>
                                    ) : (
                                        <div className="space-y-4">
                                            {matches.map(match => (
                                                <div key={match.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-400">R{match.round}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold">{match.home_team?.name}</span>
                                                        <div className="bg-slate-100 px-3 py-1 rounded font-bold">{match.home_score ?? '-'} x {match.away_score ?? '-'}</div>
                                                        <span className="font-bold">{match.away_team?.name}</span>
                                                    </div>
                                                    <button onClick={() => handleOpenScoreModal(match)} className="text-blue-500 text-sm font-bold">Editar Placar</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
            
            {/* Team Modal with Athlete Tab */}
            {isTeamModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTeamModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{editingTeamId ? 'Editar Equipe' : 'Nova Equipe'}</h3>
                                <p className="text-xs text-slate-500">
                                    {teamModalTab === 'info' ? 'Dados principais e staff.' : 'Gestão do elenco de atletas.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Only show tabs if editing an existing team */}
                                {editingTeamId && (
                                    <div className="flex bg-slate-100 p-1.5 rounded-xl mr-4">
                                        <button 
                                            onClick={() => setTeamModalTab('info')}
                                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${teamModalTab === 'info' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Dados
                                        </button>
                                        <button 
                                            onClick={() => setTeamModalTab('roster')}
                                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${teamModalTab === 'roster' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Elenco ({athletes.length})
                                        </button>
                                    </div>
                                )}
                                <button onClick={() => { setIsTeamModalOpen(false); setEditingTeamId(null); setTeamForm({ name: '', coach: '', assistant: '', foundedAt: '', contact: '', logo: null, sponsors: [] }); }} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-slate-50/50 flex-grow">
                            {teamModalTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                                            {teamForm.logo ? <img src={teamForm.logo} className="w-full h-full object-cover" /> : <Shield className="w-8 h-8 text-slate-300" />}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if(file) { const reader = new FileReader(); reader.onloadend = () => setTeamForm({...teamForm, logo: reader.result as string}); reader.readAsDataURL(file); }
                                            }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Nome da Equipe *</label><input value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl" /></div>
                                        <div><label className="text-xs font-bold text-slate-500 uppercase">Técnico *</label><input value={teamForm.coach} onChange={e => setTeamForm({...teamForm, coach: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl" /></div>
                                        <div><label className="text-xs font-bold text-slate-500 uppercase">Contato</label><input value={teamForm.contact} onChange={e => setTeamForm({...teamForm, contact: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl" /></div>
                                    </div>
                                </div>
                            )}

                            {teamModalTab === 'roster' && (
                                <div className="h-full flex flex-col">
                                    {!isAthleteFormOpen ? (
                                        <>
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-bold text-slate-900">Atletas Cadastrados</h4>
                                                <button onClick={() => { setIsAthleteFormOpen(true); setAthleteForm({ name: '', nickname: '', birth_date: '', document: '', phone: '', position: '', jersey_number: undefined, photo_url: null }); }} className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center"><UserPlus className="w-3 h-3 mr-1.5" /> Novo Atleta</button>
                                            </div>
                                            <div className="space-y-2">
                                                {athletes.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum atleta cadastrado.</p>}
                                                {athletes.map(athlete => (
                                                    <div key={athlete.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-4 group">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden">{athlete.photo_url ? <img src={athlete.photo_url} className="w-full h-full object-cover"/> : <User className="w-5 h-5 text-slate-400 m-auto mt-2"/>}</div>
                                                        <div className="flex-grow"><h5 className="font-bold text-sm">{athlete.name}</h5><p className="text-xs text-slate-500">{athlete.position} #{athlete.jersey_number}</p></div>
                                                        <button onClick={() => handleDeleteAthlete(athlete.id)} className="text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 h-full flex flex-col">
                                            <button onClick={() => setIsAthleteFormOpen(false)} className="mb-4 text-slate-400 hover:text-slate-600 flex items-center text-xs font-bold"><ArrowLeft className="w-3 h-3 mr-1"/> Voltar</button>
                                            <div className="flex-grow space-y-4">
                                                <div className="flex justify-center mb-4">
                                                     <div className="w-24 h-28 bg-slate-100 border-2 border-dashed rounded flex items-center justify-center relative group">
                                                         {athleteForm.photo_url ? <img src={athleteForm.photo_url} className="w-full h-full object-cover"/> : <Camera className="w-6 h-6 text-slate-300"/>}
                                                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAthleteUpload} />
                                                     </div>
                                                </div>
                                                <input value={athleteForm.name} onChange={e => setAthleteForm({...athleteForm, name: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="Nome Completo *" />
                                                <input value={athleteForm.nickname} onChange={e => setAthleteForm({...athleteForm, nickname: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="Apelido" />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <select value={athleteForm.position} onChange={e => setAthleteForm({...athleteForm, position: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                                                        <option value="">Posição</option>
                                                        {getPositions(currentChamp?.sport || 'Futebol').map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                    <input type="number" value={athleteForm.jersey_number || ''} onChange={e => setAthleteForm({...athleteForm, jersey_number: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg text-sm" placeholder="Nº Camisa" />
                                                </div>
                                            </div>
                                            <button onClick={handleSaveAthlete} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-4 flex items-center justify-center">{saving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Salvar Atleta'}</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {teamModalTab === 'info' && (
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
                                <button onClick={() => setIsTeamModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-white rounded-xl">Cancelar</button>
                                <button onClick={handleSaveTeam} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center">{saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Check className="w-5 h-5 mr-2"/>} {editingTeamId ? 'Salvar' : 'Criar'}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;