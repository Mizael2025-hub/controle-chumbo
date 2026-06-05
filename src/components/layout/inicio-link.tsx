import Link from 'next/link'

export function InicioLink() {
  return (
    <Link
      href="/"
      className="text-sm text-apple-blue min-h-[44px] inline-flex items-center w-fit"
      data-testid="link-inicio"
    >
      Início
    </Link>
  )
}
