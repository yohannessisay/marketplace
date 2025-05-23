import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React from "react";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center mt-8">
          <Alert className="bg-white border-slate-200 rounded-lg max-w-md w-full">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <AlertTitle className="text-xl font-semibold text-slate-700">
              Something went wrong
            </AlertTitle>
            <AlertDescription className="text-slate-500 mt-2">
              {this.state.errorMessage || "An unexpected error occurred."}
            </AlertDescription>
            <div className="mt-4">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Refresh Page
              </Button>
            </div>
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}
