"use client";
import * as React from "react";
import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextType { open: boolean; onClose: () => void; }
const DialogContext = React.createContext<DialogContextType>({ open: false, onClose: () => {} });

interface DialogProps { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode; }

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); }, [onOpenChange]);
  useEffect(() => {
    if (open) { document.addEventListener("keydown", handleKeyDown); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
  }, [open, handleKeyDown]);
  return <DialogContext.Provider value={{ open, onClose: () => onOpenChange(false) }}><AnimatePresence>{open && children}</AnimatePresence></DialogContext.Provider>;
}

export function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("fixed inset-0 z-50 bg-black/70 backdrop-blur-sm", className)}
      {...(props as any)}
    />
  );
}

interface DialogContentProps { children: React.ReactNode; className?: string; size?: "sm" | "md" | "lg" | "xl" | "full"; }

export function DialogContent({ children, className, size = "lg" }: DialogContentProps) {
  const { onClose } = React.useContext(DialogContext);
  const sizeClasses = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl", full: "max-w-[95vw] h-[90vh]" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <DialogOverlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        role="dialog" aria-modal="true"
        className={cn("relative z-50 w-full rounded-xl border border-border bg-card shadow-2xl overflow-hidden", sizeClasses[size], className)}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors" aria-label="Close dialog">
          <X className="h-5 w-5" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-y-auto p-6", className)} {...props} />;
}
