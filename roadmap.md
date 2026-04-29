# Roadmap

Este roadmap reorganiza os itens pendentes da proposta em fases, no mesmo estilo do `README`, e acrescenta melhorias pragmáticas para o estado atual do app.

| Fase | Status | Descrição |
|------|--------|-----------|
| 1 — Shell + Navegação | ✅ Completo | Workspace, grade de disciplinas, sidebar |
| 2 — Editor | ✅ Completo | CodeMirror, auto-save, paleta de comandos |
| 3 — Preview + Geração | 🔄 Em progresso | Consolidar UX de geração, feedback em tempo real e robustez do pipeline de preview/exportação |
| 4 — Polish | ⏳ Planejado | Animações de painel, stagger de listas, busca fuzzy e atalhos documentados na interface |
| 5 — Confiabilidade de Edição | ⏳ Planejado | Resolver melhor conflitos de edição externa, permitir comparar/recarregar conteúdo e criar histórico ou backup por arquivo |
| 6 — Operação de Conteúdo | ⏳ Planejado | Exportar disciplina completa em `.zip`, com fontes e artefatos gerados, e melhorar ações em lote |
| 7 — Distribuição e Update | ⏳ Planejado | Validar release real do updater ponta a ponta e endurecer o fluxo de instalação/atualização |
| 8 — Arquitetura | ⏳ Planejado | Reduzir acoplamento de `App.tsx`, modularizar o frontend e aproximar a estrutura da arquitetura proposta |

## Detalhamento por fase

### 3 — Preview + Geração

- Refinar estados de geração com mensagens mais específicas por etapa e erro.
- Destacar com mais clareza o que está `ok`, `desatualizado` e `sem output`.
- Permitir reabrir rapidamente o artefato gerado além de abrir só a pasta.
- Melhorar diagnóstico quando preview ou geração falharem por asset ausente, runtime quebrado ou caminho inválido.

### 4 — Polish

- Adicionar transições de painel com Framer Motion sem deixar a navegação pesada.
- Aplicar stagger curto nas listas de disciplinas, aulas e atividades.
- Evoluir a command palette para busca fuzzy real.
- Exibir atalhos relevantes na UI, principalmente no editor e nas ações de geração.
- Revisar microcopy de erros, estados vazios e ações destrutivas.

### 5 — Confiabilidade de Edição

- Substituir o aviso passivo de modificação externa por um fluxo com ações explícitas:
  - recarregar do disco
  - manter versão local
  - comparar diferenças
- Criar histórico simples por arquivo com restauração rápida.
- Considerar autosave com snapshots locais antes de sobrescrever conteúdo divergente.
- Trocar polling por watcher/event stream real quando essa mudança compensar o custo de implementação.

### 6 — Operação de Conteúdo

- Exportar uma disciplina inteira em `.zip` com `aulas/`, `atividades/`, `slides/`, `pdfs/`, `.conf` e arquivos-base.
- Adicionar filtros rápidos na tela da disciplina: todos, sem output, desatualizados.
- Permitir geração em lote seletiva, não só "gerar tudo".
- Incluir indicadores de progresso mais úteis para lotes longos, com item atual, total e falhas acumuladas.

### 7 — Distribuição e Update

- Fazer uma release real de teste com tag publicada e validar download, instalação e reinício do app.
- Revisar o texto da experiência de atualização para ficar claro quando há nova versão, erro de rede ou instalação concluída.
- Verificar estratégia de rollback ou recuperação quando a atualização falhar.

### 8 — Arquitetura

- Quebrar `App.tsx` em módulos por responsabilidade sem refatoração cosmética.
- Mover navegação baseada em estado local para roteamento formal quando o fluxo estiver estável.
- Centralizar estado compartilhado que hoje está pulverizado em `useState`.
- Padronizar queries, invalidações e loading states num fluxo mais previsível.
- Aproximar a estrutura de pastas da proposta: `features/`, `shared/`, `hooks/`, `store/` e `tokens/`.

## Ideias Extras

- Adicionar uma visão "Hoje" ou "Pendências" com tudo que está sem output ou desatualizado no workspace.
- Criar um modo de revisão para impressão, focado em atividade, paginação e quebras visuais.
- Permitir templates por disciplina além do template global.
- Mostrar prévia das cores/logo/background diretamente nas configurações.
- Adicionar um pequeno changelog embutido na tela de atualização do app.
