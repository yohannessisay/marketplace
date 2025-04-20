"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SignUpPromptModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function SignUpPromptModal({
  open,
  message,
  onClose,
}: SignUpPromptModalProps) {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/registration", { state: { from: "/market-place" } });
    onClose();
  };

  const handleSignIn = () => {
    navigate("/login", { state: { from: "/market-place" } });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-bold text-slate-800">
            Sign Up or Sign In Required
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-5">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button onClick={handleSignUp} className="flex-1">
            Sign Up
          </Button>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            Sign In
          </Button>
        </div>
        <div className="mt-4">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
