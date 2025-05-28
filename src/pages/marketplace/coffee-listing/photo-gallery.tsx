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
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 p-1 sm:p-2">
        {photos && photos.length > 0 ? (
          <div className="relative">
            <img
              src={photos[activePhotoIndex].photo_url || "/placeholder.svg"}
              alt={`Coffee photo ${activePhotoIndex + 1}`}
              className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
            />
            {isOrganic && (
              <div className="absolute top-4 right-4">
                <Badge
                  variant="outline"
                  className="bg-green-500 text-white border-0 text-xs sm:text-sm"
                >
                  Organic
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <img
              src="/placeholder.svg"
              alt="No coffee photo available"
              className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      {photos && photos.length > 0 && (
        <div className="flex p-2 space-x-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={index}
              className={`flex-shrink-0 bg-card w-20 h-20 sm:w-24 sm:h-24 rounded border-2 cursor-pointer ${
                index === activePhotoIndex
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onClick={() => setActivePhotoIndex(index)}
            >
              <img
                src={photo.photo_url || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
