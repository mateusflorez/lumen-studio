import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function ActivityPreview({
  workspacePath,
  content,
}: {
  workspacePath: string;
  content: string;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await invoke<string>("render_activity_html", {
          workspacePath,
          content,
        });
        if (cancelled) return;
        setHtml(result);
        setError(null);
      } catch (cause) {
        if (cancelled) return;
        setError(typeof cause === "string" ? cause : "Falha ao renderizar preview.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [content, workspacePath]);

  return (
    <div className="marp-preview marp-preview--activity">
      <div className="marp-preview-header">
        <p className="preview-label">Preview da atividade</p>
        {loading && (
          <span className="status-chip status-chip-saving">● renderizando</span>
        )}
      </div>
      {error ? (
        <div className="marp-preview-body marp-preview-body--error">
          <p>{error}</p>
        </div>
      ) : html ? (
        <div className="activity-preview-stage">
          <iframe
            srcDoc={html}
            sandbox="allow-scripts"
            className="activity-preview-frame"
            title="Preview A4 da atividade"
          />
        </div>
      ) : (
        <div className="marp-preview-body">
          <span>Preparando renderizacao...</span>
        </div>
      )}
    </div>
  );
}
