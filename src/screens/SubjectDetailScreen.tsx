import type { SubjectDetail, ContentItem, GenerationEnvironmentStatus } from "../types";
import { humanizeSlug } from "../utils";
import { LoadingState, ErrorState } from "../components/FeedbackStates";
import { ContentColumn } from "../components/ContentColumn";

export function SubjectDetailScreen({
  selectedSubject,
  selectedSubjectSlug,
  selectedContentPath,
  detailLoading,
  detailError,
  processingOutputPath,
  generationBusy,
  generatingAll,
  generationEnvironment,
  generationEnvironmentLoading,
  onEditSubject,
  onGenerateAll,
  onSelectContent,
  onGoBack,
  onCreateLesson,
  onCreateActivity,
  onGenerate,
  onOpenOutput,
  onMoveContentUp,
  onMoveContentDown,
  onDuplicateContent,
  onRenameContent,
  onDeleteContent,
  onPreviewContent,
}: {
  selectedSubject: SubjectDetail | null;
  selectedSubjectSlug: string;
  selectedContentPath: string | null;
  detailLoading: boolean;
  detailError: string | null;
  processingOutputPath: string | null;
  generationBusy: boolean;
  generatingAll: boolean;
  generationEnvironment: GenerationEnvironmentStatus | null;
  generationEnvironmentLoading: boolean;
  onEditSubject: () => void;
  onGenerateAll: () => void;
  onSelectContent: (path: string) => void;
  onGoBack: () => void;
  onCreateLesson: () => void;
  onCreateActivity: () => void;
  onGenerate: (item: ContentItem) => void;
  onOpenOutput: (item: ContentItem) => void;
  onMoveContentUp: (item: ContentItem) => void;
  onMoveContentDown: (item: ContentItem) => void;
  onDuplicateContent: (item: ContentItem) => void;
  onRenameContent: (item: ContentItem) => void;
  onDeleteContent: (item: ContentItem) => void;
  onPreviewContent: (item: ContentItem) => void;
}) {
  const allItems = selectedSubject
    ? [...selectedSubject.lessons, ...selectedSubject.activities]
    : [];
  const totalItems = allItems.length;
  const itemsWithoutOutput = allItems.filter((item) => item.status === "none").length;
  const outdatedItems = allItems.filter((item) => item.status === "outdated").length;
  const generatedItems = allItems.filter((item) => item.status !== "none").length;
  const progressPercent = totalItems > 0 ? Math.round((generatedItems / totalItems) * 100) : 0;

  return (
    <section className="subject-detail-shell" aria-labelledby="subject-detail-title">
      <div className="subject-detail-header">
        <div className="subject-detail-copy">
          <button type="button" className="back-action" onClick={onGoBack}>
            ← voltar para disciplinas
          </button>
          <p className="hero-kicker">Disciplina</p>
          <h1 id="subject-detail-title">
            {selectedSubject?.displayName ?? humanizeSlug(selectedSubjectSlug)}
          </h1>
          <p className="hero-body">
            Abra uma aula ou atividade para editar o Markdown com salvamento automático.
          </p>
        </div>

        <aside className="workspace-panel subject-detail-panel">
          <div className="workspace-heading">
            <button
              type="button"
              className="ghost-action"
              onClick={onEditSubject}
              disabled={generationBusy}
            >
              configurar disciplina
            </button>
            <button
              type="button"
              className="primary-action subject-generate-all-action"
              onClick={onGenerateAll}
              disabled={generationBusy}
            >
              {generatingAll ? "gerando tudo..." : "gerar tudo"}
            </button>
          </div>

          {selectedSubject ? (
            <section className="subject-overview-inline" aria-labelledby="subject-overview-title">
              <div className="subject-overview-inline-header">
                <div>
                  <p className="preview-label">Visão geral</p>
                  <h2 id="subject-overview-title">Progresso da disciplina</h2>
                </div>
                <span className="status-chip status-chip-ok">{progressPercent}% com output</span>
              </div>

              <div className="subject-overview-progress">
                <div className="generation-progress-track" aria-hidden="true">
                  <div
                    className="generation-progress-bar"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="subject-overview-inline-stats">
                <div className="subject-overview-inline-stat">
                  <strong>{totalItems}</strong>
                  <span>itens</span>
                </div>
                <div className="subject-overview-inline-stat">
                  <strong>{itemsWithoutOutput}</strong>
                  <span>sem output</span>
                </div>
                <div className="subject-overview-inline-stat">
                  <strong>{outdatedItems}</strong>
                  <span>desatualizados</span>
                </div>
              </div>

              <div className="subject-environment">
                <div className="subject-environment-header">
                  <p className="preview-label">Ambiente de geração</p>
                  {generationEnvironmentLoading ? (
                    <span className="status-chip status-chip-saving">verificando...</span>
                  ) : null}
                </div>
                {generationEnvironment ? (
                  <div className="subject-environment-list">
                    <div className="subject-environment-item">
                      <span className={`status-chip ${generationEnvironment.lessonReady ? "status-chip-ok" : "status-chip-warning"}`}>
                        {generationEnvironment.lessonReady ? "◉ slides prontos" : "◎ slides pendentes"}
                      </span>
                      <p className="subject-environment-copy">{generationEnvironment.lessonMessage}</p>
                    </div>
                    <div className="subject-environment-item">
                      <span className={`status-chip ${generationEnvironment.activityReady ? "status-chip-ok" : "status-chip-warning"}`}>
                        {generationEnvironment.activityReady ? "◉ pdf pronto" : "◎ pdf pendente"}
                      </span>
                      <p className="subject-environment-copy">{generationEnvironment.activityMessage}</p>
                    </div>
                  </div>
                ) : (
                  <p className="subject-environment-copy">Não foi possível verificar o ambiente de geração.</p>
                )}
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      {detailLoading ? <LoadingState /> : null}
      {detailError ? <ErrorState message={detailError} /> : null}
      {!detailLoading && !detailError && selectedSubject ? (
        <div className="subject-detail-grid">
          <ContentColumn
            title="Aulas"
            subtitle="Arquivos de aula"
            emptyMessage="Nenhuma aula encontrada."
            items={selectedSubject.lessons}
            selectedPath={selectedContentPath}
            onSelect={onSelectContent}
            actionLabel="+ Aula"
            onAction={onCreateLesson}
            busyPath={processingOutputPath}
            generationBusy={generationBusy}
            onGenerate={onGenerate}
            onOpenOutput={onOpenOutput}
            onMoveUp={onMoveContentUp}
            onMoveDown={onMoveContentDown}
            onDuplicate={onDuplicateContent}
            onRename={onRenameContent}
            onDelete={onDeleteContent}
            onPreview={onPreviewContent}
          />
          <ContentColumn
            title="Atividades"
            subtitle="Arquivos de atividade"
            emptyMessage="Nenhuma atividade encontrada."
            items={selectedSubject.activities}
            selectedPath={selectedContentPath}
            onSelect={onSelectContent}
            actionLabel="+ Atividade"
            onAction={onCreateActivity}
            busyPath={processingOutputPath}
            generationBusy={generationBusy}
            onGenerate={onGenerate}
            onOpenOutput={onOpenOutput}
            onMoveUp={onMoveContentUp}
            onMoveDown={onMoveContentDown}
            onDuplicate={onDuplicateContent}
            onRename={onRenameContent}
            onDelete={onDeleteContent}
            onPreview={onPreviewContent}
          />
        </div>
      ) : null}
    </section>
  );
}
