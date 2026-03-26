import { useStore } from "@/store/useStore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastSystem() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-xl border min-w-[300px] max-w-md",
              "bg-surface/90 backdrop-blur-xl border-border",
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green shrink-0 mt-0.5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue shrink-0 mt-0.5" />}
            
            <p className="text-sm font-medium text-text-primary flex-1">
              {toast.message}
            </p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
