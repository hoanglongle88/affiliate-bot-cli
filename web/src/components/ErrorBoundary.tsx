import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 sm:p-8 border border-red-500/30 max-w-md text-center">
            <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">Đã xảy ra lỗi</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {this.state.error?.message || "Không thể tải nội dung"}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium text-sm"
            >
              <RefreshCw size={16} />
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
