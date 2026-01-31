import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, Home, PlusCircle, BarChart2, FileText, Share2, Settings, HelpCircle, LogIn, LogOut, 
  Menu, X, Search, Bell, User, Calendar, MapPin, Upload, ChevronRight, Layers, Users, 
  Dna, Image as ImageIcon, Video, MessageSquare, Save, Printer, Trash2, Lock, CheckCircle, AlertCircle,
  Info, Camera, Shield, UserPlus, Phone, Globe, Facebook, Instagram, Mail, Award, AlertTriangle, PlayCircle,
  ChevronUp, ChevronDown, Loader2, MoreVertical, Database, Copy, Check
} from 'lucide-react';
import { UserType } from '../App';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

// --- TYPES ---

type ViewState = 'list' | 'create_selection' | 'create_form' | 'manage';
type ManageTab = 'home' | 'teams' | 'athletes' | 'groups' | 'stats' | 'media' | 'settings';
type CreateStep = 'info' | 'rules' | 'scoring' | 'contact' | 'visual';

interface Sponsor {
  id: number;
  name: string;
  image: string | null;
}

interface Team {
  id: number;
  name: string;
  coach: string;
  contact_phone?: string;
  logo_url: string | null;
  // stats for UI only
  played?: number;
  points?: number;
}

interface ChampionshipConfig {
    id: number | string; // Changed to string/number to handle UUIDs from Supabase
    // Basic
    name: string;
    sport: string; 
    type: string; 
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    // Visual
    logo: string | null;
    cover: string | null;
    // Contact
    organizerPhone: string;
    organizerEmail: string;
    organizerSite: string;
    organizerInsta: string;
    organizerFace: string;
    // Rules & Scoring
    rulesText: string;
    pointsWin: number;
    pointsDraw: number;
    pointsLoss: number;
    suspensionYellow: number;
    suspensionRed: number;
    suspensionBlue: number; 
    tieBreakers: string[]; 
    prizes: { first: string, second: string, third: string };
    // Settings toggles
    publicInscription: boolean;
    showStatsPublicly: boolean;
    allowComments: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
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

  // Form State for Championship Creation/Editing
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

  // Current Active Championship (for Management View)
  const [currentChamp, setCurrentChamp] = useState<ChampionshipConfig | null>(null);

  // My Championships List
  const [myChampionships, setMyChampionships] = useState<ChampionshipConfig[]>([]);

  // --- TEAM MANAGEMENT STATE ---
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', coach: '', contact: '', logo: null as string | null });

  // --- SUPABASE INTEGRATION ---

  // 1. Fetch Championships on Mount
  useEffect(() => {
    fetchChampionships();
  }, [user.id]);

  // 2. Fetch Teams when entering Team Management tab
  useEffect(() => {
      if (view === 'manage' && manageTab === 'teams' && currentChamp) {
          fetchTeams(currentChamp.id);
      }
  }, [view, manageTab, currentChamp]);

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
        // Map Supabase columns back to our frontend state structure
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
          // Deserialize JSON config
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
      // Handle missing table error (PGRST205 or 42P01)
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
            .select('*')
            .eq('championship_id', champId)
            .order('name', { ascending: true });

          if (error) throw error;

          if (data) {
              setTeams(data.map((t: any) => ({
                  id: t.id,
                  name: t.name,
                  coach: t.coach || '',
                  contact_phone: t.contact_phone || '',
                  logo_url: t.logo_url
              })));
          }
      } catch (err: any) {
          console.error("Erro ao buscar times:", err);
      } finally {
          setLoadingTeams(false);
      }
  };

  const handleAddTeam = async () => {
      if (!teamForm.name) return alert("Nome da equipe é obrigatório");
      if (!currentChamp) return;

      setSaving(true);
      try {
          const { error } = await supabase.from('teams').insert([{
              name: teamForm.name,
              coach: teamForm.coach,
              contact_phone: teamForm.contact,
              logo_url: teamForm.logo,
              championship_id: currentChamp.id,
              user_id: user.id
          }]);

          if (error) throw error;

          setIsTeamModalOpen(false);
          setTeamForm({ name: '', coach: '', contact: '', logo: null });
          fetchTeams(currentChamp.id); // Refresh list
      } catch (err: any) {
          console.error("Erro ao adicionar time:", err);
          alert("Erro: " + err.message);
      } finally {
          setSaving(false);
      }
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

  // 3. Save (Create or Update) Championship
  const handleSaveChampionship = async () => {
      if (!champForm.name) return alert("Nome é obrigatório");
      setSaving(true);

      try {
        // Prepare JSON config object
        const configData = {
          organizerPhone: champForm.organizerPhone,
          organizerEmail: champForm.organizerEmail,
          organizerSite: champForm.organizerSite,
          organizerInsta: champForm.organizerInsta,
          organizerFace: champForm.organizerFace,
          rulesText: champForm.rulesText,
          pointsWin: champForm.pointsWin,
          pointsDraw: champForm.pointsDraw,
          pointsLoss: champForm.pointsLoss,
          suspensionYellow: champForm.suspensionYellow,
          suspensionRed: champForm.suspensionRed,
          suspensionBlue: champForm.suspensionBlue,
          tieBreakers: champForm.tieBreakers,
          prizes: champForm.prizes,
          publicInscription: champForm.publicInscription,
          showStatsPublicly: champForm.showStatsPublicly,
          allowComments: champForm.allowComments,
        };

        const payload: any = {
          name: champForm.name,
          sport: champForm.sport,
          type: champForm.type,
          start_date: champForm.startDate || null,
          end_date: champForm.endDate || null,
          location: champForm.location,
          description: champForm.description,
          logo_url: champForm.logo, // In a real app, upload file to Storage first, then save URL here
          cover_url: champForm.cover,
          config: configData,
          user_id: user.id
        };

        let result;
        
        // If ID is 0 or undefined, it's a NEW insert
        // Supabase will generate the UUID
        if (!champForm.id || champForm.id === 0) {
           const { data, error } = await supabase.from('campeonatos').insert([payload]).select().single();
           if(error) throw error;
           result = data;
        } else {
           // Update existing
           const { data, error } = await supabase.from('campeonatos').update(payload).eq('id', champForm.id).select().single();
           if(error) throw error;
           result = data;
        }

        // Refresh list
        await fetchChampionships();
        
        // If we are in Manage View, update the currentChamp state and DON'T redirect
        if (view === 'manage') {
            setCurrentChamp(champForm);
            alert("Alterações salvas com sucesso!");
        } else {
            // If we are in Wizard, go to List
            setView('list');
        }

      } catch (error: any) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar campeonato: " + error.message);
      } finally {
        setSaving(false);
      }
  };

  const handleDeleteChampionship = async () => {
    if (!currentChamp) return;
    
    const confirmName = window.prompt(`Para confirmar a exclusão, digite o nome do campeonato: "${currentChamp.name}"`);
    if (confirmName !== currentChamp.name) {
        if (confirmName !== null) alert("Nome incorreto. A exclusão foi cancelada.");
        return;
    }

    setSaving(true);
    try {
        // Teams cascade delete automatically due to SQL setup, but good to know
        const { error } = await supabase.from('campeonatos').delete().eq('id', currentChamp.id);
        
        if (error) throw error;
        
        await fetchChampionships();
        setCurrentChamp(null);
        setView('list');
    } catch (err: any) {
        console.error("Erro ao excluir:", err);
        alert("Erro ao excluir campeonato: " + err.message);
    } finally {
        setSaving(false);
    }
  };

  // --- HANDLERS ---

  const handleCreateNew = (isMultiple: boolean) => {
      setChampForm({
          ...initialFormState,
          sport: isMultiple ? 'Múltiplas Modalidades' : 'Futebol',
          organizerEmail: user.email,
          id: 0 // Indicates new
      });
      setCreateStep('info');
      setView('create_form');
  };

  const handleManage = (champ: ChampionshipConfig) => {
      setCurrentChamp(champ);
      setChampForm(champ); // Pre-fill form for settings editing
      setManageTab('home');
      setView('manage');
  };

  // Generic Input Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      
      // Handle nested properties (e.g. prizes.first)
      if (name.includes('.')) {
          const [parent, child] = name.split('.');
          setChampForm(prev => ({
              ...prev,
              [parent]: {
                  ...(prev as any)[parent],
                  [child]: value
              }
          }));
      } else {
          setChampForm(prev => ({ ...prev, [name]: value }));
      }
  };

  // Image Upload Handler (Simulated for now, would be Storage upload in V2)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'cover') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              // In production: Upload `file` to Supabase Storage here, get URL, then set URL
              setChampForm(prev => ({ ...prev, [field]: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleTeamLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setTeamForm(prev => ({ ...prev, logo: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCopySql = () => {
    const sql = `-- 1. Tabelas (com verificação de existência)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  plan text default 'Starter'
);

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

create table if not exists public.teams (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  championship_id bigint references public.campeonatos on delete cascade not null,
  name text not null,
  coach text,
  contact_phone text,
  logo_url text
);

-- 2. Habilitar RLS (Seguro para rodar múltiplas vezes)
alter table public.profiles enable row level security;
alter table public.campeonatos enable row level security;
alter table public.teams enable row level security;

-- 3. Políticas de Acesso (Recriar para garantir)
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

-- 4. Função e Trigger (Idempotente)
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
  for each row execute procedure public.handle_new_user();`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // --- RENDERERS ---

  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-2xl`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <Trophy className="h-8 w-8 text-green-500 mr-3" />
          <div>
              <span className="font-bold text-xl text-white block leading-none">Gestor <span className="text-green-500">Pro</span></span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Painel do Organizador</span>
          </div>
          <button className="md:hidden ml-auto text-white" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-8 space-y-1 px-4 overflow-y-auto">
          <button onClick={() => setView('list')} className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Home className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> Meus Campeonatos
          </button>
          <button onClick={() => setView('create_selection')} className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${view.startsWith('create') ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'hover:bg-slate-800 hover:text-white'}`}>
            <PlusCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> Criar Campeonato
          </button>
          
          <div className="pt-8 pb-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Gestão</div>
          
          <button className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <BarChart2 className="w-5 h-5 mr-3" /> Estatísticas Globais
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <FileText className="w-5 h-5 mr-3" /> Relatórios
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <Share2 className="w-5 h-5 mr-3" /> Central de Divulgação
          </button>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950">
          <button className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors mb-1">
            <Settings className="w-5 h-5 mr-3" /> Configurações
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors mb-1">
            <HelpCircle className="w-5 h-5 mr-3" /> Ajuda / Suporte
          </button>
          <button onClick={onLogout} className="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-2">
            <LogOut className="w-5 h-5 mr-3" /> Sair
          </button>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4 text-slate-500 hover:bg-slate-100 p-2 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
            {view === 'list' && 'Visão Geral'}
            {view === 'create_selection' && 'Novo Campeonato'}
            {view === 'create_form' && 'Configuração'}
            {view === 'manage' && (
                <span className="flex items-center gap-2">
                    <span className="text-slate-400 font-normal">Gerenciar /</span> {currentChamp?.name}
                </span>
            )}
            </h1>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-slate-50 transition-all focus:bg-white focus:w-72" />
        </div>
        <button className="text-slate-400 hover:text-blue-600 relative p-2 rounded-full hover:bg-blue-50 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
            <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wide bg-green-50 inline-block px-1.5 rounded mt-0.5">{user.plan}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white shadow-lg ring-2 ring-white cursor-pointer hover:ring-blue-100 transition-all">
             <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );

  // --- RENDER DATABASE SETUP (IF TABLES MISSING) ---
  const renderDbSetup = () => (
      <div className="p-8 max-w-5xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600">
                      <Database className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                      <h2 className="text-2xl font-bold text-amber-900 mb-2">Banco de Dados Não Configurado</h2>
                      <p className="text-amber-800/80 mb-6 leading-relaxed">
                          O sistema detectou que as tabelas necessárias ainda não foram criadas no seu projeto Supabase. 
                          Para corrigir isso, você precisa executar o script SQL abaixo no painel do Supabase.
                      </p>

                      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                              <span className="text-slate-400 text-xs font-mono">setup_schema.sql</span>
                              <button 
                                  onClick={handleCopySql}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center transition-all ${copiedSql ? 'bg-green-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                              >
                                  {copiedSql ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                                  {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                              </button>
                          </div>
                          <div className="p-4 overflow-x-auto max-h-96">
                              <pre className="text-blue-300 font-mono text-xs leading-relaxed">
{`-- 1. Tabelas (com verificação de existência)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  plan text default 'Starter'
);

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

create table if not exists public.teams (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  championship_id bigint references public.campeonatos on delete cascade not null,
  name text not null,
  coach text,
  contact_phone text,
  logo_url text
);

-- 2. Habilitar RLS (Seguro para rodar múltiplas vezes)
alter table public.profiles enable row level security;
alter table public.campeonatos enable row level security;
alter table public.teams enable row level security;

-- 3. Políticas de Acesso (Recriar para garantir)
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

-- 4. Função e Trigger (Idempotente)
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
  for each row execute procedure public.handle_new_user();`}
                              </pre>
                          </div>
                      </div>

                      <div className="mt-8 space-y-4">
                          <h3 className="font-bold text-amber-900">Como resolver:</h3>
                          <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
                              <li>Clique no botão <strong>Copiar SQL</strong> acima.</li>
                              <li>Acesse seu <a href="https://supabase.com/dashboard" target="_blank" className="underline font-bold hover:text-amber-600">Painel do Supabase</a>.</li>
                              <li>No menu lateral esquerdo, clique em <strong>SQL Editor</strong>.</li>
                              <li>Cole o código na área de edição e clique em <strong>Run</strong>.</li>
                              <li>Volte aqui e clique no botão abaixo para recarregar.</li>
                          </ol>
                      </div>

                      <div className="mt-8 flex gap-4">
                          <button 
                              onClick={() => window.location.reload()}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-amber-600/20 transition-all transform hover:-translate-y-1 flex items-center"
                          >
                              <RefreshCw className="w-5 h-5 mr-2" /> Já executei, recarregar página
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  // Helper component for Refresh Icon since we can't import it in renderDbSetup due to scope but we imported Lucide earlier
  const RefreshCw = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;


  // --- VIEW: LIST ---
  const renderList = () => (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
            <h2 className="text-3xl font-bold text-slate-800">Meus Campeonatos</h2>
            <p className="text-slate-500 mt-1">Gerencie suas competições ativas e histórico.</p>
            </div>
            <button onClick={() => setView('create_selection')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5">
            <PlusCircle className="w-5 h-5 mr-2" /> Adicionar Novo
            </button>
        </div>
        
        {loading ? (
             <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500">Carregando seus campeonatos...</p>
             </div>
        ) : myChampionships.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum campeonato encontrado</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Você ainda não criou nenhuma competição. Comece agora e organize seu primeiro torneio em minutos.</p>
                <button onClick={() => setView('create_selection')} className="text-blue-600 font-bold hover:underline">Começar agora</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myChampionships.map(champ => (
                    <div key={champ.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                            {champ.cover ? (
                                <img src={champ.cover} alt={champ.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-12 h-12 opacity-50" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-white/50">
                                    Em Andamento
                                </span>
                            </div>
                            <div className="absolute -bottom-6 left-6">
                                <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-md">
                                    {champ.logo ? (
                                        <img src={champ.logo} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Trophy className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-8 flex-grow flex flex-col">
                            <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-1">{champ.name}</h3>
                            <div className="space-y-2 mb-6">
                                <p className="text-sm text-slate-500 flex items-center">
                                    <Award className="w-4 h-4 mr-2 text-blue-500" /> {champ.sport}
                                </p>
                                <p className="text-sm text-slate-500 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-red-500" /> {champ.location || 'Local não definido'}
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <button onClick={() => handleManage(champ)} className="w-full py-3 bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 rounded-xl text-slate-700 font-bold transition-all flex items-center justify-center">
                                    <Settings className="w-4 h-4 mr-2" /> Gerenciar Painel
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
  );

  // --- VIEW: CREATE SELECTION ---
  const renderCreateSelection = () => (
      <div className="p-8 max-w-5xl mx-auto h-full flex flex-col justify-center">
          <div className="mb-8">
            <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800 flex items-center font-medium mb-4">
               <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Voltar
            </button>
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">Escolha o formato do seu campeonato</h2>
            <p className="text-slate-500 text-center">Selecione a estrutura que melhor se adapta à sua competição.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div onClick={() => handleCreateNew(false)} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl hover:border-blue-500 cursor-pointer transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-[100px] -mr-4 -mt-4 transition-all group-hover:bg-blue-500/20"></div>
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                      <Trophy className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Campeonato Simples</h3>
                  <p className="text-slate-600 leading-relaxed">Focado em apenas uma modalidade esportiva (Ex: Copa de Futsal, Torneio de Vôlei). Gestão direta, tabelas e artilharia unificadas.</p>
                  <div className="mt-8 flex items-center text-blue-600 font-bold">
                      Selecionar <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
              </div>

              <div onClick={() => handleCreateNew(true)} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl hover:border-green-500 cursor-pointer transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-[100px] -mr-4 -mt-4 transition-all group-hover:bg-green-500/20"></div>
                  <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                      <Layers className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Campeonato Múltiplo</h3>
                  <p className="text-slate-600 leading-relaxed">Ideal para Olimpíadas Escolares, Jogos Universitários ou eventos poliesportivos. Gerencie várias modalidades sob um único evento "guarda-chuva".</p>
                  <div className="mt-8 flex items-center text-green-600 font-bold">
                      Selecionar <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
              </div>
          </div>
      </div>
  );

  // --- VIEW: CREATE FORM (THE WIZARD) ---
  const renderCreateForm = () => (
    <div className="max-w-4xl mx-auto p-6 pb-24">
        <div className="flex items-center justify-between mb-8 sticky top-20 bg-slate-50 py-4 z-10">
            <div className="flex items-center">
                <button onClick={() => setView('create_selection')} className="bg-white p-2 rounded-full border border-slate-200 mr-4 text-slate-500 hover:text-slate-900 shadow-sm">
                   <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Configuração do Campeonato</h2>
                    <p className="text-sm text-slate-500">Preencha os detalhes para lançar sua competição.</p>
                </div>
            </div>
            <button 
                onClick={handleSaveChampionship} 
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-green-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {saving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                    <Save className="w-5 h-5 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salvar e Publicar'}
            </button>
        </div>

        {/* Steps Navigation */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
            {[
                { id: 'info', label: 'Dados Básicos', icon: FileText },
                { id: 'rules', label: 'Regras', icon: Scale },
                { id: 'scoring', label: 'Pontuação', icon: Calculator },
                { id: 'contact', label: 'Contato', icon: Phone },
                { id: 'visual', label: 'Visual', icon: ImageIcon },
            ].map(step => (
                <button 
                   key={step.id} 
                   onClick={() => setCreateStep(step.id as CreateStep)}
                   className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                       createStep === step.id 
                       ? 'bg-slate-900 text-white shadow-md' 
                       : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                   }`}
                >
                    <span className="mr-2">{step.label}</span>
                </button>
            ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
            {createStep === 'info' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Campeonato</label>
                            <input name="name" value={champForm.name} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Copa Verão 2024" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Modalidade</label>
                            <select name="sport" value={champForm.sport} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                                <option>Futebol</option>
                                <option>Futsal</option>
                                <option>Vôlei de Quadra</option>
                                <option>Vôlei de Areia</option>
                                <option>Handebol</option>
                                <option>Basquete</option>
                                <option>Society</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Competição</label>
                            <select name="type" value={champForm.type} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                                <option>Fase de Grupos + Mata-mata</option>
                                <option>Pontos Corridos</option>
                                <option>Pontos Corridos + Eliminatórias</option>
                                <option>Eliminatória Simples (Mata-mata)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Data de Início</label>
                            <input type="date" name="startDate" value={champForm.startDate} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Data de Término</label>
                            <input type="date" name="endDate" value={champForm.endDate} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Local / Sede Principal</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                                <input name="location" value={champForm.location} onChange={handleInputChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Clube Atlético, São Paulo - SP" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Descrição Curta</label>
                            <textarea name="description" value={champForm.description} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" placeholder="Detalhes principais sobre o evento..." />
                        </div>
                    </div>
                </div>
            )}

            {createStep === 'rules' && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Regulamento Completo</label>
                        <textarea name="rulesText" value={champForm.rulesText} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-64 font-mono text-sm" placeholder="Cole aqui o texto do regulamento ou as regras específicas..." />
                        <p className="text-xs text-slate-400 mt-2 text-right">Dica: Você poderá fazer upload de PDF posteriormente.</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase mb-4">Critérios de Desempate (Ordem de Prioridade)</h3>
                        <div className="space-y-2">
                            {champForm.tieBreakers.map((crit, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
                                    <span className="font-medium text-slate-700"><span className="text-slate-300 font-bold mr-3">{idx + 1}</span> {crit}</span>
                                    <div className="flex gap-1">
                                        <button className="p-1 hover:bg-slate-100 rounded"><ChevronUp className="w-4 h-4 text-slate-400" /></button>
                                        <button className="p-1 hover:bg-slate-100 rounded"><ChevronDown className="w-4 h-4 text-slate-400" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {createStep === 'scoring' && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center"><Award className="w-5 h-5 mr-2 text-blue-500" /> Pontuação da Partida</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                                <label className="block text-xs font-bold text-green-700 uppercase mb-2">Vitória</label>
                                <input type="number" name="pointsWin" value={champForm.pointsWin} onChange={handleInputChange} className="w-full text-center text-2xl font-bold bg-white border border-green-200 rounded-lg p-2 text-green-800" />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Empate</label>
                                <input type="number" name="pointsDraw" value={champForm.pointsDraw} onChange={handleInputChange} className="w-full text-center text-2xl font-bold bg-white border border-slate-200 rounded-lg p-2 text-slate-700" />
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                                <label className="block text-xs font-bold text-red-700 uppercase mb-2">Derrota</label>
                                <input type="number" name="pointsLoss" value={champForm.pointsLoss} onChange={handleInputChange} className="w-full text-center text-2xl font-bold bg-white border border-red-200 rounded-lg p-2 text-red-800" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-orange-500" /> Suspensão Automática</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Cartões Amarelos</label>
                                <div className="flex items-center">
                                    <input type="number" name="suspensionYellow" value={champForm.suspensionYellow} onChange={handleInputChange} className="w-16 p-2 border border-slate-300 rounded-lg text-center font-bold mr-2" />
                                    <span className="text-sm text-slate-400">para suspender</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Cartões Vermelhos</label>
                                <div className="flex items-center">
                                    <input type="number" name="suspensionRed" value={champForm.suspensionRed} onChange={handleInputChange} className="w-16 p-2 border border-slate-300 rounded-lg text-center font-bold mr-2" />
                                    <span className="text-sm text-slate-400">para suspender</span>
                                </div>
                            </div>
                            {['Futsal', 'Society'].includes(champForm.sport) && (
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">Cartões Azuis</label>
                                    <div className="flex items-center">
                                        <input type="number" name="suspensionBlue" value={champForm.suspensionBlue} onChange={handleInputChange} className="w-16 p-2 border border-slate-300 rounded-lg text-center font-bold mr-2" />
                                        <span className="text-sm text-slate-400">para suspender</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center"><Trophy className="w-5 h-5 mr-2 text-yellow-500" /> Premiação</h3>
                        <div className="space-y-3">
                            <input name="prizes.first" value={champForm.prizes.first} onChange={handleInputChange} placeholder="Prêmio para 1º Lugar (Ex: Troféu + R$ 1000)" className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg placeholder-yellow-700/50" />
                            <input name="prizes.second" value={champForm.prizes.second} onChange={handleInputChange} placeholder="Prêmio para 2º Lugar" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
                            <input name="prizes.third" value={champForm.prizes.third} onChange={handleInputChange} placeholder="Prêmio para 3º Lugar" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
                        </div>
                    </div>
                </div>
            )}

            {createStep === 'contact' && (
                <div className="space-y-6 animate-fade-in">
                    <p className="text-slate-500 text-sm mb-4">Informações que ficarão visíveis para o público na página do campeonato.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">E-mail de Contato</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                                <input name="organizerEmail" value={champForm.organizerEmail} onChange={handleInputChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Telefone / WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                                <input name="organizerPhone" value={champForm.organizerPhone} onChange={handleInputChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="(00) 00000-0000" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Site Oficial</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                                <input name="organizerSite" value={champForm.organizerSite} onChange={handleInputChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="https://" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Instagram</label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                                <input name="organizerInsta" value={champForm.organizerInsta} onChange={handleInputChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="@usuario" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {createStep === 'visual' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">Logo do Campeonato (200x240)</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative h-64">
                                {champForm.logo ? (
                                    <>
                                        <img src={champForm.logo} className="w-full h-full object-contain" />
                                        <button onClick={() => setChampForm(p => ({...p, logo: null}))} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4"/></button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">Clique para fazer upload</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG (Máx 2MB)</p>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'logo')} accept="image/*" />
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">Imagem de Capa (1600x533)</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative h-64">
                                {champForm.cover ? (
                                    <>
                                        <img src={champForm.cover} className="w-full h-full object-cover rounded-lg" />
                                        <button onClick={() => setChampForm(p => ({...p, cover: null}))} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4"/></button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">Clique para fazer upload</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG (Wide)</p>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'cover')} accept="image/*" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  // --- VIEW: MANAGER (The Dashboard inside the Dashboard) ---
  const renderManager = () => {
    if (!currentChamp) return null;

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Champ Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl border border-slate-200 p-1 bg-white shadow-sm flex-shrink-0">
                            {currentChamp.logo ? <img src={currentChamp.logo} className="w-full h-full object-contain rounded-lg"/> : <Trophy className="w-full h-full text-slate-300 p-2"/>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-3xl font-bold text-slate-900">{currentChamp.name}</h2>
                                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold border border-green-200">Ativo</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center"><Award className="w-4 h-4 mr-1 text-blue-500" /> {currentChamp.sport}</span>
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-red-500" /> {currentChamp.location}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors">
                            Ver Página Pública
                        </button>
                        <button onClick={() => setView('list')} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
                            Voltar
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 overflow-x-auto hide-scrollbar border-b border-slate-100">
                    {[
                       { id: 'home', label: 'Visão Geral', icon: Home },
                       { id: 'teams', label: 'Equipes', icon: Shield },
                       { id: 'athletes', label: 'Atletas', icon: Users },
                       { id: 'groups', label: 'Grupos & Jogos', icon: Dna },
                       { id: 'stats', label: 'Estatísticas', icon: BarChart2 },
                       { id: 'media', label: 'Mídia & Mensagens', icon: ImageIcon },
                       { id: 'settings', label: 'Configurações', icon: Settings },
                    ].map((tab) => (
                       <button
                          key={tab.id}
                          onClick={() => setManageTab(tab.id as ManageTab)}
                          className={`flex items-center px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                             manageTab === tab.id 
                             ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                             : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                          }`}
                       >
                          <tab.icon className={`w-4 h-4 mr-2 ${manageTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                          {tab.label}
                       </button>
                    ))}
                 </div>
            </div>

            {/* Tab Content Area */}
            <div className="p-8 flex-grow overflow-y-auto">
                {manageTab === 'home' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Equipes Confirmadas</h4>
                            <p className="text-4xl font-extrabold text-slate-900">{teams.length}</p>
                            <div className="mt-4 text-xs text-green-600 font-bold bg-green-50 inline-block px-2 py-1 rounded">+ {teams.length} nessa semana</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Jogos Realizados</h4>
                            <p className="text-4xl font-extrabold text-slate-900">0 <span className="text-lg text-slate-300">/ 0</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Gols Marcados</h4>
                            <p className="text-4xl font-extrabold text-slate-900">0</p>
                            <div className="mt-4 text-xs text-slate-400">Média: 0.0 por jogo</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-blue-600 to-blue-500 text-white">
                            <h4 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">Próxima Rodada</h4>
                            <p className="text-xl font-bold">A definir</p>
                            <button className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                                Gerar Tabela
                            </button>
                        </div>

                        {/* Recent Activity or Empty State */}
                        <div className="lg:col-span-4 mt-4 bg-white rounded-2xl border border-slate-200 p-8 text-center">
                            {teams.length === 0 ? (
                                <>
                                    <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
                                        <AlertTriangle className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Campeonato Recém-Criado</h3>
                                    <p className="text-slate-500 mb-6">Para começar, cadastre as equipes participantes ou abra o link de inscrições.</p>
                                    <button onClick={() => setManageTab('teams')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all">
                                        Cadastrar Equipes
                                    </button>
                                </>
                            ) : (
                                <div className="text-left">
                                     <h3 className="text-lg font-bold text-slate-900 mb-4">Resumo</h3>
                                     <p className="text-slate-500">O campeonato possui {teams.length} equipes cadastradas. O próximo passo é gerar os grupos ou tabela de jogos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {manageTab === 'teams' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Gestão de Equipes ({teams.length})</h3>
                            <button 
                                onClick={() => setIsTeamModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-blue-600/20"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" /> Nova Equipe
                            </button>
                        </div>

                        {loadingTeams ? (
                             <div className="text-center py-20">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                                <p className="text-slate-500">Carregando equipes...</p>
                             </div>
                        ) : teams.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 mb-2">Nenhuma equipe cadastrada ainda.</p>
                                <p className="text-sm text-slate-400">Adicione manualmente ou compartilhe o link de inscrição.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teams.map((team) => (
                                    <div key={team.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                                                {team.logo_url ? (
                                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <Shield className="w-6 h-6 text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{team.name}</h4>
                                                <p className="text-xs text-slate-500 flex items-center mt-1">
                                                    <User className="w-3 h-3 mr-1" /> {team.coach || 'Sem técnico'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleDeleteTeam(team.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {manageTab === 'settings' && (
                    <div className="max-w-4xl animate-fade-in pb-10">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-900">Editar Campeonato</h3>
                                <span className="text-xs text-slate-400">ID: {currentChamp.id}</span>
                            </div>

                            {/* Basic Info Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Campeonato</label>
                                    <input name="name" value={champForm.name} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do campeonato" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Data de Início</label>
                                    <input type="date" name="startDate" value={champForm.startDate} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Data de Término</label>
                                    <input type="date" name="endDate" value={champForm.endDate} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Local / Sede</label>
                                    <input name="location" value={champForm.location} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
                                    <textarea name="description" value={champForm.description} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Modalidade (Não editável)</label>
                                    <input value={champForm.sport} disabled className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                                </div>
                            </div>

                            {/* Images */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Logo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-slate-50 border rounded-lg flex items-center justify-center overflow-hidden">
                                            {champForm.logo ? <img src={champForm.logo} className="w-full h-full object-cover" /> : <Camera className="text-slate-300"/>}
                                        </div>
                                        <div className="relative">
                                            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors pointer-events-none">Alterar Logo</button>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'logo')} accept="image/*" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Capa</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 h-20 bg-slate-50 border rounded-lg flex items-center justify-center overflow-hidden">
                                            {champForm.cover ? <img src={champForm.cover} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300"/>}
                                        </div>
                                        <div className="relative">
                                            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors pointer-events-none">Alterar Capa</button>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'cover')} accept="image/*" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Toggles */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-2">Visibilidade e Recursos</h4>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <h5 className="font-bold text-slate-800 text-sm">Inscrições Online</h5>
                                        <p className="text-xs text-slate-500">Permitir cadastro público de times</p>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${champForm.publicInscription ? 'bg-green-500' : 'bg-slate-200'}`} onClick={() => setChampForm(prev => ({...prev, publicInscription: !prev.publicInscription}))}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${champForm.publicInscription ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <h5 className="font-bold text-slate-800 text-sm">Estatísticas Públicas</h5>
                                        <p className="text-xs text-slate-500">Mostrar artilharia e tabelas no site</p>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${champForm.showStatsPublicly ? 'bg-green-500' : 'bg-slate-200'}`} onClick={() => setChampForm(prev => ({...prev, showStatsPublicly: !prev.showStatsPublicly}))}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${champForm.showStatsPublicly ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={handleSaveChampionship}
                                    disabled={saving}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center shadow-lg disabled:opacity-70"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Save className="w-5 h-5 mr-2" />}
                                    Salvar Alterações
                                </button>
                            </div>

                            {/* Danger Zone */}
                            <div className="mt-12 pt-8 border-t border-red-100">
                                <h4 className="text-red-600 font-bold mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> Zona de Perigo</h4>
                                <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-red-900">Excluir este campeonato</p>
                                        <p className="text-sm text-red-700/80">Essa ação não pode ser desfeita. Todos os times, jogos e estatísticas serão apagados permanentemente.</p>
                                    </div>
                                    <button 
                                        onClick={handleDeleteChampionship}
                                        className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-colors flex-shrink-0"
                                    >
                                        Excluir Definitivamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {manageTab === 'media' && (
                    <div className="animate-fade-in">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                             <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:border-blue-500 transition-colors cursor-pointer group">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Camera className="w-8 h-8 text-blue-500" />
                                </div>
                                <h4 className="font-bold text-slate-900">Upload de Fotos</h4>
                                <p className="text-xs text-slate-500 mt-1">Galeria de jogos e bastidores</p>
                             </div>
                             <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:border-red-500 transition-colors cursor-pointer group">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h4 className="font-bold text-slate-900">Vídeos / YouTube</h4>
                                <p className="text-xs text-slate-500 mt-1">Melhores momentos e lives</p>
                             </div>
                             <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:border-yellow-500 transition-colors cursor-pointer group">
                                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h4 className="font-bold text-slate-900">Comunicados</h4>
                                <p className="text-xs text-slate-500 mt-1">Avisos oficiais para times</p>
                             </div>
                         </div>
                    </div>
                )}

                {/* Placeholders for other tabs */}
                {(['groups', 'stats', 'athletes'].includes(manageTab)) && (
                    <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <Settings className="w-16 h-16 mb-6 opacity-20" />
                        <h3 className="text-lg font-bold text-slate-600 mb-2 capitalize">Módulo: {manageTab}</h3>
                        <p className="max-w-md text-center">Esta funcionalidade está sendo implementada no seu ambiente. Em breve você poderá gerenciar {manageTab === 'groups' ? 'grupos e chaves' : manageTab} completas aqui.</p>
                    </div>
                )}
            </div>

            {/* TEAM MODAL */}
            {isTeamModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTeamModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Adicionar Nova Equipe</h3>
                            <button onClick={() => setIsTeamModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:bg-slate-200 transition-colors cursor-pointer">
                                    {teamForm.logo ? (
                                        <img src={teamForm.logo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center">
                                            <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                            <span className="text-[10px] text-slate-500">Logo</span>
                                        </div>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleTeamLogoUpload} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Equipe *</label>
                                <input 
                                    value={teamForm.name}
                                    onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Ex: Real Madrid FC"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Técnico / Responsável</label>
                                <input 
                                    value={teamForm.coach}
                                    onChange={(e) => setTeamForm({...teamForm, coach: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Nome do treinador"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Telefone de Contato</label>
                                <input 
                                    value={teamForm.contact}
                                    onChange={(e) => setTeamForm({...teamForm, contact: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Cancelar</button>
                            <button 
                                onClick={handleAddTeam} 
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <PlusCircle className="w-4 h-4 mr-2"/>}
                                Salvar Equipe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  // Helper icons component since we can't map components directly easily in array
  const Scale = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
  
  const Calculator = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-200">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {renderHeader()}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative scroll-smooth">
          {dbMissing ? renderDbSetup() : (
              <>
                  {view === 'list' && renderList()}
                  {view === 'create_selection' && renderCreateSelection()}
                  {view === 'create_form' && renderCreateForm()}
                  {view === 'manage' && renderManager()}
              </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;