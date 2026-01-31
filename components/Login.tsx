import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Mail, Lock, ArrowLeft, LogIn, AlertCircle, ShieldCheck, RefreshCw, CheckCircle2, UserCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onRegisterClick: () => void;
  onDemoLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack, onRegisterClick, onDemoLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States for Email Resend functionality
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setShowResend(false);
  };

  const handleResendEmail = async () => {
    if (!formData.email) return;
    
    setResendLoading(true);
    setError('');
    
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: formData.email
        });

        if (error) throw error;

        setResendSuccess('E-mail reenviado com sucesso! Verifique sua caixa de entrada e spam.');
        setShowResend(false);
    } catch (err: any) {
        setError(err.message || 'Erro ao reenviar e-mail.');
    } finally {
        setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    setResendSuccess('');
    setShowResend(false);

    try {
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tempo limite excedido. Verifique sua conexão.')), 15000)
      );

      const loginPromise = (supabase.auth as any).signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      // Race between login and timeout
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

      // Login successful
      onLoginSuccess();
      
    } catch (err: any) {
      setLoading(false); // Only stop loading on error, keep loading on success until parent unmounts
      
      const msg = err.message || '';

      // Clean up console for expected user errors
      if (msg.includes('Invalid login') || msg === 'Invalid login credentials') {
         console.warn('Login attempt failed: Invalid credentials');
         setError('E-mail ou senha incorretos.');
      } else if (msg.includes('Email not confirmed')) {
         console.warn('Login attempt failed: Email not confirmed');
         setError('Sua conta ainda não foi ativada. É necessário confirmar o e-mail antes de entrar.');
         setShowResend(true);
      } else if (msg.includes('Tempo limite')) {
         setError('O servidor demorou para responder. Verifique sua internet e tente novamente.');
      } else {
         console.error('Login error:', err);
         setError(msg || 'Erro ao realizar login. Tente novamente.');
      }
    } 
    // Note: We do NOT call setLoading(false) in finally block if success, 
    // because the parent component will unmount this component shortly after onLoginSuccess.
    // Keeping it loading prevents user from clicking again.
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center relative flex-col bg-slate-50">
      <button 
        onClick={onBack} 
        className="absolute top-24 left-4 sm:left-8 flex items-center text-slate-500 hover:text-slate-900 transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </button>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-50 rounded-full mb-4 relative">
             <Trophy className="w-10 h-10 text-blue-600" />
             <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                <ShieldCheck className="w-3 h-3 text-white" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Gestor Pro v4.0</h2>
          <p className="text-slate-500 mt-2">Acesse seu painel (Supabase Connected).</p>
        </div>

        {/* Success Message for Resend */}
        {resendSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-start text-sm animate-fade-in">
                <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0 text-green-600" />
                <span>{resendSuccess}</span>
            </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl flex flex-col text-sm border ${showResend ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <div className="flex items-start">
                <AlertCircle className={`w-5 h-5 mr-2 flex-shrink-0 ${showResend ? 'text-yellow-600' : 'text-red-500'}`} />
                <span>{error}</span>
            </div>
            
            {showResend && (
                <button 
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="mt-3 ml-7 text-xs font-bold bg-white border border-yellow-300 px-3 py-2 rounded-lg hover:bg-yellow-100 transition-colors flex items-center w-fit shadow-sm text-yellow-900"
                >
                    {resendLoading ? (
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                    ) : (
                        <Mail className="w-3 h-3 mr-2" />
                    )}
                    {resendLoading ? 'Enviando...' : 'Reenviar E-mail de Ativação'}
                </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input 
                required 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                placeholder="seu@email.com"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Senha</label>
              <a href="#" className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input 
                required 
                name="password" 
                type="password" 
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" /> Entrar no Painel
              </>
            )}
          </button>
          
          {/* Demo Button */}
          <button 
            type="button"
            onClick={onDemoLogin}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-200 hover:border-blue-400 transition-all flex items-center justify-center group"
          >
            <UserCheck className="w-5 h-5 mr-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
            Entrar como Visitante (Demo)
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Ainda não tem uma conta?{' '}
            <button onClick={onRegisterClick} className="text-blue-600 font-bold hover:underline">
              Criar conta gratuita
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;