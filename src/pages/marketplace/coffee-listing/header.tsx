import { ArrowLeft } from 'lucide-react'
import { Star } from 'lucide-react'
import { OrderStatus } from "@/types/order"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeaderProps {
  demoOrderStatus: OrderStatus
  setDemoOrderStatus: (status: OrderStatus) => void
  sellerName: string
  sellerRating: number
  sellerReviews: number
}

export function Header({ 
  demoOrderStatus, 
  setDemoOrderStatus,
  sellerName,
  sellerRating,
  sellerReviews
}: HeaderProps) {
  return (
    <header className="bg-card shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center">
          <button 
            onClick={() => window.history.back()} 
            className="flex bg-card items-center text-muted-foreground mr-4 hover:text-primary"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back to Marketplace</span>
          </button>
          <h1 className="text-xl font-semibold text-foreground flex-1">Coffee Details</h1>
          
          {/* Demo Mode Selector - Remove in production */}
          <div className="mr-4 w-64">
            <Select 
              value={demoOrderStatus} 
              onValueChange={(value) => setDemoOrderStatus(value as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select demo order status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Order</SelectItem>
                <SelectItem value="pending">Pending Order</SelectItem>
                <SelectItem value="confirmed">Confirmed Order</SelectItem>
                <SelectItem value="processing">Processing Order</SelectItem>
                <SelectItem value="shipping">Shipping Order</SelectItem>
                <SelectItem value="delivered">Delivered Order</SelectItem>
                <SelectItem value="completed">Completed Order</SelectItem>
                <SelectItem value="cancelled">Cancelled Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2">
            <span className="text-sm text-muted-foreground">Listed by</span>
            <span className="text-sm font-medium text-foreground">{sellerName}</span>
            <div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm ml-1">{sellerRating} ({sellerReviews})</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
