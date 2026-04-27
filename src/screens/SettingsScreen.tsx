import type { AssetSettingsState } from "../types";

const colorThemes = [
  { id: "preto", label: "Preto", dark: "#111111", mid: "#4a4a4a", light: "#f3f4f6" },
  { id: "azul", label: "Azul", dark: "#1a5fa8", mid: "#3a7fc1", light: "#eaf2ff" },
  { id: "vermelho", label: "Vermelho", dark: "#b42318", mid: "#ef4444", light: "#ffe4e6" },
  { id: "verde", label: "Verde", dark: "#166534", mid: "#22c55e", light: "#dcfce7" },
  { id: "roxo", label: "Roxo", dark: "#6d28d9", mid: "#8b5cf6", light: "#ede9fe" },
  { id: "laranja", label: "Laranja", dark: "#c2410c", mid: "#f97316", light: "#ffedd5" },
  { id: "bege", label: "Bege", dark: "#92400e", mid: "#d97706", light: "#f5ead7" },
  { id: "teal", label: "Teal", dark: "#0f766e", mid: "#14b8a6", light: "#ccfbf1" },
  { id: "rosa", label: "Rosa", dark: "#be185d", mid: "#ec4899", light: "#fce7f3" },
  { id: "cinza", label: "Cinza", dark: "#334155", mid: "#64748b", light: "#eef2f7" },
] as const;

function sourceLabel(source: string) {
  if (source === "appData") return "configurado no app";
  if (source === "fallback") return "fallback do sistema";
  return "em branco";
}

type AssetCardProps = {
  title: string;
  copy: string;
  value: string | null;
  source: string;
  onSelect: () => void;
  onClear: () => void;
  busy: boolean;
};

function AssetCard({ title, copy, value, source, onSelect, onClear, busy }: AssetCardProps) {
  return (
    <article className="settings-asset-card">
      <p className="preview-label">{title}</p>
      <h3>{title}</h3>
      <p className="section-copy settings-asset-copy">{copy}</p>
      <p className={`workspace-path${value ? "" : " is-empty"}`}>
        {value ?? "Nenhum arquivo definido."}
      </p>
      <div className="subject-detail-flags">
        <span className="status-chip">{sourceLabel(source)}</span>
      </div>
      <div className="settings-asset-actions">
        <button type="button" className="primary-action" disabled={busy} onClick={onSelect}>
          selecionar arquivo
        </button>
        <button type="button" className="ghost-action danger-action" disabled={busy} onClick={onClear}>
          limpar
        </button>
      </div>
    </article>
  );
}

export function SettingsScreen({
  assetSettings,
  loading,
  error,
  busy,
  onSelectLogo,
  onSelectBackground,
  onClearLogo,
  onClearBackground,
  onSelectTheme,
}: {
  assetSettings: AssetSettingsState | null;
  loading: boolean;
  error: string | null;
  busy: boolean;
  onSelectLogo: () => void;
  onSelectBackground: () => void;
  onClearLogo: () => void;
  onClearBackground: () => void;
  onSelectTheme: (themeId: string) => void;
}) {
  return (
    <section className="subject-detail-shell" aria-labelledby="settings-title">
      <div className="subject-detail-header">
        <div className="hero-copy">
          <p className="hero-kicker">Configuracoes</p>
          <h1 id="settings-title">Defina o visual padrao dos materiais.</h1>
          <p className="hero-body">
            Os slides e atividades usam primeiro o que estiver salvo no aplicativo.
            Se nao houver nada definido, o sistema tenta um fallback global.
          </p>
        </div>

        <aside className="workspace-panel subject-detail-panel">
          <div className="workspace-heading">
            <p className="preview-label">Localizacao dos assets</p>
          </div>
          <p className="workspace-path">
            {assetSettings?.appDataDir ?? "Carregando pasta local..."}
          </p>
          <div className="subject-detail-flags">
            <span className="status-chip">app principal</span>
            {assetSettings?.fallbackDir ? (
              <span className="status-chip">{assetSettings.fallbackDir}</span>
            ) : (
              <span className="status-chip">sem fallback encontrado</span>
            )}
          </div>
        </aside>
      </div>

      {loading ? (
        <div className="feedback-panel">
          <p className="preview-label">carregando</p>
          <h2 className="feedback-title">Lendo configuracoes visuais.</h2>
        </div>
      ) : null}

      {error ? (
        <div className="feedback-panel is-error">
          <p className="preview-label">erro</p>
          <h2 className="feedback-title">Nao foi possivel abrir as configuracoes.</h2>
          <p className="feedback-copy">{error}</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="settings-grid">
          <AssetCard
            title="Logo"
            copy="Usado na capa dos slides e no topo das atividades."
            value={assetSettings?.logoPath ?? null}
            source={assetSettings?.logoSource ?? "none"}
            onSelect={onSelectLogo}
            onClear={onClearLogo}
            busy={busy}
          />
          <AssetCard
            title="Background"
            copy="Usado como fundo padrao dos slides."
            value={assetSettings?.backgroundPath ?? null}
            source={assetSettings?.backgroundSource ?? "none"}
            onSelect={onSelectBackground}
            onClear={onClearBackground}
            busy={busy}
          />
          <article className="settings-asset-card settings-theme-card">
            <p className="preview-label">Cores</p>
            <h3>Paleta editorial</h3>
            <p className="section-copy settings-asset-copy">
              Define a cor principal dos titulos, linhas e detalhes dos slides e atividades.
            </p>
            <div className="settings-theme-grid">
              {colorThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`settings-theme-option${assetSettings?.colorThemeId === theme.id ? " is-active" : ""}`}
                  onClick={() => onSelectTheme(theme.id)}
                  disabled={busy}
                >
                  <span className="settings-theme-swatches">
                    <span style={{ backgroundColor: theme.dark }} />
                    <span style={{ backgroundColor: theme.mid }} />
                    <span style={{ backgroundColor: theme.light }} />
                  </span>
                  <span className="settings-theme-label">{theme.label}</span>
                </button>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
