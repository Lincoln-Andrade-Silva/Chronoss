import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-navy-700 bg-navy-950/60 px-3 py-2.5 text-sm text-navy-50 outline-none transition placeholder:text-navy-500 focus:border-navy-400 focus:ring-2 focus:ring-navy-500/40 disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
