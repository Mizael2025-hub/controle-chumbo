# novo_projeto.md — Especificação para reconstrução do módulo de chumbo (do zero)

> **Implementação canônica (Fase A):** regras em [`docs/BUSINESS_RULES.md`](docs/BUSINESS_RULES.md), schema em [`docs/DATABASE.md`](docs/DATABASE.md), decisões de produto em [`docs/ENTREVISTA_PROJETO.md`](docs/ENTREVISTA_PROJETO.md). Este arquivo permanece como visão de produto e critérios de aceite do MVP.

## 1) Objetivo do produto (o “porquê”)
Substituir o controle manual de estoque de chumbo (anotações) por um sistema digital que:

- Espelhe **fielmente** a disposição física dos montes no chão de fábrica.
- Controle com exatidão **peso (kg)** e **quantidade de barras**.
- Funcione **100% offline** durante a operação, com sincronização quando houver internet, mas ao iniciar obrigatório ter internet pra garantir que tudo esteja sincronizado.
- Garanta **rastreabilidade/auditoria** (o que aconteceu, quando, por quem, e em qual posição).

## 3) Escopo do módulo (o que entra)
### 3.1 Estoque (espelho físico)
- Visualizar estoque por **Liga → Lotes → Grade de Montagens (Montes/Pilhas)**.
- Cada lote possui uma **grade 2D** configurável (até **10 colunas × 5 linhas**).
- Cada célula representa um **Monte/Pilha** com:
  - kg atuais
  - barras atuais
  - status operacional
  - posição (x, y)
- O usuário pode operar em montes:
  - **Reservar**
  - **Cancelar reserva**
  - **Baixar parcialmente**
  - **Baixar totalmente**
  - **Mover para setor** / **Devolver ao almoxarifado**

### 3.2 Entrada (cadastro de lote e montes)
- Criar e editar **Lotes** com:
  - número do lote
  - data de chegada
  - totais iniciais (kg e barras) para auditoria
- Criar e editar a **grade de montes** do lote (kg e barras por posição).

### 3.3 Saída (liberação/baixa direta)
- Registrar saídas do estoque com:
  - destino (texto ou lista, definido no projeto)
  - data/hora
  - baixa parcial ou total por monte
  - possibilidade de agrupar uma “liberação” com múltiplos montes
- Permitir **estorno** (reversão) de uma liberação, com rastreabilidade.

### 3.4 Consumo (apontamento diário de produção)
Registrar consumo diário de chumbo com contexto operacional:

- data
- setor e/ou máquina
- operador e turno
- liga e lote do chumbo
- barras consumidas
- borra (kg) e observações
- forma de seleção de montes:
  - **automática** (o sistema escolhe quais montes serão abatidos)
  - **manual** (o usuário escolhe os montes)

O consumo deve:
- Validar saldo disponível no **setor** antes de confirmar.
- Gerar um detalhamento de **alocações por monte** (quais montes pagaram o consumo).

### 3.5 Relatórios e auditoria
Relatório por período com filtros para:
- Entradas (lotes)
- Saídas/liberações
- Reservas (e eventos)
- Consumo (apontamentos e métricas)

Requisitos:
- Filtros persistentes durante a navegação (sem perder o contexto ao editar um item).
- Visualização e navegação do detalhe até o evento/registro origem.

### 3.6 Cadastros base (configurações)
Manter cadastros que suportam o consumo e relatórios:
- ligas (inclui cor/paleta)
- setores (inclui tipo)
- máquinas (vinculadas a setor)
- operadores
- turnos
- modelos de produto

## 4) Multiusuário (requisito confirmado)
### 4.1 Modelo de dados compartilhado
- **Todos os usuários autenticados** veem e operam **o mesmo estoque e os mesmos relatórios** (mesma fábrica).

### 4.2 Perfis e permissões

> **Atualizado na Fase A (2026-06-02):** modelo canônico em [`docs/BUSINESS_RULES.md`](docs/BUSINESS_RULES.md) §1.  
> Resumo: **`operador`** = operador de setor (consumo + leitura do estoque); **`admin`** = PCP (acesso total); **`supervisor`** reservado no schema, não usado no MVP.

O sistema deve ter **roles** (`operador`, `supervisor`, `admin`) com regras claras:

- **operador**: ver estoque (leitura), registrar consumo, ver relatórios.
- **admin (PCP)**: estoque completo (reservar/baixar/mover), estornos, cadastros, consumo, export CSV, gerir usuários, ajustes críticos.
- **supervisor**: *(não usado no MVP — ver BUSINESS_RULES)*

Requisitos:
- A UI deve esconder/desabilitar ações não permitidas.
- Toda ação sensível deve deixar trilha de auditoria (quem/quando/o quê).


## 6) Regras de negócio (normativas)
### 6.1 Fonte da verdade do estoque
- O **saldo operacional** do lote é sempre calculado a partir das **pilhas** (montes).
- O lote pode guardar apenas totais iniciais como histórico/auditoria, mas **não** deve ser a fonte da verdade do saldo atual.

### 6.2 Status de pilha e significados
Status possíveis:
- **DISPONIVEL**: disponível para reserva/baixa.
- **RESERVADO**: reservado (comprometido), mas ainda fisicamente presente.
- **PARCIAL**: já sofreu baixa parcial (permanece na mesma posição).
- **CONSUMIDO**: baixado totalmente (kg/barras viram 0), mas a célula continua existindo para espelho e rastreio.

### 6.3 Regras de reserva
- Reserva **não reduz** kg/barras; apenas marca o compromisso.
- Reserva deve registrar: para qual destino/setor (ou motivo), e quando.
- Deve ser possível cancelar reserva (com registro no histórico).

### 6.4 Regras de baixa (saída/liberação)
Ao registrar uma baixa:
- Pode ser parcial (reduz kg/barras) ou total (zera e marca como CONSUMIDO).
- Deve gerar registro histórico (transação) com destino e data/hora.
- Deve manter a posição do monte na grade (não “reorganizar automaticamente”).

### 6.5 Movimentação física (almoxarifado ↔ setor)
O sistema deve suportar marcar quando um monte:
- foi movido para um setor (passa a “estar no setor”)
- foi devolvido ao almoxarifado

Requisitos:
- A movimentação não é baixa; é localização.
- Deve existir histórico de movimentações (eventos).

### 6.6 Consumo diário
O consumo é informado em **barras** (e borra em kg) e precisa:
- Deduzir saldo dos montes elegíveis (tipicamente montes “no setor”).
- Gerar alocações por monte para auditoria e revisão.
- Impedir confirmação se não houver saldo suficiente no setor/liga/lote escolhido.

### 6.7 Consistências e validações
Regras mínimas:
- Pesos e barras não podem ficar negativos.
- Ao marcar CONSUMED: kg=0, barras=0 e limpar flags/campos de reserva relacionados.
- Relatórios devem bater com os registros de transações/consumo/eventos.

## 11) Critérios de aceite (MVP)
O módulo será considerado pronto quando:

- **Estoque**:
  - cria ligas, lotes e montes na grade
  - calcula saldos do lote por soma das pilhas (disponível/reservado/no estoque)
  - reserva e cancela reserva com histórico
  - baixa parcial/total com histórico
  - mantém CONSUMED na grade com kg/barras = 0
- **Entrada**:
  - cadastra lote com data, número e totais iniciais
  - cadastra grade do lote com kg/barras por posição
- **Consumo**:
  - registra consumo diário com operador/turno/setor/máquina
  - valida saldo e gera alocações por monte
  - permite editar consumo sem quebrar a consistência do estoque
- **Relatórios**:
  - filtra por período e exibe entradas/saídas/reservas/consumo
  - permite navegar até detalhes e (se permitido por role) estornar uma liberação
- **Offline**:
  - todas as operações acima funcionam sem internet
  - ao voltar online, sincroniza sem perder dados e converge em múltiplos dispositivos
- **Multiusuário**:
  - usuários autenticados veem o mesmo estoque e as mesmas operações
  - ações sensíveis respeitam roles e ficam auditáveis

