"use client";

type ApiErrorPanelProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ApiErrorPanel({ title, message, onRetry }: ApiErrorPanelProps) {
  return (
    <div className="crm-card" role="alert">
      <h3 className="crm-card-title">{title}</h3>
      <p className="crm-body-text text-sm">{message}</p>
      <ul
        className="crm-helper-text mt-3"
        style={{ paddingLeft: "1.25rem", listStyle: "disc" }}
      >
        <li>
          On <strong>Railway</strong>, <code>DATABASE_URL</code> must use a database reachable from
          the cloud (Railway Postgres, RDS). A LAN IP like <code>192.168.1.206</code> will not work
          unless you use a VPN/tunnel.
        </li>
        <li>
          Run <code>npm run db:migrate</code> on the same database as <code>DATABASE_URL</code>{" "}
          (creates all <code>crm_*</code> tables + demo seed). Check{" "}
          <code>/api/db-status</code> for table row counts.
        </li>
        <li>
          Open <code>/api/health</code> to test the connection only.
        </li>
      </ul>
      {onRetry && (
        <button type="button" className="crm-btn-primary mt-4" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
