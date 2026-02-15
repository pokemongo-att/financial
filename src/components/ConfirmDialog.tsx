"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "ยืนยันการดำเนินการ",
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  variant = "destructive",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? "กำลังดำเนินการ..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
