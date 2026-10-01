import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { VistoriaFotos } from './VistoriaFotos';
import { Veiculo, Condutor, VistoriaPonto } from '../../types';
import { Truck, Users, Camera, ShieldCheck, AlertTriangle, Plus, Search, CheckCircle2, Edit2, Trash2, X, FileSpreadsheet } from 'lucide-react';

export const GestaoFrota: React.FC = () => {
  const { veiculos, condutores, addVeiculo, updateVeiculo, deleteVeiculo, addCondutor, updateCondutor, deleteCondutor } = useData();
  const { logAuditEvent } = useAuth();

  const [activeTab, setActiveTab] = useState<'veiculos' | 'condutores' | 'checklists'>('veiculos');
  const [selectedVeiculoForChecklist, setSelectedVeiculoForChecklist] = useState<Veiculo | null>(null);
  const [checklistsHistory, setChecklistsHistory] = useState<any[]>([]);

  // Vehicle Modal State
  const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [veiculoFormData, setVeiculoFormData] = useState({
    placa: '',
    frota: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    renavam: '',
    chassi: '',
    cor: 'Branco',
    tipo_veiculo: 'Utilitário' as Veiculo['tipo_veiculo'],
    combustivel: 'Flex' as Veiculo['combustivel'],
    km_atual: 0,
    responsavel_nome: '',
    situacao: 'Ativo' as Veiculo['situacao'],
  });

  // Driver Modal State
  const [isCondutorModalOpen, setIsCondutorModalOpen] = useState(false);
  const [editingCondutor, setEditingCondutor] = useState<Condutor | null>(null);
  const [condutorFormData, setCondutorFormData] = useState({
    nome: '',
    cpf: '',
    cnh: '',
    categoria_cnh: 'B',
    validade_cnh: '',
    cargo: 'Motorista OPME',
    departamento: 'Logística',
    status: 'Ativo' as Condutor['status'],
  });

  // Open Vehicle Modal for Create
  const handleOpenNewVeiculo = () => {
    setEditingVeiculo(null);
    setVeiculoFormData({
      placa: `OPM-${Math.floor(1000 + Math.random() * 9000)}`,
      frota: `FROTA-LOG-0${veiculos.length + 1}`,
      marca: 'Fiat',
      modelo: 'Strada Freedom 1.3',
      ano: 2025,
      renavam: '00987654321',
      chassi: '9BD12345678901234',
      cor: 'Branco',
      tipo_veiculo: 'Utilitário',
      combustivel: 'Flex',
      km_atual: 5000,
      responsavel_nome: 'Sérgio Ramos',
      situacao: 'Ativo',
    });
    setIsVeiculoModalOpen(true);
  };

  // Open Vehicle Modal for Edit
  const handleOpenEditVeiculo = (v: Veiculo) => {
    setEditingVeiculo(v);
    setVeiculoFormData({
      placa: v.placa,
      frota: v.frota,
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      renavam: v.renavam || '',
      chassi: v.chassi || '',
      cor: v.cor,
      tipo_veiculo: v.tipo_veiculo,
      combustivel: v.combustivel,
      km_atual: v.km_atual,
      responsavel_nome: v.responsavel_nome,
      situacao: v.situacao,
    });
    setIsVeiculoModalOpen(true);
  };

  // Save Vehicle (Create or Edit)
  const handleVeiculoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVeiculo) {
      updateVeiculo(editingVeiculo.id, veiculoFormData);
      logAuditEvent('UPDATE_VEICULO', 'Frota', editingVeiculo.placa, { modelo: veiculoFormData.modelo });
    } else {
      addVeiculo(veiculoFormData);
      logAuditEvent('CREATE_VEICULO', 'Frota', veiculoFormData.placa, { modelo: veiculoFormData.modelo });
    }
    setIsVeiculoModalOpen(false);
  };

  // Delete Vehicle
  const handleDeleteVeiculo = (v: Veiculo) => {
    if (confirm(`Tem certeza que deseja excluir o veículo placa ${v.placa}?`)) {
      deleteVeiculo(v.id);
      logAuditEvent('DELETE_VEICULO', 'Frota', v.placa, { modelo: v.modelo });
    }
  };

  // Open Driver Modal for Create
  const handleOpenNewCondutor = () => {
    setEditingCondutor(null);
    setCondutorFormData({
      nome: '',
      cpf: '',
      cnh: '',
      categoria_cnh: 'B',
      validade_cnh: '2028-12-31',
      cargo: 'Motorista de Entrega OPME',
      departamento: 'Logística',
      status: 'Ativo',
    });
    setIsCondutorModalOpen(true);
  };

  // Open Driver Modal for Edit
  const handleOpenEditCondutor = (c: Condutor) => {
    setEditingCondutor(c);
    setCondutorFormData({
      nome: c.nome,
      cpf: c.cpf,
      cnh: c.cnh,
      categoria_cnh: c.categoria_cnh,
      validade_cnh: c.validade_cnh,
      cargo: c.cargo,
      departamento: c.departamento,
      status: c.status,
    });
    setIsCondutorModalOpen(true);
  };

  // Save Driver (Create or Edit)
  const handleCondutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCondutor) {
      updateCondutor(editingCondutor.id, condutorFormData);
      logAuditEvent('UPDATE_CONDUTOR', 'Frota', editingCondutor.nome, { cpf: condutorFormData.cpf });
    } else {
      addCondutor(condutorFormData);
      logAuditEvent('CREATE_CONDUTOR', 'Frota', condutorFormData.nome, { cpf: condutorFormData.cpf });
    }
    setIsCondutorModalOpen(false);
  };

  // Delete Driver
  const handleDeleteCondutor = (c: Condutor) => {
    if (confirm(`Tem certeza que deseja excluir o condutor ${c.nome}?`)) {
      deleteCondutor(c.id);
      logAuditEvent('DELETE_CONDUTOR', 'Frota', c.nome, { cpf: c.cpf });
    }
  };

  const handleCompleteVistoria = (pontos: VistoriaPonto[], temAvaria: boolean) => {
    if (!selectedVeiculoForChecklist) return;

    const newRecord = {
      id: `chk-${Date.now()}`,
      veiculo_placa: selectedVeiculoForChecklist.placa,
      condutor_nome: selectedVeiculoForChecklist.responsavel_nome,
      data: new Date().toISOString(),
      tem_avaria: temAvaria,
      pontos_count: pontos.length,
      avarias_count: pontos.filter((p) => p.status === 'avaria').length,
    };

    setChecklistsHistory((prev) => [newRecord, ...prev]);
    logAuditEvent('VISTORIA_FROTA_CONCLUIDA', 'Frota', selectedVeiculoForChecklist.placa, { tem_avaria: temAvaria, avarias: newRecord.avarias_count }, temAvaria ? 'high' : 'low');
    setSelectedVeiculoForChecklist(null);
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20 shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestão de Frota & Vistoria Fotográfica OPME
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Logística de entrega de materiais biológicos e cirúrgicos com checklists fotográficos em 24 pontos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {activeTab === 'condutores' ? (
            <button
              onClick={handleOpenNewCondutor}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Condutor
            </button>
          ) : (
            <button
              onClick={handleOpenNewVeiculo}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Veículo
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">FROTA OPERACIONAL</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{veiculos.length} Veículos</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">100% Em Trânsito / Disponíveis</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">CONDUTORES CREDENCIADOS</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{condutores.length} Motoristas</p>
          <p className="text-[10px] font-bold text-blue-600 mt-0.5">CNH Profissional Regularizada</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TAXA CONFORMIDADE VISTORIAS</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">98.4%</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Vistorias em 24 pontos por saída</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('veiculos')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeTab === 'veiculos' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Veículos ({veiculos.length})
        </button>
        <button
          onClick={() => setActiveTab('condutores')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeTab === 'condutores' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Condutores ({condutores.length})
        </button>
        <button
          onClick={() => setActiveTab('checklists')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeTab === 'checklists' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Histórico de Vistorias ({checklistsHistory.length})
        </button>
      </div>

      {/* Vehicles Grid */}
      {activeTab === 'veiculos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {veiculos.map((v) => (
            <div key={v.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-base font-black text-slate-900 dark:text-white">{v.placa}</span>
                  <p className="text-[10px] text-slate-400 font-bold">{v.frota}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    {v.situacao}
                  </span>
                  <button
                    onClick={() => handleOpenEditVeiculo(v)}
                    title="Editar Veículo"
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVeiculo(v)}
                    title="Excluir Veículo"
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">{v.marca} {v.modelo} ({v.ano})</p>
                <p className="text-slate-500">Cor: {v.cor} • Combustível: {v.combustivel}</p>
                <p className="text-slate-500">KM Atual: <strong className="text-slate-900 dark:text-white font-mono">{v.km_atual.toLocaleString()} km</strong></p>
                <p className="text-slate-500">Responsável: <span className="text-slate-800 dark:text-slate-200 font-bold">{v.responsavel_nome}</span></p>
              </div>

              <button
                onClick={() => setSelectedVeiculoForChecklist(v)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Iniciar Vistoria Fotográfica
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'condutores' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden w-full max-w-full min-w-0">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[10px] uppercase font-extrabold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-4">Nome</th>
                  <th className="p-3.5">CPF</th>
                  <th className="p-3.5">CNH / Categoria</th>
                  <th className="p-3.5">Validade CNH</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {condutores.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 pl-4 font-bold text-slate-900 dark:text-white">{c.nome}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 font-bold">{c.cpf}</td>
                    <td className="p-3.5 text-slate-800 dark:text-slate-200 font-semibold">{c.cnh} ({c.categoria_cnh})</td>
                    <td className="p-3.5 text-slate-500">{c.validade_cnh}</td>
                    <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">{c.status}</td>
                    <td className="p-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditCondutor(c)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar Condutor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCondutor(c)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir Condutor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'checklists' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registro de Vistorias Realizadas</h2>
          {checklistsHistory.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center font-medium">Nenhuma vistoria realizada nesta sessão.</p>
          ) : (
            <div className="space-y-2">
              {checklistsHistory.map((chk) => (
                <div key={chk.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">{chk.veiculo_placa}</span>
                    <p className="text-slate-400">Condutor: {chk.condutor_nome}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${chk.tem_avaria ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {chk.tem_avaria ? `${chk.avarias_count} Avaria(s)` : 'Sem Avarias (100% OK)'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{new Date(chk.data).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guided 24-point Photography Modal */}
      {selectedVeiculoForChecklist && (
        <VistoriaFotos
          veiculoPlaca={selectedVeiculoForChecklist.placa}
          condutorNome={selectedVeiculoForChecklist.responsavel_nome}
          tipo="Saída"
          onComplete={handleCompleteVistoria}
          onCancel={() => setSelectedVeiculoForChecklist(null)}
        />
      )}

      {/* Modal Veículo (Create / Edit) */}
      {isVeiculoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                {editingVeiculo ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
              </h2>
              <button onClick={() => setIsVeiculoModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVeiculoSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Placa</label>
                  <input
                    type="text"
                    value={veiculoFormData.placa}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, placa: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Frota / ID Interno</label>
                  <input
                    type="text"
                    value={veiculoFormData.frota}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, frota: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Marca</label>
                  <input
                    type="text"
                    value={veiculoFormData.marca}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, marca: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Modelo</label>
                  <input
                    type="text"
                    value={veiculoFormData.modelo}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, modelo: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ano</label>
                  <input
                    type="number"
                    value={veiculoFormData.ano}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, ano: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Cor</label>
                  <input
                    type="text"
                    value={veiculoFormData.cor}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, cor: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">KM Atual</label>
                  <input
                    type="number"
                    value={veiculoFormData.km_atual}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, km_atual: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tipo de Veículo</label>
                  <select
                    value={veiculoFormData.tipo_veiculo}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, tipo_veiculo: e.target.value as any })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="Utilitário">Utilitário</option>
                    <option value="Van">Van</option>
                    <option value="Passeio">Passeio</option>
                    <option value="Caminhão">Caminhão</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Combustível</label>
                  <select
                    value={veiculoFormData.combustivel}
                    onChange={(e) => setVeiculoFormData({ ...veiculoFormData, combustivel: e.target.value as any })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="Flex">Flex</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Motorista Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do motorista principal"
                  value={veiculoFormData.responsavel_nome}
                  onChange={(e) => setVeiculoFormData({ ...veiculoFormData, responsavel_nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Situação</label>
                <select
                  value={veiculoFormData.situacao}
                  onChange={(e) => setVeiculoFormData({ ...veiculoFormData, situacao: e.target.value as any })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                  <option value="Avariado">Avariado</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVeiculoModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md font-bold text-xs transition-colors"
                >
                  {editingVeiculo ? 'Atualizar Veículo' : 'Salvar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Condutor (Create / Edit) */}
      {isCondutorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingCondutor ? 'Editar Condutor' : 'Cadastrar Novo Condutor'}
              </h2>
              <button onClick={() => setIsCondutorModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCondutorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  value={condutorFormData.nome}
                  onChange={(e) => setCondutorFormData({ ...condutorFormData, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={condutorFormData.cpf}
                    onChange={(e) => setCondutorFormData({ ...condutorFormData, cpf: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Número da CNH</label>
                  <input
                    type="text"
                    value={condutorFormData.cnh}
                    onChange={(e) => setCondutorFormData({ ...condutorFormData, cnh: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Categoria CNH</label>
                  <select
                    value={condutorFormData.categoria_cnh}
                    onChange={(e) => setCondutorFormData({ ...condutorFormData, categoria_cnh: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Validade CNH</label>
                  <input
                    type="date"
                    value={condutorFormData.validade_cnh}
                    onChange={(e) => setCondutorFormData({ ...condutorFormData, validade_cnh: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Cargo</label>
                  <input
                    type="text"
                    value={condutorFormData.cargo}
                    onChange={(e) => setCondutorFormData({ ...condutorFormData, cargo: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Departamento</label>
                  <input
                    type="text"
                    value={condutorFormData.departamento}
                    onChange={(e) => setCondutorFormData({ ...condutorFormData, departamento: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={condutorFormData.status}
                  onChange={(e) => setCondutorFormData({ ...condutorFormData, status: e.target.value as any })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCondutorModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md font-bold text-xs transition-colors"
                >
                  {editingCondutor ? 'Atualizar Condutor' : 'Salvar Condutor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
