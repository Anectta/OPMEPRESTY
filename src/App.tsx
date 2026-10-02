import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { LoginScreen } from './components/LoginScreen';
import { AppLayout } from './components/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PageSkeleton } from './components/common/PageSkeleton';

// =====================================================================
// Code-splitting V2.0 — módulos conforme Especificação Mestre V2.0
// Removidos: GestaoFrota, RelatoriosPDF (não previstos na V2.0)
// =====================================================================

const MapaCirurgico = React.lazy(() =>
  import('./components/mapa/MapaCirurgico').then((m) => ({ default: m.MapaCirurgico }))
);
const ProtocolosOPME = React.lazy(() =>
  import('./components/protocolos/ProtocolosOPME').then((m) => ({ default: m.ProtocolosOPME }))
);
const AutorizacoesOPME = React.lazy(() =>
  import('./components/autorizacoes/AutorizacoesOPME').then((m) => ({ default: m.AutorizacoesOPME }))
);
const GestaoEstoque = React.lazy(() =>
  import('./components/estoque/GestaoEstoque').then((m) => ({ default: m.GestaoEstoque }))
);
const GestaoEquipamentos = React.lazy(() =>
  import('./components/equipamentos/GestaoEquipamentos').then((m) => ({ default: m.GestaoEquipamentos }))
);
const TorreControle = React.lazy(() =>
  import('./components/torre/TorreControle').then((m) => ({ default: m.TorreControle }))
);
const CadastrosAuxiliares = React.lazy(() =>
  import('./components/cadastros/CadastrosAuxiliares').then((m) => ({ default: m.CadastrosAuxiliares }))
);
const GestaoUsuarios = React.lazy(() =>
  import('./components/admin/GestaoUsuarios').then((m) => ({ default: m.GestaoUsuarios }))
);
const AuditLogsView = React.lazy(() =>
  import('./components/admin/AuditLogsView').then((m) => ({ default: m.AuditLogsView }))
);
const ConfiguracoesSistema = React.lazy(() =>
  import('./components/admin/ConfiguracoesSistema').then((m) => ({ default: m.ConfiguracoesSistema }))
);

// =====================================================================
// App Principal
// =====================================================================
const MainApp: React.FC = () => {
  const { isAuthenticated, logAuditEvent, user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('mapa');

  // Registro de Auditoria: Toda navegação/acesso no sistema gera log
  useEffect(() => {
    if (isAuthenticated) {
      const labels: Record<string, string> = {
        torre: 'Torre de Controle',
        mapa: 'Mapa Cirúrgico',
        protocolos: 'Protocolo OPME',
        autorizacoes: 'Autorizações OPME',
        estoque: 'Gestão de Estoque',
        equipamentos: 'Gestão de Equipamentos',
        cadastros: 'Cadastros Auxiliares',
        usuarios: 'Gestão de Usuários',
        auditoria: 'Trilha de Auditoria',
        configuracoes: 'Configurações do Sistema',
      };

      logAuditEvent(
        'ACESSO_MODULO',
        'Navegação',
        labels[activeTab] || activeTab,
        {
          modulo: activeTab,
          tela: labels[activeTab] || activeTab,
          usuario: user?.nome,
          email: user?.email,
          papel: role,
        },
        'low'
      );
    }
  }, [activeTab, isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Suspense fallback={<PageSkeleton />}>
        {/* Módulos V2.0 — Especificação Mestre */}
        {activeTab === 'torre' && <TorreControle />}
        {activeTab === 'mapa' && <MapaCirurgico />}
        {activeTab === 'protocolos' && <ProtocolosOPME />}
        {activeTab === 'autorizacoes' && <AutorizacoesOPME />}
        {activeTab === 'estoque' && <GestaoEstoque />}
        {activeTab === 'equipamentos' && <GestaoEquipamentos />}
        {activeTab === 'cadastros' && <CadastrosAuxiliares />}

        {/* Módulos Administrativos — Protegidos por RBAC */}
        {activeTab === 'usuarios' && (
          <ProtectedRoute
            allowedRoles={['admin']}
            routeName="Gestão de Usuários e Permissões"
            onRedirectToDashboard={() => setActiveTab('mapa')}
          >
            <GestaoUsuarios />
          </ProtectedRoute>
        )}

        {activeTab === 'auditoria' && (
          <ProtectedRoute
            allowedRoles={['admin', 'auditor']}
            routeName="Trilha de Auditoria e Logs"
            onRedirectToDashboard={() => setActiveTab('mapa')}
          >
            <AuditLogsView />
          </ProtectedRoute>
        )}

        {activeTab === 'configuracoes' && (
          <ProtectedRoute
            allowedRoles={['admin', 'gestor']}
            routeName="Configurações do Sistema"
            onRedirectToDashboard={() => setActiveTab('mapa')}
          >
            <ConfiguracoesSistema />
          </ProtectedRoute>
        )}
      </Suspense>
    </AppLayout>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
