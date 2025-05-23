import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";

export const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="mb-4">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 sm:w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full sm:w-3/4"></div>
            </div>
            <div className="text-left sm:text-right">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20 sm:w-24 mt-1"></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center mt-2 gap-3">
            <div className="h-4 bg-gray-200 rounded w-28 sm:w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-28 sm:w-32"></div>
          </div>
          <Separator className="my-3" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="h-4 bg-gray-200 rounded w-32 sm:w-40"></div>
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded w-14 sm:w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
