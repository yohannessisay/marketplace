import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  isSuccess?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isDestructive = false,
  isSuccess = false,
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <div className="p-6">
          <DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div
                className={cn(
                  "p-3 rounded-full",
                  isDestructive ? "bg-destructive/10" : "bg-primary/10",
                  isSuccess && "bg-emerald-100",
                )}
              >
                {isDestructive ? (
                  <AlertCircle className="w-8 h-8 text-destructive" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-primary" />
                )}
              </div>
              <DialogTitle className="text-2xl font-semibold text-center">
                {title}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="mt-4 px-4 py-3 bg-muted/50 rounded-lg border">
            <DialogDescription className="text-center text-foreground">
              {message}
            </DialogDescription>
          </div>

          <DialogFooter className="mt-10 grid grid-cols-2 gap-3">
            {cancelText && (
              <Button variant="outline" onClick={onClose} className="w-full">
                {cancelText}
              </Button>
            )}
            <Button
              variant={isDestructive ? "destructive" : "default"}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "w-full",
                isSuccess && "bg-emerald-600 hover:bg-emerald-700",
                !cancelText && "col-span-2",
              )}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
