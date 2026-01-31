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
  // Add 'construction' to valid views
  const [currentView, setCurrentView] = useState<'landing' | 'payment' | 'dashboard' | 'login' | 'construction'>(
    MAINTENANCE_MODE ? 'construction' : 'landing'
  );
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  
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
        // Don't warn on 'PGRST116' (row not found) or 'PGRST205' (table missing)
        // This keeps the console clean for new projects
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

  // Robust User Loader: Tries DB, Falls back to Session Metadata
  const loadUserSession = async (session: any) => {
      if (!session?.user) return null;
      
      // 1. Try DB
      let profileUser = await fetchUserProfile(session.user.id, session.user.email!);
      
      // 2. If null, use Fallback from Metadata
      if (!profileUser) {
          // Only warn if we are debugging, otherwise it's expected for new/demo setups
          // console.warn("Profile not found in DB. Using session metadata as fallback.");
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

    // Safety timeout to ensure loading doesn't stick forever
    const loadingTimeout = setTimeout(() => {
        if (mounted.current && loadingSession) {
            console.warn("Session check timed out - forcing load complete");
            setLoadingSession(false);
        }
    }, 4000);

    // 1. Check active session on load
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await (supabase.auth as any).getSession();
        if (error) throw error;

        if (session) {
          await loadUserSession(session);
          if (mounted.current) setCurrentView('dashboard');
        } else {
            // If no session and maintenance mode is on, ensure we are on construction
            // FIX: Allow 'login' view to persist so authorized users can access the restricted area
            if (MAINTENANCE_MODE && currentView !== 'login') {
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

    // 2. Listen for auth changes
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
      if (!mounted.current) return;
      
      if (session) {
         // Re-use robust loader
         await loadUserSession(session);
      } else {
        // Critical Fix: If session is null, clear user AND redirect to avoid limbo state
        setUser(null);
        if (currentView === 'dashboard') {
            setCurrentView('login');
        } else if (event === 'SIGNED_OUT') {
           // On logout, go back to construction if maintenance is on, else landing
           setCurrentView(MAINTENANCE_MODE ? 'construction' : 'landing');
        }
      }
    });

    return () => {
        mounted.current = false;
        clearTimeout(loadingTimeout);
        subscription.unsubscribe();
    };
  }, []); // Remove dependencies to run once on mount

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

  // Handle Login Success
  const handleLoginSuccess = async () => {
     try {
        setLoadingSession(true); // Show loading while fetching profile
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session) {
            await loadUserSession(session);
            setCurrentView('dashboard');
        } else {
            // Fallback if session is not immediately available (rare race condition)
            console.error("Login success but no session found");
        }
     } catch (err) {
        console.error("Error during login transition:", err);
     } finally {
        setLoadingSession(false);
        window.scrollTo(0, 0);
     }
  };

  // --- DEMO MODE HANDLER (Bypass Supabase) ---
  const handleDemoLogin = () => {
    setUser({
      id: 'demo-user-123',
      name: 'Visitante (Demo)',
      email: 'visitante@gestorpro.com',
      plan: 'Elite' // Give full access for demo
    });
    setCurrentView('dashboard');
    window.scrollTo(0, 0);
  };

  const handleRegisterFromLogin = () => {
    // If maintenance mode, maybe disallow registration or redirect to construction? 
    // For now, let's redirect to landing but maybe landing is not accessible.
    // Let's assume registration is Invite Only during maintenance, OR we show plans.
    // For simplicity, let's allow going to landing temporarily to see plans.
    setCurrentView('landing'); 
    setTimeout(() => {
       const plansSection = document.getElementById('plans');
       if(plansSection) plansSection.scrollIntoView({ behavior: 'smooth'});
    }, 100);
  };

  // Handle Register Success
  const handleRegisterSuccess = async () => {
     setLoadingSession(true);
     try {
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session) {
           // Try DB fetch first
           let profile = await fetchUserProfile(session.user.id, session.user.email!);

           // Retry logic for race conditions (DB trigger latency)
           if (!profile) {
              await new Promise(resolve => setTimeout(resolve, 1500));
              // Use the robust loader for the second attempt/fallback
              await loadUserSession(session);
           } else {
               // Profile found, user already set by fetchUserProfile
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
    // Determine where to go after logout
    setCurrentView(MAINTENANCE_MODE ? 'construction' : 'landing');
    setSelectedPlan(null);
    window.scrollTo(0, 0);
  }

  // Global Loading State (Initial Load)
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

  // Dashboard View - Strict Check
  if (currentView === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
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