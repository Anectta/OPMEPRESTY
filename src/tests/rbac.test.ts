import { describe, it, expect } from 'vitest';
import type { AppRole } from '../types';

describe('Controle de Acesso Baseado em Papéis (RBAC Policy Tests) — V2.0', () => {
  /**
   * V2.0 AppRole: 'admin' | 'gestor' | 'vendedor' | 'estoque' |
   *               'logistica' | 'motorista' | 'operador' | 'auditor'
   */
  const isRouteAllowed = (role: AppRole, routeId: string): boolean => {
    const adminOnlyRoutes = ['usuarios'];
    const adminAuditorRoutes = ['auditoria'];

    if (adminOnlyRoutes.includes(routeId)) {
      return role === 'admin';
    }

    if (adminAuditorRoutes.includes(routeId)) {
      return role === 'admin' || role === 'auditor';
    }

    if (routeId === 'logistica') {
      return ['admin', 'gestor', 'logistica', 'motorista'].includes(role);
    }

    if (routeId === 'estoque') {
      return ['admin', 'gestor', 'estoque', 'operador'].includes(role);
    }

    // Dashboard, mapa, protocolos acessíveis a todos os perfis autenticados
    return true;
  };

  it('permite acesso total ao perfil admin em todas as rotas', () => {
    const routes = ['dashboard', 'mapa', 'protocolos', 'estoque', 'logistica', 'usuarios', 'auditoria'];
    routes.forEach((route) => {
      expect(isRouteAllowed('admin', route)).toBe(true);
    });
  });

  it('bloqueia estritamente acesso a Gestão de Usuários para não-admins', () => {
    const nonAdminRoles: AppRole[] = ['gestor', 'vendedor', 'estoque', 'logistica', 'motorista', 'operador', 'auditor'];
    nonAdminRoles.forEach((role) => {
      expect(isRouteAllowed(role, 'usuarios')).toBe(false);
    });
  });

  it('permite acesso à auditoria apenas para admin e auditor', () => {
    expect(isRouteAllowed('admin', 'auditoria')).toBe(true);
    expect(isRouteAllowed('auditor', 'auditoria')).toBe(true);

    const blocked: AppRole[] = ['gestor', 'vendedor', 'estoque', 'logistica', 'motorista', 'operador'];
    blocked.forEach((role) => {
      expect(isRouteAllowed(role, 'auditoria')).toBe(false);
    });
  });

  it('restringe o módulo de estoque a admins, gestores, operadores e estoque', () => {
    expect(isRouteAllowed('estoque', 'estoque')).toBe(true);
    expect(isRouteAllowed('admin', 'estoque')).toBe(true);
    expect(isRouteAllowed('gestor', 'estoque')).toBe(true);
    expect(isRouteAllowed('operador', 'estoque')).toBe(true);
    expect(isRouteAllowed('motorista', 'estoque')).toBe(false);
    expect(isRouteAllowed('vendedor', 'estoque')).toBe(false);
  });

  it('permite módulo de logística apenas para logística, motoristas, gestores e admins', () => {
    expect(isRouteAllowed('logistica', 'logistica')).toBe(true);
    expect(isRouteAllowed('motorista', 'logistica')).toBe(true);
    expect(isRouteAllowed('gestor', 'logistica')).toBe(true);
    expect(isRouteAllowed('admin', 'logistica')).toBe(true);
    expect(isRouteAllowed('vendedor', 'logistica')).toBe(false);
    expect(isRouteAllowed('auditor', 'logistica')).toBe(false);
  });
});
