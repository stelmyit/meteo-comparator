type DataActionsProps = {
  onCopyLink: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  t: {
    copyLink: string;
    exportCsv: string;
    exportJson: string;
    dataActions: string;
  };
};

export function DataActions({ onCopyLink, onExportCsv, onExportJson, t }: DataActionsProps) {
  return (
    <section className="data-actions" aria-label={t.dataActions}>
      <div className="section-heading">
        <h2>{t.dataActions}</h2>
      </div>
      <div className="data-actions-row">
        <button className="action-button" onClick={onCopyLink} type="button">
          <span aria-hidden="true" className="action-icon">
            L
          </span>
          <span>{t.copyLink}</span>
        </button>
        <button className="action-button" onClick={onExportCsv} type="button">
          <span aria-hidden="true" className="action-icon">
            C
          </span>
          <span>{t.exportCsv}</span>
        </button>
        <button className="action-button" onClick={onExportJson} type="button">
          <span aria-hidden="true" className="action-icon">
            J
          </span>
          <span>{t.exportJson}</span>
        </button>
      </div>
    </section>
  );
}
