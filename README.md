<p align="center">
  <img src="lumen_studio_lockup.svg" alt="Lumen Studio" height="60" />
</p>

<p align="center">
  Ferramenta de autoria para professores criarem slides e atividades a partir de Markdown — sem fricção, sem servidores.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.2.1-ffb938?style=flat-square&labelColor=171c26" alt="version" />
  <img src="https://img.shields.io/badge/platform-Windows-8b95a8?style=flat-square&labelColor=171c26" alt="platform" />
  <img src="https://img.shields.io/badge/built%20with-Tauri%202%20%2B%20React%2019-f0ede6?style=flat-square&labelColor=171c26" alt="stack" />
</p>

---

## O que é

**Lumen Studio** é uma aplicação desktop para professores que querem transformar conteúdo em Markdown em slides `.pptx` e atividades `.pdf` — sem depender de ferramentas online, sem conta em nuvem, sem instalação complexa.

O fluxo é simples: escreva em Markdown, gere o arquivo, compartilhe. Cada disciplina vive como uma pasta no sistema de arquivos. Nada é perdido se o app for desinstalado.

## Capacidades principais

**Edição focada** — Editor CodeMirror 6 com ocultação automática de blocos técnicos (frontmatter YAML, CSS de tema, comentários de apresentador). Você vê apenas o que importa.

**Geração de artefatos** — Aulas viram `.pptx` via [Marp CLI](https://github.com/marp-team/marp-cli). Atividades viram `.pdf` via Chrome headless. Um botão, arquivo pronto.

**Status em tempo real** — Cada conteúdo exibe `◉ ok`, `◎ desatualizado` ou `○ sem arquivo`, calculado comparando o `.md` com o artefato gerado. Você sempre sabe o que precisa ser regerado.

**Auto-save com detecção de drift** — O editor salva automaticamente após 800ms de inatividade e avisa se o arquivo foi modificado externamente enquanto você editava.

**Workspace local** — Nenhum banco de dados. Cada disciplina é uma pasta com `.conf` JSON e arquivos `.md`. Funciona em qualquer diretório, inclusive repositórios Git existentes.

## Começando

### Instalação

acesse a [página de releases](https://github.com/mateusflorez/lumen-studio/releases) e baixe o instalador para Windows.

## Roadmap

| Fase | Status | Descrição |
|------|--------|-----------|
| 1 — Shell + Navegação | ✅ Completo | Workspace, grade de disciplinas, sidebar |
| 2 — Editor | ✅ Completo | CodeMirror, auto-save, paleta de comandos |
| 3 — Preview + Geração | 🔄 Em progresso | Preview Marp iframe, preview PDF A4, UI de geração |
| 4 — Polish | ⏳ Planejado | Animações Framer Motion, busca fuzzy, configurações de disciplina |

---

<p align="center">
  Feito para professores que preferem escrever a formatar.
</p>
