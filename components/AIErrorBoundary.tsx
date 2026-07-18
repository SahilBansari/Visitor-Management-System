import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const isAiApiError = (error: Error | undefined) => {
    // In a real app, we'd inspect the error object for specifics
    return true;
}

class AIErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AI Feature Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError && isAiApiError(this.state.error)) {
      return (
        <div className="p-4 m-4 bg-error/10 text-error border border-error/20 rounded-lg text-center">
            <h3 className="font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">error</span>
                AI Feature Unavailable
            </h3>
            <p className="text-sm mt-1">An AI-powered feature is temporarily unavailable. You can continue using the manual process.</p>
            <button 
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="mt-3 bg-white border border-error/30 text-error text-xs font-bold py-1 px-3 rounded-md hover:bg-error/5 transition-colors"
            >
                Retry Feature
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AIErrorBoundary;