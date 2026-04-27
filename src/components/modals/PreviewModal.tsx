import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ContentItem, EditableContentFile } from "../../types";
import { MarpPreview } from "../MarpPreview";
import { ActivityPreview } from "../ActivityPreview";
import { LoadingState, ErrorState } from "../FeedbackStates";

export function PreviewModal({
  workspacePath,
  subjectSlug,
  item,
  onClose,
}: {
  workspacePath: string;
  subjectSlug: string;
  item: ContentItem;
  onClose: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLesson = item.relativePath.startsWith("aulas/");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    invoke<EditableContentFile>("read_content_file", {
      workspacePath,
      subjectSlug,
      relativePath: item.relativePath,
    })
      .then((doc) => {
        if (!cancelled) {
          setContent(doc.content);
          setError(null);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(typeof cause === "string" ? cause : "Falha ao carregar arquivo.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [workspacePath, subjectSlug, item.relativePath]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card modal-card--preview"
        aria-label={`Preview: ${item.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="preview-label">{isLesson ? "Aula" : "Atividade"}</p>
            <h2>{item.title}</h2>
          </div>
          <button type="button" className="ghost-action" onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="modal-preview-body">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : content !== null ? (
            isLesson ? (
              <MarpPreview workspacePath={workspacePath} content={content} />
            ) : (
              <ActivityPreview workspacePath={workspacePath} content={content} />
            )
          ) : null}
        </div>
      </section>
    </div>
  );
}
