import { Skeleton } from "@/components/ui/skeleton";
import { Coffee } from "lucide-react";
import { useState } from "react";

export function CoffeeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}
      {hasError ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100">
          <Coffee className="h-12 w-12 text-slate-400" />
        </div>
      ) : (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={`w-full h-full object-cover ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}
