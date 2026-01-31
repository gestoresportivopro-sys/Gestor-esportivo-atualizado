import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Differentiators from './components/Differentiators';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import Championships from './components/Championships';
import Plans from './components/Plans';
import Payment from './components/Payment';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Construction from './components/Construction';
import PublicChampionship from './components/PublicChampionship';

// --- CONFIGURAÇÃO DE MANUTENÇÃO ---
// Mude para 'true' para ativar a página de "Em Breve" para visitantes
// Mude para 'false' para lançar o site oficial publicamente
const MAINTENANCE_MODE = true; 

export type PlanType = {
  name: string;
  price: string;
  period: string;
  features: string[];
  isFree?: boolean;
};

export type UserType = {
  id?: string; // Supabase ID
  name: string;
  email: string;
  plan: string;
};

const App: React.FC = () => {
  // Add 'public_championship' to valid views
  const [currentView, setCurrentView] = useState<'landing' | 'payment' | 'dashboard' | 'login' | 'construction' | 'public_championship'>(
    MAINTENANCE_MODE ? 'construction' : 'landing'
  );
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [publicChampId, setPublicChampId] = useState<number | string | null>(null);
  
  // Current logged in user state
  const [user, setUser] = useState<UserType | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const mounted = useRef(true);

  // Helper to fetch profile from DB
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116' && error.code !== 'PGRST205' && error.code !== '42P01') {
            console.warn("Profile fetch warning:", error.message);
        }
        return null;
      }

      if (profile) {
        const userData = {
          id: userId,
          name: profile.name,
          email: email,
          plan: profile.plan || 'Starter'
        };
        setUser(userData);
        return userData;
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
    return null;
  };

  // Robust User Loader
  const loadUserSession = async (session: any) => {
      if (!session?.user) return null;
      let profileUser = await fetchUserProfile(session.user.id, session.user.email!);
      if (!profileUser) {
          const fallbackUser: UserType = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 'Usuário',
              email: session.user.email!,
              plan: session.user.user_metadata?.plan || 'Starter'
          };
          setUser(fallbackUser);
          return fallbackUser;
      }
      return profileUser;
  };

  // --- SUPABASE AUTH LISTENER ---
  useEffect(() => {
    mounted.current = true;
    const loadingTimeout = setTimeout(() => {
        if (mounted.current && loadingSession) {
            console.warn("Session check timed out - forcing load complete");
            setLoadingSession(false);
        }
    }, 30000);

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await (supabase.auth as any).getSession();
        if (error) throw error;

        if (session) {
          await loadUserSession(session);
          if (mounted.current) setCurrentView('dashboard');
        } else {
            if (MAINTENANCE_MODE && currentView !== 'login' && currentView !== 'public_championship') {
                if (mounted.current) setCurrentView('construction');
            }
        }
      } catch (err) {
        console.error("Session check failed:", err);
        if (mounted.current) setUser(null);
      } finally {
        if (mounted.current) setLoadingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
      if (!mounted.current) return;
      if (session) {
         await loadUserSession(session);
      } else {
        setUser(null);
        if (currentView === 'dashboard') {
            setCurrentView('login');
        } else if (event === 'SIGNED_OUT') {
           setCurrentView(MAINTENANCE_MODE ? 'construction' : 'landing');
        }
      }
    });

    return () => {
        mounted.current = false;
        clearTimeout(loadingTimeout);
        subscription.unsubscribe();
    };
  }, []);

  // --- HANDLERS ---

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
    setCurrentView('payment');
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentView(MAINTENANCE_MODE ? 'construction' : 'landing');
    setSelectedPlan(null);
    window.scrollTo(0, 0);
  };

  const handleNavigateToLogin = () => {
    setCurrentView('login');
    window.scrollTo(0, 0);
  }

  // --- NEW: View Public Page Handler ---
  const handleViewPublicPage = (champId: number | string) => {
      setPublicChampId(champId);
      setCurrentView('public_championship');
      window.scrollTo(0, 0);
  };

  const handleBackFromPublic = () => {
      // If user is logged in, go back to dashboard, else go to home
      if (user) {
          setCurrentView('dashboard');
      } else {
          setCurrentView(MAINTENANCE_MODE ? 'construction' : 'landing');
      }
  };

  // Handle Login Success
  const handleLoginSuccess = async () => {
     try {
        setLoadingSession(true); 
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session) {
            await loadUserSession(session);
            setCurrentView('dashboard');
        } else {
            console.error("Login success but no session found");
        }
     } catch (err) {
        console.error("Error during login transition:", err);
     } finally {
        setLoadingSession(false);
        window.scrollTo(0, 0);
     }
  };

  const handleDemoLogin = () => {
    setUser({
      id: 'demo-user-123',
      name: 'Visitante (Demo)',
      email: 'visitante@gestorpro.com',
      plan: 'Elite' 
    });
    setCurrentView('dashboard');
    window.scrollTo(0, 0);
  };

  const handleRegisterFromLogin = () => {
    setCurrentView('landing'); 
    setTimeout(() => {
       const plansSection = document.getElementById('plans');
       if(plansSection) plansSection.scrollIntoView({ behavior: 'smooth'});
    }, 100);
  };

  const handleRegisterSuccess = async () => {
     setLoadingSession(true);
     try {
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session) {
           let profile = await fetchUserProfile(session.user.id, session.user.email!);
           if (!profile) {
              await new Promise(resolve => setTimeout(resolve, 1500));
              await loadUserSession(session);
           }
           setCurrentView('dashboard');
        } else {
           setCurrentView('login');
        }
     } catch (e) {
        console.error(e);
     } finally {
        setLoadingSession(false);
        window.scrollTo(0, 0);
     }
  };

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    setUser(null);
    setCurrentView(MAINTENANCE_MODE ? 'construction' : 'landing');
    setSelectedPlan(null);
    window.scrollTo(0, 0);
  }

  // Global Loading State
  if (loadingSession) {
     return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center">
           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
           <p className="animate-pulse">Carregando sistema...</p>
           <button onClick={() => window.location.reload()} className="mt-8 text-xs text-blue-400 hover:underline">
              Demorando muito? Recarregar
           </button>
        </div>
     </div>;
  }

  // --- PUBLIC VIEW RENDER ---
  if (currentView === 'public_championship' && publicChampId) {
      return <PublicChampionship championshipId={publicChampId} onBack={handleBackFromPublic} />;
  }

  // Dashboard View - Strict Check
  if (currentView === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} onViewPublicPage={handleViewPublicPage} />;
  }

  // --- CONSTRUCTION MODE ---
  if (currentView === 'construction') {
      return <Construction onLogin={handleNavigateToLogin} />;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans text-slate-900 bg-slate-50 selection:bg-green-500 selection:text-white">
      {/* Global Sports Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/5 blur-3xl"></div>
        <div className="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-green-500/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] rounded-full bg-blue-900/5 blur-3xl"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onNavigateHome={handleBackToHome} onLogin={handleNavigateToLogin} />
        
        <main className="flex-grow">
          {currentView === 'landing' && (
            <>
              <Hero />
              <Championships />
              <About />
              <Features />
              <Differentiators />
              <Plans onSelectPlan={handlePlanSelect} />
              <CallToAction />
            </>
          )}

          {currentView === 'payment' && (
            <Payment 
              plan={selectedPlan} 
              onBack={handleBackToHome} 
              onRegisterSuccess={handleRegisterSuccess} 
              onLogin={handleNavigateToLogin}
            />
          )}

          {currentView === 'login' && (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onBack={handleBackToHome} 
              onRegisterClick={handleRegisterFromLogin}
              onDemoLogin={handleDemoLogin}
            />
          )}

          {/* Fallback for Dashboard Loading / Error State */}
          {currentView === 'dashboard' && !user && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-slate-800">Preparando seu ambiente...</h2>
                <p className="text-slate-500 mt-2">Estamos configurando seu painel de gestão.</p>
                
                {/* Fallback Action */}
                <div className="mt-8 space-y-4 flex flex-col items-center">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Se demorar muito, clique aqui para recarregar
                    </button>
                    <button 
                        onClick={() => {
                             // Emergency escape hatch: Clear session and go to login
                             supabase.auth.signOut();
                             setCurrentView('login');
                             setUser(null);
                        }}
                        className="text-xs text-red-400 hover:text-red-600"
                    >
                        Sair e tentar novamente
                    </button>
                </div>
             </div>
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;