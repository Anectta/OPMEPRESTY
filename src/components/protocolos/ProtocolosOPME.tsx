import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Protocolo, StatusProtocolo, ProtocoloItem } from '../../types';
import { formatBRL, formatDate, getStatusBadge } from '../../lib/utils';
import { FileSpreadsheet, Plus, Search, CheckCircle2, Clock, FileText, AlertTriangle, X, ChevronRight } from 'lucide-react';

export const ProtocolosOPME: React.FC = () => {
  const { protocolos, hospitais, medicos, convenios, vendedores, produtos, addProtocolo } = useData();
  const { logAuditEvent } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProtocolo, setSelectedProtocolo] = useState<Protocolo | null>(null);

  // New Protocol State
  const [formData, setFormData] = useState({
    medico_nome: medicos[0]?.nome || '',
    crm: medicos[0]?.crm || '',
    paciente: '',
    hospital_nome: hospitais[0]?.nome || '',
    convenio_nome: convenios[0]?.nome || '',
    procedimento: 'Artrodese Cervical Anterior',
    data_cirurgia: new Date().toISOString().split('T')[0],
    vendedor_nome: vendedores[0]?.nome || '',
    observacao: '',
  });

  const [itemsList, setItemsList] = useState<Omit<ProtocoloItem, 'id' | 'protocolo_id' | 'valor_total'>[]>([
    { produto_codigo: produtos[0]?.codigo || 'OPME-COL-001', descricao: produtos[0]?.descricao || 'Gaiola Cervical PEEK 12x14mm', quantidade: 2, valor_unitario: produtos[0]?.valor_venda || 8500.00, anvisa: produtos[0]?.anvisa },
  ]);

  const filteredProtocolos = protocolos.filter((p) => {
    const matchesSearch =
      p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medico_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hospital_nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'todos' || p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    setItemsList((prev) => [
      ...prev,
      { produto_codigo: 'OPME-GEN-01', descricao: 'Item de OPME genérico', quantidade: 1, valor_unitario: 1000.00, anvisa: '80123450000' },
    ]);
  };

  const calculateTotal = () => {
    return itemsList.reduce((acc, item) => acc + item.quantidade * item.valor_unitario, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.paciente.trim()) return;

    const totalVal = calculateTotal();

    const newP = await addProtocolo({
      data: new Date().toISOString().split('T')[0],
      medico_nome: formData.medico_nome,
      crm: formData.crm,
      paciente: formData.paciente,
      hospital_nome: formData.hospital_nome,
      convenio_nome: formData.convenio_nome,
      procedimento: formData.procedimento,
      data_cirurgia: formData.data_cirurgia,
      status: 'Em Análise',
      vendedor_nome: formData.vendedor_nome,
      valor_total: totalVal,
      observacao: formData.observacao,
      itens: itemsList.map((it, idx) => ({
        id: `pi-${Date.now()}-${idx}`,
        protocolo_id: 'temp',
        ...it,
        valor_total: it.quantidade * it.valor_unitario,
      })),
    });

    logAuditEvent('CREATE_PROTOCOLO_COTAÇÃO', 'ProtocoloOPME', newP.id, { paciente: formData.paciente, total: totalVal });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Protocolos & Cotações OPME
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Elaboração de cotações para pré-autorização de convênio com recálculo automático de itens.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Cotação OPME
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TOTAL DE COTAÇÕES</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{protocolos.length}</p>
          <p className="text-[10px] font-bold text-blue-600 mt-0.5">Cotações ativas e rascunhos</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">EM ANÁLISE CONVÊNIO</p>
          <p className="text-lg font-black text-amber-600 mt-0.5">
            {protocolos.filter((p) => p.status === 'Em Análise').length}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Tempo médio: 4.2h</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">VALOR TOTAL COTADO</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatBRL(protocolos.reduce((acc, p) => acc + p.valor_total, 0))}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Taxa de aprovação 93.8%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por protocolo, paciente, hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-bold">STATUS:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="Rascunho">Rascunho</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Aprovado Convenio">Aprovado Convênio</option>
            <option value="Recusado">Recusado</option>
            <option value="Entregue">Entregue</option>
          </select>
        </div>
      </div>

      {/* Protocols List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredProtocolos.map((p) => {
          const badge = getStatusBadge(p.status);
          return (
            <div
              key={p.id}
              onClick={() => setSelectedProtocolo(p)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs hover:border-blue-500/50 transition-all cursor-pointer space-y-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 group-hover:underline">
                  {p.numero}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{p.paciente}</p>
                <p className="text-xs text-slate-500 font-medium">{p.procedimento}</p>
              </div>

              <div className="text-xs text-slate-500 space-y-0.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p><strong className="text-slate-800 dark:text-slate-200">Médico:</strong> {p.medico_nome}</p>
                <p><strong className="text-slate-800 dark:text-slate-200">Hospital:</strong> {p.hospital_nome}</p>
                <p><strong className="text-slate-800 dark:text-slate-200">Convênio:</strong> {p.convenio_nome}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Cirurgia: {formatDate(p.data_cirurgia)}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{formatBRL(p.valor_total)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal View Details */}
      {selectedProtocolo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">{selectedProtocolo.numero}</h2>
                <p className="text-xs text-slate-400">Detalhamento de Cotação OPME</p>
              </div>
              <button onClick={() => setSelectedProtocolo(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-400 font-medium">Paciente:</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedProtocolo.paciente}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Médico Cirurgião:</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedProtocolo.medico_nome} ({selectedProtocolo.crm})</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Hospital / Convênio:</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedProtocolo.hospital_nome} • {selectedProtocolo.convenio_nome}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Procedimento:</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedProtocolo.procedimento}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Itens de OPME Solicitados</p>
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] uppercase font-extrabold">
                  <tr>
                    <th className="p-2.5 pl-3">Código</th>
                    <th className="p-2.5">Descrição</th>
                    <th className="p-2.5">Qtd</th>
                    <th className="p-2.5">Valor Un.</th>
                    <th className="p-2.5 text-right pr-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedProtocolo.itens.map((it) => (
                    <tr key={it.id}>
                      <td className="p-2.5 pl-3 font-mono font-bold text-slate-900 dark:text-white">{it.produto_codigo}</td>
                      <td className="p-2.5 text-slate-800 dark:text-slate-200">{it.descricao}</td>
                      <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{it.quantidade}</td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{formatBRL(it.valor_unitario)}</td>
                      <td className="p-2.5 text-right pr-3 font-mono font-black text-slate-900 dark:text-white">{formatBRL(it.valor_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500">Total da Cotação:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatBRL(selectedProtocolo.valor_total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* New Protocol Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Nova Cotação / Protocolo OPME
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Paciente</label>
                  <input
                    type="text"
                    placeholder="Nome do paciente"
                    value={formData.paciente}
                    onChange={(e) => setFormData({ ...formData, paciente: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Procedimento</label>
                  <input
                    type="text"
                    value={formData.procedimento}
                    onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Items Section with Auto Recalculation */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Itens da Cotação (Recálculo Automático)</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    + Adicionar Item
                  </button>
                </div>

                {itemsList.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <input
                      type="text"
                      placeholder="Código"
                      value={item.produto_codigo}
                      onChange={(e) => {
                        const newArr = [...itemsList];
                        newArr[idx].produto_codigo = e.target.value;
                        setItemsList(newArr);
                      }}
                      className="col-span-3 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Descrição"
                      value={item.descricao}
                      onChange={(e) => {
                        const newArr = [...itemsList];
                        newArr[idx].descricao = e.target.value;
                        setItemsList(newArr);
                      }}
                      className="col-span-4 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={item.quantidade}
                      onChange={(e) => {
                        const newArr = [...itemsList];
                        newArr[idx].quantidade = Number(e.target.value);
                        setItemsList(newArr);
                      }}
                      className="col-span-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Valor Unit."
                      value={item.valor_unitario}
                      onChange={(e) => {
                        const newArr = [...itemsList];
                        newArr[idx].valor_unitario = Number(e.target.value);
                        setItemsList(newArr);
                      }}
                      className="col-span-3 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-right"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs">
                <span className="text-slate-700 dark:text-slate-300">Valor Total da Cotação:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatBRL(calculateTotal())}</span>
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
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Gerar Cotação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
