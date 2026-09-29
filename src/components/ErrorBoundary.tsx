import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { humanizeError } from '../utils/humanizedErrors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const friendly = humanizeError(this.state.error);

      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 select-none font-sans">
          <div className="relative max-w-md w-full bg-zinc-900/95 rounded-3xl p-8 shadow-soft-2xl text-center overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"
            />

            {/* Friendly Badge */}
            <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shadow-soft-sm">
              <AlertCircle className="w-8 h-8 animate-pulse" />
            </div>

            <h2 className="relative z-10 text-xl font-bold tracking-tight text-white mb-2">
              {friendly.title}
            </h2>

            <p className="relative z-10 text-xs text-zinc-400 leading-relaxed mb-6">
              {friendly.message}
            </p>

            <div className="relative z-10 p-3.5 rounded-2xl bg-zinc-950/70 text-[11px] text-zinc-300 mb-6 text-left flex items-start gap-2.5 shadow-soft-xs">
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>{friendly.actionHint}</span>
            </div>

            <button
              onClick={this.handleReset}
              className="relative z-10 w-full h-11 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all shadow-soft-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh & Keep Teaching</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
