import type { UserProfile, AppRole, Vendedor, ProtocoloOPME, Cirurgia } from '../types';

/**
 * Localiza o Vendedor correspondente ao usuário logado.
 */
export function getActiveVendedor(
  user: UserProfile | null,
  vendedores: Vendedor[]
): Vendedor | undefined {
  if (!user || !vendedores || !vendedores.length) return undefined;

  // 1. Vínculo direto por vendedor_id salvo no perfil
  if (user.vendedor_id) {
    const v = vendedores.find((x) => x.id === user.vendedor_id);
    if (v) return v;
  }

  // 2. Vínculo por vendedor_nome salvo no perfil
  if (user.vendedor_nome) {
    const v = vendedores.find(
      (x) => x.nome.trim().toLowerCase() === user.vendedor_nome?.trim().toLowerCase()
    );
    if (v) return v;
  }

  // 3. Correspondência por user_id ou id
  const byUserId = vendedores.find((x) => x.user_id === user.id || x.id === user.id);
  if (byUserId) return byUserId;

  // 4. Correspondência por e-mail
  if (user.email) {
    const userEmail = user.email.trim().toLowerCase();
    const byEmail = vendedores.find(
      (x) => x.email && x.email.trim().toLowerCase() === userEmail
    );
    if (byEmail) return byEmail;
  }

  // 5. Correspondência por nome completo
  if (user.nome) {
    const normalizedUser = user.nome.trim().toLowerCase();
    const byName = vendedores.find((x) => {
      const normalizedVend = x.nome.trim().toLowerCase();
      return (
        normalizedVend === normalizedUser ||
        normalizedVend.includes(normalizedUser) ||
        normalizedUser.includes(normalizedVend)
      );
    });
    if (byName) return byName;
  }

  // 6. Fallback quando perfil está operando como vendedor (ex: primeiro vendedor ativo)
  return vendedores[0];
}

/**
 * Verifica se a role é administradora ou gestora.
 */
export function isAdminOrGestor(role: AppRole): boolean {
  return role === 'admin' || role === 'gestor';
}

/**
 * Verifica se a cirurgia pertence ao vendedor especificado.
 */
export function isCirurgiaOfVendedor(
  cirurgia: Cirurgia,
  vendedor: Vendedor | undefined
): boolean {
  if (!vendedor) return false;
  if (cirurgia.vendedor_id && cirurgia.vendedor_id === vendedor.id) return true;
  if (cirurgia.vendedor_nome && vendedor.nome) {
    return cirurgia.vendedor_nome.trim().toLowerCase() === vendedor.nome.trim().toLowerCase();
  }
  return false;
}

/**
 * Verifica se o protocolo pertence ao vendedor especificado.
 */
export function isProtocoloOfVendedor(
  protocolo: ProtocoloOPME | undefined,
  vendedor: Vendedor | undefined
): boolean {
  if (!protocolo || !vendedor) return false;
  if (protocolo.vendedor_id && protocolo.vendedor_id === vendedor.id) return true;
  if (protocolo.vendedor_nome && vendedor.nome) {
    return protocolo.vendedor_nome.trim().toLowerCase() === vendedor.nome.trim().toLowerCase();
  }
  return false;
}

/**
 * Regra de negócio Master:
 * - Quem pode autorizar são os administradores e os vendedores com as suas respectivas cirurgias.
 * - Um vendedor não pode autorizar a cirurgia de outro vendedor.
 */
export function canUserAuthorize(
  role: AppRole,
  protocolo: ProtocoloOPME | undefined,
  activeVendedor: Vendedor | undefined
): boolean {
  if (isAdminOrGestor(role)) return true;
  if (role === 'vendedor' || (role as string) === 'comercial') {
    return isProtocoloOfVendedor(protocolo, activeVendedor);
  }
  return false;
}

/**
 * Verifica se o usuário pode definir/informar a data da cirurgia confirmada pela OPME.
 * Administradores, gestores ou o vendedor responsável pela respectiva cirurgia.
 */
export function canUserSetSurgeryDate(
  role: AppRole,
  cirurgia: Cirurgia,
  activeVendedor: Vendedor | undefined
): boolean {
  if (isAdminOrGestor(role)) return true;
  if (role === 'vendedor' || (role as string) === 'comercial') {
    return isCirurgiaOfVendedor(cirurgia, activeVendedor);
  }
  return false;
}
