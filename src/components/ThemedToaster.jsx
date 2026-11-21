"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export default function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : "system"}
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "border-line bg-surface-raised text-foreground shadow-lg",
        },
      }}
    />
  );
}
