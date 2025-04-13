import { Loader2 } from "lucide-react";

  export const LoadingState = () => {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading orders...</span>
      </div>
    );
  };