"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CoffeePhoto } from "@/types/coffee";

interface PhotoGalleryProps {
  photos: CoffeePhoto[] | null;
  isOrganic: boolean;
}

export function PhotoGallery({ photos, isOrganic }: PhotoGalleryProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="flex flex-col gap-4 p-4">
        {photos && (
          <div className="relative">
            {photos.find((photo) => photo.is_primary) ? (
              <>
                <img
                  src={
                    photos.find((photo) => photo.is_primary)!.photo_url ||
                    "/placeholder.svg"
                  }
                  alt="Primary coffee photo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </>
            ) : (
              <img
                src={photos[0]?.photo_url || "/placeholder.svg"}
                alt="Coffee photo"
                className="w-full h-full object-cover rounded-lg"
              />
            )}

            {isOrganic && (
              <div className="absolute top-4 right-4">
                <Badge
                  variant="outline"
                  className="bg-green-500 text-white border-0"
                >
                  Organic
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex p-2 space-x-2 overflow-x-auto ml-2">
        {photos &&
          photos.map((photo, index) => (
            <button
              key={index}
              className={`flex-shrink-0 bg-card w-25 h-25 rounded border-2 ${
                index === activePhotoIndex
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onClick={() => setActivePhotoIndex(index)}
            >
              <img
                src={photo.photo_url ? photo.photo_url : "/placeholder.svg"}
                alt=""
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
      </div>
    </div>
  );
}
