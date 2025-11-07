import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  // FIX: Explicitly declaring the 'state' property resolves TypeScript errors where 'state' and 'props'
  // were not being found on the component instance. In some strict configurations, class properties 
  // that are initialized in the constructor must also be declared at the class level.
  state: State;

  // FIX: To resolve "Property 'props' does not exist", 'props' is also explicitly declared,
  // following the same pattern as 'state' above for this component's specific configuration.
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    // This lifecycle method is static and does not have access to `this`.
    // It returns an object to update the state.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-neutral-50 text-neutral-800 p-4">
            <h1 className="text-2xl font-bold text-center">Ocorreu um erro inesperado.</h1>
            <p className="mt-2 text-neutral-600 text-center">
                Nossa equipe já foi notificada. Por favor, recarreghe a página e tente novamente.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
                Recarregar Página
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
