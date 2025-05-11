import { Farm } from "@/types/coffee"
import { MapPin } from "lucide-react" 

interface FarmInformationProps {
  listing: Farm|undefined
}

export function FarmInformation({ listing }: FarmInformationProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <MapPin size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium">{listing?.farm_name}</h3>
          <p className="text-muted-foreground">
            {listing?.region}, {listing?.country}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Altitude</h4>
          <p>{listing?.altitude_meters} meters</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Region</h4>
          <p>{listing?.region}</p>
        </div>
      </div>

      <div>
 
      </div>
    </div>
  )
}
