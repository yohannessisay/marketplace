import { CoffeeListing } from "@/types/coffee";

interface CoffeeDetailsTabProps {
  listing: CoffeeListing | null;
}

export function CoffeeDetailsTab({ listing }: CoffeeDetailsTabProps) {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Variety</h4>
          <p>{listing?.coffee_variety || "N/A"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            Processing
          </h4>
          <p>{listing?.processing_method || "N/A"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            Bean Type
          </h4>
          <p>{listing?.bean_type || "N/A"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            Crop Year
          </h4>
          <p>{listing?.crop_year || "N/A"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            Quantity Available
          </h4>
          <p>{listing?.quantity_kg ? `${listing.quantity_kg} kg` : "N/A"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            Ready By
          </h4>
          <p>{listing?.readiness_date?.slice(0, 10) || "N/A"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Organic</h4>
          <p>{listing?.is_organic ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  );
}
