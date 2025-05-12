"use client";

import { Droplet, Coffee, Star, Heart, Loader2, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CoffeeListing } from "@/types/coffee";
import { CoffeeImage } from "./coffee-image";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface ListingCardProps {
  listing: CoffeeListing;
  isFavorited: boolean;
  isFavoriteLoading: boolean;
  onCardClick: () => void;
  onFavoriteToggle: () => Promise<void> | void;
  onRequireAuth: () => void;
  setAuthMessage: (message: string) => void;
}

export function ListingCard({
  listing,
  isFavorited,
  isFavoriteLoading,
  onCardClick,
  onFavoriteToggle,
  onRequireAuth,
  setAuthMessage,
}: ListingCardProps) {
  const { user } = useAuth();
  const [optimisticFavorited, setOptimisticFavorited] = useState(isFavorited);

  const getPrimaryPhotoUrl = (): string => {
    const primaryPhoto = listing?.coffee_photo.find(
      (photo) => photo.is_primary,
    );
    return primaryPhoto ? primaryPhoto.photo_url : "/placeholder.svg";
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      setAuthMessage(
        "To favorite this listing you have to login or signup for an AfroValley account",
      );
      onRequireAuth();
      return;
    }
    if (user.userType === "seller" || isFavoriteLoading) return;

    const previousFavorited = optimisticFavorited;
    setOptimisticFavorited(!optimisticFavorited);

    try {
      await onFavoriteToggle();
    } catch (error) {
      setOptimisticFavorited(previousFavorited);
      console.error("Failed to toggle favorite:", error);
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onCardClick}
    >
      <div className="relative h-40 bg-slate-200">
        <CoffeeImage
          src={getPrimaryPhotoUrl()}
          alt={listing?.coffee_variety}
          className="w-full h-full"
        />
        {listing?.is_organic && (
          <Badge className="absolute top-2 right-2 bg-emerald-500">
            Organic
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-800">
            {listing?.coffee_variety}
          </h3>
          <div className="flex items-center bg-amber-50 px-2 py-1 rounded">
            <Star className="h-4 w-4 text-amber-500 mr-1" />
            <span className="text-sm font-medium text-amber-700">
              {listing?.grade}
            </span>
          </div>
        </div>
        <p className="text-slate-600 text-sm mb-2">
          {listing?.farm?.farm_name}
        </p>
        <div className="flex items-center text-slate-500 text-sm mb-4">
          <Map className="h-4 w-4 mr-1" />
          <span>
            {listing?.farm?.region}, {listing?.farm?.country}
          </span>
        </div>
        <div className="flex items-center text-slate-500 text-sm mb-2">
          <Droplet className="h-4 w-4 mr-1" />
          <span>{listing?.processing_method}</span>
        </div>
        <div className="flex items-center text-slate-500 text-sm mb-2">
          <Coffee className="h-4 w-4 mr-1" />
          <span>{listing?.bean_type}</span>
        </div>
        {user?.userType !== "seller" && (
          <div className="flex justify-end items-end mb-2 mt-4">
            <button
              role="button"
              aria-label={optimisticFavorited ? "Unfavorite" : "Favorite"}
              disabled={isFavoriteLoading}
              className="cursor-pointer focus:outline-none disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                handleFavoriteClick();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFavoriteClick();
                }
              }}
            >
              {isFavoriteLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <Heart
                  className={`h-5 w-5 transition-colors duration-200 ${
                    optimisticFavorited
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-400 stroke-slate-400"
                  }`}
                  strokeWidth={2}
                  fill={optimisticFavorited ? "currentColor" : "none"}
                />
              )}
            </button>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between">
        <div className="text-emerald-700 font-bold">
          ${listing?.price_per_kg.toFixed(2)}/kg
        </div>
        <div className="text-slate-500 text-sm">
          {listing?.quantity_kg.toLocaleString()} kg available
        </div>
      </CardFooter>
    </Card>
  );
}
