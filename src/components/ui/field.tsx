import { cn } from "@/lib/cn";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-navy-200", className)} {...props} />;
}

interface FieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {hint && <span className="ml-1 font-normal text-navy-400">{hint}</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{children}</p>
  );
}

export function FormSuccess({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{children}</p>
  );
}
