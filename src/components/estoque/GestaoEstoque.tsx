import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import type { Produto } from '../../types';
import {
  Package,
  Search,
  Plus,
  CheckCircle2,
  Building2,
  Tag,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const GestaoEstoque: React.FC = () => {
  const { produtos, addProduto } = useData();
  const { logAuditEvent } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  // Formulário de Cadastro de Produto — apenas dados cadastrais operacionais, sem saldo ou campos financeiros
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    fabricante: '',
    anvisa: '',
    categoria: 'Materiais Cirúrgicos',
    unidade: 'UN',
    controla_lote: true,
    controla_validade: true,
    controla_serie: false,
    ativo: true,
  });

  const filteredProdutos = produtos.filter(
    (p) =>
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.anvisa && p.anvisa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.fabricante && p.fabricante.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (p?: Produto) => {
    if (p) {
      setEditingProduto(p);
      setFormData({
        codigo: p.codigo,
        descricao: p.descricao,
        fabricante: p.fabricante || '',
        anvisa: p.anvisa || '',
        categoria: p.categoria || p.grupo || 'Materiais Cirúrgicos',
        unidade: p.unidade || 'UN',
        controla_lote: p.controla_lote ?? true,
        controla_validade: p.controla_validade ?? true,
        controla_serie: p.controla_serie ?? false,
        ativo: p.ativo ?? true,
      });
    } else {
      setEditingProduto(null);
      setFormData({
        codigo: '',
        descricao: '',
        fabricante: '',
        anvisa: '',
        categoria: 'Materiais Cirúrgicos',
        unidade: 'UN',
        controla_lote: true,
        controla_validade: true,
        controla_serie: false,
        ativo: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmitProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo.trim() || !formData.descricao.trim()) {
      alert('Código e Descrição são obrigatórios.');
      return;
    }

    await addProduto({
      codigo: formData.codigo.trim(),
      descricao: formData.descricao.trim(),
      fabricante: formData.fabricante.trim() || undefined,
      anvisa: formData.anvisa.trim() || undefined,
      categoria: formData.categoria,
      unidade: formData.unidade || 'UN',
      controla_lote: formData.controla_lote,
      controla_validade: formData.controla_validade,
      controla_serie: formData.controla_serie,
      ativo: formData.ativo,
    });

    logAuditEvent('CREATE_PRODUTO_OPME', 'Estoque', formData.codigo, {
      descricao: formData.descricao,
      anvisa: formData.anvisa,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-md shadow-violet-500/20 shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Cadastro de Produtos e Materiais OPME
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Catálogo de materiais cirúrgicos. O controle de quantidades e reservas é vinculado diretamente ao Protocolo OPME.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => handleOpenModal()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Produto OPME
          </button>
        </div>
      </div>

      {/* Informativo Operacional V2.0 */}
      <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
        <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Regra Operacional do Sistema:</span> A demanda e a quantidade de produtos e equipamentos são definidas operacionalmente dentro de cada <strong>Protocolo OPME</strong>. O módulo Estoque gerencia exclusivamente o catálogo técnico e cadastral dos itens.
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, descrição, ANVISA, fabricante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
          {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? 's' : ''} cadastrado{filteredProdutos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* TABELA DE CADASTRO DE PRODUTOS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse min-w-[750px] text-[11px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                <th className="p-2.5 pl-3.5">Código / Descrição</th>
                <th className="p-2.5">Fabricante Homologado</th>
                <th className="p-2.5">Categoria / Grupo</th>
                <th className="p-2.5">Unidade</th>
                <th className="p-2.5">Rastreabilidade</th>
                <th className="p-2.5 text-right pr-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {filteredProdutos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProdutos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5 pl-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-blue-600 dark:text-blue-400">{p.codigo}</span>
                        {p.anvisa && (
                          <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono">
                            ANVISA: {p.anvisa}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{p.descricao}</p>
                    </td>

                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                      {p.fabricante || 'Fabricante Homologado'}
                    </td>

                    <td className="p-2.5 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-[10px]">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {p.categoria || p.grupo || 'Materiais OPME'}
                      </span>
                    </td>

                    <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {p.unidade || 'UN'}
                    </td>

                    <td className="p-2.5">
                      <div className="flex flex-wrap gap-1 text-[9px]">
                        {p.controla_lote && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                            Lote
                          </span>
                        )}
                        {p.controla_validade && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 font-medium">
                            Validade
                          </span>
                        )}
                        {p.controla_serie && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 font-medium">
                            Série
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-2.5 text-right pr-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        Ativo
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo / Editar Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                {editingProduto ? 'Editar Produto OPME' : 'Cadastrar Novo Produto OPME'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduto} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Código Interno <span className="text-red-500">*</span>
                  </label>
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
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Descrição do Produto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome do dispositivo / prótese / implante"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ex: Medtronic Spine"
                    value={formData.fabricante}
                    onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Unidade de Medida</label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="UN">UN - Unidade</option>
                    <option value="CX">CX - Caixa</option>
                    <option value="KIT">KIT - Kit Cirúrgico</option>
                    <option value="PAR">PAR - Par</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Coluna Vertebral, Prótese de Quadril..."
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Rastreabilidade checkboxes */}
              <div className="pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Controles de Rastreabilidade ANVISA
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.controla_lote}
                      onChange={(e) => setFormData({ ...formData, controla_lote: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Controla Lote
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.controla_validade}
                      onChange={(e) => setFormData({ ...formData, controla_validade: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Validade
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.controla_serie}
                      onChange={(e) => setFormData({ ...formData, controla_serie: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Nº de Série
                  </label>
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
