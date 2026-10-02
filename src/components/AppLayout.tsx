import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { AppRole } from '../types';
import { getActiveVendedor } from '../lib/vendedorHelper';
import { SupabaseSetupModal } from './admin/SupabaseSetupModal';
import {
  Calendar,
  FileSpreadsheet,
  Package,
  Truck,
  Users,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Layers,
  Settings,
  CheckCircle2,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<Props> = ({ activeTab, setActiveTab, children }) => {
  const { user, role, empresa, logout, switchRole, updateUserVendedor, isSupabaseConnected } = useAuth();
  const { vendedores } = useData();
  const activeVendedor = getActiveVendedor(user, vendedores);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Módulos V2.0 — conforme Especificação Mestre
  const menuItems = [
    { id: 'mapa', label: 'Mapa Cirúrgico', icon: Calendar, gradient: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/20' },
    { id: 'protocolos', label: 'Protocolo OPME', icon: FileSpreadsheet, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { id: 'autorizacoes', label: 'Autorizações', icon: CheckCircle2, gradient: 'from-green-500 to-emerald-700', shadow: 'shadow-green-500/20' },
    { id: 'estoque', label: 'Estoque', icon: Package, gradient: 'from-violet-500 to-purple-700', shadow: 'shadow-violet-500/20' },
    { id: 'equipamentos', label: 'Equipamentos', icon: Zap, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
    { id: 'cadastros', label: 'Cadastros', icon: Layers, gradient: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/20' },
    { id: 'auditoria', label: 'Auditoria', icon: ShieldAlert, adminOnly: true, gradient: 'from-rose-500 to-red-700', shadow: 'shadow-rose-500/20' },
    { id: 'usuarios', label: 'Usuários', icon: Users, adminOnly: true, gradient: 'from-indigo-500 to-blue-700', shadow: 'shadow-indigo-500/20' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, adminOnly: true, gradient: 'from-gray-500 to-gray-700', shadow: 'shadow-gray-500/20' },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || role === 'admin' || role === 'gestor' || role === 'auditor'
  );

  // Roles V2.0 — conforme spec seção 3
  const roleLabels: Record<AppRole, string> = {
    admin: 'Administrador',
    gestor: 'Gestor',
    vendedor: 'Vendedor / Representante',
    estoque: 'Estoque',
    logistica: 'Logística',
    motorista: 'Motorista / Entregador',
    operador: 'Operador',
    auditor: 'Auditor',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-foreground flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* ==================== DARK LEFT SIDEBAR ==================== */}
        <aside className="hidden lg:flex w-64 bg-[#0B0F19] text-slate-300 flex-col shrink-0 border-r border-slate-800/80 z-30 select-none">
          
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-lg tracking-wider">
                <CrownIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  PrestyMedick
                </span>
                <p className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                  OPME ERP PLATFORM
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
            
            {/* Primary Nav Menu */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                NAVEGAÇÃO PRINCIPAL
              </p>
              <nav className="space-y-1 pt-1.5">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-slate-800/90 text-white shadow-md border border-slate-700/80 ring-1 ring-blue-500/30'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient} text-white shadow-xs ${item.shadow} shrink-0 transition-transform ${
                          isActive ? 'scale-105 ring-2 ring-white/20' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

          </div>

          {/* User Profile Footer */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-blue-500/30">
                  {user?.nome ? user.nome.slice(0, 2).toUpperCase() : 'PM'}
                </div>
                <div className="truncate text-xs">
                  <p className="font-bold text-slate-100 truncate leading-tight">{user?.nome || 'Carlos Amorim'}</p>
                  <p className="text-[10px] text-blue-400 font-semibold truncate capitalize">
                    {role === 'vendedor' ? `Vendedor (${activeVendedor?.nome?.split(' ')[0] || 'Vendedor'})` : roleLabels[role] || role}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sair do Sistema"
                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Alternador rápido de Papel e Vendedor para Testes e Auditoria */}
            <div className="pt-1 border-t border-slate-900 space-y-1">
              <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-black">
                <span>Papel de Acesso:</span>
              </div>
              <select
                value={role}
                onChange={(e) => switchRole(e.target.value as AppRole)}
                className="w-full text-[10px] bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="admin">Administrador (Acesso Total)</option>
                <option value="vendedor">Vendedor (Somente Suas Cirurgias)</option>
                <option value="gestor">Gestor Geral</option>
                <option value="auditor">Auditor (Trilha de Logs)</option>
                <option value="estoque">Estoque OPME</option>
              </select>

              {role === 'vendedor' && vendedores.length > 0 && (
                <div className="pt-1">
                  <span className="text-[9px] text-amber-500 uppercase font-black block">Representante Ativo:</span>
                  <select
                    value={activeVendedor?.id || ''}
                    onChange={(e) => {
                      const v = vendedores.find(item => item.id === e.target.value);
                      if (v && updateUserVendedor) {
                        updateUserVendedor(v.id, v.nome);
                      }
                    }}
                    className="w-full text-[10px] bg-amber-950/60 border border-amber-700/80 text-amber-300 rounded-lg px-2 py-1 focus:outline-none font-bold"
                  >
                    {vendedores.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* ==================== MAIN WORKSPACE ==================== */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-y-auto overflow-x-hidden">
          
          {/* Mobile Top Bar (visível apenas em telas menores/mobile) */}
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 h-12 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
              {menuItems.find((m) => m.id === activeTab)?.label || 'OPME Presty'}
            </span>
            <div className="w-6" />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 space-y-6 min-w-0 max-w-full">
            {children}
          </main>

        </div>

      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex">
          <div className="w-64 bg-[#0B0F19] border-r border-slate-800 p-4 h-full flex flex-col justify-between text-slate-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-sm text-white">Módulos PrestyMedick</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <nav className="space-y-1">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                          : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient} text-white shadow-xs`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

    </div>
  );
};

function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

