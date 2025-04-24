import { MapPin, Coffee, Droplet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Farm } from "./FarmProfilePage";

interface FarmDetailsProps {
  farm: Farm;
  onRequireAuth: () => void;
}

export function FarmDetails({ farm }: FarmDetailsProps) {
  const primaryPhoto =
    farm.photos.find((p) => p.is_primary)?.photo_url ||
    farm.photos[0]?.photo_url ||
    "/placeholder.svg";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <img
            src={primaryPhoto}
            alt={farm.farm_name}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4">{farm.farm_name}</h1>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          {farm.town_location ? `${farm.town_location}, ` : ""}
          {farm.region ? `${farm.region}, ` : ""}
          {farm.country}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Farm Details</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <b>Total Size:</b> {farm.total_size_hectares} hectares
              </p>
              <p>
                <b>Coffee Area:</b> {farm.coffee_area_hectares} hectares
              </p>
              <p>
                <b>Altitude:</b> {farm.altitude_meters} meters
              </p>
              <p>
                <b>Capacity:</b> {farm.capacity_kg?.toLocaleString()} kg
              </p>
              <p>
                <b>Verification Status:</b>{" "}
                {farm.verification_status.charAt(0).toUpperCase() +
                  farm.verification_status.slice(1)}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Crop Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <Coffee className="h-4 w-4 inline mr-1" />
                <b>Crop Type:</b> {farm.crop_type || "N/A"}
              </p>
              <p>
                <b>Tree Variety:</b> {farm.tree_variety || "N/A"}
              </p>
              <p>
                <b>Soil Type:</b> {farm.soil_type || "N/A"}
              </p>
              <p>
                <Droplet className="h-4 w-4 inline mr-1" />
                <b>Annual Rainfall:</b>{" "}
                {farm.annual_rainfall_mm
                  ? `${farm.annual_rainfall_mm} mm`
                  : "N/A"}
              </p>
              <p>
                <b>Average Temperature:</b>{" "}
                {farm.avg_annual_temp ? `${farm.avg_annual_temp}°C` : "N/A"}
              </p>
            </div>
          </div>
        </div>
        {farm.photos.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Additional Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {farm.photos
                .filter((p) => !p.is_primary)
                .map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.photo_url}
                    alt="Farm Photo"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
