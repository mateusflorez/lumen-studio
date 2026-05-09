import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { EditorView } from "@codemirror/view";
import type { RefObject } from "react";
import type { EditorHandle } from "./MarkdownEditor";
import type { CopyAssetResult } from "../types";

export function FormattingToolbar({
  editorHandle,
  workspacePath,
  subjectSlug,
  contentRelativePath,
}: {
  editorHandle: RefObject<EditorHandle | null>;
  workspacePath: string;
  subjectSlug: string;
  contentRelativePath: string;
}) {
  const [imageBusy, setImageBusy] = useState(false);

  function view(): EditorView | null {
    return editorHandle.current?.view ?? null;
  }

  function insertHeading(level: 1 | 2 | 3) {
    const v = view();
    if (!v) return;
    const prefix = "#".repeat(level) + " ";
    const line = v.state.doc.lineAt(v.state.selection.main.head);
    const match = line.text.match(/^(#{1,6}) /);
    let changes;
    if (match && match[1] === "#".repeat(level)) {
      changes = { from: line.from, to: line.from + match[0].length, insert: "" };
    } else if (match) {
      changes = { from: line.from, to: line.from + match[0].length, insert: prefix };
    } else {
      changes = { from: line.from, insert: prefix };
    }
    v.dispatch({ changes });
    v.focus();
  }

  function wrapInline(marker: string, placeholder: string) {
    const v = view();
    if (!v) return;
    const { from, to } = v.state.selection.main;
    if (from === to) {
      const insert = `${marker}${placeholder}${marker}`;
      v.dispatch({
        changes: { from, insert },
        selection: { anchor: from + marker.length, head: from + marker.length + placeholder.length },
      });
    } else {
      v.dispatch({
        changes: [{ from, insert: marker }, { from: to, insert: marker }],
        selection: { anchor: from + marker.length, head: to + marker.length },
      });
    }
    v.focus();
  }

  function insertTable() {
    const v = view();
    if (!v) return;
    const line = v.state.doc.lineAt(v.state.selection.main.head);
    const insert =
      "\n| Coluna 1 | Coluna 2 | Coluna 3 |\n" +
      "| -------- | -------- | -------- |\n" +
      "| Célula   | Célula   | Célula   |\n";
    v.dispatch({ changes: { from: line.to, insert } });
    v.focus();
  }

  function insertSlideSep() {
    const v = view();
    if (!v) return;
    const line = v.state.doc.lineAt(v.state.selection.main.head);
    v.dispatch({ changes: { from: line.to, insert: "\n\n---\n" } });
    v.focus();
  }

  async function handleInsertImage() {
    const v = view();
    if (!v || imageBusy) return;

    const selected = await open({
      multiple: false,
      filters: [{ name: "Imagem", extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"] }],
    });
    if (!selected || typeof selected !== "string") return;

    setImageBusy(true);
    try {
      const result = await invoke<CopyAssetResult>("copy_asset_to_subject", {
        workspacePath,
        subjectSlug,
        sourcePath: selected,
        contentRelativePath,
      });
      const line = v.state.doc.lineAt(v.state.selection.main.head);
      v.dispatch({ changes: { from: line.to, insert: `\n![](${result.relativePath})\n` } });
      v.focus();
    } catch (err) {
      console.error("Erro ao copiar imagem:", err);
    } finally {
      setImageBusy(false);
    }
  }

  return (
    <div className="formatting-toolbar" role="toolbar" aria-label="Formatação">
      <div className="formatting-toolbar-group">
        <button type="button" className="toolbar-btn" onClick={() => insertHeading(1)} title="Título H1">
          H1
        </button>
        <button type="button" className="toolbar-btn" onClick={() => insertHeading(2)} title="Título H2">
          H2
        </button>
        <button type="button" className="toolbar-btn" onClick={() => insertHeading(3)} title="Título H3">
          H3
        </button>
      </div>

      <div className="formatting-toolbar-sep" />

      <div className="formatting-toolbar-group">
        <button
          type="button"
          className="toolbar-btn toolbar-btn--bold"
          onClick={() => wrapInline("**", "negrito")}
          title="Negrito"
        >
          N
        </button>
        <button
          type="button"
          className="toolbar-btn toolbar-btn--italic"
          onClick={() => wrapInline("*", "itálico")}
          title="Itálico"
        >
          I
        </button>
        <button
          type="button"
          className="toolbar-btn toolbar-btn--mono"
          onClick={() => wrapInline("`", "código")}
          title="Código inline"
        >
          {"</>"}
        </button>
      </div>

      <div className="formatting-toolbar-sep" />

      <div className="formatting-toolbar-group">
        <button type="button" className="toolbar-btn" onClick={insertTable} title="Inserir tabela">
          Tabela
        </button>
        <button type="button" className="toolbar-btn" onClick={insertSlideSep} title="Separador de slide Marp">
          — Slide
        </button>
      </div>

      <div className="formatting-toolbar-sep" />

      <div className="formatting-toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={handleInsertImage}
          disabled={imageBusy}
          title="Inserir imagem"
        >
          {imageBusy ? "copiando..." : "Imagem"}
        </button>
      </div>
    </div>
  );
}
