import React from 'react';

interface State {
  error: Error | null;
}

type Props = { children: React.ReactNode };

export default class ErrorBoundary extends React.Component<Props, State> {
  declare props: Readonly<Props>;
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAFA]">
          <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 p-8 shadow-sm space-y-4">
            <h1 className="text-xl font-bold text-red-600">Something went wrong</h1>
            <p className="text-sm text-slate-600">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
