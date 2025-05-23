import { Award, Star } from "lucide-react";
import { CoffeeListing } from "@/types/coffee";
import { Badge } from "@/components/ui/badge";

interface CupProfileProps {
  listing: CoffeeListing | null;
}

export function CupProfile({ listing }: CupProfileProps) {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-yellow-100 rounded-full p-2">
          <Award size={20} className="text-yellow-600" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold">Cup Profile</div>
          <div className="text-xs text-muted-foreground">Taste & Aroma</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Grading</h4>
            <Badge
              variant="outline"
              className="bg-yellow-100 text-yellow-800 border-0"
            >
              <Star size={16} className="mr-1 text-yellow-500 fill-current" />
              {listing?.grade || "Not graded"}
            </Badge>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Aroma</h4>
            <div className="flex flex-wrap gap-2">
              {listing?.cup_aroma && listing.cup_aroma.length > 0 ? (
                listing.cup_aroma.map((aroma, index) => (
                  <Badge
                    key={`aroma-${index}`}
                    variant="default"
                    className="text-xs sm:text-sm"
                  >
                    {aroma}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No aroma data</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3 col-span-1 sm:col-span-2">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Taste Profile</h4>
            <div className="flex flex-wrap gap-2">
              {listing?.cup_taste && listing.cup_taste.length > 0 ? (
                listing.cup_taste.map((taste, index) => (
                  <Badge
                    key={`taste-${index}`}
                    variant="default"
                    className="text-xs sm:text-sm"
                  >
                    {taste}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No taste data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
