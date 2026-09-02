"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Component-level Error Boundary
 * Prevents a failure in one widget (e.g. broken image, slider, weather widget)
 * from crashing the entire page or turning the screen white.
 */
export class SafeErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[SafeErrorBoundary] Error in ${this.props.componentName || "Component"}:`,
      error,
      errorInfo
    );
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-950/10 text-center my-2">
          <p className="text-xs text-slate-400 font-medium">
            Temporary issue loading this widget.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
          >
            Retry / Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
