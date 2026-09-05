import { Loader2 } from "lucide-react";

export default function LoadingDialog({
  open,
  message,
  submessage = "This usually takes 5-10 seconds.",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-text-primary/40 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <Loader2 className="text-primary mx-auto mb-4 animate-spin" size={32} />
        <p className="font-display text-lg text-text-primary mb-1">{message}</p>
        <p className="text-text-muted text-sm">{submessage}</p>
      </div>
    </div>
  );
}
