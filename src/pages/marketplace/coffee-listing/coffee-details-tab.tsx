import { CoffeeListing } from "@/types/coffee"

interface CoffeeDetailsTabProps {
  listing: CoffeeListing
}

export function CoffeeDetailsTab({ listing }: CoffeeDetailsTabProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Description</h3>
        <p className="text-muted-foreground text-sm">{listing.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Variety</h4>
          <p>{listing.variety}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Processing</h4>
          <p>{listing.processing}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Bean Type</h4>
          <p>{listing.beanType}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Crop Year</h4>
          <p>{listing.cropYear}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Quantity Available</h4>
          <p>{listing.availableQuantity} kg</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Ready By</h4>
          <p>{listing.readinessDate}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Farming Practice</h4>
          <p>{listing.farmingPractice}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Organic</h4>
          <p>{listing.isOrganic ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}
