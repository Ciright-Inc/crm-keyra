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
          Check Railway variables, run <code>npm run db:migrate</code> on deploy, and open{" "}
          <code>/api/health</code> in the browser to test the DB connection.
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
