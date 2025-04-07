import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center cursor-pointer justify-center rounded bg-black text-white text-sm font-medium transition-colors hover:bg-gray-800 disabled:opacity-50",
        "px-4 py-2",
        className
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";
