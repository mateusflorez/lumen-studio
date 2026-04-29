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

## Publicar uma nova versão

O workflow de CI **não roda em push para `main`** — só dispara quando uma tag `v*.*.*` é publicada.

```bash
# 1. Atualizar a versão nos dois arquivos:
#    src-tauri/tauri.conf.json  → "version": "X.Y.Z"
#    src-tauri/Cargo.toml       → version = "X.Y.Z"

# 2. Commitar o bump
git add src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "chore: bump version to X.Y.Z"

# 3. Criar e publicar a tag — isso dispara o GitHub Actions
git tag vX.Y.Z
git push origin main --tags
```

O Actions vai compilar o instalador `.exe`, assinar com a chave RSA, publicar no GitHub Releases e atualizar o `latest.json` no GitHub Pages. O app instalado detecta a nova versão na próxima abertura e oferece a atualização automaticamente.

### Secrets necessários no GitHub

| Secret | Descrição |
|--------|-----------|
| `TAURI_SIGNING_PRIVATE_KEY` | Conteúdo de `~/.tauri/lumen-studio.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Senha definida na geração da chave |

Sem esses secrets o build compila mas a assinatura falha e o updater rejeita o instalador.

---

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
