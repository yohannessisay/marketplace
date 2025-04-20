import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="relative h-40 bg-gray-200">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-5 w-12 rounded" />
        </div>
        <Skeleton className="h-4 w-1/2 mb-2" />
        <div className="flex items-center mb-4">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center mb-2">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex items-center mb-2">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-end mt-4">
          <Skeleton className="h-5 w-5" />
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  );
}
