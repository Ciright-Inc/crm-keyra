export default function LoginPage() {
  return (
    <div className="crm-auth-screen">
      <div className="crm-auth-card">
        <h1 className="crm-auth-title">Keyra CRM</h1>
        <p className="crm-auth-sub">crm.keyra.ie — Internal enterprise access</p>
        <p className="crm-auth-note">
          Authenticate via Keyra identity (auth_users / SAT session). Set{" "}
          <code className="crm-auth-code">NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS=false</code> for production.
        </p>
      </div>
    </div>
  );
}
