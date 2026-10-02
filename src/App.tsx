import React, { useState, Suspense } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { LoginScreen } from './components/LoginScreen';
import { AppLayout } from './components/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PageSkeleton } from './components/common/PageSkeleton';

// Code-splitting com React.lazy para máxima performance
const ExecutiveDashboard = React.lazy(() =>
  import('./components/dashboard/ExecutiveDashboard').then((m) => ({ default: m.ExecutiveDashboard }))
);
const MapaCirurgico = React.lazy(() =>
  import('./components/mapa/MapaCirurgico').then((m) => ({ default: m.MapaCirurgico }))
);
const ProtocolosOPME = React.lazy(() =>
  import('./components/protocolos/ProtocolosOPME').then((m) => ({ default: m.ProtocolosOPME }))
);
const GestaoEstoque = React.lazy(() =>
  import('./components/estoque/GestaoEstoque').then((m) => ({ default: m.GestaoEstoque }))
);
const GestaoFrota = React.lazy(() =>
  import('./components/frota/GestaoFrota').then((m) => ({ default: m.GestaoFrota }))
);
const CadastrosAuxiliares = React.lazy(() =>
  import('./components/cadastros/CadastrosAuxiliares').then((m) => ({ default: m.CadastrosAuxiliares }))
);
const RelatoriosPDF = React.lazy(() =>
  import('./components/relatorios/RelatoriosPDF').then((m) => ({ default: m.RelatoriosPDF }))
);
const GestaoUsuarios = React.lazy(() =>
  import('./components/admin/GestaoUsuarios').then((m) => ({ default: m.GestaoUsuarios }))
);
const AuditLogsView = React.lazy(() =>
  import('./components/admin/AuditLogsView').then((m) => ({ default: m.AuditLogsView }))
);

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Suspense fallback={<PageSkeleton />}>
        {activeTab === 'dashboard' && <ExecutiveDashboard setActiveTab={setActiveTab} />}
        {activeTab === 'mapa' && <MapaCirurgico />}
        {activeTab === 'protocolos' && <ProtocolosOPME />}
        {activeTab === 'estoque' && <GestaoEstoque />}
        {activeTab === 'frota' && <GestaoFrota />}
        {activeTab === 'cadastros' && <CadastrosAuxiliares />}
        {activeTab === 'relatorios' && <RelatoriosPDF />}

        {/* Rotas Administrativas Blindadas com RBAC */}
        {activeTab === 'usuarios' && (
          <ProtectedRoute
            allowedRoles={['admin']}
            routeName="Gestão de Usuários e Perfis"
            onRedirectToDashboard={() => setActiveTab('dashboard')}
          >
            <GestaoUsuarios />
          </ProtectedRoute>
        )}

        {activeTab === 'auditoria' && (
          <ProtectedRoute
            allowedRoles={['admin']}
            routeName="Trilha de Auditoria e Logs de Segurança"
            onRedirectToDashboard={() => setActiveTab('dashboard')}
          >
            <AuditLogsView />
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
