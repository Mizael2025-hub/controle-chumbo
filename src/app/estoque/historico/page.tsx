import { redirect } from 'next/navigation'

export default function EstoqueHistoricoPage() {
  redirect('/relatorios?aba=saidas')
}
