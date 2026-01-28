import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCcw } from 'lucide-react';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-bg text-text p-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
            <p className="text-muted-foreground max-w-md">
              We apologize for the inconvenience. The application encountered an unexpected error.
            </p>
            {this.state.error && (
              <pre className="mt-4 max-h-40 max-w-md overflow-auto rounded bg-surface/50 p-4 text-left text-xs text-muted font-mono">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="gap-2"
            variant="primary"
          >
            <RefreshCcw size={16} />
            Reload Application
          </Button>
        </div>
      );
    }

    return (this.props as any).children;
  }
}
