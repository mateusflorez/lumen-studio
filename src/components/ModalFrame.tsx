import type { ReactNode } from "react";

export function ModalFrame({
  eyebrow = "Criação",
  title,
  children,
  onClose,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="preview-label">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button type="button" className="ghost-action" onClick={onClose}>
            Fechar
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
