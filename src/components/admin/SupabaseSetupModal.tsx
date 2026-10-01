import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, X, ShieldCheck, Key, Download } from 'lucide-react';
import { saveSupabaseCredentials, clearSupabaseCredentials, IS_SUPABASE_CONFIGURED, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase/client';
import schemaSql from '../../lib/supabase/schema.sql?raw';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState(SUPABASE_URL.includes('demo') ? '' : SUPABASE_URL);
  const [keyInput, setKeyInput] = useState(SUPABASE_ANON_KEY.includes('demo') ? '' : SUPABASE_ANON_KEY);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([schemaSql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presty_medick_schema_v2.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput || !keyInput) return;
    saveSupabaseCredentials(urlInput, keyInput);
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/80 rounded-xl border border-blue-200 dark:border-blue-800">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Conexão com Banco Supabase</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure suas chaves da nuvem ou use o blueprint SQL completo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Credenciais de API
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Esquema SQL (DDL Produção)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'config' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${IS_SUPABASE_CONFIGURED ? 'text-emerald-600' : 'text-amber-500'}`} />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Status Atual: {IS_SUPABASE_CONFIGURED ? 'Conectado ao Supabase Cloud' : 'Modo Protótipo Local (Demonstração)'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {IS_SUPABASE_CONFIGURED
                      ? 'Sua aplicação está sincronizando dados diretamente com seu projeto Supabase.'
                      : 'Você pode utilizar o sistema com o motor local ou conectar seu próprio projeto no Supabase preenchendo os dados abaixo.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Supabase Project URL</label>
                <input
                  type="url"
                  placeholder="https://seu-projeto.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full mt-1.5 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Supabase Anon Public Key</label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full mt-1.5 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {IS_SUPABASE_CONFIGURED ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                  >
                    Desconectar banco e voltar ao modo local
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Salvar e Conectar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  Script DDL de criação de tabelas, enums, triggers RLS e seed inicial (`src/lib/supabase/schema.sql`).
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSQL}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar .sql
                  </button>
                  <button
                    onClick={handleCopySQL}
                    className="px-3 py-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'SQL Copiado!' : 'Copiar SQL Completo'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-60 border border-slate-800 space-y-1">
                <span className="text-slate-500">-- Script DDL Completo (500+ linhas prontas para execução):</span>
                <p className="text-emerald-400">CREATE EXTENSION IF NOT EXISTS "uuid-ossp";</p>
                <p className="text-blue-400">CREATE TYPE app_role AS ENUM ('admin','user','editor','supervisor','comercial','financeiro','motorista','gestor_frota','estoque');</p>
                <p className="text-amber-300">CREATE TABLE public.empresa (...);</p>
                <p className="text-amber-300">CREATE TABLE public.profiles (...);</p>
                <p className="text-amber-300">CREATE TABLE public.user_roles (...);</p>
                <p className="text-amber-300">CREATE TABLE public.cirurgias (...);</p>
                <p className="text-amber-300">CREATE TABLE public.protocolos (...);</p>
                <p className="text-amber-300">CREATE TABLE public.produtos (...);</p>
                <p className="text-amber-300">CREATE TABLE public.veiculos (...);</p>
                <p className="text-emerald-400">ALTER TABLE ... ENABLE ROW LEVEL SECURITY;</p>
                <p className="text-sky-400">CREATE TRIGGER trg_mov_apply_saldo ...;</p>
                <p className="text-purple-400">INSERT INTO storage.buckets ... ('vistorias-frota', 'documentos');</p>
                <p className="text-slate-400">... [Clique em 'Copiar SQL Completo' ou 'Baixar .sql' para obter o script na íntegra]</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  Instruções para provisionar no Supabase:
                </p>
                <ol className="list-decimal pl-4 space-y-1 font-medium text-slate-500 dark:text-slate-400">
                  <li>Acesse o painel do seu projeto no Supabase (<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-500 underline">supabase.com/dashboard</a>)</li>
                  <li>No menu lateral esquerdo, clique em <strong>SQL Editor</strong></li>
                  <li>Clique em <strong>+ New Query</strong></li>
                  <li>Cole o script completo (copiado pelo botão acima)</li>
                  <li>Clique no botão verde <strong>Run</strong></li>
                  <li>Todas as tabelas, RLS, triggers e seed inicial serão gerados instantaneamente</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
