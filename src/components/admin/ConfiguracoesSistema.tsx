import React, { useState } from 'react';
import { Settings, Building2, Sliders, Layers, Save, CheckCircle2, Database, AlertTriangle, Trash2, FileSpreadsheet } from 'lucide-react';
import { useData } from '../../hooks/useData';

type ConfigTab = 'empresa' | 'parametros' | 'modulos' | 'dados';

const MODULOS_SISTEMA = [
  { id: 'mapa', nome: 'Mapa Cirúrgico', descricao: 'Calendário e gestão das cirurgias' },
  { id: 'protocolo_opme', nome: 'Protocolo OPME', descricao: 'Registro e controle de protocolos' },
  { id: 'autorizacao', nome: 'Autorizações', descricao: 'Gestão do processo de autorização do convênio' },
  { id: 'estoque', nome: 'Estoque', descricao: 'Controle operacional de materiais e lotes' },
  { id: 'equipamentos', nome: 'Equipamentos', descricao: 'Controle individual por patrimônio/série' },
  { id: 'cadastros', nome: 'Cadastros', descricao: 'Hospitais, médicos, produtos e demais registros' },
  { id: 'auditoria', nome: 'Auditoria', descricao: 'Trilha de auditoria e logs do sistema' },
  { id: 'usuarios', nome: 'Usuários', descricao: 'Gestão de usuários e permissões' },
];

const PARAMETROS_DEFAULT = [
  { chave: 'protocolo_prefixo', label: 'Prefixo dos Protocolos', valor: 'PROT', tipo: 'text' },
  { chave: 'os_prefixo', label: 'Prefixo das Ordens de Serviço', valor: 'OS', tipo: 'text' },
  { chave: 'dias_alerta_validade', label: 'Dias de Antecedência para Alerta de Validade', valor: '30', tipo: 'number' },
  { chave: 'notificacoes_ativas', label: 'Notificações Ativas', valor: 'true', tipo: 'boolean' },
];

export const ConfiguracoesSistema: React.FC = () => {
  const { zerarBancoDados, importarDadosExcel } = useData();
  const [activeTab, setActiveTab] = useState<ConfigTab>('empresa');
  const [saved, setSaved] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [modulosAtivos, setModulosAtivos] = useState<Record<string, boolean>>(
    Object.fromEntries(MODULOS_SISTEMA.map(m => [m.id, true]))
  );
  const [parametros, setParametros] = useState(PARAMETROS_DEFAULT);
  const [empresaForm, setEmpresaForm] = useState({
    razao_social: 'Presty Medick Distribuidora de OPME Ltda.',
    nome_fantasia: 'Presty Medick OPME',
    cnpj: '12.345.678/0001-90',
    telefone: '(11) 3200-4000',
    email: 'atendimento@prestymedick.com.br',
    endereco: 'Av. Paulista, 1500 - Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: Array<{ id: ConfigTab; label: string; icon: React.ReactNode }> = [
    { id: 'empresa', label: 'Empresa', icon: <Building2 className="w-4 h-4" /> },
    { id: 'parametros', label: 'Parâmetros', icon: <Sliders className="w-4 h-4" /> },
    { id: 'modulos', label: 'Módulos', icon: <Layers className="w-4 h-4" /> },
    { id: 'dados', label: 'Banco de Dados', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-100 rounded-xl">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-sm text-gray-500 mt-0.5">Parâmetros operacionais e configurações institucionais</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm ${
            saved ? 'bg-emerald-600 text-white' : 'bg-gray-900 hover:bg-gray-700 text-white'
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Empresa */}
        {activeTab === 'empresa' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-900">Dados da Empresa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Razão Social</label>
                <input
                  type="text"
                  value={empresaForm.razao_social}
                  onChange={e => setEmpresaForm(p => ({ ...p, razao_social: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={empresaForm.nome_fantasia}
                  onChange={e => setEmpresaForm(p => ({ ...p, nome_fantasia: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={empresaForm.cnpj}
                  onChange={e => setEmpresaForm(p => ({ ...p, cnpj: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={empresaForm.telefone}
                  onChange={e => setEmpresaForm(p => ({ ...p, telefone: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={empresaForm.email}
                  onChange={e => setEmpresaForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={empresaForm.endereco}
                  onChange={e => setEmpresaForm(p => ({ ...p, endereco: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={empresaForm.cidade}
                  onChange={e => setEmpresaForm(p => ({ ...p, cidade: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estado</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={empresaForm.estado}
                    onChange={e => setEmpresaForm(p => ({ ...p, estado: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">CEP</label>
                  <input
                    type="text"
                    value={empresaForm.cep}
                    onChange={e => setEmpresaForm(p => ({ ...p, cep: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parâmetros */}
        {activeTab === 'parametros' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-900">Parâmetros Operacionais</h2>
            <div className="space-y-4">
              {parametros.map((param, idx) => (
                <div key={param.chave} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{param.label}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{param.chave}</p>
                  </div>
                  {param.tipo === 'boolean' ? (
                    <button
                      onClick={() => setParametros(prev => prev.map((p, i) => i === idx ? { ...p, valor: p.valor === 'true' ? 'false' : 'true' } : p))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${param.valor === 'true' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${param.valor === 'true' ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  ) : (
                    <input
                      type={param.tipo}
                      value={param.valor}
                      onChange={e => setParametros(prev => prev.map((p, i) => i === idx ? { ...p, valor: e.target.value } : p))}
                      className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Módulos */}
        {activeTab === 'modulos' && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Módulos do Sistema</h2>
                <p className="text-sm text-gray-500 mt-0.5">Habilitar ou desabilitar módulos conforme a necessidade operacional</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {MODULOS_SISTEMA.map(modulo => (
                <div key={modulo.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{modulo.nome}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{modulo.descricao}</p>
                  </div>
                  <button
                    onClick={() => setModulosAtivos(prev => ({ ...prev, [modulo.id]: !prev[modulo.id] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${modulosAtivos[modulo.id] ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${modulosAtivos[modulo.id] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banco de Dados / Limpeza */}
        {activeTab === 'dados' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Gerenciamento da Base de Dados</h2>
              <p className="text-sm text-gray-500 mt-0.5">Operações de manutenção e reinicialização de dados</p>
            </div>

            {/* Card Importação Excel */}
            <div className="p-5 border border-blue-200 bg-blue-50/50 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-blue-900">Importar / Restaurar Dados da Planilha Excel</h3>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Carrega e importa a base oficial de dados do arquivo Excel fornecido com 105 Produtos, 12 Procedimentos, 11 Vendedores, 283 Hospitais, 112 Convênios, 416 Médicos, 1.665 Pacientes, 1.756 Protocolos OPME e 388 Cirurgias para as tabelas correspondentes.
                  </p>
                </div>
              </div>

              {importSuccess ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Base de dados da planilha Excel importada com sucesso para todas as tabelas!
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      importarDadosExcel();
                      setImportSuccess(true);
                      setTimeout(() => setImportSuccess(false), 5000);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Importar Dados da Planilha Excel
                  </button>
                </div>
              )}
            </div>

            {/* Card Zerar Banco */}
            <div className="p-5 border border-red-200 bg-red-50/50 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-red-900">Zerar e Limpar Todas as Informações</h3>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    Esta ação limpa completamente todas as tabelas em memória e armazenamento local (cirurgias, protocolos, estoque, movimentações, pacientes, hospitais, médicos, convênios e produtos), iniciando o sistema com as listas 100% vazias.
                  </p>
                </div>
              </div>

              {resetSuccess ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Todas as informações do banco de dados foram zeradas com sucesso!
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (window.confirm('ATENÇÃO: Confirma que deseja zerar todas as informações do banco de dados? Todos os registros serão apagados.')) {
                        zerarBancoDados();
                        setResetSuccess(true);
                        setTimeout(() => setResetSuccess(false), 5000);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Zerar Informações do Banco de Dados
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
