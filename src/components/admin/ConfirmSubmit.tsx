"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Submit button guarded by a native confirm(). Used for destructive actions —
 * the form still posts to a server action, so blocking here is purely a UX
 * safety net, not a security control.
 */
export default function ConfirmSubmit({
  message,
  children,
  className = "btn btn-danger",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
