import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppRole } from '../types';
import { SupabaseSetupModal } from './admin/SupabaseSetupModal';
import { supabase } from '../lib/supabase/client';
import { Activity, ShieldCheck, Stethoscope, Truck, Package, Database, Lock, UserCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, signup, isLoading, isSupabaseConnected } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('admin@prestymedick.com.br');
  const [password, setPassword] = useState('123456');
  const [nome, setNome] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('admin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (mode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Falha ao autenticar. Verifique o e-mail e senha informados.');
      }
    } else {
      if (!nome.trim()) {
        setErrorMsg('Por favor informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      const res = await signup(nome, email, password, selectedRole);
      if (!res.success) {
        setErrorMsg(res.error || 'Falha ao criar conta.');
      } else {
        setInfoMsg('Conta criada com sucesso! Faça login ou verifique seu e-mail caso a confirmação esteja ativada.');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Informe seu e-mail no campo abaixo para recuperar a senha.');
      return;
    }
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMsg(error.message);
      } else {
        setInfoMsg(`Instruções de redefinição de senha foram enviadas para ${email}!`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao solicitar redefinição.');
    }
  };

  const demoRoles: { role: AppRole; title: string; email: string; desc: string }[] = [
    { role: 'admin', title: 'Administrador Geral', email: 'admin@prestymedick.com.br', desc: 'Acesso total a relatórios, auditoria e usuários' },
    { role: 'comercial', title: 'Representante Comercial', email: 'vendedor@prestymedick.com.br', desc: 'Mapa cirúrgico, cotações OPME e metas' },
    { role: 'estoque', title: 'Gestor de Estoque OPME', email: 'estoque@prestymedick.com.br', desc: 'Lotes, séries, consignação e rastreabilidade' },
    { role: 'gestor_frota', title: 'Gestor de Frota', email: 'frota@prestymedick.com.br', desc: 'Veículos, abastecimentos e vistoria fotográfica' },
    { role: 'motorista', title: 'Entregador / Motorista', email: 'motorista@prestymedick.com.br', desc: 'Acesso às vistorias e checklists de saída/retorno' },
  ];

  const applyDemoRole = (roleItem: (typeof demoRoles)[0]) => {
    setEmail(roleItem.email);
    setSelectedRole(roleItem.role);
    setPassword('123456');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 lg:p-8 selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative w-full max-w-5xl bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Informative Panel - Navy Trust Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 text-slate-100 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/10">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Presty Medick
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">SaaS OPME</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">ERP para Distribuidora de OPME</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Stethoscope className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Mapa Cirúrgico Integrado</p>
                  <p className="text-slate-400">Agendamentos por hospital, médico, paciente e convênio.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Package className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Estoque com Lotes & Rastreabilidade</p>
                  <p className="text-slate-400">Controle rigoroso ANVISA, números de série e kits consignados.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Truck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Frota com Vistoria Fotográfica</p>
                  <p className="text-slate-400">Checklists guiados em 24 pontos com câmera em tempo real.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium text-xs cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>{isSupabaseConnected ? 'PostgreSQL Conectado' : 'Configurar Supabase'}</span>
            </button>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Online
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 bg-card flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Top Mode Selector */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {mode === 'login' ? 'Acesso ao Sistema' : 'Criar Nova Conta'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {mode === 'login'
                    ? 'Informe suas credenciais corporativas para entrar'
                    : 'Cadastre um novo usuário com papel parametrizado no banco'}
                </p>
              </div>

              <div className="flex bg-muted p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); setInfoMsg(null); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(null); setInfoMsg(null); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    mode === 'signup' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Cadastrar
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            {/* Login / Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Amorim"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">E-mail Corporativo</label>
                <input
                  type="email"
                  placeholder="usuario@prestymedick.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Senha de Acesso</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                  required
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Papel no Sistema (Role)</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as AppRole)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                  >
                    <option value="admin">Administrador (Acesso Total)</option>
                    <option value="comercial">Comercial / Vendedor</option>
                    <option value="estoque">Gestor de Estoque OPME</option>
                    <option value="gestor_frota">Gestor de Frota</option>
                    <option value="motorista">Motorista / Entregador</option>
                    <option value="financeiro">Financeiro</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Acessar Plataforma OPME' : 'Criar Minha Conta'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Role Selector */}
            {mode === 'login' && (
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Atalhos de Demonstração
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoRoles.slice(0, 4).map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => applyDemoRole(r)}
                      className="p-2 text-left rounded-lg border border-border/70 hover:border-primary/50 hover:bg-muted/50 transition-all text-xs cursor-pointer"
                    >
                      <p className="font-semibold text-foreground truncate">{r.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{r.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground text-center pt-2">
            Protegido por criptografia TLS 1.3 • RLS ativo no Supabase PostgreSQL
          </div>
        </div>
      </div>

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};
