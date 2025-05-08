import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const SkeletonOrdersTable = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const SkeletonSampleRequestsTable = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const SkeletonBidsTable = () => (
  <Card>
    <CardContent className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeader>
              <Skeleton className="h-5 w-24" />
            </TableHeader>
            <TableHeader>
              <Skeleton className="h-5 w-32" />
            </TableHeader>
            <TableHeader>
              <Skeleton className="h-5 w-24" />
            </TableHeader>
            <TableHeader>
              <Skeleton className="h-5 w-20" />
            </TableHeader>
            <TableHeader>
              <Skeleton className="h-5 w-20" />
            </TableHeader>
            <TableHeader>
              <Skeleton className="h-5 w-24" />
            </TableHeader>
            <TableHeader>
              <Skeleton className="h-5 w-20" />
            </TableHeader>
            <TableHeader>
              <Skeleton className="h-5 w-28" />
            </TableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export function SkeletonPhotoGallery() {
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
      <div className="flex p-2 space-x-2 overflow-x-auto ml-3">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="w-20 h-20 rounded" />
          ))}
      </div>
    </div>
  );
}

export function SkeletonCardContent() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-baseline mb-6">
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonBids() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="py-4 flex justify-between">
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonMessages() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="py-4 flex justify-between">
                <div className="flex">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonStats() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
