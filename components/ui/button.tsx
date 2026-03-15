"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "focus-ring inline-flex min-h-12 items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition",
        variant === "primary" &&
          "border-action bg-action text-white hover:bg-[#0060bf]",
        variant === "secondary" &&
          "border-black/[0.08] bg-white text-ink hover:bg-black/[0.02]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-muted hover:bg-black/[0.04] hover:text-ink",
        variant === "danger" &&
          "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        variant === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
