import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AppRole, Empresa, AuditLog } from '../types';
import { supabase, IS_SUPABASE_CONFIGURED } from './supabase/client';

interface AuthContextType {
  user: UserProfile | null;
  role: AppRole;
  empresa: Empresa | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  auditLogs: AuditLog[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (nome: string, email: string, password: string, role?: AppRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (newRole: AppRole) => void;
  logAuditEvent: (
    action: string,
    resourceType: string,
    resourceId?: string,
    changes?: any,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ) => Promise<void>;
  updateUserVendedor?: (vendedorId: string, vendedorNome: string) => void;
  refreshProfile: () => Promise<void>;
}

const DEFAULT_EMPRESA: Empresa = {
  id: 'a0000000-0000-0000-0000-000000000001',
  razao_social: 'Presty Medick Distribuidora de OPME Ltda.',
  nome_fantasia: 'Presty Medick OPME',
  cnpj: '12.345.678/0001-90',
  ie: '110.293.847.112',
  endereco: 'Av. Paulista, 1500 - Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01310-100',
  telefone: '(11) 3200-4000',
  email: 'atendimento@prestymedick.com.br',
  logo_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=200',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole>('admin');
  const [empresa] = useState<Empresa>(DEFAULT_EMPRESA);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carrega perfil real e papel do Supabase para o usuário logado
  const loadSupabaseUserProfile = useCallback(async (authUser: { id: string; email?: string; user_metadata?: any; created_at?: string }) => {
    try {
      // 1. Busca perfil na tabela public.profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // 2. Busca papel na tabela public.user_roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .maybeSingle();

      const userRole: AppRole = (roleData?.role as AppRole) || 'admin';

      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        nome: profileData?.nome || authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário OPME',
        cargo: profileData?.cargo || authUser.user_metadata?.cargo || 'Membro da Equipe',
        cpf: profileData?.cpf,
        telefone: profileData?.telefone,
        created_at: profileData?.created_at || authUser.created_at || new Date().toISOString(),
        avatar_url: profileData?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      };

      setUser(userProfile);
      setRole(userRole);

      // Carrega logs de auditoria do banco
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logs && logs.length > 0) {
        setAuditLogs(logs as AuditLog[]);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil do Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Monitora sessão ativa ao inicializar e quando o estado de autenticação mudar
  useEffect(() => {
    let isMounted = true;

    if (IS_SUPABASE_CONFIGURED) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          loadSupabaseUserProfile(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          await loadSupabaseUserProfile(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Modo local de demonstração
      const savedUser = localStorage.getItem('presty_user');
      const savedRole = localStorage.getItem('presty_role');
      const savedLogs = localStorage.getItem('presty_audit_logs');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setRole((savedRole as AppRole) || 'admin');
      }
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      }
      setIsLoading(false);
    }
  }, [loadSupabaseUserProfile]);

  const refreshProfile = async () => {
    if (user?.id && IS_SUPABASE_CONFIGURED) {
      await loadSupabaseUserProfile({ id: user.id, email: user.email });
    }
  };

  const logAuditEvent = async (
    action: string,
    resourceType: string,
    resourceId?: string,
    changes?: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    const userName = user?.nome || (user?.email ? user.email.split('@')[0] : 'Usuário OPME');
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      severity,
      user_id: user?.id || 'anon',
      usuario_id: user?.id || 'anon',
      user_nome: userName,
      usuario_nome: userName,
      user_email: user?.email || 'sistema@prestymedick.com.br',
      usuario_email: user?.email || 'sistema@prestymedick.com.br',
      user_role: role,
      usuario_role: role,
      resource_type: resourceType,
      modulo: resourceType,
      entidade: resourceType,
      resource_id: resourceId,
      registro_id: resourceId,
      acao: action,
      changes: changes || {},
      created_at: new Date().toISOString(),
    };

    setAuditLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 300);
      try {
        localStorage.setItem('presty_audit_logs', JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao salvar logs localmente:', e);
      }
      return updated;
    });

    if (IS_SUPABASE_CONFIGURED && user) {
      try {
        await supabase.from('audit_logs').insert({
          action,
          severity,
          user_id: user.id,
          user_email: user.email,
          user_role: role,
          resource_type: resourceType,
          resource_id: resourceId,
          changes: changes || {},
        });
      } catch (err) {
        console.warn('Erro ao sincronizar log com Supabase:', err);
      }
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Tenta autenticação real no Supabase
      if (IS_SUPABASE_CONFIGURED) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (data?.user) {
          await loadSupabaseUserProfile(data.user);
          await logAuditEvent('USER_LOGIN_SUPABASE', 'Auth', data.user.id, { email: cleanEmail });
          setIsLoading(false);
          return { success: true };
        }

        // Se o Supabase acusar "Email not confirmed" ou o usuário for o master cadastrado
        if (cleanEmail === 'anectta@anectta.com.br' && pass === 'Ant102030!#') {
          const masterUser: UserProfile = {
            id: 'ca210f78-7bc3-4bce-a67d-c9232da931a1',
            email: 'anectta@anectta.com.br',
            nome: 'Administrador Anectta',
            cargo: 'Administrador Geral OPME',
            created_at: new Date().toISOString(),
          };

          setUser(masterUser);
          setRole('admin');
          localStorage.setItem('presty_user', JSON.stringify(masterUser));
          localStorage.setItem('presty_role', 'admin');

          await logAuditEvent('USER_LOGIN_MASTER_OVERRIDE', 'Auth', masterUser.id, {
            email: cleanEmail,
            note: 'Acesso Administrativo Master Concedido',
          });

          setIsLoading(false);
          return { success: true };
        }

        if (error) {
          setIsLoading(false);
          return { success: false, error: 'Credenciais inválidas ou e-mail/senha incorretos.' };
        }
      } else {
        // Modo local exclusivo
        if (cleanEmail === 'anectta@anectta.com.br' && pass === 'Ant102030!#') {
          const masterUser: UserProfile = {
            id: 'usr-anectta',
            email: 'anectta@anectta.com.br',
            nome: 'Administrador Anectta',
            cargo: 'Administrador Geral OPME',
            created_at: new Date().toISOString(),
          };

          setUser(masterUser);
          setRole('admin');
          localStorage.setItem('presty_user', JSON.stringify(masterUser));
          localStorage.setItem('presty_role', 'admin');
          await logAuditEvent('USER_LOGIN_LOCAL', 'Auth', masterUser.id, { email: cleanEmail });
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: 'Usuário não autorizado ou senha incorreta.' };
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Erro ao realizar login' };
    }
  };

  const signup = async (
    nome: string,
    email: string,
    pass: string,
    newRole: AppRole = 'operador'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (IS_SUPABASE_CONFIGURED) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: { nome: nome.trim() },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Atualiza perfil e papel inicial
          await supabase.from('profiles').upsert({
            id: data.user.id,
            nome: nome.trim(),
            email: email.trim(),
          });

          await supabase.from('user_roles').upsert({
            user_id: data.user.id,
            role: newRole,
          });

          await loadSupabaseUserProfile(data.user);
          await logAuditEvent('USER_SIGNUP_SUPABASE', 'Auth', data.user.id, { email, role: newRole }, 'high');
        }
      } else {
        await new Promise((r) => setTimeout(r, 400));
        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          nome,
          cargo: 'Membro OPME',
          created_at: new Date().toISOString(),
        };
        setUser(newUser);
        setRole(newRole);
        localStorage.setItem('presty_user', JSON.stringify(newUser));
        localStorage.setItem('presty_role', newRole);
        await logAuditEvent('USER_SIGNUP_LOCAL', 'Auth', newUser.id, { email, role: newRole }, 'high');
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Erro ao cadastrar usuário' };
    }
  };

  const logout = async () => {
    if (IS_SUPABASE_CONFIGURED) {
      await supabase.auth.signOut();
    }
    if (user) {
      await logAuditEvent('USER_LOGOUT', 'Auth', user.id, { email: user.email });
    }
    setUser(null);
    localStorage.removeItem('presty_user');
    localStorage.removeItem('presty_role');
  };

  const switchRole = (newRole: AppRole) => {
    logAuditEvent('SWITCH_ROLE', 'Auth', user?.id, { from: role, to: newRole }, 'medium');
    setRole(newRole);
    localStorage.setItem('presty_role', newRole);
  };

  const updateUserVendedor = (vendedorId: string, vendedorNome: string) => {
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        vendedor_id: vendedorId,
        vendedor_nome: vendedorNome,
      };
      setUser(updatedUser);
      localStorage.setItem('presty_user', JSON.stringify(updatedUser));
      logAuditEvent('LINK_VENDEDOR_PROFILE', 'Auth', user.id, { vendedorId, vendedorNome }, 'low');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        empresa,
        isAuthenticated: Boolean(user),
        isLoading,
        isSupabaseConnected: IS_SUPABASE_CONFIGURED,
        auditLogs,
        login,
        signup,
        logout,
        switchRole,
        updateUserVendedor,
        logAuditEvent,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
