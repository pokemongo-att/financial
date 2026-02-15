import { getTemplateWithItems } from "@/actions/templates";
import { notFound } from "next/navigation";
import { TemplateItemsEditor } from "./TemplateItemsEditor";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateWithItems(id);
  if (!template) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/templates" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader title={template.name} subtitle="แก้ไขรายการ template" />
      </div>
      <TemplateItemsEditor templateId={id} items={template.items} />
    </div>
  );
}
