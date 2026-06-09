import type { LucideIcon } from 'lucide-react'
import {
  ClipboardList,
  FileBarChart,
  Flame,
  Home,
  Package,
  PackagePlus,
  Settings,
} from 'lucide-react'
import type { UsuarioRole } from '@/lib/types/usuario-role'

export type NavItemPrincipal = {
  id: string
  rotuloWeb: string
  rotuloMobile: string
  href: string
  icone: LucideIcon
  match: (pathname: string) => boolean
}

export type NavItemAdicionar = {
  id: string
  rotulo: string
  href: string
  icone: LucideIcon
  corIcone: string
  visivelPara: (role: UsuarioRole | null) => boolean
}

function matchExato(href: string) {
  return (pathname: string) => pathname === href
}

function matchPrefixo(href: string) {
  return (pathname: string) => pathname === href || pathname.startsWith(`${href}/`)
}

export const NAV_ITENS_PRINCIPAIS: NavItemPrincipal[] = [
  {
    id: 'inicio',
    rotuloWeb: 'Página Principal',
    rotuloMobile: 'Página Principal',
    href: '/',
    icone: Home,
    match: matchExato('/'),
  },
  {
    id: 'estoque',
    rotuloWeb: 'Estoque',
    rotuloMobile: 'Estoque',
    href: '/estoque',
    icone: Package,
    match: (pathname) =>
      pathname === '/estoque' ||
      (pathname.startsWith('/estoque/') && !pathname.startsWith('/estoque/contagem')),
  },
  {
    id: 'relatorio',
    rotuloWeb: 'Relatório',
    rotuloMobile: 'Relatório',
    href: '/relatorios',
    icone: FileBarChart,
    match: matchPrefixo('/relatorios'),
  },
  {
    id: 'config',
    rotuloWeb: 'Config',
    rotuloMobile: 'Configuração',
    href: '/configuracoes/cadastros',
    icone: Settings,
    match: matchPrefixo('/configuracoes'),
  },
]

export const NAV_ITENS_ADICIONAR: NavItemAdicionar[] = [
  {
    id: 'contagem',
    rotulo: 'Contagem',
    href: '/estoque/contagem',
    icone: ClipboardList,
    corIcone: 'bg-violet-500',
    visivelPara: (role) => role === 'admin' || role === 'operador',
  },
  {
    id: 'entrada',
    rotulo: 'Entrada',
    href: '/entrada',
    icone: PackagePlus,
    corIcone: 'bg-apple-green',
    visivelPara: (role) => role === 'admin',
  },
  {
    id: 'consumo',
    rotulo: 'Consumo',
    href: '/consumo',
    icone: Flame,
    corIcone: 'bg-amber-500',
    visivelPara: (role) => role === 'admin' || role === 'operador',
  },
]

export function filtrarItensAdicionar(role: UsuarioRole | null): NavItemAdicionar[] {
  return NAV_ITENS_ADICIONAR.filter((item) => item.visivelPara(role))
}

export function podeUsarNavegacao(role: UsuarioRole | null): boolean {
  return role === 'admin' || role === 'operador'
}
