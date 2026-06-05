# DESIGN_TOKENS.md — Tokens Tailwind do Design System

> Classes referenciadas em `docs/COMPONENTS.md`. Copie estes trechos para `tailwind.config.ts` e `globals.css` ao scaffoldar o Next.js.

---

## tailwind.config.ts — Extensões

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        'apple-red': '#FF3B30',
        'apple-green': '#34C759',
        'apple-blue': '#007AFF',
      },
      borderRadius: {
        'ios-btn': '12px',
        'ios-card': '16px',
        'ios-modal': '20px',
      },
    },
  },
}

export default config
```

---

## globals.css — Utilitários Customizados

```css
/* globals.css */

.apple-pressable {
  @apply active:scale-95 transition-transform duration-150;
}

.apple-blur {
  @apply backdrop-blur-md bg-white/80 dark:bg-zinc-900/80;
}

/* Safe area para notch/home indicator em mobile */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## Regras de Uso

- **Somente** classes Tailwind + tokens deste arquivo.
- shadcn/ui opcional — visual final sempre iOS.
- **Nunca** CSS modules ou estilos inline.
- Ícones: Lucide React, `w-5 h-5`, `strokeWidth={1.5}`.
- Touch target mínimo: 44px de altura em botões.
- Font-size mínimo 16px em inputs (previne zoom no iOS).

---

## Referência Rápida

| Token | Classe | Uso |
|---|---|---|
| Botão arredondado | `rounded-ios-btn` | Botões, inputs |
| Card arredondado | `rounded-ios-card` | Cards, containers |
| Modal arredondado | `rounded-ios-modal` | Modais mobile |
| Press feedback | `apple-pressable` | Botões interativos |
| Blur de header | `apple-blur` | Navbar, TabBar |
| Vermelho sistema | `apple-red` | Erros, ações destrutivas |
| Safe area bottom | `pb-safe` | TabBar, modais mobile |
