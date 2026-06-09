# COMPONENTS.md — Catálogo de Componentes UI (Design System iOS)

> Referência obrigatória para interfaces. Tokens: `docs/DESIGN_TOKENS.md`.
> shadcn/ui é opcional — se usar, aplicar classes/tokens iOS por cima. O visual segue **este** catálogo.

---

## 1. Botões

```tsx
// Primário
<button className="apple-pressable bg-blue-500 text-white font-medium px-4 py-2 rounded-ios-btn transition-all duration-300 min-h-[44px]">
  Confirmar
</button>

// Secundário / Destrutivo
<button className="apple-pressable bg-apple-red/10 text-apple-red font-medium px-4 py-2 rounded-ios-btn transition-all duration-300 min-h-[44px]">
  Excluir
</button>
```

---

## 2. Cards e Containers

```tsx
<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card shadow-sm">
  <h3 className="font-semibold text-lg mb-2">Título do Card</h3>
  <p className="text-zinc-500 text-sm">Descrição.</p>
</div>
```

---

## 3. Inputs

```tsx
// Padrão
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-zinc-700">Nome</label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[16px]"
    placeholder="Digite..."
    data-testid="input-nome"
  />
</div>

// Data (dd/MM/aaaa na UI — calendário nativo ao toque)
import { DataInputPtBr } from '@/components/ui/data-input-pt-br'

<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-zinc-700" htmlFor="data-evento">Data do Evento</label>
  <DataInputPtBr
    id="data-evento"
    value={dataUi}
    onChange={setDataUi}
    data-testid="input-data"
  />
</div>

// Com erro
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-apple-red">Valor</label>
  <input
    type="number"
    className="w-full px-3 py-2 border border-apple-red/10 bg-apple-red/5 text-apple-red rounded-ios-btn focus:outline-none text-[16px] tabular-nums"
  />
  <span className="text-[12px] text-apple-red">Valor inválido.</span>
</div>
```

---

## 4. Layout

```tsx
// Header
<header className="sticky top-0 h-14 w-full apple-blur border-b border-zinc-200/50 flex items-center justify-between px-4 z-50">
  <h1 className="font-semibold text-lg">Módulo</h1>
  {/* HeaderSyncStatus aqui */}
</header>

// Tab Bar Mobile (pílula flutuante — classe .app-dock-mobile em globals.css)
<nav className="app-dock-mobile" aria-label="Navegação inferior">
  {/* 5 itens: Início, Estoque, + central, Relatório, Configuração */}
</nav>

// body com dock visível — padding no main via CSS
<body data-dock-visible="true">
  <main className="app-main-scroll">{/* padding-bottom: var(--dock-reserva) no mobile */}</main>
</body>

// Sidebar Web (lg+)
<aside className="hidden lg:flex fixed inset-y-0 left-0 w-[240px] bg-nav-sidebar text-white">
  {/* Itens + botão "Adicionar novo" com menu popover lateral */}
</aside>
```

---

## 5. Modal (iOS Share Sheet)

```tsx
import { ModalOverlay } from '@/components/ui/modal-overlay'

<ModalOverlay aberto variante="sheet" nivel="base">
  <button type="button" className="absolute inset-0" aria-label="Fechar" />
  <div className="modal-card mobile-sheet-card" role="dialog" aria-modal="true">
    <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-4 sm:hidden" />
    <h2 className="text-xl font-semibold mb-4">Título</h2>
    <div className="flex gap-2 modal-actions">
      <button type="button" className="btn-modal-cancel">Cancelar</button>
      <button type="submit" className="apple-pressable flex-1 min-h-[44px] rounded-ios-btn bg-apple-blue text-white font-medium">Confirmar</button>
    </div>
  </div>
</ModalOverlay>
```

> **Contraste iOS:** usar `.btn-modal-cancel`, `.btn-modal-secondary` e `.modal-card` (CSS com `prefers-color-scheme`) — não depender de `dark:` Tailwind para fundo/texto crítico.

> **Z-index mobile:** header 50 → dock 100 → contextual 110 → modal base 200 → modal nested 210 (tokens `--z-mobile-*` em `globals.css`).

> **Rodapé de ações:** classe `modal-actions` no contêiner dos botões (definida em `globals.css`).

---

## 6. Tela de Sem Internet (Login Gate)

```tsx
<div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
  <WifiOff className="w-12 h-12 text-amber-500" />
  <h1 className="text-xl font-semibold">Sem conexão com a internet</h1>
  <p className="text-zinc-500 text-center">
    Conecte-se à internet para abrir ou entrar no sistema.
  </p>
</div>
```

---

## Regras Gerais

- Ícones: Lucide React, `w-5 h-5`, `strokeWidth={1.5}`
- Cores: Tailwind + tokens de `docs/DESIGN_TOKENS.md`
- Toast: Sonner (`toast.success`, `toast.error`, `toast.info`)
- Mobile-first: 375px (celular) e tablet **1200×1920 px** (primário — ver `BUSINESS_RULES.md` §4)
- Touch target mínimo: 44px
- Input font-size mínimo: 16px
- Datas: sempre `dd/MM/aaaa` na UI
- `data-testid` em elementos interativos críticos
