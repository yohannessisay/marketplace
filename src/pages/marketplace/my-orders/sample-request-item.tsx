import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SampleRequest } from "../my-orders";
import { Calendar, ChevronDown, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";

export const SampleRequestItem = ({
  item,
  expandedOrderId,
  toggleOrderExpansion,
}: {
  item: SampleRequest;
  expandedOrderId: string;
  toggleOrderExpansion: (id: string) => void;
}) => {
  const isExpanded = expandedOrderId === item.id;

  return (
    <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center mb-2 gap-2">
              {item.coffee_listing?.listing_status === "active" && (
                <Badge
                  variant="outline"
                  className="sm:ml-2 bg-green-500 text-white border-0 w-fit"
                >
                  Active Listing
                </Badge>
              )}
              <h3 className="font-bold text-lg">
                {item.coffee_listing?.coffee_variety || "Unknown Coffee"}
              </h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {item.coffee_listing?.farm?.farm_name || "Unknown Farm"}
              {item.coffee_listing?.farm?.region
                ? `, ${item.coffee_listing.farm.region}`
                : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{item.weight.toFixed(2)} kg</div>
            <div className="text-sm text-muted-foreground">Sample Weight</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Requested: {new Date(item.created_at!).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{item.delivery_address || "Unknown Address"}</span>
          </div>
        </div>

        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm font-medium">
              {item.coffee_listing?.seller?.first_name || "Unknown"}{" "}
              <span className="hidden sm:inline">
                {item.coffee_listing?.seller?.last_name || ""}
              </span>
            </span>
            {item.coffee_listing?.seller && (
              <Link
                to={`/sellers/${item.coffee_listing.seller.id}`}
                className="ml-2 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                View Seller
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                item.delivery_status === "delivered"
                  ? "secondary"
                  : item.delivery_status === "inprogress"
                    ? "default"
                    : item.delivery_status === "pending"
                      ? "warning"
                      : "destructive"
              }
            >
              {item.delivery_status.charAt(0).toUpperCase() +
                item.delivery_status.slice(1)}
            </Badge>
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
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t animate-in fade-in-50 duration-300">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Sample Request Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Request ID:</span>
                    <span className="font-medium">{item.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Coffee Variety:
                    </span>
                    <span className="font-medium">
                      {item.coffee_listing?.coffee_variety || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">
                      {item.weight.toFixed(2)} kg
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires At:</span>
                    <span className="font-medium">
                      {new Date(item.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Seller & Delivery
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seller:</span>
                    <span className="font-medium">
                      {item.coffee_listing?.seller?.first_name || "N/A"}{" "}
                      <span className="hidden sm:inline">
                        {item.coffee_listing?.seller?.last_name || ""}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">
                      {item.coffee_listing?.seller?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{item.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium">
                      {item.delivery_address || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <Link to={`/listing/${item.coffee_listing.id}`}>
                <Button variant="outline">View Listing</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
