## Desenvolvimento

### Pré-requisitos

- Node.js 20+
- Rust toolchain (`rustup` + stable)

```bash
npm install
npm run tauri dev     # Vite HMR + janela Tauri
npx tsc --noEmit      # type-check
```

### Publicar uma nova versão

O workflow de CI **não roda em push para `main`** — só dispara ao publicar uma tag `v*.*.*`.

```bash
# 1. Atualizar a versão nos dois arquivos:
#    src-tauri/tauri.conf.json  → "version": "X.Y.Z"
#    src-tauri/Cargo.toml       → version = "X.Y.Z"

# 2. Commitar o bump
git add src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "chore: bump version to X.Y.Z"

# 3. Criar e publicar a tag — dispara o GitHub Actions
git tag vX.Y.Z
git push origin main --tags
```

O Actions compila o instalador, assina, publica no GitHub Releases e atualiza o manifesto de atualização automática.

#### Secrets necessários no GitHub

| Secret | Descrição |
|--------|-----------|
| `TAURI_SIGNING_PRIVATE_KEY` | Conteúdo de `~/.tauri/lumen-studio.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Senha definida na geração da chave |
