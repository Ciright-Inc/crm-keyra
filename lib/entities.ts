export type EntityConfig = {
  key: string;
  label: string;
  table: string;
  idColumn: string;
  listColumns: string[];
  href: string;
};

export const CRM_ENTITIES: Record<string, EntityConfig> = {
  lead_sources: {
    key: "lead_sources",
    label: "Lead Sources",
    table: "crm_lead_sources",
    idColumn: "lead_source_id",
    listColumns: ["source_name", "source_type", "status", "date_created"],
    href: "/lead-sources",
  },
  prospects: {
    key: "prospects",
    label: "Prospects",
    table: "crm_prospects",
    idColumn: "prospect_id",
    listColumns: ["prospect_name", "prospect_type", "status", "country", "date_created"],
    href: "/prospects",
  },
  companies: {
    key: "companies",
    label: "Companies",
    table: "crm_companies",
    idColumn: "company_id",
    listColumns: ["company_name", "country", "industry", "account_status", "date_created"],
    href: "/companies",
  },
  contacts: {
    key: "contacts",
    label: "Contacts",
    table: "crm_contacts",
    idColumn: "contact_id",
    listColumns: ["full_name", "title", "email", "decision_role", "status"],
    href: "/contacts",
  },
  calls: {
    key: "calls",
    label: "Calls",
    table: "crm_calls",
    idColumn: "call_id",
    listColumns: ["call_type", "call_datetime", "duration_minutes"],
    href: "/calls",
  },
  communications: {
    key: "communications",
    label: "Communications",
    table: "crm_communications",
    idColumn: "communication_id",
    listColumns: ["communication_type", "direction", "subject", "date_time"],
    href: "/communications",
  },
  meetings: {
    key: "meetings",
    label: "Meetings",
    table: "crm_meetings",
    idColumn: "meeting_id",
    listColumns: ["meeting_title", "meeting_type", "meeting_datetime"],
    href: "/meetings",
  },
  proposals: {
    key: "proposals",
    label: "Proposals",
    table: "crm_proposals",
    idColumn: "proposal_id",
    listColumns: ["proposal_name", "proposal_type", "status", "shared_datetime"],
    href: "/proposals",
  },
  follow_ups: {
    key: "follow_ups",
    label: "Follow-Ups",
    table: "crm_follow_ups",
    idColumn: "follow_up_id",
    listColumns: ["follow_up_type", "priority", "due_date", "status"],
    href: "/follow-ups",
  },
  pipeline: {
    key: "pipeline",
    label: "Pipeline",
    table: "crm_pipeline",
    idColumn: "pipeline_id",
    listColumns: ["opportunity_name", "contract_phase", "expected_contract_value", "probability"],
    href: "/pipeline",
  },
  revenue: {
    key: "revenue",
    label: "Revenue Recognition",
    table: "crm_revenue_recognition",
    idColumn: "revenue_id",
    listColumns: ["revenue_type", "gross_revenue", "recognition_status", "billing_date"],
    href: "/revenue",
  },
  commission: {
    key: "commission",
    label: "Commission Attribution",
    table: "crm_commission_attribution",
    idColumn: "commission_id",
    listColumns: ["persona_type", "commission_role", "payable_commission_amount", "payment_status"],
    href: "/commission",
  },
  files: {
    key: "files",
    label: "Files",
    table: "crm_files",
    idColumn: "file_id",
    listColumns: ["file_name", "file_type", "permission_level", "uploaded_at"],
    href: "/files",
  },
  ai_log: {
    key: "ai_log",
    label: "AI Activity Log",
    table: "crm_ai_activity_log",
    idColumn: "ai_activity_id",
    listColumns: ["ai_agent_name", "activity_type", "human_approved_boolean", "created_at"],
    href: "/ai-activity",
  },
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/lead-sources", label: "Lead Source", icon: "Target" },
  { href: "/prospects", label: "Prospects", icon: "UserPlus" },
  { href: "/companies", label: "Companies", icon: "Building2" },
  { href: "/contacts", label: "Contacts", icon: "Users" },
  { href: "/calls", label: "Calls", icon: "Phone" },
  { href: "/communications", label: "Emails / Comms", icon: "Mail" },
  { href: "/meetings", label: "Meetings", icon: "Calendar" },
  { href: "/proposals", label: "Proposals / Decks", icon: "FilePresentation" },
  { href: "/follow-ups", label: "Follow-Up", icon: "CheckSquare" },
  { href: "/pipeline", label: "Pipeline / Contracts", icon: "GitBranch" },
  { href: "/revenue", label: "Revenue Recognition", icon: "TrendingUp" },
  { href: "/commission", label: "Commission Attribution", icon: "Percent" },
  { href: "/files", label: "Files / Documents", icon: "FolderOpen" },
  { href: "/ai-activity", label: "AI Activity Log", icon: "Brain" },
  { href: "/admin", label: "Admin / Settings", icon: "Settings" },
] as const;
