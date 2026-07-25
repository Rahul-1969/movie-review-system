import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 text-red-500 p-4">
          <div className="glass p-8 rounded-xl max-w-2xl text-center overflow-auto">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <div className="text-sm opacity-80 whitespace-pre-wrap font-mono text-left bg-dark-900 p-4 rounded-lg overflow-auto">
              <p className="font-bold">{this.state.error?.toString()}</p>
              <p className="mt-2 text-xs text-slate-400">{this.state.errorInfo?.componentStack}</p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
