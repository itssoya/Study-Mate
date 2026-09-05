import { CloudOff, RefreshCw, X } from "lucide-react";

export default function ErrorDialog({
  open,
  onClose,
  onRetry,
  retryable,
  message,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-text-primary/40 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-full bg-warning/15 flex items-center justify-center mx-auto mb-4">
          <CloudOff className="text-warning" size={24} />
        </div>

        <p className="font-display text-lg text-text-primary mb-2">
          {retryable ? "AI is a little busy right now" : "Something went wrong"}
        </p>
        <p className="text-text-muted text-sm mb-6">
          {retryable
            ? "Our AI provider is experiencing high demand. This usually clears up within a minute — try again shortly."
            : message}
        </p>

        <div className="flex gap-3 justify-center">
          {retryable && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          )}
          <button
            onClick={onClose}
            className="border border-primary-light/30 text-text-primary px-5 py-2.5 rounded-lg font-medium hover:bg-primary-light/10"
          >
            {retryable ? "Later" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
