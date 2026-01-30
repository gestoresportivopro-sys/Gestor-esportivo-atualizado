import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CreditCard, Lock, CheckCircle, ShieldCheck, User, Mail, Key, AlertCircle, LogIn } from 'lucide-react';
import { PlanType } from '../App';

interface PaymentProps {
  plan: PlanType | null;
  onBack: () => void;
  onRegisterSuccess: () => void;
  onLogin: () => void;
}

const Payment: React.FC<PaymentProps> = ({ plan, onBack, onRegisterSuccess, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  if (!plan) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setUserExists(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUserExists(false);

    try {
      // 1. Sign Up User
      const { data: authData, error: authError } = await (supabase.auth as any).signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name, 
            plan: plan.name 
          }
        }
      });

      if (authError) throw authError;

      // Check if session is missing (Email Confirmation enabled)
      if (authData.user && !authData.session) {
        setRequiresConfirmation(true);
      }

      // 2. Success State
      setSuccess(true);

    } catch (err: any) {
      const msgRaw = err?.message || '';
      
      // Log warning instead of error for known validation issues
      if (msgRaw.includes('already registered')) {
        console.warn('Registration: User already exists');
      } else {
        console.error('Registration error:', err);
      }
      
      // Tratamento amigável de erros
      let msg = '';
      if (typeof err === 'string') {
        msg = err;
      } else if (err?.message) {
        msg = err.message;
      } else if (err?.error_description) {
         msg = err.error_description;
      } else {
        msg = 'Erro desconhecido ao criar conta.';
      }
      
      const lowerMsg = msg.toLowerCase();

      if (lowerMsg.includes('already registered') || lowerMsg.includes('unique constraint')) {
        msg = 'Este e-mail já está cadastrado. Você pode fazer login diretamente.';
        setUserExists(true);
      } else if (lowerMsg.includes('password') && (lowerMsg.includes('short') || lowerMsg.includes('6'))) {
        msg = 'A senha deve ter no mínimo 6 caracteres.';
      } else if (lowerMsg.includes('weak') || lowerMsg.includes('pwned') || lowerMsg.includes('compromised')) {
        msg = 'Esta senha é muito comum. Use uma senha mais complexa.';
      } else if (lowerMsg.includes('valid email')) {
        msg = 'Por favor, insira um e-mail válido.';
      } else if (lowerMsg.includes('rate limit')) {
         if (lowerMsg.includes('email')) {
             msg = 'Limite de e-mails do Supabase atingido. SOLUÇÃO: No painel do Supabase, vá em Authentication > Providers > Email e DESMARQUE a opção "Confirm email".';
         } else {
             msg = 'Muitas tentativas detectadas. Aguarde alguns instantes.';
         }
      } else if (lowerMsg.includes('security purposes')) {
          msg = 'Bloqueado por segurança. Tente novamente mais tarde.';
      }

      setError(msg);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-100 relative overflow-hidden">
          
          {requiresConfirmation ? (
             <>
                <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Verifique seu E-mail
                </h2>
                <p className="text-slate-600 mb-8">
                  Enviamos um link de confirmação para <span className="font-bold text-slate-900">{formData.email}</span>.
                  <br/><br/>
                  <span className="text-sm">Por favor, clique no link enviado para ativar sua conta e acessar o painel.</span>
                </p>
                <button 
                  onClick={onRegisterSuccess}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center"
                >
                  Ir para Login
                </button>
             </>
          ) : (
             <>
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Conta Criada com Sucesso!
                </h2>
                <p className="text-slate-600 mb-8">
                  {plan.isFree 
                    ? <span>Bem-vindo ao <b>Gestor Esportivo Pro</b>, <span className="font-bold">{formData.name}</span>.</span>
                    : <span>Seu plano <span className="font-bold text-slate-900">{plan.name}</span> foi ativado.</span>
                  }
                </p>
                <button 
                  onClick={onRegisterSuccess}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Acessar Meu Painel
                </button>
             </>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar para planos
      </button>

      <div className="lg:grid lg:grid-cols-12 gap-12">
        
        {/* Payment/Signup Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                {plan.isFree ? 'Criar Conta Grátis' : 'Finalizar Compra'}
              </h2>
              <div className="flex gap-2">
                <div className={`w-10 h-6 rounded border border-slate-200 ${plan.isFree ? 'bg-blue-500 border-blue-600' : 'bg-slate-100'}`}></div>
                {!plan.isFree && (
                  <>
                    <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200"></div>
                    <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200"></div>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-xl text-sm flex flex-col items-start border ${userExists ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <div className="flex items-start">
                  <AlertCircle className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${userExists ? 'text-blue-600' : 'text-red-600'}`} />
                  <span className="leading-relaxed">{error}</span>
                </div>
                {userExists && (
                  <button 
                    type="button"
                    onClick={onLogin}
                    className="mt-3 ml-8 text-xs font-bold bg-white border border-blue-300 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center shadow-sm text-blue-700"
                  >
                    <LogIn className="w-3 h-3 mr-2" /> Ir para Login
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Dados de Acesso</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                      <input 
                        required name="name" onChange={handleChange}
                        type="text" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Seu nome"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                      <input 
                        required name="email" onChange={handleChange}
                        type="email" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                      <input 
                        required name="password" onChange={handleChange}
                        type="password" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Crie uma senha segura (min 6 caracteres)"
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 ml-1">Para sua segurança, evite senhas comuns ou sequenciais.</p>
                  </div>
                </div>
              </div>

              {!plan.isFree ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                   <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pagamento (Simulado)</h3>
                   {/* Credit Card Fields */}
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome no Cartão</label>
                      <input 
                        required name="cardName" onChange={handleChange}
                        type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Como impresso no cartão"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número do Cartão</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                        <input 
                          required name="cardNumber" onChange={handleChange}
                          type="text" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0000 0000 0000 0000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Validade</label>
                        <input 
                          required name="expiry" onChange={handleChange}
                          type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                          <input 
                            required name="cvc" onChange={handleChange}
                            type="text" className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100">
                   <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                         <ShieldCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 text-sm mb-1">Período de Teste de 30 Dias</h4>
                         <p className="text-xs text-slate-600">
                           Aproveite todas as funcionalidades gratuitamente. Após 30 dias, você poderá escolher migrar para um plano pago ou manter sua conta com recursos limitados.
                         </p>
                      </div>
                   </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    {plan.isFree ? (
                      <>Começar Teste Grátis</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Pagar {plan.price}</>
                    )}
                  </>
                )}
              </button>
              
              {!plan.isFree && (
                <div className="flex items-center justify-center text-xs text-slate-400 gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Pagamento processado em ambiente seguro
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
             {/* Abstract bg */}
             <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
             
             <h3 className="text-xl font-bold mb-6">Resumo do Pedido</h3>
             
             <div className="flex justify-between items-center py-4 border-b border-slate-700">
               <div>
                 <p className="font-bold text-lg">Plano {plan.name}</p>
                 <p className="text-slate-400 text-sm">
                   {plan.isFree ? 'Período de avaliação' : `Cobrança ${plan.period}`}
                 </p>
               </div>
               <div className="text-2xl font-bold">{plan.price}</div>
             </div>
            
             {/* Dynamic Total */}
             <div className="flex justify-between items-center py-4 border-b border-slate-700">
               <p className="font-medium text-slate-300">Total a pagar hoje</p>
               <p className="text-xl font-bold text-green-400">
                  {plan.isFree ? 'R$ 0,00' : plan.price}
               </p>
             </div>

             <div className="py-6 space-y-3">
               <p className="font-semibold text-slate-300 mb-2">Incluso no pacote:</p>
               {plan.features.slice(0, 4).map((feature, i) => (
                 <div key={i} className="flex items-center text-sm text-slate-400">
                   <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                   {feature}
                 </div>
               ))}
               <div className="text-sm text-slate-500 pl-6 italic">+ outros benefícios</div>
             </div>

             {!plan.isFree && (
                <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-300 mt-4 border border-slate-700">
                    <p>O cancelamento pode ser feito a qualquer momento através do painel do usuário.</p>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;