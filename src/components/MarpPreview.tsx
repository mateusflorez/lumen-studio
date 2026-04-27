import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function MarpPreview({
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
        const result = await invoke<string>("render_marp_html", {
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
    }, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [content, workspacePath]);

  return (
    <div className="marp-preview">
      <div className="marp-preview-header">
        <p className="preview-label">Preview dos slides</p>
        {loading && (
          <span className="status-chip status-chip-saving">● renderizando</span>
        )}
      </div>
      {error ? (
        <div className="marp-preview-body marp-preview-body--error">
          <p>{error}</p>
        </div>
      ) : html ? (
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          className="marp-preview-frame"
          title="Preview dos slides Marp"
        />
      ) : (
        <div className="marp-preview-body">
          <span>Preparando renderizacao...</span>
        </div>
      )}
    </div>
  );
}
