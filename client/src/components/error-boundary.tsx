import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
  isChunkError: boolean;
  isNetworkError: boolean;
}

function isChunkLoadError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('loading chunk') ||
    message.includes('loading css chunk') ||
    message.includes('dynamically imported module') ||
    message.includes('failed to fetch') ||
    message.includes('failed to load module') ||
    message.includes('error loading') ||
    error.name === 'ChunkLoadError'
  );
}

function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('connection') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && message.includes('failed to fetch')
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isChunkError: false,
      isNetworkError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const chunkError = isChunkLoadError(error);
    const networkError = isNetworkError(error);
    return { 
      hasError: true, 
      error, 
      errorInfo: error.message,
      isChunkError: chunkError,
      isNetworkError: networkError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReload = () => {
    window.location.href = window.location.href.split('?')[0] + '?_=' + Date.now();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isChunkError: false,
      isNetworkError: false
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isChunkError, isNetworkError } = this.state;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                {isNetworkError ? (
                  <WifiOff className="w-8 h-8 text-destructive" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {isChunkError || isNetworkError 
                  ? '연결 오류' 
                  : '페이지 로딩 오류'
                }
              </h1>
              <p className="text-muted-foreground">
                {isChunkError 
                  ? '페이지 리소스를 불러올 수 없습니다. 새로고침을 시도해 주세요.'
                  : isNetworkError
                  ? '네트워크 연결을 확인해 주세요.'
                  : '페이지를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.'
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isChunkError ? (
                <Button onClick={this.handleHardReload} variant="default" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  새로고침
                </Button>
              ) : (
                <Button onClick={this.handleRetry} variant="default" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  다시 시도
                </Button>
              )}
              <Button onClick={this.handleReload} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                새로고침
              </Button>
              <Button onClick={this.handleGoHome} variant="ghost" className="gap-2">
                <Home className="w-4 h-4" />
                홈으로
              </Button>
            </div>

            {this.state.error && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-left">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  Error: {this.state.error.name || 'Unknown'}
                </p>
                <p className="text-xs font-mono text-muted-foreground break-all mt-1">
                  {this.state.error.message?.substring(0, 200) || 'No message'}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
