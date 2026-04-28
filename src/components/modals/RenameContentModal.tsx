import { useState } from "react";
import { ModalFrame } from "../ModalFrame";
import type { ContentItem } from "../../types";

function extractNumber(fileName: string) {
  const match = fileName.match(/_(\d{2})_/);
  return match ? match[1] : "00";
}

function extractTheme(item: ContentItem, kind: "aula" | "atividade", numberLabel: string) {
  const patterns =
    kind === "aula"
      ? [
          new RegExp(`^Aula ${numberLabel} -\\s*`, "i"),
          new RegExp(`^Aula ${numberLabel} —\\s*`, "i"),
        ]
      : [
          new RegExp(`^Atividade ${numberLabel} -\\s*`, "i"),
          new RegExp(`^Atividade ${numberLabel} —\\s*`, "i"),
        ];

  const matched = patterns.find((pattern) => pattern.test(item.title));
  if (matched) {
    return item.title.replace(matched, "").trim();
  }

  const stem = item.file.replace(/\.md$/i, "");
  const parts = stem.split("_");
  return parts.slice(2).join(" ").trim();
}

export function RenameContentModal({
  item,
  onClose,
  onConfirm,
}: {
  item: ContentItem;
  onClose: () => void;
  onConfirm: (theme: string) => Promise<void>;
}) {
  const kind = item.relativePath.startsWith("aulas/") ? "aula" : "atividade";
  const isLesson = kind === "aula";
  const numberLabel = extractNumber(item.file);
  const [theme, setTheme] = useState(() => extractTheme(item, kind, numberLabel));
  const [renaming, setRenaming] = useState(false);

  const titlePreview = `${isLesson ? "Aula" : "Atividade"} ${numberLabel} - ${
    theme.trim() || (isLesson ? "Tema da aula" : "Tema da atividade")
  }`;

  function handleClose() {
    if (renaming) return;
    onClose();
  }

  async function handleConfirm() {
    if (!theme.trim() || renaming) return;
    setRenaming(true);
    try {
      await onConfirm(theme.trim());
    } finally {
      setRenaming(false);
    }
  }

  return (
    <ModalFrame eyebrow="Edição" title={`Renomear ${kind}`} onClose={handleClose}>
      <div className="modal-stack">
        <p className="modal-copy">
          Atualize o tema {isLesson ? "da aula" : "da atividade"}. O app também ajusta o título
          principal.
        </p>
        <label className="modal-field">
          <span className="preview-label">Novo tema</span>
          <input
            autoFocus
            type="text"
            className="modal-input"
            placeholder={isLesson ? "Ex.: Introducao a APIs REST" : "Ex.: Revisao de conceitos principais"}
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          />
        </label>
        <div className="modal-preview">
          <div>
            <p className="preview-label">Título atualizado</p>
            <strong>{titlePreview}</strong>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost-action" onClick={handleClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={() => void handleConfirm()}
            disabled={!theme.trim() || renaming}
          >
            {renaming ? "salvando..." : "Renomear"}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
