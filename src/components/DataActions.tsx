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
        <button onClick={onCopyLink} type="button">
          {t.copyLink}
        </button>
        <button onClick={onExportCsv} type="button">
          {t.exportCsv}
        </button>
        <button onClick={onExportJson} type="button">
          {t.exportJson}
        </button>
      </div>
    </section>
  );
}
