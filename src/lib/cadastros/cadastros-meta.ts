import type { TipoCadastro } from '@/repositories/cadastro-repository'

export type CadastroMeta = {
  tipo: TipoCadastro
  titulo: string
  descricao: string
  href: string
  testId: string
}

export const CADASTROS_META: CadastroMeta[] = [
  {
    tipo: 'ligas',
    titulo: 'Ligas',
    descricao: 'Tipos de liga de chumbo e cores na grade',
    href: '/configuracoes/cadastros/ligas',
    testId: 'cadastro-ligas',
  },
  {
    tipo: 'setores',
    titulo: 'Setores',
    descricao: 'Setores da fábrica e tipos de produção',
    href: '/configuracoes/cadastros/setores',
    testId: 'cadastro-setores',
  },
  {
    tipo: 'destinos_saida',
    titulo: 'Destinos de saída',
    descricao: 'Destinos para liberação e baixa de montes',
    href: '/configuracoes/cadastros/destinos',
    testId: 'cadastro-destinos',
  },
  {
    tipo: 'maquinas',
    titulo: 'Máquinas',
    descricao: 'Máquinas vinculadas aos setores',
    href: '/configuracoes/cadastros/maquinas',
    testId: 'cadastro-maquinas',
  },
  {
    tipo: 'operadores',
    titulo: 'Operadores',
    descricao: 'Operadores de produção para apontamento',
    href: '/configuracoes/cadastros/operadores',
    testId: 'cadastro-operadores',
  },
  {
    tipo: 'turnos',
    titulo: 'Turnos',
    descricao: 'Turnos de trabalho',
    href: '/configuracoes/cadastros/turnos',
    testId: 'cadastro-turnos',
  },
  {
    tipo: 'modelos_produto',
    titulo: 'Modelos de grade',
    descricao: 'Grade da teleira — polaridade e placas por grade',
    href: '/configuracoes/cadastros/modelos',
    testId: 'cadastro-modelos',
  },
]
