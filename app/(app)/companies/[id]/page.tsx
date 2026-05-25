import { Company360 } from "@/components/crm/company-360";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Company360 companyId={id} />;
}
