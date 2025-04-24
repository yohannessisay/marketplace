"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { UserPlus } from "lucide-react";

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
  const location = useLocation();

  const handleSignUp = () => {
    const registrationUrl = `/registration?redirectTo=${encodeURIComponent(location.pathname)}`;
    navigate(registrationUrl);
    onClose();
  };

  const handleSignIn = () => {
    const loginUrl = `/login?redirectTo=${encodeURIComponent(location.pathname)}`;
    navigate(loginUrl);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md p-8 rounded-xl shadow-lg">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <UserPlus />
          </div>
          <DialogTitle className="text-2xl text-center font-bold text-slate-800">
            Sign Up or Sign In Required
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-center pt-5">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-5 mt-6">
          <Button
            onClick={handleSignUp}
            className="w-full py-6 text-base font-medium transition-all hover:shadow-md"
          >
            Sign Up
          </Button>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="w-full py-6 text-base mb-25 font-medium border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:shadow-md"
          >
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
