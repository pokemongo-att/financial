import { getTemplateWithItems } from "@/actions/templates";
import { notFound } from "next/navigation";
import { TemplateItemsEditor } from "./TemplateItemsEditor";
import { TemplateDetailHeader } from "./TemplateDetailHeader";

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
      <TemplateDetailHeader templateId={id} templateName={template.name} />
      <TemplateItemsEditor templateId={id} items={template.items} />
    </div>
  );
}
