"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface PhotoGalleryProps {
  photos: string[]
  isOrganic: boolean
}

export function PhotoGallery({ photos, isOrganic }: PhotoGalleryProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="relative aspect-video bg-muted">
        <img 
          src={photos[activePhotoIndex] || "/placeholder.svg"} 
          alt="Coffee" 
          className="w-full h-full object-cover"
        />
        {isOrganic && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-green-500 text-white border-0">
              Organic
            </Badge>
          </div>
        )}
      </div>
      <div className="flex p-2 space-x-2 overflow-x-auto">
        {photos.map((photo, index) => (
          <button 
            key={index}
            className={`flex-shrink-0 bg-card w-20 h-20 rounded border-2 ${
              index === activePhotoIndex ? 'border-primary' : 'border-transparent'
            }`}
            onClick={() => setActivePhotoIndex(index)}
          >
            <img src={photo || "/placeholder.svg"} alt="" className="w-full h-full object-cover rounded" />
          </button>
        ))}
      </div>
    </div>
  )
}
