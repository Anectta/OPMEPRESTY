import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { LoginScreen } from './components/LoginScreen';
import { AppLayout } from './components/AppLayout';

import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { MapaCirurgico } from './components/mapa/MapaCirurgico';
import { MapaCalorOperacional } from './components/mapa/MapaCalorOperacional';
import { ProtocolosOPME } from './components/protocolos/ProtocolosOPME';
import { GestaoEstoque } from './components/estoque/GestaoEstoque';
import { GestaoVendas } from './components/vendas/GestaoVendas';
import { GestaoFrota } from './components/frota/GestaoFrota';
import { CadastrosAuxiliares } from './components/cadastros/CadastrosAuxiliares';
import { RelatoriosPDF } from './components/relatorios/RelatoriosPDF';
import { GestaoUsuarios } from './components/admin/GestaoUsuarios';
import { AuditLogsView } from './components/admin/AuditLogsView';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <ExecutiveDashboard setActiveTab={setActiveTab} />}
      {activeTab === 'mapa' && <MapaCirurgico />}
      {activeTab === 'mapa_calor' && <MapaCalorOperacional />}
      {activeTab === 'protocolos' && <ProtocolosOPME />}
      {activeTab === 'estoque' && <GestaoEstoque />}
      {activeTab === 'vendas' && <GestaoVendas />}
      {activeTab === 'frota' && <GestaoFrota />}
      {activeTab === 'cadastros' && <CadastrosAuxiliares />}
      {activeTab === 'relatorios' && <RelatoriosPDF />}
      {activeTab === 'usuarios' && <GestaoUsuarios />}
      {activeTab === 'auditoria' && <AuditLogsView />}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
