import { redirect } from 'next/navigation'

/** Saída unificada ao painel de Estoque — mantém compatibilidade de URLs antigas. */
export default function SaidaPage() {
  redirect('/estoque')
}
