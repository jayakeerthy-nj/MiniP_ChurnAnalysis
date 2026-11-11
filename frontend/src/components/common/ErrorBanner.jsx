import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

export const ErrorBanner = ({
  error,
  onRetry,
  retryLabel = "Retry Connection",
  className = ""
}) => {
  if (!error) return null;

  return (
    <div
      className={`p-4 bg-red-950/70 border border-red-600/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-200 animate-fade-in shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <span className="font-mono truncate">{error}</span>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          className="shrink-0 border-red-700/60 hover:bg-red-900/40 text-red-200"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorBanner;

