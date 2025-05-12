import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Favorite } from "@/types/orders";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Calendar, ChevronDown, Coffee, User } from "lucide-react";
import { Link } from "react-router-dom";

export const FavoriteItem = ({
  item,
  expandedOrderId,
  toggleOrderExpansion,
}: {
  item: Favorite;
  expandedOrderId: string;
  toggleOrderExpansion: (id: string) => void;
}) => {
  const isExpanded = expandedOrderId === item.id;

  return (
    <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="font-bold text-lg">
                {item.listing?.coffee_variety || "Unknown Coffee"}
              </h3>
              {item.listing?.listing_status === "active" && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-500 text-white border-0"
                >
                  Active Listing
                </Badge>
              )}
              {item.listing?.is_organic && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-500 text-white border-0"
                >
                  Organic
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {item.listing?.farm?.farm_name || "Unknown Farm"}
              {item.listing?.farm?.region
                ? `, ${item.listing.farm.region}`
                : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-green-600">
              ${item.listing?.price_per_kg?.toFixed(2) || "N/A"}/kg
            </div>
            <div className="text-sm text-muted-foreground">
              {item.listing?.quantity_kg?.toLocaleString() || "0"} kg available
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Favorited: {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center">
            <Coffee className="h-4 w-4 mr-1" />
            <span>{item.listing?.bean_type || "Unknown"}</span>
          </div>
        </div>

        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm font-medium">
              {item.listing.seller?.first_name || "Unknown"}{" "}
              {item.listing.seller?.last_name || ""}
            </span>
            {item.seller && (
              <Link
                to={`/sellers/${item.seller.first_name?.toLowerCase()}-${item.seller.last_name?.toLowerCase()}`}
                className="ml-2 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                View Seller
              </Link>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleOrderExpansion(item.id)}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t animate-in fade-in-50 duration-300">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Listing Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Listing ID:</span>
                    <span className="font-medium">{item.listing_id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Coffee Variety:
                    </span>
                    <span className="font-medium">
                      {item.listing?.coffee_variety || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Processing Method:
                    </span>
                    <span className="font-medium">
                      {item.listing?.processing_method || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cup Score:</span>
                    <span className="font-medium">
                      {item.listing?.cup_score || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Farm Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Farm:</span>
                    <span className="font-medium">
                      {item.listing?.farm?.farm_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Region:</span>
                    <span className="font-medium">
                      {item.listing?.farm?.region || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium">
                      {item.listing?.farm?.country || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <Link to={`/listing/${item.listing_id}`}>
                <Button variant="outline">View Listing</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
