# Proposal: Formatting Toolbar + Image Pipeline

**Data:** 2026-05-09  
**Status:** Rascunho

---

## Contexto

O editor atual (CodeMirror 6) é funcional mas expõe uma superfície de escrita crua, sem assistência para as construções mais comuns de Marp/Markdown. Dois problemas reais foram identificados:

1. **Sem atalhos de formatação** — inserir uma tabela, um slide break ou uma imagem requer digitar a sintaxe de cor, o que cria fricção especialmente para professores menos familiarizados com Markdown.
2. **Imagens não renderizam no preview** — caminhos relativos como `../assets/exemplo.png` não resolvem dentro do webview do Tauri porque o preview não tem base URL apontando para o workspace.

---

## O Que Será Construído

### 1. Barra de Formatação Sticky (`FormattingToolbar`)

Uma faixa horizontal posicionada entre o cabeçalho da tela de editor e o CodeMirror. Ela começa inline e vira `position: sticky; top: 0` conforme o usuário scrolla, mantendo os atalhos sempre visíveis.

#### Botões planejados

| Grupo | Botão | Ação inserida no cursor |
|-------|-------|------------------------|
| Estrutura | `H1` | `# ` no início da linha |
| Estrutura | `H2` | `## ` |
| Estrutura | `H3` | `### ` |
| Formatação | `N` (negrito) | `**texto**` |
| Formatação | `I` (itálico) | `*texto*` |
| Formatação | `código` | `` `código` `` |
| Conteúdo | `Tabela` | Template 3×2 com header |
| Conteúdo | `Slide ---` | Insere `\n---\n` (separador de slide Marp) |
| Conteúdo | `Imagem` | Abre seletor de arquivo → pipeline completo (ver abaixo) |

Seleção de texto existente: quando há texto selecionado e o botão é ativado, o texto é envolvido pela sintaxe (ex: `**seleção**`). Sem seleção, é inserido um placeholder.

#### Integração com o CodeMirror

`MarkdownEditor` passará para fora uma `ref` com o `EditorView`. A toolbar recebe essa ref e usa `view.dispatch({ changes: { from, insert } })` para todas as inserções, preservando o histórico de undo nativo do editor.

```typescript
// MarkdownEditor expõe:
export type EditorHandle = { view: EditorView };
const ref = useImperativeHandle(handleRef, () => ({ view: viewRef.current! }));
```

### 2. Pipeline de Imagem

Fluxo ao clicar em "Imagem":

```
Usuário clica → open() (Tauri dialog) → arquivo selecionado
  → invoke("copy_asset_to_subject", { workspacePath, subjectSlug, sourcePath })
  → Rust copia para <subject>/assets/<nome-do-arquivo>
  → retorna { relativePath: "../assets/nome.png" }
  → toolbar insere ![](../assets/nome.png) no cursor
```

#### Novo comando Rust: `copy_asset_to_subject`

```rust
#[tauri::command]
async fn copy_asset_to_subject(
    workspace_path: String,
    subject_slug: String,
    source_path: String,
) -> Result<CopyAssetResult, String>
```

- Cria `<workspace>/<subject>/assets/` se não existir.
- Valida que `source_path` não escapa do workspace (path traversal check).
- Se o arquivo já existe, acrescenta sufixo numérico (`nome_2.png`) em vez de sobrescrever.
- Retorna `{ relative_path: "../assets/nome.png" }` — relativo ao `aulas/` ou `atividades/` onde o `.md` mora.

#### TypeScript result type

```typescript
interface CopyAssetResult {
  relative_path: string; // "../assets/nome.png"
  file_name: string;     // "nome.png"
}
```

### 3. Correção de Imagens no Preview

#### Diagnóstico

`MarpPreview` e `ActivityPreview` servem o conteúdo dentro de um `<iframe>` ou `<webview>`. Caminhos relativos como `../assets/foto.png` não resolvem porque o webview não tem `base` URL apontando para o diretório do arquivo `.md`.

Existem dois caminhos:

**Opção A — Converter para URI de arquivo (recomendada)**  
Antes de passar `content` para o preview, substituir caminhos de imagem relativos pelo URI absoluto do arquivo em disco usando `convertFileSrc` do Tauri:

```typescript
import { convertFileSrc } from "@tauri-apps/api/core";

function resolveImagePaths(content: string, mdFilePath: string): string {
  const mdDir = mdFilePath.substring(0, mdFilePath.lastIndexOf("/"));
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    if (src.startsWith("http") || src.startsWith("asset://")) return match;
    const absPath = resolvePath(mdDir, src); // resolve relativo → absoluto
    return `![${alt}](${convertFileSrc(absPath)})`;
  });
}
```

O `convertFileSrc` converte `C:\...\assets\foto.png` → `asset://localhost/C:/...` que o webview aceita.

**Opção B — Injetar `<base>` tag no HTML do preview**  
Adicionar `<base href="file:///caminho/do/md/">` no HTML gerado pelo preview antes de passar para o iframe. Mais simples mas pode quebrar links internos do Marp.

→ **Opção A é preferida**: não altera o HTML, opera só no conteúdo Markdown antes da renderização.

#### Onde aplicar

Em `EditorScreen.tsx`, antes de passar `editorContent` para `MarpPreview` e `ActivityPreview`:

```typescript
const resolvedContent = editorDocument
  ? resolveImagePaths(editorContent, editorDocument.absolutePath)
  : editorContent;
```

Isso requer expor o `absolutePath` do arquivo no tipo `EditableContentFile` (atualmente não existe). O Rust já sabe o caminho completo — basta incluir no retorno de `read_content_file`.

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/MarkdownEditor.tsx` | Expõe `EditorHandle` via `forwardRef` + `useImperativeHandle` |
| `src/components/FormattingToolbar.tsx` | **Novo** — barra de formatação |
| `src/screens/EditorScreen.tsx` | Monta toolbar, passa handle do editor, aplica `resolveImagePaths` |
| `src/App.tsx` | Passa `subjectSlug` para `EditorScreen` (já pode estar disponível via `selectedSubjectSlug`) |
| `src/App.css` | Estilos da toolbar sticky |
| `src-tauri/src/lib.rs` | Novo comando `copy_asset_to_subject`; expõe `absolute_path` em `EditableContentFile` |
| `src/types.ts` | `EditableContentFile` recebe campo `absolutePath: string` |
| `src/utils.ts` | Nova função `resolveImagePaths` |

---

## Design da Toolbar

```
┌─────────────────────────────────────────────────────────────────┐
│  H1  H2  H3  │  N  I  `  │  ─── Tabela  │  🖼 Imagem            │
└─────────────────────────────────────────────────────────────────┘
```

- Fundo: `var(--bg-elevated)` com borda inferior `var(--border)`
- Fonte: `var(--font-ui)` 0.75rem, uppercase, letter-spacing
- Botões: mesma linguagem dos `ghost-action` existentes, compactos (32px altura)
- Divisores: `1px solid var(--border)` vertical entre grupos
- Sticky: `position: sticky; top: 0; z-index: 10`
- Scroll: `overflow-x: auto` para telas estreitas sem quebrar layout

---

## Fora do Escopo (Desta Iteração)

- Preview em tempo real de imagens dentro do CodeMirror (image widgets)
- Suporte a drag-and-drop de imagens
- Redimensionamento automático de imagens grandes
- Undo/redo do passo de cópia de arquivo (operação de FS é irreversível por design)

---

## Ordem de Implementação Sugerida

1. **Fix de imagens no preview** (menor risco, valor imediato, não depende de nada)
2. **`copy_asset_to_subject` no Rust** + dialog de arquivo no frontend
3. **`EditorHandle` ref no MarkdownEditor**
4. **`FormattingToolbar`** com todos os botões exceto imagem
5. **Integrar botão de imagem** na toolbar usando o comando do passo 2
6. **Estilos sticky** e testes manuais nos dois layouts (editor simples + split preview)

---

## Checklist de Implementação

### Rust (`src-tauri/src/lib.rs`)
- [x] Adicionar campo `absolute_path: String` na struct `EditableContentFile`
- [x] Preencher `absolute_path` no comando `read_content_file`
- [x] Implementar comando `copy_asset_to_subject` (criar pasta `assets/`, copiar arquivo, tratar colisão de nome)
- [x] Registrar `copy_asset_to_subject` no `invoke_handler`

### TypeScript — Tipos e Utils (`src/types.ts`, `src/utils.ts`)
- [x] Adicionar `absolutePath: string` em `EditableContentFile`
- [x] Implementar `resolveImagePaths(content, absoluteMdPath)` usando `convertFileSrc`

### MarkdownEditor (`src/components/MarkdownEditor.tsx`)
- [ ] Converter para `forwardRef` com tipo `EditorHandle = { view: EditorView }`
- [ ] Expor `viewRef.current` via `useImperativeHandle`

### FormattingToolbar (`src/components/FormattingToolbar.tsx`)
- [ ] Criar componente recebendo `editorHandle` e `subjectSlug` / `workspacePath`
- [ ] Botão H1 — insere `# ` (ou envolve seleção)
- [ ] Botão H2 — insere `## `
- [ ] Botão H3 — insere `### `
- [ ] Botão Negrito — envolve com `**`
- [ ] Botão Itálico — envolve com `*`
- [ ] Botão Código inline — envolve com `` ` ``
- [ ] Botão Tabela — insere template 3×2 com header
- [ ] Botão Slide `---` — insere `\n---\n`
- [ ] Botão Imagem — abre dialog, chama `copy_asset_to_subject`, insere `![](../assets/nome.png)`

### EditorScreen (`src/screens/EditorScreen.tsx`)
- [ ] Criar `editorHandleRef` e passar para `MarkdownEditor`
- [ ] Montar `<FormattingToolbar>` acima do `editor-surface`
- [ ] Aplicar `resolveImagePaths` no conteúdo antes de passar para `MarpPreview` / `ActivityPreview`
- [ ] Garantir que `subjectSlug` e `workspacePath` chegam à toolbar

### Estilos (`src/App.css`)
- [ ] Estilo base da toolbar (fundo, borda inferior, altura)
- [ ] Sticky behavior (`position: sticky; top: 0; z-index: 10`)
- [ ] Botões compactos (32px, `var(--font-ui)`, uppercase)
- [ ] Divisores verticais entre grupos
- [ ] `overflow-x: auto` para viewport estreita

### Testes Manuais
- [ ] Imagem com caminho relativo renderiza no preview de aula (Marp)
- [ ] Imagem com caminho relativo renderiza no preview de atividade
- [ ] Clicar em "Imagem" abre seletor de arquivos
- [ ] Arquivo copiado aparece em `<disciplina>/assets/`
- [ ] Referência inserida no editor aponta para o arquivo copiado
- [ ] Colisão de nome (mesmo arquivo duas vezes) cria `nome_2.png`
- [ ] Cada botão de formatação insere a sintaxe correta sem seleção
- [ ] Cada botão de formatação envolve o texto selecionado corretamente
- [ ] Toolbar fica sticky ao scrollar no editor
- [ ] Toolbar funciona nos dois layouts (editor simples e split com preview)
- [ ] Undo (`Ctrl+Z`) desfaz inserções da toolbar
