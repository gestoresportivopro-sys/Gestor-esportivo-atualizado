import React from 'react';
import { Trophy, Instagram, Facebook, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <Trophy className="h-6 w-6 text-green-500" />
               <span className="font-bold text-xl text-white">
                 Gestor Esportivo <span className="text-green-500">Pro</span>
               </span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              A plataforma definitiva para gestão esportiva. Tecnologia, inovação e paixão pelo esporte em um só lugar.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Planos e Preços</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">App Mobile</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Integrações</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Tutoriais</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Status do Sistema</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Fale Conosco</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> contato@gestoresportivo.pro
              </li>
              <li>Av. Paulista, 1000 - São Paulo, SP</li>
              <li>+55 (11) 99999-9999</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} Gestor Esportivo Pro. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Termos de Uso</a>
            <a href="#" className="hover:text-white">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;