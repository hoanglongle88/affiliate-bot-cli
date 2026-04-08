import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    console.error('[ErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center p-8">
          <div className="max-w-md rounded-xl border border-red-500/30 bg-[var(--bg-card)] p-6 text-center sm:p-8">
            <AlertTriangle className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="mb-2 text-lg font-semibold">Đã xảy ra lỗi</h3>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              {this.state.error?.message || 'Không thể tải nội dung'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)]"
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
