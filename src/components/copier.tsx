"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";

interface TruncatableIdProps {
  id: string;
}

export const TruncatableId = ({ id }: TruncatableIdProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { successMessage, errorMessage } = useNotification();

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = id;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      successMessage("ID copied to clipboard.");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
      errorMessage({
        error: {
          message: "Failed to copy ID",
          code: "COPY_ERROR",
        },
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-none">
        {id}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-6 w-6"
        title={isCopied ? "Copied!" : "Copy ID"}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};
