# Lumen Studio

Aplicativo desktop em Tauri para autoria, organização e geração de aulas e atividades em Markdown.

## Desenvolvimento

```bash
npm install
npm run tauri dev
```

Validação mínima:

```bash
npx tsc --noEmit
cargo check --manifest-path src-tauri/Cargo.toml
```

## Build com instalador Windows

O instalador Windows agora pode embutir o runtime de geração usado pelo app:

- `@marp-team/marp-cli`
- `markdown-it`
- `node.exe`
- `chrome-headless-shell.exe`

Preparação do runtime:

```bash
npm run prepare:windows-runtime
```

Build do instalador:

```bash
npm run build:windows-installer
```

O script baixa o Node 20.x para Windows e o `chrome-headless-shell` estável, instala as dependências de geração em `src-tauri/resources/windows-runtime/` e inclui tudo no bundle Tauri.
