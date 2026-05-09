import { convertFileSrc } from "@tauri-apps/api/core";
import type { ContentItem, SaveState } from "./types";

export function flagClassName(isReady: boolean) {
  return isReady ? "subject-flag is-ready" : "subject-flag";
}

export function saveStateClassName(saveState: SaveState) {
  if (saveState === "saved") return "status-chip-ok";
  if (saveState === "saving") return "status-chip-saving";
  if (saveState === "error") return "status-chip-error";
  return "";
}

export function saveStateLabel(saveState: SaveState, updatedAtMs: number | null) {
  if (saveState === "saving") return "salvando...";
  if (saveState === "saved") return `salvo ${formatClock(updatedAtMs)}`;
  if (saveState === "dirty") return "alterações não salvas";
  if (saveState === "error") return "erro ao salvar";
  return updatedAtMs ? `pronto ${formatClock(updatedAtMs)}` : "pronto para editar";
}

export function statusLabel(status: ContentItem["status"]) {
  if (status === "ok") return "atualizado";
  if (status === "outdated") return "precisa revisar";
  return "sem output";
}

export function statusGlyph(status: ContentItem["status"]) {
  if (status === "ok") return "◉";
  if (status === "outdated") return "◎";
  return "○";
}

export function formatUpdatedAt(updatedAtMs: number | null) {
  if (!updatedAtMs) return "sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(updatedAtMs));
}

export function formatClock(updatedAtMs: number | null) {
  if (!updatedAtMs) return "agora";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(updatedAtMs));
}

export function humanizeSlug(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function describeError(cause: unknown, fallback: string) {
  if (cause instanceof Error && cause.message) return cause.message;
  if (typeof cause === "string" && cause.trim()) return cause;
  if (typeof cause === "object" && cause !== null) {
    const maybeMessage = "message" in cause ? cause.message : null;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;
  }
  return fallback;
}

// Resolves relative image paths in Markdown content to asset:// URIs that
// the Tauri webview can load. Only rewrites paths that are clearly relative
// (not http/https, data:, or already asset:// URIs).
export function resolveImagePaths(content: string, absoluteMdPath: string): string {
  // Normalize separators to forward slash for uniform processing.
  const normalizedMdPath = absoluteMdPath.replace(/\\/g, "/");
  // Directory containing the .md file (strip filename).
  const mdDir = normalizedMdPath.substring(0, normalizedMdPath.lastIndexOf("/"));

  return content.replace(/!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (match, alt, src, title) => {
    // Leave absolute URIs and data URLs untouched.
    if (/^(https?:|asset:|data:)/i.test(src)) return match;

    const resolvedPath = resolvePosixPath(mdDir, src);
    const assetUri = convertFileSrc(resolvedPath);
    const titlePart = title ? ` ${title}` : "";
    return `![${alt}](${assetUri}${titlePart})`;
  });
}

function resolvePosixPath(base: string, relative: string): string {
  // If the relative path is actually absolute (starts with / or drive letter), use it directly.
  if (/^(\/|[A-Za-z]:)/.test(relative)) return relative;

  const parts = base.split("/");
  const relParts = relative.split("/");

  for (const part of relParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== ".") {
      parts.push(part);
    }
  }

  return parts.join("/");
}

export function nextContentNumberLabel(items: ContentItem[] | undefined) {
  const maxNumber = (items ?? []).reduce((max, item) => {
    const match = item.file.match(/_(\d{2})_/);
    const number = match ? Number(match[1]) : 0;
    return number > max ? number : max;
  }, 0);
  return String(maxNumber + 1).padStart(2, "0");
}
