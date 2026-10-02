import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AppRole } from '../../types';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  routeName: string;
  onRedirectToDashboard?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  routeName,
  onRedirectToDashboard,
}) => {
  const { role, user, logAuditEvent } = useAuth();

  const isAllowed = allowedRoles.includes(role);

  useEffect(() => {
    if (!isAllowed) {
      logAuditEvent(
        'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT',
        'RBAC_RouteGuard',
        routeName,
        {
          userEmail: user?.email,
          currentRole: role,
          requiredRoles: allowedRoles,
        },
        'high'
      );
    }
  }, [isAllowed, role, user?.email, routeName, allowedRoles, logAuditEvent]);

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/80 rounded-3xl p-8 max-w-md w-full text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-md shadow-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
              Acesso Restrito (RBAC)
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
              Permissão Insuficiente
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              O módulo <strong>"{routeName}"</strong> exige privilégios de{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {allowedRoles.join(', ')}
              </span>
              . Seu perfil atual é <strong>{role}</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            Esta tentativa foi registrada na trilha imutável de auditoria de segurança da plataforma.
          </div>

          {onRedirectToDashboard && (
            <button
              onClick={onRedirectToDashboard}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retornar ao Painel Principal
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
