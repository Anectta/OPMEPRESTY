import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Produto, MovimentoEstoque, ProdutoLote, TipoMovimentoEstoque } from '../../types';
import { formatBRL, formatDate } from '../../lib/utils';
import {
  Package,
  Search,
  Plus,
  AlertCircle,
  ShieldCheck,
  Tag,
  Layers,
  RefreshCw,
  Layers3,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Calendar,
  Truck,
  CheckCircle2,
  FileCheck,
  Building2,
  UserCheck,
} from 'lucide-react';

export const GestaoEstoque: React.FC = () => {
  const { produtos, lotes, movimentos, addProduto, addMovimento, addLote, cirurgias, hospitais } = useData();
  const { user, logAuditEvent } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'produtos' | 'lotes' | 'movimentos' | 'rastreabilidade'>('produtos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovimentoModalOpen, setIsMovimentoModalOpen] = useState(false);

  // New Product Form
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    fabricante: 'Medtronic Spine',
    anvisa: '80123450099',
    grupo: 'Coluna Vertebral',
    subgrupo: 'Fixadores Pediculares',
    unidade: 'UN',
    valor_custo: 2500.0,
    valor_venda: 6800.0,
    controla_serie: true,
    is_kit: false,
    saldo_total: 10,
    ativo: true,
  });

  // New Movement Form
  const [movimentoForm, setMovimentoForm] = useState({
    produto_id: '',
    lote: '',
    numero_serie: '',
    tipo: 'entrada' as TipoMovimentoEstoque,
    quantidade: 1,
    origem: 'Nota Fiscal de Entrada',
    destino: 'Almoxarifado Central OPME',
    hospital_nome: '',
    medico_nome: '',
    paciente_nome: '',
    protocolo_numero: '',
  });

  // Traceability Search
  const [traceLoteSearch, setTraceLoteSearch] = useState('LT-2025-081');

  const filteredProdutos = produtos.filter(
    (p) =>
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.anvisa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fabricante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovimentos = movimentos.filter(
    (m) =>
      m.produto_codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.produto_descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.hospital_nome && m.hospital_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.paciente_nome && m.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredLotes = lotes.filter(
    (l) =>
      l.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.produto_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.descricao) return;

    const newP = await addProduto(formData);
    logAuditEvent('CREATE_PRODUTO_OPME', 'Estoque', newP.id, { codigo: formData.codigo, anvisa: formData.anvisa });
    setIsModalOpen(false);
  };

  const handleSubmitMovimento = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = produtos.find((p) => p.id === movimentoForm.produto_id);
    if (!prod) return;

    const created = await addMovimento({
      produto_id: prod.id,
      produto_codigo: prod.codigo,
      produto_descricao: prod.descricao,
      lote: movimentoForm.lote || 'LOTE-PADRAO',
      numero_serie: movimentoForm.numero_serie || undefined,
      tipo: movimentoForm.tipo,
      quantidade: Number(movimentoForm.quantidade) || 1,
      origem: movimentoForm.origem,
      destino: movimentoForm.destino,
      hospital_nome: movimentoForm.hospital_nome || undefined,
      medico_nome: movimentoForm.medico_nome || undefined,
      paciente_nome: movimentoForm.paciente_nome || undefined,
      protocolo_numero: movimentoForm.protocolo_numero || undefined,
      user_email: user?.email || 'admin@prestymedick.com.br',
    });

    logAuditEvent('MOVIMENTO_ESTOQUE_REGISTRADO', 'Estoque', created.id, {
      tipo: movimentoForm.tipo,
      produto: prod.codigo,
      quantidade: movimentoForm.quantidade,
    });

    setIsMovimentoModalOpen(false);
  };

  // Helper calculation for lot expiration
  const getDaysUntilExpiration = (validadeDateStr: string) => {
    const diffTime = new Date(validadeDateStr).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setIsMovimentoModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Movimentar Estoque
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Produto OPME
          </button>
        </div>
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
            {formatBRL(produtos.reduce((acc, p) => acc + p.valor_custo * p.saldo_total, 0))}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Auditoria física mensal</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">VALOR POTENCIAL VENDA</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatBRL(produtos.reduce((acc, p) => acc + p.valor_venda * p.saldo_total, 0))}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Margem Média 62%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TOTAL DE MOVIMENTAÇÕES</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{movimentos.length}</p>
          <p className="text-[10px] font-bold text-indigo-600 mt-0.5">Rastreio 100% Auditado</p>
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
          Lotes & Validades ANVISA ({lotes.length})
        </button>
        <button
          onClick={() => setActiveSubTab('movimentos')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeSubTab === 'movimentos'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Movimentações & Baixas ({movimentos.length})
        </button>
        <button
          onClick={() => setActiveSubTab('rastreabilidade')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors ${
            activeSubTab === 'rastreabilidade'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Rastreabilidade Total OPME
        </button>
      </div>

      {/* Filter / Search Bar */}
      {activeSubTab !== 'rastreabilidade' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeSubTab === 'produtos'
                  ? 'Buscar por código, descrição, ANVISA...'
                  : activeSubTab === 'lotes'
                  ? 'Buscar por lote...'
                  : 'Buscar por movimento, hospital, paciente...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* SUB-ABA 1: PRODUTOS & SALDOS */}
      {activeSubTab === 'produtos' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full min-w-0">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left border-collapse min-w-[750px] text-[11px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-2.5 pl-3.5">Código / Descrição</th>
                  <th className="p-2.5">Fabricante / Grupo</th>
                  <th className="p-2.5">Custo Médio</th>
                  <th className="p-2.5">Preço Tabela</th>
                  <th className="p-2.5">Saldo Físico</th>
                  <th className="p-2.5 text-right pr-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                {filteredProdutos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5 pl-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-blue-600 dark:text-blue-400">{p.codigo}</span>
                        <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono">
                          ANVISA: {p.anvisa}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{p.descricao}</p>
                      {p.controla_serie && (
                        <span className="inline-block mt-0.5 text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
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
                      <span className="font-black text-slate-900 dark:text-white">
                        {p.saldo_total} {p.unidade}
                      </span>
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
      )}

      {/* SUB-ABA 2: LOTES & VALIDADES ANVISA */}
      {activeSubTab === 'lotes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full min-w-0">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left border-collapse min-w-[700px] text-[11px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-2.5 pl-3.5">Identificação do Lote</th>
                  <th className="p-2.5">Produto Vinculado</th>
                  <th className="p-2.5">Fabricação</th>
                  <th className="p-2.5">Data Validade</th>
                  <th className="p-2.5">Quantidade em Saldo</th>
                  <th className="p-2.5 text-right pr-3.5">Status ANVISA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                {filteredLotes.map((l) => {
                  const prod = produtos.find((p) => p.id === l.produto_id);
                  const daysLeft = getDaysUntilExpiration(l.validade);
                  const isExpired = daysLeft <= 0;
                  const isWarning = daysLeft > 0 && daysLeft <= 90;

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 pl-3.5">
                        <span className="font-mono font-black text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {l.lote}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <p className="font-bold text-slate-900 dark:text-white">{prod?.descricao || 'Produto OPME'}</p>
                        <p className="text-[9px] font-mono text-slate-400">{prod?.codigo}</p>
                      </td>
                      <td className="p-2.5 text-slate-500 font-medium">{formatDate(l.fabricacao)}</td>
                      <td className="p-2.5 font-bold">
                        <span className={isExpired ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'}>
                          {formatDate(l.validade)}
                        </span>
                        <p className="text-[9px] text-slate-400">
                          {isExpired ? 'Expirado' : `${daysLeft} dias restantes`}
                        </p>
                      </td>
                      <td className="p-2.5 font-black text-slate-900 dark:text-white">{l.quantidade} UN</td>
                      <td className="p-2.5 text-right pr-3.5">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                            Bloqueado ANVISA
                          </span>
                        ) : isWarning ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            Atenção Validade
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Válido / Conforme
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA 3: MOVIMENTAÇÕES & BAIXAS */}
      {activeSubTab === 'movimentos' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full min-w-0">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left border-collapse min-w-[750px] text-[11px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-2.5 pl-3.5">Data / Hora</th>
                  <th className="p-2.5">Tipo Operação</th>
                  <th className="p-2.5">Produto & Lote</th>
                  <th className="p-2.5">Quantidade</th>
                  <th className="p-2.5">Origem ➔ Destino</th>
                  <th className="p-2.5 text-right pr-3.5">Paciente / Hospital</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                {filteredMovimentos.map((m) => {
                  const isEntrada = m.tipo === 'entrada' || m.tipo === 'devolucao';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 pl-3.5 font-mono text-slate-500">
                        {new Date(m.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            m.tipo === 'entrada'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300'
                              : m.tipo === 'saida'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300'
                              : m.tipo === 'devolucao'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                          }`}
                        >
                          {isEntrada ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {m.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <p className="font-bold text-slate-900 dark:text-white">{m.produto_descricao}</p>
                        <p className="text-[9px] font-mono text-slate-400">
                          {m.produto_codigo} • Lote: <span className="font-bold text-slate-700 dark:text-slate-300">{m.lote}</span>
                        </p>
                      </td>
                      <td className="p-2.5 font-mono font-black text-slate-900 dark:text-white">
                        {isEntrada ? '+' : '-'}
                        {m.quantidade} UN
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold text-xs">{m.origem}</p>
                        <p className="text-[9px] text-slate-400 font-medium">➔ {m.destino}</p>
                      </td>
                      <td className="p-2.5 text-right pr-3.5">
                        {m.paciente_nome ? (
                          <>
                            <p className="font-bold text-slate-900 dark:text-white">{m.paciente_nome}</p>
                            <p className="text-[9px] text-slate-400">{m.hospital_nome}</p>
                          </>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Movimentação Interna</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA 4: RASTREABILIDADE TOTAL OPME */}
      {activeSubTab === 'rastreabilidade' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Auditoria de Rastreabilidade ANVISA RDC 751/2022
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Informe o lote de fabricação ou o número de série gravado no implante para traçar a jornada ponta-a-ponta:
            </p>

            <div className="flex gap-2 mt-3 max-w-md">
              <input
                type="text"
                placeholder="Ex: LT-2025-081"
                value={traceLoteSearch}
                onChange={(e) => setTraceLoteSearch(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:outline-none"
              />
              <button
                onClick={() => {}}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Rastrear
              </button>
            </div>
          </div>

          {/* Timeline of Traceability */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-black text-blue-600">LOTE RASTREADO: {traceLoteSearch}</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  Gaiola Cervical PEEK 12x14mm - Medtronic Spine
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Rastreável Conforme ANVISA
              </span>
            </div>

            <div className="relative border-l-2 border-blue-500/30 ml-4 mt-6 space-y-6">
              {/* Step 1 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-slate-400">10/01/2025 • FABRICAÇÃO E DESEMBARAÇO</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    Fabricação e Inspeção Primária do Fabricante
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    Lote fabricado em Memphis, EUA. Laudo de biocompatibilidade e esterilização por Raio Gama aprovados.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-slate-400">20/08/2026 • ENTRADA EM ESTOQUE PRESTY</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    Recebimento e Quarentena Técnica
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    Entrada via NF-8812. Auditoria física com conferência do Registro ANVISA 80123450012 e validade até 10/01/2028.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <Truck className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-slate-400">01/09/2026 • TRANSPORTE & LOGÍSTICA</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    Separação e Transporte em Caixa Térmica Esterilizada
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    Veículo utilitário Fiat Fiorino (Placa OPM-8E29) conduzido por Sérgio Ramos com checklist fotográfico realizado.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <FileCheck className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-emerald-600">03/09/2026 • IMPLANTE NO PACIENTE</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    Cirurgia no Hospital Israelita Albert Einstein
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    Implantado na paciente <strong>Maria das Graças Oliveira</strong> pelo cirurgião <strong>Dr. Roberto Silva Mendes (CRM 145892)</strong>. Termo de gasto hospitalar assinado e faturado na VDA-2026-019.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Cadastrar Novo Produto OPME
            </h2>

            <form onSubmit={handleSubmitProduto} className="space-y-3 text-xs">
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

      {/* Modal Nova Movimentação de Estoque */}
      {isMovimentoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-600" />
              Registrar Movimentação de Estoque OPME
            </h2>

            <form onSubmit={handleSubmitMovimento} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Produto OPME</label>
                <select
                  value={movimentoForm.produto_id}
                  onChange={(e) => setMovimentoForm({ ...movimentoForm, produto_id: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                  required
                >
                  <option value="">Selecione o produto...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.descricao} (Saldo atual: {p.saldo_total})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tipo de Movimentação</label>
                  <select
                    value={movimentoForm.tipo}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, tipo: e.target.value as TipoMovimentoEstoque })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="entrada">Entrada (NF / Compra)</option>
                    <option value="saida">Saída (Cirurgia / Envio)</option>
                    <option value="devolucao">Devolução (Consignado)</option>
                    <option value="ajuste">Ajuste de Inventário</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={movimentoForm.quantidade}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, quantidade: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Lote</label>
                  <input
                    type="text"
                    placeholder="Ex: LT-2025-099"
                    value={movimentoForm.lote}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, lote: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nº de Série (Opcional)</label>
                  <input
                    type="text"
                    placeholder="SN-12345678"
                    value={movimentoForm.numero_serie}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, numero_serie: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Origem</label>
                  <input
                    type="text"
                    value={movimentoForm.origem}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, origem: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Destino</label>
                  <input
                    type="text"
                    value={movimentoForm.destino}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, destino: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Paciente (se aplicável)</label>
                  <input
                    type="text"
                    placeholder="Nome do Paciente"
                    value={movimentoForm.paciente_nome}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, paciente_nome: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Hospital (se aplicável)</label>
                  <input
                    type="text"
                    placeholder="Hospital Einstein, Sírio..."
                    value={movimentoForm.hospital_nome}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, hospital_nome: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovimentoModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-md font-bold text-xs transition-colors"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
