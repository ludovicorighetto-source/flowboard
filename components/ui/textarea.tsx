"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "focus-ring min-h-[120px] w-full rounded-control border border-black/[0.08] bg-white px-3 py-2 text-sm text-ink placeholder:text-muted",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
