# Ponto de Restauração — Navegação

Backup criado em **2026-06-05** antes da reconfiguração de navegação web/mobile.

## Como voltar ao estado anterior

```bash
# Ver o commit de backup
git log --oneline -3
git tag -l "restore/*"

# Restaurar todos os arquivos ao estado do backup
git checkout restore/pre-nav-2026-06-05 -- .

# Ou resetar o branch inteiro (descarta alterações posteriores)
git reset --hard restore/pre-nav-2026-06-05
```

Após restaurar, reinstale dependências se necessário:

```bash
npm install
npm run dev
```

## Tag

- `restore/pre-nav-2026-06-05` — estado funcional com hub na home e header global (sem sidebar/dock).
