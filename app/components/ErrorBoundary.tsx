'use client';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-red-500/30 p-4">
          <h2 className="text-xl font-mono text-red-400 mb-4">Something went wrong</h2>
          <div className="text-red-400/70 font-mono text-sm">
            {this.state.error?.message}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 