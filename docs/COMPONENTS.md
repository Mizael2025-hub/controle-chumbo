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

// Tab Bar Mobile
<nav className="fixed bottom-0 h-16 w-full apple-blur border-t border-zinc-200/50 flex items-center justify-around pb-safe z-50">
  {/* Ícones Lucide: w-5 h-5, strokeWidth={1.5} */}
</nav>
```

---

## 5. Modal (iOS Share Sheet)

```tsx
<div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
  <div className="bg-white w-full sm:w-96 rounded-t-ios-modal sm:rounded-ios-card p-6 animate-in slide-in-from-bottom duration-300 ease-out pb-safe">
    <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-4 sm:hidden" />
    <h2 className="text-xl font-semibold mb-4">Título</h2>
    {/* Rodapé de ações — usar .modal-actions para respiro acima da borda inferior */}
    <div className="flex gap-2 modal-actions">
      <button type="button" className="flex-1 ...">Cancelar</button>
      <button type="submit" className="flex-1 ...">Confirmar</button>
    </div>
  </div>
</div>
```

> **Rodapé de ações:** aplicar a classe `modal-actions` no contêiner dos botões do rodapé (definida em `globals.css`) para evitar que encostem na borda arredondada do modal no desktop (`pb-safe` zera o padding inferior fora de dispositivos com safe area).

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
