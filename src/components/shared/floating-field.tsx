"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Champ à libellé flottant (style « outlined ») : au repos le libellé est dans
// le champ ; au focus ou une fois rempli, il remonte et se pose sur la
// bordure supérieure. Compatible react-hook-form (ref transmise).
interface FloatingFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  /** Élément à droite dans le champ (ex. bouton afficher le mot de passe). */
  endAdornment?: ReactNode;
  /** Version compacte (48 px au lieu de 56) pour les formulaires longs. */
  dense?: boolean;
  /** Message d'erreur posé sous le champ sans décaler la suite du formulaire
   *  (prévoir un écart d'au moins 20 px sous le champ). */
  errorOverlay?: boolean;
}

export const FloatingField = forwardRef<HTMLInputElement, FloatingFieldProps>(function FloatingField(
  { id, label, error, required, endAdornment, dense = false, errorOverlay = false, className, ...props },
  ref,
) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={errorOverlay ? "relative" : undefined}>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          aria-required={required || undefined}
          className={cn(
            "peer block w-full rounded-xl border-2 border-foreground/15 bg-card px-4 text-foreground shadow-xs outline-none transition-[border-color,box-shadow]",
            dense ? "h-12 text-sm" : "h-14 text-[15px]",
            "hover:border-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15",
            "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/15",
            "dark:border-white/15 dark:hover:border-white/30",
            endAdornment ? "pr-12" : "",
            className,
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 max-w-[calc(100%-1.5rem)] -translate-y-1/2 truncate rounded px-1.5 text-muted-foreground transition-all duration-200",
            dense ? "text-sm" : "text-[15px]",
            // Libellé remonté sur la bordure : focus, champ rempli, autoremplissage.
            "peer-focus:top-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary",
            "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold",
            "peer-autofill:top-0 peer-autofill:text-xs peer-autofill:font-semibold",
            "peer-aria-[invalid=true]:text-destructive",
            // Fond coupé en deux (page au-dessus, champ en dessous) une fois remonté.
            "peer-focus:bg-[linear-gradient(to_bottom,var(--background)_50%,var(--card)_50%)]",
            "peer-[:not(:placeholder-shown)]:bg-[linear-gradient(to_bottom,var(--background)_50%,var(--card)_50%)]",
            "peer-autofill:bg-[linear-gradient(to_bottom,var(--background)_50%,var(--card)_50%)]",
          )}
        >
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
        {endAdornment && <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{endAdornment}</div>}
      </div>
      {error && (
        <p
          id={errorId}
          className={cn(
            "px-1 font-medium text-destructive",
            errorOverlay ? "absolute left-0 top-full mt-0.5 w-full truncate text-[11px] leading-tight" : "mt-1.5 text-xs",
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
});
