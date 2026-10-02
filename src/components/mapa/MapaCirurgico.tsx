import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Cirurgia, SituacaoCirurgia } from '../../types';
import { getStatusBadge, formatDate, formatBRL } from '../../lib/utils';
import { getActiveVendedor, isCirurgiaOfVendedor, canUserSetSurgeryDate } from '../../lib/vendedorHelper';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Building2,
  Clock,
  X,
  AlertCircle,
  Truck,
  Package,
  CheckCircle2,
  Boxes,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  Info,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  RotateCcw,
  Sliders,
  FileSpreadsheet,
  FileText,
  CalendarCheck,
  Sparkles
} from 'lucide-react';

export type InternalTab = 'overview' | 'agendamento' | 'finalizadas';

interface Props {
  initialTab?: InternalTab;
}

export const MapaCirurgico: React.FC<Props> = ({ initialTab = 'overview' }) => {
  const { cirurgias, hospitais, medicos, convenios, vendedores, produtos, protocolos, addCirurgia, updateCirurgia, updateProtocolo } = useData();
  const { logAuditEvent, user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<InternalTab>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('todos');
  const [selectedSituacao, setSelectedSituacao] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Escopo de Vendedor (somente pode ver e manipular suas próprias cirurgias)
  const activeVendedor = useMemo(() => getActiveVendedor(user, vendedores), [user, vendedores]);
  const isVendedorScope = role === 'vendedor' || (role as string) === 'comercial';

  const scopedCirurgias = useMemo(() => {
    if (!isVendedorScope) return cirurgias;
    return cirurgias.filter(c => isCirurgiaOfVendedor(c, activeVendedor));
  }, [cirurgias, isVendedorScope, activeVendedor]);

  // Date range filter state for Overview
  const [dateStart, setDateStart] = useState('2026-08-01');
  const [dateEnd, setDateEnd] = useState('2026-08-31');
  const [quickDatePreset, setQuickDatePreset] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('mes');

  // Modal para o vendedor informar a data da cirurgia confirmada pela OPME
  const [cirurgiaParaAgendar, setCirurgiaParaAgendar] = useState<Cirurgia | null>(null);
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horarioAgendamento, setHorarioAgendamento] = useState('08:00');
  const [obsAgendamento, setObsAgendamento] = useState('');

  // Form State for new Surgery registered by OPME
  const [formData, setFormData] = useState({
    numero_it: '',
    data: new Date().toISOString().split('T')[0],
    horario: '08:00',
    data_a_definir: false,
    hospital_id: hospitais[0]?.id || '',
    medico_id: medicos[0]?.id || '',
    paciente: '',
    paciente_cpf: '',
    convenio_id: convenios[0]?.id || '',
    vendedor_id: isVendedorScope && activeVendedor ? activeVendedor.id : (vendedores[0]?.id || ''),
    situacao: 'Confirmada' as SituacaoCirurgia,
    equipamento: '',
    acessorio: '',
    ld_ct: '',
    material_previsto: '',
    tecnico_nome: '',
    observacao: '',
  });

  // Cirurgias confirmadas pela OPME que aguardam o vendedor informar a data
  const cirurgiasAguardandoData = useMemo(() => {
    return scopedCirurgias.filter(c => {
      const sit = c.situacao || c.status;
      return (sit === 'Confirmada' || c.data_a_definir === true) && (!c.data || c.data_a_definir);
    });
  }, [scopedCirurgias]);

  // Enriched Surgeries with derived logistics statuses & contents
  const enrichedCirurgias = useMemo(() => {
    return scopedCirurgias.map((c, index) => {
      const logisticaStatusList = ['Confirmada', 'Agendada', 'Em Trânsito', 'Entregue', 'Devolvida Parcial'];
      const conteudoOpmeList = [
        'Prótese Quadril Híbrida + Par Parafusos',
        'Kit Artroplastia Joelho Total Titanium',
        'Cage Cervical Peak + Placa Anterior C3-C5',
        'Sistema de Fixação Pedicular L4-S1',
        'Sutura Âncora e Instrumental Especializado',
      ];

      const statusLogistico = logisticaStatusList[index % logisticaStatusList.length];
      const conteudoOpme = c.material_previsto || conteudoOpmeList[index % conteudoOpmeList.length];
      const itNumero = c.numero_it || (c.id.startsWith('cir-') ? c.id.replace('cir-', '') : c.id);

      return {
        ...c,
        numero_it: itNumero,
        numero_protocolo: c.protocolo?.numero_protocolo || `PROT-${itNumero}`,
        kitId: `IT ${itNumero}`,
        statusLogistico,
        conteudoOpme,
      };
    });
  }, [scopedCirurgias]);

  // Filtered Surgeries
  const filteredCirurgias = useMemo(() => {
    return enrichedCirurgias.filter((c) => {
      const matchesSearch =
        c.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.medico_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.vendedor_nome && c.vendedor_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.hospital_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.numero_it && c.numero_it.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.kitId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesHospital = selectedHospital === 'todos' || c.hospital_id === selectedHospital;
      const currentSit = c.situacao || c.status || 'Agendada';
      const matchesSituacao = selectedSituacao === 'todas' || currentSit === selectedSituacao;

      return matchesSearch && matchesHospital && matchesSituacao;
    });
  }, [enrichedCirurgias, searchTerm, selectedHospital, selectedSituacao]);

  // Cirurgias Finalizadas (concluídas com status correspondente)
  const cirurgiasFinalizadas = useMemo(() => {
    return enrichedCirurgias.filter((c) => {
      const sit = (c.situacao || '').toLowerCase();
      const st = (c.status || '').toLowerCase();
      return sit === 'finalizada' || st === 'finalizada' || !!c.finalizada_em;
    });
  }, [enrichedCirurgias]);

  // Cirurgias Ativas (em andamento, agendadas, confirmadas, etc.)
  const cirurgiasAtivas = useMemo(() => {
    return enrichedCirurgias.filter((c) => {
      const sit = (c.situacao || '').toLowerCase();
      const st = (c.status || '').toLowerCase();
      return sit !== 'finalizada' && st !== 'finalizada' && !c.finalizada_em;
    });
  }, [enrichedCirurgias]);

  // Lista filtrada de Cirurgias Finalizadas para a aba exclusiva
  const filteredFinalizadas = useMemo(() => {
    return cirurgiasFinalizadas.filter((c) => {
      const matchesSearch =
        c.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.medico_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.vendedor_nome && c.vendedor_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.hospital_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.numero_it && c.numero_it.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.finalizada_por && c.finalizada_por.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesHospital = selectedHospital === 'todos' || c.hospital_id === selectedHospital;
      return matchesSearch && matchesHospital;
    });
  }, [cirurgiasFinalizadas, searchTerm, selectedHospital]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.paciente.trim()) return;

    const hospObj = hospitais.find((h) => h.id === formData.hospital_id);
    const medObj = medicos.find((m) => m.id === formData.medico_id);
    const convObj = convenios.find((c) => c.id === formData.convenio_id);
    const vendObj = isVendedorScope && activeVendedor ? activeVendedor : vendedores.find((v) => v.id === formData.vendedor_id);
    const finalVendedorId = isVendedorScope && activeVendedor ? activeVendedor.id : formData.vendedor_id;
    const finalVendedorNome = isVendedorScope && activeVendedor ? activeVendedor.nome : (vendObj?.nome || 'Vendedor');
    const itGerado = formData.numero_it.trim() || `${Math.floor(550000 + Math.random() * 50000)}`;

    const isAguardandoData = formData.data_a_definir || formData.situacao === 'Confirmada';

    const created = await addCirurgia({
      numero_it: itGerado,
      data: formData.data_a_definir ? '' : formData.data,
      horario: formData.horario,
      data_a_definir: isAguardandoData,
      hospital_id: formData.hospital_id,
      hospital_nome: hospObj?.nome || 'Hospital Não Especificado',
      medico_id: formData.medico_id,
      medico_nome: medObj?.nome || 'Dr. Médico',
      paciente: formData.paciente,
      paciente_cpf: formData.paciente_cpf,
      convenio_id: formData.convenio_id,
      convenio_nome: convObj?.nome || 'Convênio',
      vendedor_id: finalVendedorId,
      vendedor_nome: finalVendedorNome,
      situacao: formData.situacao,
      status: isAguardandoData ? 'AGUARDANDO_AUTORIZACAO' : 'AUTORIZADA_E_AGENDADA',
      equipamento: formData.equipamento,
      acessorio: formData.acessorio,
      ld_ct: formData.ld_ct,
      material_previsto: formData.material_previsto,
      tecnico_nome: formData.tecnico_nome,
      observacao: formData.observacao,
      empresa_id: 'emp-001',
      created_by: user?.id,
    });

    await logAuditEvent(
      'CREATE_CIRURGIA',
      'MapaCirurgico',
      created.numero_it || created.id,
      {
        cirurgia_id: created.id,
        numero_it: created.numero_it,
        paciente: formData.paciente,
        hospital: hospObj?.nome,
        medico: medObj?.nome,
        vendedor: finalVendedorNome,
        data: formData.data_a_definir ? 'A definir pelo vendedor' : formData.data,
        horario: formData.horario,
        situacao: formData.situacao,
        data_a_definir: isAguardandoData,
        criado_por: user?.nome,
        usuario_email: user?.email,
        papel: role
      },
      'medium'
    );
    setIsModalOpen(false);
  };

  // Salvar a data informada pelo vendedor
  const handleSalvarDataCirurgia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cirurgiaParaAgendar || !dataAgendamento) {
      alert('Por favor, informe a data da cirurgia.');
      return;
    }

    const c = cirurgiaParaAgendar;
    const novaData = dataAgendamento;
    const novoHorario = horarioAgendamento || '08:00';

    await updateCirurgia(c.id, {
      data: novaData,
      horario: novoHorario,
      situacao: 'Agendada',
      status: 'AUTORIZADA_E_AGENDADA',
      data_a_definir: false,
      data_definida_por: user?.nome || 'Vendedor Responsável',
      data_definida_em: new Date().toISOString(),
      observacao: obsAgendamento
        ? `${c.observacao ? c.observacao + ' | ' : ''}Data confirmada pelo vendedor (${user?.nome}): ${obsAgendamento}`
        : c.observacao,
    });

    // Se houver protocolo vinculado na base, sincroniza a data da cirurgia
    const matchingProtocolo = protocolos.find(
      (p) => p.numero_it === c.numero_it || p.id === c.protocolo_id
    );
    if (matchingProtocolo) {
      await updateProtocolo(matchingProtocolo.id, {
        data_cirurgia: novaData,
        status: 'AUTORIZADO',
      });
    }

    await logAuditEvent(
      'DEFINIR_DATA_CIRURGIA',
      'MapaCirurgico',
      c.numero_it || c.id,
      {
        cirurgia_id: c.id,
        numero_it: c.numero_it,
        paciente: c.paciente,
        hospital: c.hospital_nome,
        medico: c.medico_nome,
        vendedor: c.vendedor_nome,
        data_anterior: c.data || 'A definir',
        nova_data: novaData,
        novo_horario: novoHorario,
        definido_por: user?.nome,
        usuario_email: user?.email,
        papel: role,
        observacoes: obsAgendamento,
        situacao_anterior: c.situacao || 'Confirmada',
        nova_situacao: 'Agendada',
      },
      'high'
    );

    setCirurgiaParaAgendar(null);
    setObsAgendamento('');
  };

  // Finalizar cirurgia completamente concluída e redirecionar para a lista de finalizadas
  const handleFinalizarCirurgia = async (c: Cirurgia) => {
    const confirmacao = window.confirm(
      `Confirmar finalização da cirurgia IT ${c.numero_it || c.id} (${c.paciente})?\n\nEsta ação registrará a cirurgia como 100% concluída e a transferirá para a lista de Cirurgias Finalizadas.`
    );
    if (!confirmacao) return;

    const finalizadoEm = new Date().toISOString();
    const finalizadoPor = user?.nome || 'Operador OPME';

    await updateCirurgia(c.id, {
      situacao: 'Finalizada',
      status: 'FINALIZADA',
      finalizada_em: finalizadoEm,
      finalizada_por: finalizadoPor,
      observacao: c.observacao
        ? `${c.observacao} | Finalizada em ${new Date().toLocaleDateString('pt-BR')} por ${finalizadoPor}`
        : `Finalizada em ${new Date().toLocaleDateString('pt-BR')} por ${finalizadoPor}`,
    });

    // Se houver protocolo vinculado, atualiza status para FINALIZADO
    const matchingProtocolo = protocolos.find(
      (p) => p.numero_it === c.numero_it || p.id === c.protocolo_id
    );
    if (matchingProtocolo) {
      await updateProtocolo(matchingProtocolo.id, {
        status: 'FINALIZADO',
      });
    }

    await logAuditEvent(
      'FINALIZAR_CIRURGIA',
      'MapaCirurgico',
      c.numero_it || c.id,
      {
        cirurgia_id: c.id,
        numero_it: c.numero_it,
        paciente: c.paciente,
        hospital: c.hospital_nome,
        medico: c.medico_nome,
        vendedor: c.vendedor_nome,
        situacao_anterior: c.situacao || c.status,
        nova_situacao: 'Finalizada',
        novo_status: 'FINALIZADA',
        finalizada_por: finalizadoPor,
        finalizada_em: finalizadoEm,
        usuario_email: user?.email,
        papel: role,
      },
      'high'
    );

    // Navega imediatamente para a lista de cirurgias finalizadas conforme solicitação
    setActiveTab('finalizadas');
  };

  // Reabrir cirurgia caso necessário
  const handleReabrirCirurgia = async (c: Cirurgia) => {
    const confirmacao = window.confirm(
      `Deseja reabrir a cirurgia IT ${c.numero_it || c.id} (${c.paciente})?\nEla voltará para a lista de cirurgias ativas com situação "Realizada".`
    );
    if (!confirmacao) return;

    await updateCirurgia(c.id, {
      situacao: 'Realizada',
      status: 'REALIZADA',
      finalizada_em: undefined,
      finalizada_por: undefined,
    });

    await logAuditEvent(
      'REABRIR_CIRURGIA',
      'MapaCirurgico',
      c.numero_it || c.id,
      {
        cirurgia_id: c.id,
        numero_it: c.numero_it,
        paciente: c.paciente,
        hospital: c.hospital_nome,
        reaberto_por: user?.nome,
        usuario_email: user?.email,
        papel: role,
      },
      'medium'
    );
  };

  // Helper for KPI Sparklines
  const renderSparkline = (points: number[], strokeColor: string, fillColor?: string) => {
    const width = 120;
    const height = 28;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const coords = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });

    const pathData = `M ${coords.join(' L ')}`;
    const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

    return (
      <svg width={width} height={height} className="overflow-visible">
        {fillColor && <path d={areaData} fill={fillColor} opacity={0.2} />}
        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Banner de Escopo do Vendedor */}
      {isVendedorScope && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-2">
                Mapa Cirúrgico Restrito por Representante
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-[10px] font-black uppercase text-amber-900">
                  Somente Suas Cirurgias
                </span>
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Você só visualiza e edita as cirurgias do seu perfil comercial: <strong>{activeVendedor?.nome || user?.nome}</strong> ({scopedCirurgias.length} cirurgias no seu escopo).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Cirurgias Confirmadas pela OPME Aguardando Definição de Data */}
      {cirurgiasAguardandoData.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-4 text-amber-950 dark:text-amber-100 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 animate-pulse">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-amber-950 dark:text-white">
                  Cirurgias Confirmadas pela OPME — Aguardando Data do Vendedor
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-[10px] font-black text-amber-900 dark:text-amber-100">
                    {cirurgiasAguardandoData.length} pendente{cirurgiasAguardandoData.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <p className="text-[11px] text-amber-900 dark:text-amber-200 mt-0.5">
                  O setor de OPME cadastrou e confirmou as cirurgias abaixo. O vendedor responsável deve informar a data e o horário para agendamento definitivo e liberação dos materiais.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {cirurgiasAguardandoData.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 rounded-xl p-3 shadow-xs flex flex-col justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                      IT {c.numero_it || c.id}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                      Confirmada OPME
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {c.paciente}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {c.hospital_nome} • Dr. {c.medico_nome}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Vendedor: <strong>{c.vendedor_nome || 'Não informado'}</strong>
                  </p>
                  {c.material_previsto && (
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 italic line-clamp-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded">
                      {c.material_previsto}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setCirurgiaParaAgendar(c);
                    setDataAgendamento(c.data || new Date().toISOString().split('T')[0]);
                    setHorarioAgendamento(c.horario || '08:00');
                    setObsAgendamento('');
                  }}
                  className="w-full mt-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Informar Data da Cirurgia
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  Mapa Cirúrgico OPME
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Controle unificado de cirurgias, protocolos OPME, reservas de materiais e atendimento a hospitais.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Date Presets */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setQuickDatePreset('hoje')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  quickDatePreset === 'hoje' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setQuickDatePreset('semana')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  quickDatePreset === 'semana' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => setQuickDatePreset('mes')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  quickDatePreset === 'mes' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Este Mês
              </button>
            </div>

            {/* Date Range Controls */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <span className="text-slate-400 font-normal">até</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Cirurgia OPME
            </button>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Visão Operacional (Overview)
            </button>

            <button
              onClick={() => setActiveTab('agendamento')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'agendamento'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Agenda & Tabela de Cirurgias ({filteredCirurgias.length})
            </button>

            <button
              onClick={() => setActiveTab('finalizadas')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'finalizadas'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cirurgias Finalizadas ({cirurgiasFinalizadas.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dados em tempo real
          </div>
        </div>
      </div>

      {/* ==================== TAB 1: VISÃO OPERACIONAL (OVERVIEW) ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-3.5">
          {/* Operational Overview Charts (Kits por Hospital e Devoluções) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            
            {/* Chart 1: Kits por Hospital Atendido (Donut + Legend) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Kits por Hospital Atendido
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Distribuição %</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
                {/* Donut SVG */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="16" className="dark:stroke-slate-800" />
                    {/* Hospital A: 45% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563EB" strokeWidth="16" strokeDasharray="107 131" strokeDashoffset="0" />
                    {/* Hospital B: 25% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="16" strokeDasharray="60 178" strokeDashoffset="-107" />
                    {/* Hospital C: 15% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="16" strokeDasharray="36 202" strokeDashoffset="-167" />
                    {/* Hospital D: 10% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="16" strokeDasharray="24 214" strokeDashoffset="-203" />
                    {/* Hospital E: 5% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EC4899" strokeWidth="16" strokeDasharray="12 226" strokeDashoffset="-227" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">100%</span>
                    <span className="text-[9px] font-bold text-slate-400">Total Rede</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-1.5 w-full text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      Hosp. Albert Einstein
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">45%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Hosp. Sírio-Libanês
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Hosp. Osvaldo Cruz
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">15%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      Hosp. Samaritano
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">10%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      Outros Hospitais SP/RJ
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 5: Status das Devoluções de Kits */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  Status das Devoluções de Kits (Pós-Cirúrgico)
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Consignado</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
                {/* Donut Chart */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="16" className="dark:stroke-slate-800" />
                    {/* Processadas: 70% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#059669" strokeWidth="16" strokeDasharray="167 71" strokeDashoffset="0" />
                    {/* Em Inspeção: 20% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0284C7" strokeWidth="16" strokeDasharray="48 190" strokeDashoffset="-167" />
                    {/* Pendente de Devolução: 10% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#D97706" strokeWidth="16" strokeDasharray="24 214" strokeDashoffset="-215" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">70%</span>
                    <span className="text-[9px] font-bold text-emerald-600">Concluídas</span>
                  </div>
                </div>

                <div className="space-y-2 w-full text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300">Processadas / Faturadas</p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Gasto conferido com hospital</p>
                    </div>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">70%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-sky-900 dark:text-sky-300">Em Inspeção & Esterilização</p>
                      <p className="text-[9px] text-sky-600 dark:text-sky-400 font-medium">Triagem na central de limpeza</p>
                    </div>
                    <span className="text-sm font-black text-sky-700 dark:text-sky-300">20%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300">Pendente de Devolução</p>
                      <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">Aguardando recolhimento motorista</p>
                    </div>
                    <span className="text-sm font-black text-amber-700 dark:text-amber-300">10%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: Complete Operational OPME Surgical Table Cross-Data */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden space-y-3 p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Tabela Operacional Integrada - Mapa Cirúrgico OPME
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cruzamento em tempo real de pacientes, convênios, cirurgiões, hospitais e materiais cirúrgicos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar kit, paciente, hospital..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-[11px] min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-2.5 pl-3">Nº IT / Cirurgia</th>
                    <th className="p-2.5">Data / Hora Cir.</th>
                    <th className="p-2.5">Hospital / Médico</th>
                    <th className="p-2.5">Paciente / Convênio</th>
                    <th className="p-2.5">Vendedor</th>
                    <th className="p-2.5">Conteúdo OPME Principal</th>
                    <th className="p-2.5 text-right pr-3">Status Logístico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCirurgias.map((c) => {
                    const badge = getStatusBadge(c.situacao || c.status || 'Agendada');
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 pl-3 font-mono">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">IT {c.numero_it || c.id}</span>
                          <p className="text-[9px] text-slate-400 font-medium">Protocolo: {c.numero_protocolo || `PROT-${c.numero_it || c.id}`}</p>
                        </td>

                        <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                          {c.situacao === 'Confirmada' || c.data_a_definir ? (
                            <div>
                              <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black">
                                Data a Definir (Vendedor)
                              </span>
                              {c.data && <p className="text-[9px] text-slate-400 font-normal mt-0.5">{formatDate(c.data)} {c.horario}h</p>}
                            </div>
                          ) : (
                            <>
                              {formatDate(c.data)}
                              <p className="text-[9px] text-slate-400 font-normal">{c.horario}h</p>
                            </>
                          )}
                        </td>

                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.hospital_nome}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{c.medico_nome}</p>
                        </td>

                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.paciente}</p>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {c.convenio_nome}
                          </span>
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{c.vendedor_nome || 'Não informado'}</p>
                        </td>

                        <td className="p-2.5 max-w-[240px]">
                          <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{c.conteudoOpme}</p>
                        </td>

                        <td className="p-2.5 text-right pr-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {(c.situacao === 'Confirmada' || c.data_a_definir) && (
                              <button
                                onClick={() => {
                                  setCirurgiaParaAgendar(c);
                                  setDataAgendamento(c.data || new Date().toISOString().split('T')[0]);
                                  setHorarioAgendamento(c.horario || '08:00');
                                  setObsAgendamento('');
                                }}
                                className="px-2 py-1 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1 shrink-0"
                                title="Vendedor: Informar data da cirurgia"
                              >
                                <Calendar className="w-3 h-3" />
                                Informar Data
                              </button>
                            )}
                            {c.situacao !== 'Finalizada' && c.status !== 'FINALIZADA' ? (
                              <button
                                onClick={() => handleFinalizarCirurgia(c)}
                                className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1 shrink-0 transition-colors"
                                title="Concluir cirurgia e mover para Finalizadas"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Finalizar
                              </button>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                                FINALIZADA
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${badge.bg} ${badge.text}`}>
                              {c.statusLogistico}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 2: AGENDA & TABELA DE CIRURGIAS ==================== */}
      {activeTab === 'agendamento' && (
        <div className="space-y-3.5">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TOTAL CIRURGIAS NO MAPA</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{cirurgias.length}</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">34 Ativas neste mês</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">HOSPITAIS ATENDIDOS</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{hospitais.length}</p>
              <p className="text-[10px] font-bold text-blue-600 mt-0.5">Rede Credenciada SP/RJ/MG</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">MÉDICOS CIRURGIÕES</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{medicos.length}</p>
              <p className="text-[10px] font-bold text-amber-600 mt-0.5">100% CRM Ativo</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, médico ou hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="todos">Todos os Hospitais</option>
                {hospitais.map((h) => (
                  <option key={h.id} value={h.id}>{h.nome}</option>
                ))}
              </select>

              <select
                value={selectedSituacao}
                onChange={(e) => setSelectedSituacao(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="todas">Todas as Situações</option>
                <option value="Agendada">Agendada</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Realizada">Realizada</option>
                <option value="Finalizada">Finalizada</option>
                <option value="Faturada">Faturada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Surgeries Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-[11px] min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-2.5 pl-3.5 w-[12%]">Nº IT / Data</th>
                    <th className="p-2.5 w-[18%]">Hospital</th>
                    <th className="p-2.5 w-[18%]">Médico / Especialidade</th>
                    <th className="p-2.5 w-[18%]">Paciente & Convênio</th>
                    <th className="p-2.5 w-[22%]">Equipamento / Material Previsto</th>
                    <th className="p-2.5 w-[12%]">Situação</th>
                    <th className="p-2.5 text-right pr-3.5 w-[10%]">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {filteredCirurgias.map((c) => {
                    const currentSit = c.situacao || c.status || 'Agendada';
                    const badge = getStatusBadge(currentSit);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 pl-3.5 font-mono">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 whitespace-nowrap">IT {c.numero_it || c.id}</span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                            <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                            {c.situacao === 'Confirmada' || c.data_a_definir ? (
                              <span className="font-bold text-amber-700 dark:text-amber-400">
                                Data a Definir (Vendedor)
                              </span>
                            ) : (
                              <span>{formatDate(c.data)} - {c.horario}h</span>
                            )}
                          </div>
                          {c.data_definida_por && (
                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Data por: {c.data_definida_por}
                            </p>
                          )}
                        </td>

                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-2">{c.hospital_nome}</span>
                          </div>
                        </td>

                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.medico_nome}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{c.vendedor_nome} (Vendedor)</p>
                        </td>

                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.paciente}</p>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-w-full truncate">
                            {c.convenio_nome}
                          </span>
                        </td>

                        <td className="p-2.5">
                          <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{c.material_previsto || 'Não especificado'}</p>
                          {c.equipamento && <p className="text-[9px] text-slate-400 line-clamp-1">Eq: {c.equipamento}</p>}
                        </td>

                        <td className="p-2.5">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border whitespace-nowrap ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                            {(c.situacao === 'Confirmada' || c.data_a_definir) && (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                <AlertCircle className="w-2.5 h-2.5" />
                                Aguardando Data
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-2.5 text-right pr-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {(c.situacao === 'Confirmada' || c.data_a_definir) && (
                              <button
                                onClick={() => {
                                  setCirurgiaParaAgendar(c);
                                  setDataAgendamento(c.data || new Date().toISOString().split('T')[0]);
                                  setHorarioAgendamento(c.horario || '08:00');
                                  setObsAgendamento('');
                                }}
                                className="px-2 py-1 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1 shrink-0"
                                title="Vendedor: Informar data da cirurgia"
                              >
                                <Calendar className="w-3 h-3" />
                                Informar Data
                              </button>
                            )}

                            {/* Botão Finalizar: Conclui e redireciona para a lista de Cirurgias Finalizadas */}
                            {c.situacao !== 'Finalizada' && c.status !== 'FINALIZADA' ? (
                              <button
                                onClick={() => handleFinalizarCirurgia(c)}
                                className="px-2 py-1 text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1 shrink-0 transition-colors"
                                title="Concluir cirurgia e mover para Cirurgias Finalizadas"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Finalizar
                              </button>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                                FINALIZADA
                              </span>
                            )}

                            <select
                              value={currentSit}
                              onChange={(e) => {
                                const newSit = e.target.value as SituacaoCirurgia;
                                if (newSit === 'Finalizada') {
                                  handleFinalizarCirurgia(c);
                                  return;
                                }
                                const isNowConfirmada = newSit === 'Confirmada';
                                updateCirurgia(c.id, {
                                  situacao: newSit,
                                  ...(isNowConfirmada ? { data_a_definir: !c.data || c.data_a_definir } : { data_a_definir: false })
                                });
                                logAuditEvent(
                                  'UPDATE_CIRURGIA_SITUACAO',
                                  'MapaCirurgico',
                                  c.numero_it || c.id,
                                  {
                                    cirurgia_id: c.id,
                                    numero_it: c.numero_it,
                                    paciente: c.paciente,
                                    hospital: c.hospital_nome,
                                    vendedor: c.vendedor_nome,
                                    situacao_anterior: currentSit,
                                    nova_situacao: newSit,
                                    modificado_por: user?.nome,
                                    usuario_email: user?.email,
                                    papel: role,
                                    aguardando_data_vendedor: isNowConfirmada
                                  },
                                  'medium'
                                );
                              }}
                              className="px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none max-w-full"
                            >
                              <option value="Aguardando Autorização">Aguardando Autorização</option>
                              <option value="Em Análise OPME">Em Análise OPME</option>
                              <option value="Confirmada">Confirmada (OPME)</option>
                              <option value="Agendada">Agendada</option>
                              <option value="Em Andamento">Em Andamento</option>
                              <option value="Realizada">Realizada</option>
                              <option value="Finalizada">Finalizada</option>
                              <option value="Faturada">Faturada</option>
                              <option value="Cancelada">Cancelada</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 3: CIRURGIAS FINALIZADAS ==================== */}
      {activeTab === 'finalizadas' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Cirurgias Finalizadas
                </p>
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {cirurgiasFinalizadas.length}
              </p>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Procedimentos 100% Concluídos
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Hospitais Atendidos
                </p>
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/60 rounded-lg text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {new Set(cirurgiasFinalizadas.map(c => c.hospital_id)).size}
              </p>
              <p className="text-[10px] font-bold text-blue-600 mt-0.5">
                Centros cirúrgicos com pós-operatório liberado
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Rastreabilidade & Logs
                </p>
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/60 rounded-lg text-purple-600">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                100%
              </p>
              <p className="text-[10px] font-bold text-purple-600 mt-0.5">
                Registrado com usuário, data e protocolo
              </p>
            </div>
          </div>

          {/* Filters Bar for Finalizadas */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar em finalizadas (paciente, médico, hospital, operador)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="todos">Todos os Hospitais</option>
                {hospitais.map((h) => (
                  <option key={h.id} value={h.id}>{h.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Finalized Surgeries Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden w-full max-w-full">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Lista de Cirurgias Finalizadas ({filteredFinalizadas.length})
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                Status: FINALIZADA
              </span>
            </div>

            {filteredFinalizadas.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nenhuma cirurgia finalizada encontrada
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Assim que uma cirurgia for concluída e você clicar no botão <strong className="text-emerald-600">"Finalizar"</strong> na Visão Geral ou na Agenda, ela aparecerá automaticamente nesta lista com o registro de conclusão e status FINALIZADA.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5 pl-3.5">Nº IT / Cirurgia</th>
                      <th className="p-2.5">Data Cirurgia</th>
                      <th className="p-2.5">Hospital / Médico</th>
                      <th className="p-2.5">Paciente / Convênio</th>
                      <th className="p-2.5">Vendedor</th>
                      <th className="p-2.5">Materiais Previstos / Utilizados</th>
                      <th className="p-2.5">Conclusão / Responsável</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right pr-3.5">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                    {filteredFinalizadas.map((c) => {
                      const badge = getStatusBadge('Finalizada');
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 pl-3.5 font-mono">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">IT {c.numero_it || c.id}</span>
                            <p className="text-[9px] text-slate-400 font-medium">Protocolo: {c.numero_protocolo || `PROT-${c.numero_it || c.id}`}</p>
                          </td>

                          <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                            {formatDate(c.data)}
                            <p className="text-[9px] text-slate-400 font-normal">{c.horario}h</p>
                          </td>

                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.hospital_nome}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{c.medico_nome}</p>
                          </td>

                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.paciente}</p>
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-w-full truncate">
                              {c.convenio_nome}
                            </span>
                          </td>

                          <td className="p-2.5 whitespace-nowrap">
                            <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{c.vendedor_nome || 'Não informado'}</p>
                          </td>

                          <td className="p-2.5 max-w-[220px]">
                            <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                              {c.material_previsto || c.conteudoOpme || 'Material cirúrgico OPME'}
                            </p>
                          </td>

                          <td className="p-2.5">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {c.finalizada_por || 'Operador OPME'}
                              </p>
                              {c.finalizada_em && (
                                <p className="text-[9px] text-slate-400 font-mono">
                                  {new Date(c.finalizada_em).toLocaleDateString('pt-BR')} às {new Date(c.finalizada_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="p-2.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                              <CheckCircle2 className="w-3 h-3" />
                              FINALIZADA
                            </span>
                          </td>

                          <td className="p-2.5 text-right pr-3.5">
                            <button
                              onClick={() => handleReabrirCirurgia(c)}
                              className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                              title="Reabrir cirurgia para edição ativa"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reabrir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================== NEW SURGERY MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Agendar Nova Cirurgia OPME
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Número IT (Identificador de Transação OPME)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 559879 (se vazio, gerado automaticamente)"
                    value={formData.numero_it}
                    onChange={(e) => setFormData({ ...formData, numero_it: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Data da Cirurgia</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Horário Previsto</label>
                  <input
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hospital Atendido</label>
                  <select
                    value={formData.hospital_id}
                    onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    {hospitais.map((h) => (
                      <option key={h.id} value={h.id}>{h.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Médico Cirurgião</label>
                  <select
                    value={formData.medico_id}
                    onChange={(e) => setFormData({ ...formData, medico_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>{m.nome} ({m.crm})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vendedor / Comercial Responsável</label>
                  <select
                    value={formData.vendedor_id}
                    onChange={(e) => setFormData({ ...formData, vendedor_id: e.target.value })}
                    disabled={isVendedorScope}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none disabled:opacity-75"
                  >
                    {vendedores.map((v) => (
                      <option key={v.id} value={v.id}>{v.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome do Paciente</label>
                  <input
                    type="text"
                    placeholder="Nome completo do paciente..."
                    value={formData.paciente}
                    onChange={(e) => setFormData({ ...formData, paciente: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Operadora / Convênio</label>
                  <select
                    value={formData.convenio_id}
                    onChange={(e) => setFormData({ ...formData, convenio_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    {convenios.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Situação do Registro OPME</label>
                  <select
                    value={formData.situacao}
                    onChange={(e) => {
                      const newSit = e.target.value as SituacaoCirurgia;
                      setFormData({
                        ...formData,
                        situacao: newSit,
                        data_a_definir: newSit === 'Confirmada' ? true : formData.data_a_definir,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    <option value="Confirmada">Confirmada (Aguardando Data do Vendedor)</option>
                    <option value="Agendada">Agendada (Data já confirmada)</option>
                    <option value="Aguardando Autorização">Aguardando Autorização</option>
                    <option value="Em Análise OPME">Em Análise OPME</option>
                  </select>
                </div>

                {/* Checkbox Data a Definir pelo Vendedor */}
                <div className="sm:col-span-2 p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.data_a_definir}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_a_definir: e.target.checked,
                          situacao: e.target.checked ? 'Confirmada' : formData.situacao,
                        })
                      }
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4 text-amber-600" />
                        Cirurgia Confirmada — Data a ser informada pelo vendedor
                      </span>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                        Ao marcar esta opção, o status é registrado como <strong>Confirmada</strong>. Assim que o vendedor responsável acessar o sistema, ele verá a cirurgia autorizada e preencherá a data e o horário definitivos.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Materiais OPME Previstos & Kit Solicitado</label>
                  <textarea
                    rows={2}
                    placeholder="Descreva as próteses, instrumental, parafusos ou caixa de instrumentação necessária..."
                    value={formData.material_previsto}
                    onChange={(e) => setFormData({ ...formData, material_previsto: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  Confirmar Cadastro OPME
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL DEFINIR DATA DA CIRURGIA (VENDEDOR) ==================== */}
      {cirurgiaParaAgendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Definir Data da Cirurgia Confirmada
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Protocolo IT {cirurgiaParaAgendar.numero_it || cirurgiaParaAgendar.id} • Vendedor: {cirurgiaParaAgendar.vendedor_nome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCirurgiaParaAgendar(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumo da cirurgia confirmada pela OPME */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Paciente:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{cirurgiaParaAgendar.paciente}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Hospital:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{cirurgiaParaAgendar.hospital_nome}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Médico Cirurgião:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{cirurgiaParaAgendar.medico_nome}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Convênio:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{cirurgiaParaAgendar.convenio_nome}</span>
              </div>
              {cirurgiaParaAgendar.material_previsto && (
                <div className="border-t border-amber-200/60 dark:border-amber-800/40 pt-1.5 mt-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Materiais Previstos:</span>
                  <span className="font-medium text-amber-900 dark:text-amber-200 line-clamp-2 text-[11px]">
                    {cirurgiaParaAgendar.material_previsto}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p>
                O setor de OPME já cadastrou e confirmou esta cirurgia. Ao salvar a data e o horário, o status da cirurgia mudará automaticamente para <strong>Agendada</strong> e ficará disponível para a logística de entrega.
              </p>
            </div>

            <form onSubmit={handleSalvarDataCirurgia} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Data da Cirurgia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dataAgendamento}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Horário Previsto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={horarioAgendamento}
                    onChange={(e) => setHorarioAgendamento(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Observações do Vendedor / Agendamento (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Confirmado com o Dr. Médico para início na sala 03 às 08h..."
                  value={obsAgendamento}
                  onChange={(e) => setObsAgendamento(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCirurgiaParaAgendar(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar e Agendar Cirurgia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};
