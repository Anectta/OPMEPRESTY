import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AppRole } from '../../types';
import { 
  Users, UserPlus, Shield, Mail, Key, ShieldCheck, CheckCircle2, Check, X, Lock, 
  Save, RotateCcw, Sliders, Eye, FileText, Download, Pencil, Trash2, Search, 
  UserCheck, UserX, AlertTriangle, Filter 
} from 'lucide-react';

interface UserItem {
  id: string;
  nome: string;
  email: string;
  role: AppRole;
  cargo: string;
  status: 'Ativo' | 'Inativo';
}

interface OperationalPermission {
  ver: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
  aprovar: boolean;
  exportar: boolean;
  auditar: boolean;
}

type RolePermissionsMap = Record<string, Record<string, OperationalPermission>>;

const DEFAULT_OPERATIONAL_MODULES = [
  'Dashboard Executivo',
  'Mapa Cirúrgico',
  'Mapa de Calor Operacional',
  'Protocolos & Cotação OPME',
  'Estoque & Lotes Consignados',
  'Vendas & Comissões',
  'Pedidos & Faturamento SEFAZ',
  'Frota & Rastreamento GPS',
  'Gestão de Motoristas',
  'Rotas & Entregas Cirúrgicas',
  'Cadastros Auxiliares (Hospitais/Médicos)',
  'Auditoria & Trilha de Logs',
  'Gestão de Usuários & RBAC',
];

const DEFAULT_ROLES = [
  { id: 'admin', label: 'Admin Geral' },
  { id: 'gerente_ops', label: 'Gerente Ops' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'estoque', label: 'Estoque OPME' },
  { id: 'frota', label: 'Gestor de Frota' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'auditor', label: 'Auditor' },
  { id: 'motorista', label: 'Motorista' },
];

export const GestaoUsuarios: React.FC = () => {
  const { role, signup, logAuditEvent } = useAuth();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'rbac'>('usuarios');
  const [selectedRole, setSelectedRole] = useState<string>('gerente_ops');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Users list state (Initial Mock)
  const [usersList, setUsersList] = useState<UserItem[]>([
    { id: 'usr-1', nome: 'Carlos Amorim', email: 'admin@prestymedick.com.br', role: 'admin', cargo: 'Diretor de Operações OPME', status: 'Ativo' },
    { id: 'usr-2', nome: 'Lucas Guimarães', email: 'lucas.g@prestymedick.com.br', role: 'comercial', cargo: 'Representante Comercial', status: 'Ativo' },
    { id: 'usr-3', nome: 'Mariana Duarte', email: 'mariana.d@prestymedick.com.br', role: 'estoque', cargo: 'Gestora de Almoxarifado', status: 'Ativo' },
    { id: 'usr-4', nome: 'Sérgio Ramos', email: 'sergio.r@prestymedick.com.br', role: 'motorista', cargo: 'Motorista de Entregas', status: 'Ativo' },
    { id: 'usr-5', nome: 'Aline Castro', email: 'aline.c@prestymedick.com.br', role: 'financeiro', cargo: 'Analista de Faturamento', status: 'Ativo' },
  ]);

  // Form for new user
  const [createFormData, setCreateFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    password: 'DefaultPass123!',
    role: 'comercial' as AppRole,
    status: 'Ativo' as 'Ativo' | 'Inativo',
  });

  // Form for editing user
  const [editFormData, setEditFormData] = useState<UserItem>({
    id: '',
    nome: '',
    email: '',
    cargo: '',
    role: 'comercial' as AppRole,
    status: 'Ativo',
  });

  // RBAC permissions matrix state indexed by [role][module]
  const [rbacMatrix, setRbacMatrix] = useState<RolePermissionsMap>(() => {
    const initial: RolePermissionsMap = {};
    DEFAULT_ROLES.forEach((r) => {
      initial[r.id] = {};
      DEFAULT_OPERATIONAL_MODULES.forEach((mod) => {
        const isAdmin = r.id === 'admin';
        const isOps = r.id === 'gerente_ops';
        const isAudit = r.id === 'auditor';

        initial[r.id][mod] = {
          ver: true,
          criar: isAdmin || isOps || (r.id === 'comercial' && mod.includes('Vendas')) || (r.id === 'estoque' && mod.includes('Estoque')),
          editar: isAdmin || isOps || (r.id === 'estoque' && mod.includes('Estoque')),
          excluir: isAdmin,
          aprovar: isAdmin || isOps || (r.id === 'financeiro' && mod.includes('Faturamento')),
          exportar: isAdmin || isOps || isAudit,
          auditar: isAdmin || isAudit,
        };
      });
    });
    return initial;
  });

  // Toggle single cell permission
  const handleTogglePermission = (moduleName: string, actionKey: keyof OperationalPermission) => {
    setRbacMatrix((prev) => {
      const currentRoleObj = { ...prev[selectedRole] };
      const currentModObj = { ...currentRoleObj[moduleName] };

      currentModObj[actionKey] = !currentModObj[actionKey];
      currentRoleObj[moduleName] = currentModObj;

      return {
        ...prev,
        [selectedRole]: currentRoleObj,
      };
    });
  };

  // Toggle full row permissions
  const handleToggleRowAll = (moduleName: string) => {
    setRbacMatrix((prev) => {
      const currentRoleObj = { ...prev[selectedRole] };
      const currentModObj = { ...currentRoleObj[moduleName] };

      const allTrue = Object.values(currentModObj).every(Boolean);
      const updatedValue = !allTrue;

      const updatedModObj: OperationalPermission = {
        ver: updatedValue,
        criar: updatedValue,
        editar: updatedValue,
        excluir: updatedValue,
        aprovar: updatedValue,
        exportar: updatedValue,
        auditar: updatedValue,
      };

      currentRoleObj[moduleName] = updatedModObj;

      return {
        ...prev,
        [selectedRole]: currentRoleObj,
      };
    });
  };

  const handleSaveMatrix = () => {
    logAuditEvent('UPDATE_RBAC_MATRIX', 'GestaoUsuarios', selectedRole, { matrixRole: selectedRole });
    setSaveSuccessMessage(`Matriz de permissões salva com sucesso para o papel "${DEFAULT_ROLES.find(r => r.id === selectedRole)?.label}"!`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // --- CRUD FUNCTIONS ---

  // 1. CREATE USER
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.email || !createFormData.nome) return;

    const newU: UserItem = {
      id: `usr-${Date.now()}`,
      nome: createFormData.nome,
      email: createFormData.email,
      role: createFormData.role,
      cargo: createFormData.cargo || `Papel: ${createFormData.role.toUpperCase()}`,
      status: createFormData.status,
    };

    setUsersList((prev) => [newU, ...prev]);
    logAuditEvent('CREATE_USER_ADMIN', 'GestaoUsuarios', newU.id, { email: newU.email, role: newU.role, status: newU.status }, 'high');
    
    // Reset and close
    setCreateFormData({
      nome: '',
      email: '',
      cargo: '',
      password: 'DefaultPass123!',
      role: 'comercial',
      status: 'Ativo',
    });
    setIsCreateModalOpen(false);

    setSaveSuccessMessage(`Usuário "${newU.nome}" cadastrado com sucesso!`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // 2. OPEN EDIT USER MODAL
  const handleOpenEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditFormData({ ...u });
  };

  // 2b. UPDATE USER
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;

    setUsersList((prev) =>
      prev.map((u) => (u.id === editFormData.id ? { ...editFormData } : u))
    );

    logAuditEvent('UPDATE_USER_ADMIN', 'GestaoUsuarios', editFormData.id, { 
      nome: editFormData.nome, 
      email: editFormData.email, 
      role: editFormData.role, 
      cargo: editFormData.cargo,
      status: editFormData.status 
    }, 'medium');

    setEditingUser(null);
    setSaveSuccessMessage(`Usuário "${editFormData.nome}" atualizado com sucesso!`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // 3. TOGGLE USER STATUS (QUICK ACTION)
  const handleToggleUserStatus = (u: UserItem) => {
    const newStatus = u.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setUsersList((prev) =>
      prev.map((item) => (item.id === u.id ? { ...item, status: newStatus } : item))
    );

    logAuditEvent('TOGGLE_USER_STATUS', 'GestaoUsuarios', u.id, { newStatus }, 'medium');
    setSaveSuccessMessage(`Status de "${u.nome}" alterado para ${newStatus}.`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // 4. CONFIRM DELETE USER
  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;

    setUsersList((prev) => prev.filter((u) => u.id !== deletingUser.id));
    logAuditEvent('DELETE_USER_ADMIN', 'GestaoUsuarios', deletingUser.id, { email: deletingUser.email }, 'critical');

    const deletedName = deletingUser.nome;
    setDeletingUser(null);
    setSaveSuccessMessage(`Usuário "${deletedName}" removido permanentemente.`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // --- FILTERED USERS ---
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'todos' || u.role === filterRole;
    const matchesStatus = filterStatus === 'todos' || u.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestão de Usuários & Permissões
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Administração completa de contas de acesso (CRUD) com controle por papéis e permissões granulares.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {activeTab === 'usuarios' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </button>
          )}

          {activeTab === 'rbac' && (
            <button
              onClick={handleSaveMatrix}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Permissões
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-3">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'usuarios'
              ? 'border-slate-600 text-slate-700 dark:border-slate-400 dark:text-slate-300'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários Cadastrados ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'rbac'
              ? 'border-slate-600 text-slate-700 dark:border-slate-400 dark:text-slate-300'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Permissões ({DEFAULT_OPERATIONAL_MODULES.length})
        </button>
      </div>

      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Tab 1: Users List with full CRUD */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">USUÁRIOS ATIVOS</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {usersList.filter((u) => u.status === 'Ativo').length} / {usersList.length} Credenciais
              </p>
              <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Autenticação JWT Sincronizada</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PERFIS DE RLS ATIVOS</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">8 Níveis</p>
              <p className="text-[11px] font-bold text-blue-600 mt-0.5">Admin, Gerente, Comercial, Estoque, Frota, Fin., Auditor, Motorista</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">STATUS SEFAZ / RLS</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">100% Protegido</p>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">Isolamento Multitenant Ativo</p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filtros:
              </span>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="todos">Todos os Papéis</option>
                <option value="admin">Admin</option>
                <option value="gerente_ops">Gerente Ops</option>
                <option value="comercial">Comercial</option>
                <option value="estoque">Estoque</option>
                <option value="gestor_frota">Gestor de Frota</option>
                <option value="motorista">Motorista</option>
                <option value="financeiro">Financeiro</option>
                <option value="auditor">Auditor</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="Ativo">Apenas Ativos</option>
                <option value="Inativo">Apenas Inativos</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden w-full max-w-full min-w-0">
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[10px] uppercase font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-4">Nome do Usuário</th>
                    <th className="p-3.5">E-mail Corporativo</th>
                    <th className="p-3.5">Papel RLS (Role)</th>
                    <th className="p-3.5">Cargo / Função</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-4">Ações (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        Nenhum usuário encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 pl-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xs uppercase shrink-0">
                              {u.nome.charAt(0)}
                            </div>
                            <span>{u.nome}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 font-medium">{u.email}</td>
                        <td className="p-3.5 font-bold uppercase text-blue-600 dark:text-blue-400">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">{u.cargo}</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="cursor-pointer"
                            title="Clique para alternar status (Ativo/Inativo)"
                          >
                            {u.status === 'Ativo' ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                Ativo
                              </span>
                            ) : (
                              <span className="text-rose-700 dark:text-rose-400 font-extrabold text-[10px] bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1">
                                <UserX className="w-3 h-3" />
                                Inativo
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="p-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                              title="Editar Usuário"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          
          {/* Role Selector Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-extrabold text-xs tracking-wider uppercase">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>SELECIONAR PAPEL OPERACIONAL:</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {DEFAULT_ROLES.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-[10px] uppercase font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 pl-6 text-slate-800 dark:text-slate-200 font-black">
                      MÓDULOS OPERACIONAIS ({DEFAULT_OPERATIONAL_MODULES.length})
                    </th>
                    <th className="p-4 text-center w-20">VER</th>
                    <th className="p-4 text-center w-20">CRIAR</th>
                    <th className="p-4 text-center w-20">EDITAR</th>
                    <th className="p-4 text-center w-20">EXCLUIR</th>
                    <th className="p-4 text-center w-20">APROVAR</th>
                    <th className="p-4 text-center w-20">EXPORTAR</th>
                    <th className="p-4 text-center w-20 pr-6">AUDITAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {DEFAULT_OPERATIONAL_MODULES.map((moduleName) => {
                    const modulePerms = rbacMatrix[selectedRole]?.[moduleName] || {
                      ver: false,
                      criar: false,
                      editar: false,
                      excluir: false,
                      aprovar: false,
                      exportar: false,
                      auditar: false,
                    };

                    return (
                      <tr key={moduleName} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 pl-6 font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between group">
                          <span>{moduleName}</span>
                          <button
                            onClick={() => handleToggleRowAll(moduleName)}
                            className="text-[10px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-extrabold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer ml-2 shrink-0"
                            title="Alternar todas as permissões deste módulo"
                          >
                            Desabilitar
                          </button>
                        </td>

                        {(['ver', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'auditar'] as (keyof OperationalPermission)[]).map(
                          (actionKey) => {
                            const isAllowed = modulePerms[actionKey];

                            return (
                              <td key={actionKey} className="p-3 text-center align-middle">
                                <button
                                  onClick={() => handleTogglePermission(moduleName, actionKey)}
                                  className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                                    isAllowed
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 shadow-xs'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-600 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-400'
                                  }`}
                                  title={`Clique para ${isAllowed ? 'remover' : 'conceder'} permissão de ${actionKey.toUpperCase()} em ${moduleName}`}
                                >
                                  {isAllowed ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-4 h-4 stroke-[2]" />}
                                </button>
                              </td>
                            );
                          }
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Legend & Quick Info */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <span className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                  Permitido
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                  <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <X className="w-3.5 h-3.5 stroke-[2]" />
                  </span>
                  Bloqueado
                </span>
              </div>

              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                Políticas RLS aplicadas em nível de Schema PostgreSQL (ROW LEVEL SECURITY)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create New User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Criar Novo Usuário no Sistema
            </h2>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Roberto Silva"
                  value={createFormData.nome}
                  onChange={(e) => setCreateFormData({ ...createFormData, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">E-mail Corporativo</label>
                <input
                  type="email"
                  placeholder="roberto.s@prestymedick.com.br"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Cargo / Função</label>
                <input
                  type="text"
                  placeholder="Ex: Coordenador de Logística"
                  value={createFormData.cargo}
                  onChange={(e) => setCreateFormData({ ...createFormData, cargo: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Papel de Acesso (Role RLS)</label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as AppRole })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="admin">Admin Geral (Acesso Total)</option>
                  <option value="gerente_ops">Gerente Ops</option>
                  <option value="comercial">Comercial</option>
                  <option value="estoque">Estoque OPME</option>
                  <option value="gestor_frota">Gestor de Frota</option>
                  <option value="motorista">Motorista</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Status Inicial</label>
                <select
                  value={createFormData.status}
                  onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value as 'Ativo' | 'Inativo' })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Cadastrar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-600" />
              Editar Usuário
            </h2>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">E-mail Corporativo</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Cargo / Função</label>
                <input
                  type="text"
                  value={editFormData.cargo}
                  onChange={(e) => setEditFormData({ ...editFormData, cargo: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Papel de Acesso (Role RLS)</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as AppRole })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="admin">Admin Geral (Acesso Total)</option>
                  <option value="gerente_ops">Gerente Ops</option>
                  <option value="comercial">Comercial</option>
                  <option value="estoque">Estoque OPME</option>
                  <option value="gestor_frota">Gestor de Frota</option>
                  <option value="motorista">Motorista</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'Ativo' | 'Inativo' })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Excluir Usuário</h3>
                <p className="text-xs text-slate-500">Ação irreversível</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Tem certeza que deseja excluir permanentemente o usuário <strong className="text-slate-900 dark:text-white">{deletingUser.nome}</strong> (<span className="font-mono text-slate-500">{deletingUser.email}</span>)?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


