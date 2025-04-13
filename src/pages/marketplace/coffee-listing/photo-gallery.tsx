"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CoffeePhoto } from "@/types/coffee";

interface PhotoGalleryProps {
  photos: CoffeePhoto[]|null;
  isOrganic: boolean;
}

export function PhotoGallery({ photos, isOrganic }: PhotoGalleryProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="grid grid-cols-2 gap-4 p-4">
        {photos&&photos.map((photo, index) => (
          <div key={index} className="relative aspect-video bg-muted">
            <img
              src={typeof photo === "string" ? photo : "/placeholder.svg"}
              alt={`Coffee ${index + 1}`}
              className="w-full h-full object-cover"
            />
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
        ))}
      </div>
      <div className="flex p-2 space-x-2 overflow-x-auto">
        {photos&&photos.map((photo, index) => (
          <button
            key={index}
            className={`flex-shrink-0 bg-card w-20 h-20 rounded border-2 ${
              index === activePhotoIndex
                ? "border-primary"
                : "border-transparent"
            }`}
            onClick={() => setActivePhotoIndex(index)}
          >
            <img
              src={typeof photo === "string" ? photo : "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover rounded"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
