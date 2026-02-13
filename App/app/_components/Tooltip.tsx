"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
}

export const Tooltip = ({ children, content, side = "top", disabled }: TooltipProps) => {
  // Ako nema sadržaja ili je disabled, renderiramo samo djecu bez Tooltip logike
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={8}
            className="z-[9999] overflow-hidden rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-150"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-slate-950" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};