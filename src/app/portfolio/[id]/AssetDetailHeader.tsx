"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateAssetAccount } from "@/actions/assets";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

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
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/portfolio" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title={
            <span>
              {symbol}
              {name && <span className="text-slate-400 font-normal ml-2">— {name}</span>}
            </span>
          }
        />
        <Badge>{type}</Badge>
        <Button size="sm" variant="ghost" onClick={() => {
          setEditSymbol(symbol);
          setEditName(name ?? "");
          setEditing(true);
        }}>
          <Pencil className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      <Dialog open={editing} onOpenChange={(open) => !open && setEditing(false)}>
        <DialogContent className="max-w-md">
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editName">ชื่อ</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="ชื่อสินทรัพย์ (optional)"
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
