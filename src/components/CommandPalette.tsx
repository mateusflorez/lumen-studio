export type CommandAction = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void;
};

export function CommandPalette({
  query,
  onQueryChange,
  actions,
  onClose,
}: {
  query: string;
  onQueryChange: (nextValue: string) => void;
  actions: CommandAction[];
  onClose: () => void;
}) {
  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <section
        className="command-palette"
        aria-label="Command palette"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          type="text"
          className="command-palette-input"
          placeholder="Buscar acao..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <div className="command-palette-list">
          {actions.length > 0 ? (
            actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="command-palette-item"
                onClick={() => {
                  action.run();
                  onClose();
                }}
              >
                <span>{action.label}</span>
                <span className="command-palette-hint">{action.hint}</span>
              </button>
            ))
          ) : (
            <div className="command-palette-empty">Nenhuma acao encontrada.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export function buildCommandActions({
  viewingDetail,
  viewingEditor,
  hasWorkspace,
  showMarpPreview,
  canPreviewCurrentFile,
  canReloadCurrentFile,
  onChooseWorkspace,
  onOpenSettings,
  onCreateSubject,
  onCreateTemplateSubject,
  onGoHome,
  onGoToFiles,
  onToggleMarpPreview,
  onReloadCurrentFile,
}: {
  viewingDetail: boolean;
  viewingEditor: boolean;
  hasWorkspace: boolean;
  showMarpPreview: boolean;
  canPreviewCurrentFile: boolean;
  canReloadCurrentFile: boolean;
  onChooseWorkspace: () => Promise<void>;
  onOpenSettings: () => void;
  onCreateSubject: () => void;
  onCreateTemplateSubject: () => void;
  onGoHome: () => void;
  onGoToFiles: () => void;
  onToggleMarpPreview: () => void;
  onReloadCurrentFile: () => void;
}): CommandAction[] {
  const actions: CommandAction[] = [];

  if (hasWorkspace) {
    actions.push({
      id: "create-subject",
      label: "Nova disciplina",
      hint: "Criacao",
      keywords: "nova disciplina criar vazia",
      run: onCreateSubject,
    });
    actions.push({
      id: "choose-workspace",
      label: "Alterar pasta",
      hint: "Workspace",
      keywords: "pasta workspace caminho alterar selecionar",
      run: () => { void onChooseWorkspace(); },
    });
    actions.push({
      id: "create-template-subject",
      label: "Nova disciplina modelo",
      hint: "Criacao",
      keywords: "nova disciplina modelo criar gerar exemplo",
      run: onCreateTemplateSubject,
    });
    actions.push({
      id: "open-settings",
      label: "Abrir configuracoes",
      hint: "Sistema",
      keywords: "configuracoes visual logo background assets",
      run: onOpenSettings,
    });
  }

  if (viewingDetail) {
    actions.push({
      id: "go-home",
      label: "Voltar para disciplinas",
      hint: "Navegacao",
      keywords: "home disciplinas voltar inicio",
      run: onGoHome,
    });
  }

  if (viewingEditor) {
    actions.push({
      id: "go-files",
      label: "Voltar para arquivos da disciplina",
      hint: "Navegacao",
      keywords: "arquivos disciplina voltar lista",
      run: onGoToFiles,
    });
  }

  if (viewingEditor && canPreviewCurrentFile) {
    actions.push({
      id: "toggle-marp-preview",
      label: showMarpPreview ? "Ocultar preview" : "Mostrar preview",
      hint: "Editor",
      keywords: "preview slides marp atividade a4 visualizar renderizar mostrar ocultar",
      run: onToggleMarpPreview,
    });
  }

  if (canReloadCurrentFile) {
    actions.push({
      id: "reload-current-file",
      label: "Recarregar arquivo aberto",
      hint: "Editor",
      keywords: "recarregar arquivo atualizar modificado externo",
      run: onReloadCurrentFile,
    });
  }

  return actions;
}
