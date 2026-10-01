import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Produto } from '../../types';
import { formatBRL, formatDate } from '../../lib/utils';
import { Package, Search, Plus, AlertCircle, ShieldCheck, Tag, Layers, RefreshCw, Layers3, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const GestaoEstoque: React.FC = () => {
  const { produtos, addProduto } = useData();
  const { logAuditEvent } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'produtos' | 'lotes' | 'movimentos' | 'rastreabilidade'>('produtos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Product Form
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    fabricante: 'Medtronic Spine',
    anvisa: '80123450099',
    grupo: 'Coluna Vertebral',
    subgrupo: 'Fixadores Pediculares',
    unidade: 'UN',
    valor_custo: 2500.00,
    valor_venda: 6800.00,
    controla_serie: true,
    is_kit: false,
    saldo_total: 10,
    ativo: true,
  });

  const filteredProdutos = produtos.filter(
    (p) =>
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.anvisa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fabricante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.descricao) return;

    const newP = addProduto(formData);
    logAuditEvent('CREATE_PRODUTO_OPME', 'Estoque', newP.id, { codigo: formData.codigo, anvisa: formData.anvisa });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-md shadow-violet-500/20 shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestão de Estoque & Lotes OPME
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Rastreabilidade total de produtos cirúrgicos por lote, número de série, validade ANVISA e kits consignados.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Produto OPME
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">PRODUTOS CADASTRADOS</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{produtos.length}</p>
          <p className="text-[10px] font-bold text-blue-600 mt-0.5">Catálogo Geral OPME</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">VALOR EM ESTOQUE (CUSTO)</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {formatBRL(produtos.reduce((acc, p) => acc + (p.valor_custo * p.saldo_total), 0))}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Auditoria física mensal</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">VALOR POTENCIAL VENDA</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatBRL(produtos.reduce((acc, p) => acc + (p.valor_venda * p.saldo_total), 0))}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Margem Média 62%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">REGISTROS ANVISA</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">100%</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Vigência Válida</p>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('produtos')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeSubTab === 'produtos'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Catálogo & Saldos ({produtos.length})
        </button>
        <button
          onClick={() => setActiveSubTab('lotes')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeSubTab === 'lotes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Lotes & Validades ANVISA
        </button>
        <button
          onClick={() => setActiveSubTab('movimentos')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeSubTab === 'movimentos'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Movimentações & Baixas
        </button>
        <button
          onClick={() => setActiveSubTab('rastreabilidade')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeSubTab === 'rastreabilidade'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Rastreabilidade por Paciente
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, descrição, registro ANVISA ou fabricante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse min-w-[700px] text-[11px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                <th className="p-2.5 pl-3.5">Código / Registro ANVISA</th>
                <th className="p-2.5">Descrição do Produto</th>
                <th className="p-2.5">Fabricante / Grupo</th>
                <th className="p-2.5">Valor Custo</th>
                <th className="p-2.5">Valor Venda</th>
                <th className="p-2.5">Saldo em Estoque</th>
                <th className="p-2.5 text-right pr-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {filteredProdutos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-2.5 pl-3.5 font-mono">
                    <span className="font-extrabold text-slate-900 dark:text-white">{p.codigo}</span>
                    <p className="text-[9px] text-slate-400 font-bold">ANVISA: {p.anvisa}</p>
                  </td>

                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                    {p.descricao}
                    {p.controla_serie && (
                      <span className="ml-2 text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        Série Obrigatória
                      </span>
                    )}
                  </td>

                  <td className="p-2.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{p.fabricante}</p>
                    <p className="text-[9px] text-slate-400 font-medium">{p.grupo}</p>
                  </td>

                  <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300 font-bold">{formatBRL(p.valor_custo)}</td>
                  <td className="p-2.5 font-mono font-black text-slate-900 dark:text-white">{formatBRL(p.valor_venda)}</td>

                  <td className="p-2.5">
                    <span className="font-black text-slate-900 dark:text-white">{p.saldo_total} {p.unidade}</span>
                  </td>

                  <td className="p-2.5 text-right pr-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Cadastrar Novo Produto OPME
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Código Interno</label>
                  <input
                    type="text"
                    placeholder="Ex: OPME-COL-088"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Registro ANVISA</label>
                  <input
                    type="text"
                    placeholder="80123450000"
                    value={formData.anvisa}
                    onChange={(e) => setFormData({ ...formData, anvisa: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Descrição Comercial</label>
                <input
                  type="text"
                  placeholder="Nome do dispositivo/prótese/material"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Valor Custo (R$)</label>
                  <input
                    type="number"
                    value={formData.valor_custo}
                    onChange={(e) => setFormData({ ...formData, valor_custo: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Valor Venda (R$)</label>
                  <input
                    type="number"
                    value={formData.valor_venda}
                    onChange={(e) => setFormData({ ...formData, valor_venda: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-black focus:outline-none"
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
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md font-bold text-xs transition-colors"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
