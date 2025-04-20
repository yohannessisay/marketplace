import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonForm = () => {
  return (
    <div
      className="space-y-8 shadow-lg px-8 rounded-md py-4 mt-8"
      aria-busy="true"
    >
      <div className="mb-10">
        <div className="mb-2">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mt-4" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          {[1, 2].map((i) => (
            <Card key={i} className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-32 w-full bg-gray-200 rounded-md animate-pulse" />
              </CardContent>
              <CardFooter>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-6" />

        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                </div>
              ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                </div>
              ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                </div>
              ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                </div>
              ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(2)
              .fill(0)
              .map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                </div>
              ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-8">
        <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  );
};

export const AddCropSkeletonForm = () => {
  return (
    <div
      className="space-y-8 shadow-lg p-8 rounded-md py-4 bg-white"
      aria-busy="true"
    >
      <Skeleton className="h-8 w-64 mx-auto rounded animate-pulse" />

      {/* Farm Selection */}
      <div className="mb-8">
        <Skeleton className="h-6 w-32 rounded animate-pulse mb-2" />
        <Skeleton className="h-4 w-96 rounded animate-pulse mb-4" />
        <div>
          <Skeleton className="h-4 w-24 rounded animate-pulse mb-2" />
          <Skeleton className="h-10 w-full rounded-md animate-pulse" />
        </div>
      </div>

      {/* Grading Report */}
      <div className="mb-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-48 rounded animate-pulse" />
            <Skeleton className="h-4 w-64 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full rounded-md animate-pulse" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-32 rounded animate-pulse" />
          </CardFooter>
        </Card>
        <Skeleton className="h-4 w-96 mx-auto rounded animate-pulse mt-4" />
      </div>

      {/* Crop Information */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 rounded animate-pulse mb-2" />
        <Skeleton className="h-4 w-96 rounded animate-pulse mb-6" />

        {/* Coffee Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 rounded animate-pulse mb-2" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
            ))}
        </div>

        {/* Crop Specification */}
        <Skeleton className="h-6 w-32 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 rounded animate-pulse mb-2" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
            ))}
        </div>

        {/* Cup Taste */}
        <Skeleton className="h-6 w-32 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 rounded animate-pulse mb-2" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
            ))}
        </div>

        {/* Coffee Crop Photos */}
        <Skeleton className="h-6 w-32 rounded animate-pulse mb-4" />
        <Skeleton className="h-4 w-96 rounded animate-pulse mb-4" />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-48 rounded animate-pulse" />
            <Skeleton className="h-4 w-64 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full rounded-md animate-pulse" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-32 rounded animate-pulse" />
          </CardFooter>
        </Card>
      </div>

      {/* Price and Discounts */}
      <div className="mb-8">
        <Skeleton className="h-6 w-32 rounded animate-pulse mb-2" />
        <Skeleton className="h-4 w-96 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 rounded animate-pulse mb-2" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
            ))}
        </div>
        <Skeleton className="h-6 w-24 rounded animate-pulse mb-2" />
        <Skeleton className="h-10 w-64 rounded-md animate-pulse" />
      </div>

      {/* Readiness and Delivery */}
      <div className="mb-8">
        <Skeleton className="h-6 w-32 rounded animate-pulse mb-2" />
        <Skeleton className="h-4 w-96 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 rounded animate-pulse mb-2" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
            ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end mb-8">
        <Skeleton className="h-10 w-32 rounded-md animate-pulse" />
      </div>
    </div>
  );
};
