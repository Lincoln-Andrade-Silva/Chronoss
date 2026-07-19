import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-navy-800 bg-navy-900/60 p-6 shadow-xl", className)}
      {...props}
    />
  );
}
