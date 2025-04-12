import { Award } from 'lucide-react'
import { CoffeeListing } from "@/types/coffee"

interface CupProfileProps {
  listing: CoffeeListing
}

export function CupProfile({ listing }: CupProfileProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-yellow-100 rounded-full p-2">
          <Award size={24} className="text-yellow-600" />
        </div>
        <div>
          <div className="text-xl font-bold">{listing.score}</div>
          <div className="text-xs text-muted-foreground">Cup Score</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Acidity</h4>
            <p className="text-sm text-muted-foreground">{listing.cupProfile.acidity}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Body</h4>
            <p className="text-sm text-muted-foreground">{listing.cupProfile.body}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Sweetness</h4>
            <p className="text-sm text-muted-foreground">{listing.cupProfile.sweetness}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Aftertaste</h4>
            <p className="text-sm text-muted-foreground">{listing.cupProfile.aftertaste}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Aroma</h4>
            <p className="text-sm text-muted-foreground">{listing.cupProfile.aroma}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-violet-400"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Balance</h4>
            <p className="text-sm text-muted-foreground">{listing.cupProfile.balance}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
