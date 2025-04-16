"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ReactNode, MouseEventHandler } from "react";

interface ActionTooltipProps {
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  children: ReactNode;
  disabledMessage?: string;
  asChild?: boolean;
  disabled: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function ActionTooltip({
  variant,
  children,
  disabled,
  disabledMessage,
  asChild = false,
  onClick,
  className,
}: ActionTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>
          {asChild ? (
            children
          ) : (
            <Button
              disabled={disabled}
              onClick={onClick}
              className={className}
              variant={variant}
            >
              {children}
            </Button>
          )}
        </TooltipTrigger>
        {disabled && disabledMessage && (
          <TooltipContent>
            <p className="text-sm">{disabledMessage}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
