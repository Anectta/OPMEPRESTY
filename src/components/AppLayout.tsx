import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppRole } from '../types';
import { SupabaseSetupModal } from './admin/SupabaseSetupModal';
import {
  Activity,
  Calendar,
  FileSpreadsheet,
  Package,
  TrendingUp,
  Truck,
  FileText,
  Users,
  ShieldAlert,
  Database,
  LogOut,
  ChevronDown,
  Building2,
  Menu,
  X,
  Sparkles,
  Layers,
  Search,
  Bell,
  Sliders,
  Settings,
  Circle,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Radio,
  ExternalLink
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<Props> = ({ activeTab, setActiveTab, children }) => {
  const { user, role, empresa, logout, switchRole, isSupabaseConnected } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Visão Executiva', icon: Activity, gradient: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { id: 'mapa', label: 'Mapa Cirúrgico', icon: Calendar, gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
    { id: 'protocolos', label: 'Protocolos & Cotação', icon: FileSpreadsheet, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { id: 'estoque', label: 'Estoque & Lotes OPME', icon: Package, gradient: 'from-violet-500 to-purple-700', shadow: 'shadow-violet-500/20' },
    { id: 'vendas', label: 'Vendas & Comissões', icon: TrendingUp, gradient: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20' },
    { id: 'frota', label: 'Frota & Vistorias', icon: Truck, gradient: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/20' },
    { id: 'cadastros', label: 'Cadastros Auxiliares', icon: Layers, gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
    { id: 'relatorios', label: 'Relatórios & BI', icon: FileText, gradient: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-fuchsia-500/20' },
    { id: 'auditoria', label: 'Trilha de Auditoria', icon: ShieldAlert, adminOnly: true, gradient: 'from-rose-500 to-red-700', shadow: 'shadow-rose-500/20' },
    { id: 'usuarios', label: 'Gestão de Usuários', icon: Users, adminOnly: true, gradient: 'from-indigo-500 to-blue-700', shadow: 'shadow-indigo-500/20' },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || role === 'admin'
  );

  const roleLabels: Record<AppRole, string> = {
    admin: 'Administrador (Acesso Total)',
    comercial: 'Representante Comercial',
    estoque: 'Gestor de Estoque OPME',
    gestor_frota: 'Gestor de Frota',
    motorista: 'Motorista / Entregador',
    supervisor: 'Supervisor Comercial',
    financeiro: 'Financeiro',
    editor: 'Editor',
    user: 'Usuário Comum',
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
          <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-blue-500/30">
                {user?.nome ? user.nome.slice(0, 2).toUpperCase() : 'PM'}
              </div>
              <div className="truncate text-xs">
                <p className="font-bold text-slate-100 truncate leading-tight">{user?.nome || 'Carlos Amorim'}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">{role}</p>
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

        </aside>

        {/* ==================== MAIN WORKSPACE ==================== */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-y-auto overflow-x-hidden">
          
          {/* Top Bar Header */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            
            {/* Left Breadcrumb & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  DASHBOARD
                </span>
                <span className="text-slate-300 font-bold">/</span>
                {(() => {
                  const currentItem = menuItems.find((m) => m.id === activeTab) || menuItems[0];
                  const IconComp = currentItem.icon;
                  return (
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-100">
                      <span className={`p-1 rounded-md bg-gradient-to-br ${currentItem.gradient} text-white shadow-2xs`}>
                        <IconComp className="w-3 h-3 text-white" />
                      </span>
                      <span>{currentItem.label}</span>
                    </div>
                  );
                })()}

                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Center Global Search */}
            <div className="hidden md:flex items-center relative w-72 lg:w-96">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cirurgias, lotes, hospitais, cotações..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
              <kbd className="absolute right-2 top-2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                Ctrl K
              </kbd>
            </div>

            {/* Right Tools: Date, Status, RLS Switcher, Supabase */}
            <div className="flex items-center gap-2.5">
              
              {/* Date & Market Status */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span>Qua, 07 Ago 2026</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white">
                  MAPA ABERTO
                </span>
              </div>

              {/* Supabase Button */}
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                title="Status da Conexão de Banco de Dados Supabase"
              >
                <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline text-[11px] font-bold">
                  {isSupabaseConnected ? 'PostgreSQL Cloud' : 'Banco Local'}
                </span>
                <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </button>

              {/* Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="capitalize hidden sm:inline">{roleLabels[role] || role}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Simular Papel de Acesso (RLS)
                    </div>
                    {(Object.keys(roleLabels) as AppRole[]).slice(0, 6).map((rKey) => (
                      <button
                        key={rKey}
                        onClick={() => {
                          switchRole(rKey);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between ${
                          role === rKey ? 'font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{roleLabels[rKey]}</span>
                        {role === rKey && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 space-y-6 min-w-0 max-w-full">
            {children}
          </main>

          {/* Bottom Fixed Engine Status Footer Bar */}
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-6 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                PrestyMedick Engine running
              </span>
              <span>•</span>
              <span>34 cirurgias ativas em mapa</span>
              <span>•</span>
              <span className="font-mono">14ms avg latency</span>
            </div>

            <div className="flex items-center gap-4 text-[10px]">
              <span>Horário de Atendimento: 08:00–18:00 BRT</span>
              <span>•</span>
              <span>Fonte de Dados: PostgreSQL RLS / Supabase v4.2.1</span>
            </div>
          </footer>

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

