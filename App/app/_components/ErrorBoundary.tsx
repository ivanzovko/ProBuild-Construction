"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-900">
          <div className="bg-slate-800 border-2 border-slate-700 p-10 rounded-[40px] max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
              <AlertTriangle size={40} strokeWidth={2.5} />
            </div>
            
            <h2 className="text-2xl font-black uppercase italic text-white mb-3 tracking-tight">
              System Error
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase mb-10 leading-relaxed tracking-wider">
              An unexpected error has occurred in the application. Please try again or return to the homepage.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-slate-900 px-6 py-4 rounded-2xl font-black uppercase text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
              >
                <RefreshCcw size={16} strokeWidth={3} />
                Try Again
              </button>

              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-3 bg-slate-700 text-slate-300 px-6 py-4 rounded-2xl font-black uppercase text-xs transition-all hover:bg-slate-600 active:scale-95"
              >
                <Home size={16} strokeWidth={3} />
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;