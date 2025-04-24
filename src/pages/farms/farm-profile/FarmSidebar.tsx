import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Farm } from "./FarmProfilePage";

interface FarmSidebarProps {
  farm: Farm;
  onRequireAuth: () => void;
}

export function FarmSidebar({ farm }: FarmSidebarProps) {
  const primaryPhoto =
    farm.photos.find((p) => p.is_primary)?.photo_url ||
    farm.photos[0]?.photo_url ||
    "/placeholder.svg";

  return (
    <div className="space-y-6">
      <Card className="top-6">
        <CardContent className="p-6">
          <div className="mb-4">
            <img
              src={primaryPhoto}
              alt={farm.farm_name}
              className="w-full h-40 object-cover rounded-lg"
            />
          </div>
          <h2 className="text-xl font-bold mb-2">{farm.farm_name}</h2>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {farm.region ? `${farm.region}, ` : ""}
            {farm.country}
          </div>
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <p>
              <b>Capacity:</b> {farm.capacity_kg?.toLocaleString()} kg
            </p>
            <p>
              <b>Altitude:</b> {farm.altitude_meters} meters
            </p>
            <p>
              <b>Verification:</b>{" "}
              {farm.verification_status.charAt(0).toUpperCase() +
                farm.verification_status.slice(1)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">About the Seller</h3>
          <div className="flex items-center mb-2">
            <img
              src={farm.seller.avatar_url_csv || "/placeholder.svg"}
              alt="Seller Avatar"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <div className="font-semibold">
                {farm.seller.first_name} {farm.seller.last_name}
              </div>
              <div className="text-xs text-muted-foreground">
                {farm.seller.email}
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-2 pt-2">
            <b className="font-bold mr-1">Rating:</b> {farm.seller.rating}
            <span className="ml-1 mr-1">
              <Star className="h-4 w-4 inline text-yellow-500 fill-current" />
            </span>
            ({farm.seller.total_reviews} review
            {farm.seller.total_reviews !== 1 ? "s" : ""})
          </div>
          <Link to={`/sellers/${farm.seller.id}`}>
            <Button variant="outline" className="w-full mt-2">
              View Seller Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
