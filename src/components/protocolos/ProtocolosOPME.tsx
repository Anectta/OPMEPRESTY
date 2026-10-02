import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import type { ProtocoloOPME, ProtocoloItem, StatusProtocolo } from '../../types';
import { formatDate, getStatusProtocoloConfig } from '../../lib/utils';
import { getActiveVendedor, isProtocoloOfVendedor } from '../../lib/vendedorHelper';
import {
  FileSpreadsheet, Plus, Search, CheckCircle2, Clock,
  FileText, AlertTriangle, X, ChevronRight, Send, Calendar,
  Building2, Stethoscope, User, UserCheck, Package
} from 'lucide-react';

// Status V2.0 — seção 8 da Especificação Mestre
const STATUS_FILTER_OPTS: Array<{ value: string; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'AGUARDANDO_AUTORIZACAO', label: 'Aguardando Autorização' },
  { value: 'AUTORIZADO', label: 'Autorizado' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'FINALIZADO', label: 'Finalizado' },
];

export const ProtocolosOPME: React.FC = () => {
  const {
    protocolos, hospitais, medicos, convenios, vendedores, produtos, cirurgias,
    addProtocolo, updateProtocolo, addCirurgia, updateCirurgia
  } = useData();
  const { user, role, logAuditEvent } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProtocolo, setSelectedProtocolo] = useState<ProtocoloOPME | null>(null);

  // Modal para informar data da cirurgia em protocolos autorizados/confirmados
  const [protocoloParaAgendar, setProtocoloParaAgendar] = useState<ProtocoloOPME | null>(null);
  const [dataCirurgiaModal, setDataCirurgiaModal] = useState('');
  const [horarioCirurgiaModal, setHorarioCirurgiaModal] = useState('08:00');

  // Escopo de Vendedor (somente pode ver e cadastrar protocolos sob sua responsabilidade)
  const activeVendedor = React.useMemo(() => getActiveVendedor(user, vendedores), [user, vendedores]);
  const isVendedorScope = role === 'vendedor' || (role as string) === 'comercial';

  const scopedProtocolos = React.useMemo(() => {
    if (!isVendedorScope) return protocolos;
    return protocolos.filter(p => isProtocoloOfVendedor(p, activeVendedor));
  }, [protocolos, isVendedorScope, activeVendedor]);

  // Formulário para novo protocolo — sem campos financeiros
  const [formData, setFormData] = useState({
    numero_it: '',
    paciente: '',
    hospital_nome: hospitais[0]?.nome || '',
    medico_nome: medicos[0]?.nome || '',
    convenio_nome: convenios[0]?.nome || '',
    procedimento_nome: 'ARTRODESE CERVICAL',
    vendedor_nome: isVendedorScope && activeVendedor ? activeVendedor.nome : (vendedores[0]?.nome || ''),
    data_cirurgia: '',
    observacoes: '',
  });

  // Items do protocolo — sem valor_unitario, sem valor_total
  const [itemsList, setItemsList] = useState<Array<{
    descricao_produto: string;
    quantidade: number;
    indicacao: string;
    numero_it?: string;
  }>>([
    { descricao_produto: produtos[0]?.descricao || 'Gaiola Cervical PEEK 12x14mm', quantidade: 1, indicacao: 'PRIMEIRA' },
  ]);

  const [displayCount, setDisplayCount] = useState(50);

  // Filtros
  const filteredProtocolos = scopedProtocolos.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.numero_it?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medico_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hospital_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendedor_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numero_protocolo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'todos' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const displayedProtocolos = filteredProtocolos.slice(0, displayCount);

  const handleAddItem = () => {
    setItemsList((prev) => [
      ...prev,
      { descricao_produto: 'Novo material OPME', quantidade: 1, indicacao: 'PRIMEIRA' },
    ]);
  };

  const handleUpdateItem = (idx: number, field: string, value: string | number) => {
    setItemsList((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (idx: number) => {
    setItemsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (status: StatusProtocolo = 'RASCUNHO') => {
    if (!formData.paciente || !formData.numero_it) {
      alert('Preencha os campos obrigatórios: Número IT e Paciente');
      return;
    }

    const finalVendedorNome = isVendedorScope && activeVendedor ? activeVendedor.nome : formData.vendedor_nome;
    const finalVendedorId = isVendedorScope && activeVendedor ? activeVendedor.id : undefined;

    const newProtocolo: Omit<ProtocoloOPME, 'id' | 'created_at'> = {
      numero_it: formData.numero_it,
      paciente: formData.paciente,
      hospital_nome: formData.hospital_nome,
      medico_nome: formData.medico_nome,
      convenio_nome: formData.convenio_nome,
      procedimento_nome: formData.procedimento_nome,
      vendedor_nome: finalVendedorNome,
      vendedor_id: finalVendedorId,
      status,
      data_cirurgia: formData.data_cirurgia || undefined,
      observacoes: formData.observacoes || undefined,
      itens: itemsList.map((item, idx) => ({
        id: `item-${idx}`,
        protocolo_id: '',
        numero_it: `${formData.numero_it}-${String(idx + 1).padStart(2, '0')}`,
        descricao_produto: item.descricao_produto,
        quantidade: item.quantidade,
        indicacao: item.indicacao,
      })),
    };

    const created = await addProtocolo(newProtocolo);
    await logAuditEvent(
      'CREATE_PROTOCOLO',
      'Protocolos',
      newProtocolo.numero_it,
      {
        protocolo_id: created?.id,
        numero_it: newProtocolo.numero_it,
        paciente: newProtocolo.paciente,
        hospital: newProtocolo.hospital_nome,
        medico: newProtocolo.medico_nome,
        vendedor: finalVendedorNome,
        status,
        itens_qtd: newProtocolo.itens?.length,
        criado_por: user?.nome,
        usuario_email: user?.email,
        papel: role
      },
      'medium'
    );

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      numero_it: '',
      paciente: '',
      hospital_nome: hospitais[0]?.nome || '',
      medico_nome: medicos[0]?.nome || '',
      convenio_nome: convenios[0]?.nome || '',
      procedimento_nome: 'ARTRODESE CERVICAL',
      vendedor_nome: isVendedorScope && activeVendedor ? activeVendedor.nome : (vendedores[0]?.nome || ''),
      data_cirurgia: '',
      observacoes: '',
    });
    setItemsList([{ descricao_produto: produtos[0]?.descricao || 'Gaiola Cervical PEEK 12x14mm', quantidade: 1, indicacao: 'PRIMEIRA' }]);
  };

  const handleSolicitarAutorizacao = async (protocolo: ProtocoloOPME) => {
    // Fluxo conforme seção 10 da spec: RASCUNHO → AGUARDANDO_AUTORIZACAO
    await updateProtocolo(protocolo.id, { status: 'AGUARDANDO_AUTORIZACAO' });
    await logAuditEvent(
      'SOLICITAR_AUTORIZACAO',
      'Protocolos',
      protocolo.numero_it,
      {
        protocolo_id: protocolo.id,
        numero_it: protocolo.numero_it,
        paciente: protocolo.paciente,
        vendedor: protocolo.vendedor_nome,
        solicitado_por: user?.nome,
        usuario_email: user?.email,
        papel: role,
        status_anterior: protocolo.status,
        novo_status: 'AGUARDANDO_AUTORIZACAO'
      },
      'medium'
    );
    setSelectedProtocolo(null);
  };

  const canAdicionarAoMapa = (p: ProtocoloOPME): boolean => {
    // Regra seção 14: somente AUTORIZADO + data_cirurgia preenchida
    return (p.status === 'AUTORIZADO' || (p.status as string) === 'CONFIRMADO') && !!p.data_cirurgia && !!p.hospital_nome && !!p.paciente && !!p.medico_nome;
  };

  const handleSalvarDataCirurgiaProtocolo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocoloParaAgendar || !dataCirurgiaModal) {
      alert('Por favor, informe a data da cirurgia.');
      return;
    }

    const prot = protocoloParaAgendar;
    await updateProtocolo(prot.id, {
      data_cirurgia: dataCirurgiaModal,
      status: 'AUTORIZADO',
    });

    // Sincroniza com o Mapa Cirúrgico
    const cirurgiaExistente = cirurgias.find(
      c => c.numero_it === prot.numero_it || c.protocolo_id === prot.id
    );

    if (cirurgiaExistente) {
      await updateCirurgia(cirurgiaExistente.id, {
        data: dataCirurgiaModal,
        horario: horarioCirurgiaModal || '08:00',
        situacao: 'Agendada',
        status: 'AUTORIZADA_E_AGENDADA',
        data_a_definir: false,
        data_definida_por: user?.nome,
        data_definida_em: new Date().toISOString(),
      });
    } else {
      const hospObj = hospitais.find(h => h.nome === prot.hospital_nome);
      const medObj = medicos.find(m => m.nome === prot.medico_nome);
      const convObj = convenios.find(c => c.nome === prot.convenio_nome);
      const vendObj = vendedores.find(v => v.nome === prot.vendedor_nome);

      await addCirurgia({
        numero_it: prot.numero_it,
        protocolo_id: prot.id,
        data: dataCirurgiaModal,
        horario: horarioCirurgiaModal || '08:00',
        hospital_id: hospObj?.id || hospitais[0]?.id || 'hosp-001',
        hospital_nome: prot.hospital_nome,
        medico_id: medObj?.id || medicos[0]?.id || 'med-001',
        medico_nome: prot.medico_nome,
        paciente: prot.paciente,
        convenio_id: convObj?.id || convenios[0]?.id || 'conv-001',
        convenio_nome: prot.convenio_nome,
        vendedor_id: prot.vendedor_id || vendObj?.id,
        vendedor_nome: prot.vendedor_nome,
        situacao: 'Agendada',
        status: 'AUTORIZADA_E_AGENDADA',
        material_previsto: prot.itens?.map(i => `${i.quantidade}x ${i.descricao_produto}`).join(', '),
        data_a_definir: false,
        data_definida_por: user?.nome,
        data_definida_em: new Date().toISOString(),
      });
    }

    await logAuditEvent(
      'DEFINIR_DATA_CIRURGIA',
      'Protocolos',
      prot.numero_it,
      {
        protocolo_id: prot.id,
        numero_it: prot.numero_it,
        paciente: prot.paciente,
        hospital: prot.hospital_nome,
        medico: prot.medico_nome,
        vendedor: prot.vendedor_nome,
        data_anterior: prot.data_cirurgia || 'Não informada',
        nova_data: dataCirurgiaModal,
        novo_horario: horarioCirurgiaModal,
        definido_por: user?.nome,
        usuario_email: user?.email,
        papel: role
      },
      'high'
    );

    setProtocoloParaAgendar(null);
  };

  const handleAdicionarAoMapaDireto = async (p: ProtocoloOPME) => {
    const cirurgiaExistente = cirurgias.find(
      c => c.numero_it === p.numero_it || c.protocolo_id === p.id
    );

    if (cirurgiaExistente) {
      await updateCirurgia(cirurgiaExistente.id, {
        situacao: 'Agendada',
        status: 'AUTORIZADA_E_AGENDADA',
      });
      alert(`Cirurgia IT ${p.numero_it} já está sincronizada no Mapa Cirúrgico.`);
      return;
    }

    const hospObj = hospitais.find(h => h.nome === p.hospital_nome);
    const medObj = medicos.find(m => m.nome === p.medico_nome);
    const convObj = convenios.find(c => c.nome === p.convenio_nome);
    const vendObj = vendedores.find(v => v.nome === p.vendedor_nome);

    await addCirurgia({
      numero_it: p.numero_it,
      protocolo_id: p.id,
      data: p.data_cirurgia || new Date().toISOString().split('T')[0],
      horario: '08:00',
      hospital_id: hospObj?.id || hospitais[0]?.id || 'hosp-001',
      hospital_nome: p.hospital_nome,
      medico_id: medObj?.id || medicos[0]?.id || 'med-001',
      medico_nome: p.medico_nome,
      paciente: p.paciente,
      convenio_id: convObj?.id || convenios[0]?.id || 'conv-001',
      convenio_nome: p.convenio_nome,
      vendedor_id: p.vendedor_id || vendObj?.id,
      vendedor_nome: p.vendedor_nome,
      situacao: 'Agendada',
      status: 'AUTORIZADA_E_AGENDADA',
      material_previsto: p.itens?.map(i => `${i.quantidade}x ${i.descricao_produto}`).join(', '),
      data_a_definir: false,
      data_definida_por: user?.nome,
      data_definida_em: new Date().toISOString(),
    });

    await logAuditEvent(
      'ADICIONAR_AO_MAPA',
      'Protocolos',
      p.numero_it,
      {
        protocolo_id: p.id,
        numero_it: p.numero_it,
        paciente: p.paciente,
        hospital: p.hospital_nome,
        medico: p.medico_nome,
        vendedor: p.vendedor_nome,
        data_cirurgia: p.data_cirurgia,
        adicionado_por: user?.nome,
        usuario_email: user?.email,
        papel: role
      },
      'medium'
    );

    alert(`Cirurgia IT ${p.numero_it} adicionada com sucesso ao Mapa Cirúrgico!`);
  };

  // Contadores por status dentro do escopo
  const aguardando = scopedProtocolos.filter(p => p.status === 'AGUARDANDO_AUTORIZACAO').length;
  const autorizados = scopedProtocolos.filter(p => p.status === 'AUTORIZADO').length;

  return (
    <div className="space-y-6">
      {/* Banner de Escopo do Vendedor */}
      {isVendedorScope && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-2">
                Protocolos Restritos por Representante
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-[10px] font-black uppercase text-amber-900">
                  Somente Seus Protocolos
                </span>
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Exibindo e registrando protocolos exclusivamente para o vendedor <strong>{activeVendedor?.nome || user?.nome}</strong> ({scopedProtocolos.length} protocolos no seu escopo).
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Protocolo OPME</h1>
            <div className="flex gap-2">
              {aguardando > 0 && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full animate-pulse">
                  {aguardando} aguardando
                </span>
              )}
              {autorizados > 0 && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {autorizados} autorizado{autorizados > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Fluxo: Protocolo → Autorização → Mapa Cirúrgico
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setSelectedProtocolo(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Protocolo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por IT, paciente, médico, hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTER_OPTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                selectedStatus === opt.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filteredProtocolos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FileSpreadsheet className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-semibold">Nenhum protocolo encontrado</p>
          <p className="text-sm mt-1">Crie um novo protocolo para iniciar o fluxo operacional</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedProtocolos.map((protocolo) => {
            const statusCfg = getStatusProtocoloConfig(protocolo.status);
            const podeMapa = canAdicionarAoMapa(protocolo);
            return (
              <div
                key={protocolo.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer"
                onClick={() => setSelectedProtocolo(protocolo)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-2.5 bg-emerald-50 rounded-xl flex-shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 font-mono">
                          IT {protocolo.numero_it}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.badgeClass}`}>
                          {statusCfg.label}
                        </span>
                        {protocolo.numero_protocolo && (
                          <span className="text-xs text-gray-400 font-mono">{protocolo.numero_protocolo}</span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {protocolo.paciente}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            {protocolo.hospital_nome}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                            {protocolo.medico_nome}
                          </span>
                          {protocolo.vendedor_nome && (
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                              {protocolo.vendedor_nome}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                          {protocolo.data_cirurgia && (
                            <span className="flex items-center gap-1.5 text-blue-600">
                              <Calendar className="w-3.5 h-3.5" />
                              Cirurgia: {formatDate(protocolo.data_cirurgia)}
                            </span>
                          )}
                          {protocolo.procedimento_nome && (
                            <span className="text-gray-500">{protocolo.procedimento_nome}</span>
                          )}
                          {protocolo.itens && protocolo.itens.length > 0 && (
                            <span className="flex items-center gap-1.5 text-gray-500">
                              <Package className="w-3.5 h-3.5 text-gray-400" />
                              {protocolo.itens.length} item(ns)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {protocolo.status === 'RASCUNHO' && (
                      <button
                        onClick={() => handleSolicitarAutorizacao(protocolo)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Solicitar Autorização
                      </button>
                    )}
                    {podeMapa && (
                      <button
                        onClick={() => handleAdicionarAoMapaDireto(protocolo)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Adicionar ao Mapa
                      </button>
                    )}
                    {(protocolo.status === 'AUTORIZADO' || (protocolo.status as string) === 'CONFIRMADO') && !protocolo.data_cirurgia && (
                      <button
                        onClick={() => {
                          setProtocoloParaAgendar(protocolo);
                          setDataCirurgiaModal(new Date().toISOString().split('T')[0]);
                          setHorarioCirurgiaModal('08:00');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        Informar Data
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProtocolos.length > displayCount && (
            <div className="text-center pt-4">
              <button
                onClick={() => setDisplayCount(prev => prev + 50)}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Carregar Mais ({displayCount} de {filteredProtocolos.length} protocolos)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Detalhe */}
      {selectedProtocolo && !isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">IT {selectedProtocolo.numero_it}</h3>
                <p className="text-sm text-gray-500">{selectedProtocolo.numero_protocolo}</p>
              </div>
              <button onClick={() => setSelectedProtocolo(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusProtocoloConfig(selectedProtocolo.status).badgeClass}`}>
                  {getStatusProtocoloConfig(selectedProtocolo.status).label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500 block text-xs">Paciente</span>{selectedProtocolo.paciente}</div>
                <div><span className="text-gray-500 block text-xs">Data Cirurgia</span>{formatDate(selectedProtocolo.data_cirurgia) || 'Não informada'}</div>
                <div><span className="text-gray-500 block text-xs">Hospital</span>{selectedProtocolo.hospital_nome}</div>
                <div><span className="text-gray-500 block text-xs">Médico</span>{selectedProtocolo.medico_nome}</div>
                <div><span className="text-gray-500 block text-xs">Convênio</span>{selectedProtocolo.convenio_nome}</div>
                <div><span className="text-gray-500 block text-xs">Vendedor</span>{selectedProtocolo.vendedor_nome}</div>
                {selectedProtocolo.procedimento_nome && (
                  <div className="col-span-2"><span className="text-gray-500 block text-xs">Procedimento</span>{selectedProtocolo.procedimento_nome}</div>
                )}
              </div>

              {selectedProtocolo.itens && selectedProtocolo.itens.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    Materiais ({selectedProtocolo.itens.length} item(ns))
                  </h4>
                  <div className="space-y-2">
                    {selectedProtocolo.itens.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                        <div className="min-w-0">
                          {item.numero_it && <span className="text-xs text-gray-400 font-mono block">{item.numero_it}</span>}
                          <span className="font-medium">{item.descricao_produto}</span>
                          {item.indicacao && <span className="text-xs text-gray-500 ml-2">{item.indicacao}</span>}
                        </div>
                        <span className="font-semibold ml-4 flex-shrink-0">×{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProtocolo.observacoes && (
                <div>
                  <span className="text-xs text-gray-500">Observações</span>
                  <p className="text-sm text-gray-700 mt-1">{selectedProtocolo.observacoes}</p>
                </div>
              )}

              {/* Ações do modal */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                {selectedProtocolo.status === 'RASCUNHO' && (
                  <button
                    onClick={() => handleSolicitarAutorizacao(selectedProtocolo)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Solicitar Autorização
                  </button>
                )}
                {canAdicionarAoMapa(selectedProtocolo) && (
                  <button
                    onClick={() => {
                      handleAdicionarAoMapaDireto(selectedProtocolo);
                      setSelectedProtocolo(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Adicionar ao Mapa Cirúrgico
                  </button>
                )}
                {((selectedProtocolo.status === 'AUTORIZADO' || (selectedProtocolo.status as string) === 'CONFIRMADO') && !selectedProtocolo.data_cirurgia) && (
                  <button
                    onClick={() => {
                      const p = selectedProtocolo;
                      setSelectedProtocolo(null);
                      setProtocoloParaAgendar(p);
                      setDataCirurgiaModal(new Date().toISOString().split('T')[0]);
                      setHorarioCirurgiaModal('08:00');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Informar Data da Cirurgia
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Protocolo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Novo Protocolo OPME</h3>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Campos do protocolo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Número IT <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Ex: 559879"
                    value={formData.numero_it}
                    onChange={(e) => setFormData(p => ({ ...p, numero_it: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Paciente <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.paciente}
                    onChange={(e) => setFormData(p => ({ ...p, paciente: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hospital</label>
                  <select
                    value={formData.hospital_nome}
                    onChange={(e) => setFormData(p => ({ ...p, hospital_nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {hospitais.map(h => <option key={h.id} value={h.nome}>{h.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Médico</label>
                  <select
                    value={formData.medico_nome}
                    onChange={(e) => setFormData(p => ({ ...p, medico_nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {medicos.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Convênio</label>
                  <select
                    value={formData.convenio_nome}
                    onChange={(e) => setFormData(p => ({ ...p, convenio_nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {convenios.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vendedor</label>
                  <select
                    value={formData.vendedor_nome}
                    onChange={(e) => setFormData(p => ({ ...p, vendedor_nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {vendedores.map(v => <option key={v.id} value={v.nome}>{v.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Procedimento</label>
                  <input
                    type="text"
                    value={formData.procedimento_nome}
                    onChange={(e) => setFormData(p => ({ ...p, procedimento_nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Data Prevista</label>
                  <input
                    type="date"
                    value={formData.data_cirurgia}
                    onChange={(e) => setFormData(p => ({ ...p, data_cirurgia: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData(p => ({ ...p, observacoes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
              </div>

              {/* Itens — sem campos financeiros */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    Materiais OPME
                  </h4>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {itemsList.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          placeholder="Descrição do material OPME"
                          value={item.descricao_produto}
                          onChange={(e) => handleUpdateItem(idx, 'descricao_produto', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantidade}
                          onChange={(e) => handleUpdateItem(idx, 'quantidade', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={item.indicacao}
                          onChange={(e) => handleUpdateItem(idx, 'indicacao', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="PRIMEIRA">1ª</option>
                          <option value="SEGUNDA">2ª</option>
                          <option value="TERCEIRA">3ª</option>
                          <option value="SEM PEDIDO MEDICO">S/ Pedido</option>
                        </select>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ações do formulário */}
            <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSave('RASCUNHO')}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                Salvar Rascunho
              </button>
              <button
                onClick={() => handleSave('AGUARDANDO_AUTORIZACAO')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
                Enviar para Autorização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Informar Data da Cirurgia no Protocolo */}
      {protocoloParaAgendar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Definir Data da Cirurgia</h3>
                  <p className="text-xs text-gray-500">Protocolo IT {protocoloParaAgendar.numero_it}</p>
                </div>
              </div>
              <button
                onClick={() => setProtocoloParaAgendar(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarDataCirurgiaProtocolo} className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Paciente:</span>
                  <span className="font-bold">{protocoloParaAgendar.paciente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hospital:</span>
                  <span className="font-medium">{protocoloParaAgendar.hospital_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Médico:</span>
                  <span className="font-medium">{protocoloParaAgendar.medico_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendedor:</span>
                  <span className="font-bold text-blue-700">{protocoloParaAgendar.vendedor_nome}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Data da Cirurgia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dataCirurgiaModal}
                    onChange={(e) => setDataCirurgiaModal(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Horário Previsto
                  </label>
                  <input
                    type="time"
                    value={horarioCirurgiaModal}
                    onChange={(e) => setHorarioCirurgiaModal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 text-blue-800">
                Ao registrar a data, o protocolo será automaticamente atualizado e a cirurgia ficará agendada no <strong>Mapa Cirúrgico</strong> para a equipe logística.
              </p>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProtocoloParaAgendar(null)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Salvar Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
