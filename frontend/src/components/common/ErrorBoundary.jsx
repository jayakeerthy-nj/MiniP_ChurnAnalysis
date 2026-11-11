import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui/button";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[Institutional ErrorBoundary Caught]:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 select-none">
          <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-600/40 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-100 uppercase tracking-wide font-mono">
                Component Render Anomaly Detected
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An unexpected state occurred while processing telemetry or charting components. Safe mode active; core database services remain unaffected.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-lg text-left text-[11px] font-mono text-red-300 max-h-32 overflow-y-auto break-all">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReset}
                icon={RefreshCw}
              >
                Reset Component
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => (window.location.href = "/dashboard")}
                icon={Home}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

