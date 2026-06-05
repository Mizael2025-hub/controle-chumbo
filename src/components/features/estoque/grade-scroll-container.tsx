import type { ReactNode } from 'react'

/** Largura mínima de cada célula na grade (touch target em mobile). */
export const GRADE_CELULA_MIN_PX = 72

type Props = {
  colunas: number
  children: ReactNode
  testId?: string
}

export function GradeScrollContainer({ colunas, children, testId }: Props) {
  return (
    <div
      className="overflow-x-auto overscroll-x-contain -mx-4 px-4 scrollbar-hide"
      data-testid={testId}
    >
      <div
        className="grid gap-2 w-max min-w-full overflow-visible py-1"
        style={{
          gridTemplateColumns: `repeat(${colunas}, minmax(${GRADE_CELULA_MIN_PX}px, ${GRADE_CELULA_MIN_PX}px))`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
