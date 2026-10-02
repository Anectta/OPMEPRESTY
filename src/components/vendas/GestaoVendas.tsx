import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Venda, StatusVenda } from '../../types';
import { formatBRL, formatDate, getStatusBadge } from '../../lib/utils';
import {
  TrendingUp,
  DollarSign,
  Target,
  Award,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  FileText,
  Printer,
  Edit2,
  Trash2,
  X,
  Building2,
  User,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const GestaoVendas: React.FC = () => {
  const { vendas, cirurgias, hospitais, vendedores, convenios, addVenda, updateVenda, deleteVenda } = useData();
  const { logAuditEvent } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    cirurgia_id: '',
    numero: `VDA-2026-0${vendas.length + 20}`,
    nota_fiscal: `NF-${Math.floor(10000 + Math.random() * 90000)}`,
    data: new Date().toISOString().split('T')[0],
    cliente_hospital: '',
    cliente_codigo: 'CLI-0012',
    convenio_nome: '',
    medico_nome: '',
    crm: '',
    paciente: '',
    procedimento: '',
    vendedor_nome: '',
    status: 'Consumo Registrado' as StatusVenda,
    valor_total: 45000.0,
    valor_consumido: 45000.0,
    valor_devolvido: 0.0,
    margem_pct: 62.5,
  });

  const filteredVendas = vendas.filter(
    (v) =>
      v.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vendedor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cliente_hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFaturado = vendas.reduce((acc, v) => acc + v.valor_consumido, 0);
  const comissaoEstimada = totalFaturado * 0.055; // 5.5% média

  const handleSelectCirurgia = (cirId: string) => {
    const cir = cirurgias.find((c) => c.id === cirId);
    if (!cir) return;

    setFormData((prev) => ({
      ...prev,
      cirurgia_id: cir.id,
      cliente_hospital: cir.hospital_nome,
      convenio_nome: cir.convenio_nome,
      medico_nome: cir.medico_nome,
      paciente: cir.paciente,
      procedimento: cir.material_previsto || 'Procedimento OPME',
      vendedor_nome: cir.vendedor_nome,
    }));
  };

  const handleSubmitVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente_hospital || !formData.paciente) return;

    const created = await addVenda({
      numero: formData.numero,
      nota_fiscal: formData.nota_fiscal,
      data: formData.data,
      cliente_hospital: formData.cliente_hospital,
      cliente_codigo: formData.cliente_codigo,
      convenio_nome: formData.convenio_nome,
      medico_nome: formData.medico_nome,
      crm: formData.crm,
      paciente: formData.paciente,
      procedimento: formData.procedimento,
      vendedor_nome: formData.vendedor_nome,
      status: formData.status,
      valor_total: Number(formData.valor_total),
      valor_consumido: Number(formData.valor_consumido),
      valor_devolvido: Number(formData.valor_devolvido),
      margem_pct: Number(formData.margem_pct),
    });

    logAuditEvent('CREATE_VENDA_FATURAMENTO', 'Vendas', created.id, {
      numero: created.numero,
      hospital: created.cliente_hospital,
      consumido: created.valor_consumido,
    });

    setIsModalOpen(false);
  };

  const handleUpdateStatus = async (newStatus: StatusVenda) => {
    if (!selectedVenda) return;
    await updateVenda(selectedVenda.id, { status: newStatus });
    setSelectedVenda((prev) => (prev ? { ...prev, status: newStatus } : null));
    logAuditEvent('UPDATE_STATUS_VENDA', 'Vendas', selectedVenda.id, { status: newStatus });
  };

  const handleDelete = async (venda: Venda) => {
    if (confirm(`Tem certeza que deseja excluir a venda ${venda.numero}?`)) {
      await deleteVenda(venda.id);
      logAuditEvent('DELETE_VENDA', 'Vendas', venda.id, { numero: venda.numero });
      setSelectedVenda(null);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestão de Vendas & Faturamento OPME
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Pedidos faturados, apuração de consumo x devolução, emissão de NF-e e apuração de comissões de representantes.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({
              cirurgia_id: '',
              numero: `VDA-2026-0${vendas.length + 20}`,
              nota_fiscal: `NF-${Math.floor(10000 + Math.random() * 90000)}`,
              data: new Date().toISOString().split('T')[0],
              cliente_hospital: hospitais[0]?.nome || 'Hospital Israelita Albert Einstein',
              cliente_codigo: 'CLI-0012',
              convenio_nome: convenios[0]?.nome || 'Bradesco Saúde',
              medico_nome: 'Dr. Roberto Silva Mendes',
              crm: '145892/SP',
              paciente: '',
              procedimento: 'Artrodese da Coluna',
              vendedor_nome: vendedores[0]?.nome || 'Lucas Guimarães',
              status: 'Consumo Registrado',
              valor_total: 48500.0,
              valor_consumido: 48500.0,
              valor_devolvido: 0.0,
              margem_pct: 61.5,
            });
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Faturar Cirurgia / Nova Venda
        </button>
      </div>

      {/* Sales KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Faturamento Consumido</span>
          <p className="text-lg font-black text-slate-900 dark:text-white">{formatBRL(totalFaturado)}</p>
          <p className="text-[10px] font-bold text-emerald-600">Margem Líquida Média: 61.2%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Comissões a Pagar</span>
          <p className="text-lg font-black text-slate-900 dark:text-white">{formatBRL(comissaoEstimada)}</p>
          <p className="text-[10px] font-bold text-blue-600">Representantes Ativos ({vendedores.length})</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total de Pedidos</span>
          <p className="text-lg font-black text-slate-900 dark:text-white">{vendas.length}</p>
          <p className="text-[10px] font-bold text-slate-400">100% Auditados Financeiramente</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por pedido, cliente hospital, vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse min-w-[700px] text-[11px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                <th className="p-2.5 pl-3.5">Nº Pedido / Data</th>
                <th className="p-2.5">Hospital / Cliente</th>
                <th className="p-2.5">Médico / Paciente</th>
                <th className="p-2.5">Vendedor</th>
                <th className="p-2.5">Valor Consumido</th>
                <th className="p-2.5 text-right pr-3.5">Status & Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {filteredVendas.map((v) => {
                const badge = getStatusBadge(v.status);
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVenda(v)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="p-2.5 pl-3.5 font-mono">
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 group-hover:underline">{v.numero}</span>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {formatDate(v.data)} {v.nota_fiscal && `• ${v.nota_fiscal}`}
                      </p>
                    </td>

                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                      {v.cliente_hospital}
                      <p className="text-[9px] text-slate-400 font-medium">{v.convenio_nome}</p>
                    </td>

                    <td className="p-2.5">
                      <p className="font-bold text-slate-900 dark:text-white">{v.paciente}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{v.medico_nome}</p>
                    </td>

                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{v.vendedor_nome}</td>

                    <td className="p-2.5 font-mono font-black text-slate-900 dark:text-white">
                      {formatBRL(v.valor_consumido)}
                      <p className="text-[9px] text-emerald-600 font-sans font-bold">Margem: {v.margem_pct}%</p>
                    </td>

                    <td className="p-2.5 text-right pr-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Faturamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Faturar Cirurgia / Novo Pedido de Venda
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVenda} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Vincular a Cirurgia do Mapa (Opcional)</label>
                <select
                  value={formData.cirurgia_id}
                  onChange={(e) => handleSelectCirurgia(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                >
                  <option value="">Selecione uma cirurgia para auto-preenchimento...</option>
                  {cirurgias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatDate(c.data)} • {c.paciente} ({c.hospital_nome}) - {c.situacao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Número do Pedido</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nota Fiscal (NF-e)</label>
                  <input
                    type="text"
                    value={formData.nota_fiscal}
                    onChange={(e) => setFormData({ ...formData, nota_fiscal: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Hospital / Cliente</label>
                  <input
                    type="text"
                    value={formData.cliente_hospital}
                    onChange={(e) => setFormData({ ...formData, cliente_hospital: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Convênio / Operadora</label>
                  <input
                    type="text"
                    value={formData.convenio_nome}
                    onChange={(e) => setFormData({ ...formData, convenio_nome: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Paciente</label>
                  <input
                    type="text"
                    value={formData.paciente}
                    onChange={(e) => setFormData({ ...formData, paciente: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Cirurgião Responsável</label>
                  <input
                    type="text"
                    value={formData.medico_nome}
                    onChange={(e) => setFormData({ ...formData, medico_nome: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Valor Consumido (R$)</label>
                  <input
                    type="number"
                    value={formData.valor_consumido}
                    onChange={(e) => setFormData({ ...formData, valor_consumido: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-black focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Valor Devolvido (R$)</label>
                  <input
                    type="number"
                    value={formData.valor_devolvido}
                    onChange={(e) => setFormData({ ...formData, valor_devolvido: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Margem (%)</label>
                  <input
                    type="number"
                    value={formData.margem_pct}
                    onChange={(e) => setFormData({ ...formData, margem_pct: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-md font-bold text-xs transition-colors"
                >
                  Confirmar Faturamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Venda / Espelho da Fatura */}
      {selectedVenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono font-black text-sm text-blue-600">{selectedVenda.numero}</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Espelho de Faturamento & Consumo Hospitalar
                  </h3>
                </div>
              </div>
              <button onClick={() => setSelectedVenda(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações da Fatura */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400">Data do Pedido</span>
                <p className="font-bold text-xs mt-0.5">{formatDate(selectedVenda.data)}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400">Nota Fiscal</span>
                <p className="font-mono font-black text-xs mt-0.5">{selectedVenda.nota_fiscal || 'A emitir'}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400">Valor Consumido</span>
                <p className="font-mono font-black text-emerald-600 text-xs mt-0.5">
                  {formatBRL(selectedVenda.valor_consumido)}
                </p>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400">Margem Contribuição</span>
                <p className="font-bold text-xs mt-0.5 text-blue-600">{selectedVenda.margem_pct}%</p>
              </div>
            </div>

            {/* Detalhes Médicos & Cirúrgicos */}
            <div className="space-y-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-medium">Hospital Comprador:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedVenda.cliente_hospital}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Convênio Pagador:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedVenda.convenio_nome}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-medium">Paciente / Beneficiário:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedVenda.paciente}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Médico Cirurgião / CRM:</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedVenda.medico_nome} ({selectedVenda.crm || 'CRM Ativo'})
                  </p>
                </div>
              </div>
            </div>

            {/* Mudança de Status */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold">Status do Faturamento:</span>
              <div className="flex gap-1.5">
                {(['Pedido Criado', 'Consumo Registrado', 'Faturado'] as StatusVenda[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                      selectedVenda.status === st
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações do Rodapé */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDelete(selectedVenda)}
                className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Venda
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Espelho
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVenda(null)}
                  className="px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
