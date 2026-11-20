import { getDemoUserId } from "@/lib/demo-user";
import { getTemplates } from "@/actions/templates";
import { PageHeader } from "@/components/PageHeader";
import { TemplateList } from "./TemplateList";

export default async function TemplatesPage() {
  const userId = await getDemoUserId();
  const templates = await getTemplates(userId);
  return (
    <div className="space-y-6">
      <PageHeader title="แม่แบบรายเดือน" subtitle="ตั้งค่ารายการที่ใช้ซ้ำทุกเดือน" />
      <TemplateList templates={templates} userId={userId} />
    </div>
  );
}
