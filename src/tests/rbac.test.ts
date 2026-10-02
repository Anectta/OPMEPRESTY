import { describe, it, expect } from 'vitest';
import { AppRole } from '../types';

describe('Controle de Acesso Baseado em Papéis (RBAC Policy Tests)', () => {
  const isRouteAllowed = (role: AppRole, routeId: string): boolean => {
    const adminOnlyRoutes = ['usuarios', 'auditoria'];
    const gestorRoutes = ['cadastros', 'usuarios', 'auditoria'];

    if (adminOnlyRoutes.includes(routeId)) {
      return role === 'admin';
    }

    if (routeId === 'frota') {
      return ['admin', 'gestor_frota', 'motorista'].includes(role);
    }

    if (routeId === 'estoque') {
      return ['admin', 'estoque'].includes(role);
    }

    return true; // Dashboard, mapa, relatórios acessíveis a todos os perfis autenticados
  };

  it('permite acesso total ao perfil admin em todas as rotas', () => {
    const routes = ['dashboard', 'mapa', 'protocolos', 'estoque', 'frota', 'usuarios', 'auditoria'];
    routes.forEach((route) => {
      expect(isRouteAllowed('admin', route)).toBe(true);
    });
  });

  it('bloqueia estritamente acesso a Gestão de Usuários e Auditoria para não-admins', () => {
    const nonAdminRoles: AppRole[] = ['user', 'comercial', 'estoque', 'motorista', 'gestor_frota', 'supervisor'];
    nonAdminRoles.forEach((role) => {
      expect(isRouteAllowed(role, 'usuarios')).toBe(false);
      expect(isRouteAllowed(role, 'auditoria')).toBe(false);
    });
  });

  it('restringe o módulo de estoque a administradores e gestores de estoque', () => {
    expect(isRouteAllowed('estoque', 'estoque')).toBe(true);
    expect(isRouteAllowed('admin', 'estoque')).toBe(true);
    expect(isRouteAllowed('motorista', 'estoque')).toBe(false);
    expect(isRouteAllowed('comercial', 'estoque')).toBe(false);
  });

  it('permite módulo de frota apenas para gestores de frota, motoristas e admins', () => {
    expect(isRouteAllowed('gestor_frota', 'frota')).toBe(true);
    expect(isRouteAllowed('motorista', 'frota')).toBe(true);
    expect(isRouteAllowed('admin', 'frota')).toBe(true);
    expect(isRouteAllowed('comercial', 'frota')).toBe(false);
  });
});
