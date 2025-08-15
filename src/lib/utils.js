import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes do Tailwind com clsx + tailwind-merge
 * Exemplo: cn("p-4", isActive && "bg-blue-500")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
