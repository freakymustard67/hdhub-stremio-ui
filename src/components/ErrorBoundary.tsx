"use client";
import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"><AlertTriangle className="h-6 w-6 text-destructive" /></div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">A component error occurred.</p>
          <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false })}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
