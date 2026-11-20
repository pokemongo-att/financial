"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateAssetAccount } from "@/actions/assets";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TYPE_LABELS: Record<string, string> = {
  STOCK: "หุ้น",
  FUND: "กองทุน",
  CRYPTO: "Crypto",
  BANK: "เงินฝาก",
};

export function AssetDetailHeader({
  assetId,
  symbol,
  name,
  type,
}: {
  assetId: string;
  symbol: string;
  name: string | null;
  type: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editSymbol, setEditSymbol] = useState(symbol);
  const [editName, setEditName] = useState(name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editSymbol.trim()) return;
    setSaving(true);
    try {
      await updateAssetAccount(assetId, {
        symbol: editSymbol.trim(),
        name: editName.trim() || undefined,
      });
      toast.success("บันทึกแล้ว");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("บันทึกไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        backHref="/portfolio"
        backLabel="กลับไป Portfolio"
        title={
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            {symbol}
            <Badge className="align-middle">{TYPE_LABELS[type] ?? type}</Badge>
          </span>
        }
        subtitle={name ?? undefined}
      >
        <Button
          variant="outline"
          onClick={() => {
            setEditSymbol(symbol);
            setEditName(name ?? "");
            setEditing(true);
          }}
        >
          <Pencil className="h-4 w-4" />
          แก้ไขข้อมูล
        </Button>
      </PageHeader>

      <Dialog open={editing} onOpenChange={(open) => !open && setEditing(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลสินทรัพย์</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editSymbol">Symbol</Label>
              <Input
                id="editSymbol"
                value={editSymbol}
                onChange={(e) => setEditSymbol(e.target.value)}
                placeholder="Symbol / Code"
                autoCorrect="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editName">ชื่อ</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="ชื่อสินทรัพย์ (ไม่บังคับ)"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
