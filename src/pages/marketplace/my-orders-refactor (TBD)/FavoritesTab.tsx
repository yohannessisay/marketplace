import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Listing {
  id: string;
  coffee_variety?: string;
  farm_name?: string;
  region?: string;
  processing_method?: string;
  bean_type?: string;
  price_per_kg?: number;
  seller: any;
  cup_score?: string;
  is_organic?: boolean;
  quantity_kg?: number;
  farm?: {
    farm_id: string;
    farm_name: string;
    region: string | null;
    country: string;
  };
}

interface Favorite {
  id: string;
  listing_id: string;
  seller: any;
  buyer_id: string;
  created_at: string;
  listing: Listing;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const FavoritesTab: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesPagination, setFavoritesPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [favoritesCurrentPage, setFavoritesCurrentPage] = useState<number>(1);
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState<string>("");
  const { errorMessage } = useNotification();

  useEffect(() => {
    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/favorites?page=${favoritesCurrentPage}&limit=${
            favoritesPagination.limit
          }&search=${encodeURIComponent(favoritesSearchTerm)}`
        );
        if (response.success) {
          setFavorites(response.data.favorites || []);
          setFavoritesPagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
            }
          );
        } else {
          setFavoritesError("Failed to fetch favorites");
        }
      } catch (err: unknown) {
        const errorResponse = err as APIErrorResponse;
        setFavoritesError(errorResponse.error?.message || "An error occurred");
        errorMessage(errorResponse);
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [favoritesCurrentPage, favoritesSearchTerm]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search favorites..."
          value={favoritesSearchTerm}
          onChange={(e) => setFavoritesSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {favoritesLoading ? (
        <div>Loading...</div>
      ) : favoritesError ? (
        <div className="text-red-500">{favoritesError}</div>
      ) : (
        <div>
          {favorites.length === 0 ? (
            <div>No favorites found.</div>
          ) : (
            favorites.map((fav) => (
              <Card key={fav.id} className="mb-4">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">
                        {fav.listing?.coffee_variety || "Unknown Coffee"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {fav.listing?.farm_name || "Unknown Farm"}
                        {fav.listing?.region ? `, ${fav.listing.region}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-pink-100 text-pink-600 border-0">
                        <Heart className="h-4 w-4 mr-1 inline" />
                        Favorite
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
                    <div className="flex items-center">
                      <span>
                        Added: {new Date(fav.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setFavoritesCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  aria-disabled={favoritesCurrentPage === 1}
                />
              </PaginationItem>
              {[...Array(favoritesPagination.total_pages)].map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={favoritesCurrentPage === idx + 1}
                    onClick={() => setFavoritesCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setFavoritesCurrentPage((prev) =>
                      Math.min(prev + 1, favoritesPagination.total_pages)
                    )
                  }
                  aria-disabled={favoritesCurrentPage === favoritesPagination.total_pages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;