import { ArrowLeft } from "lucide-react";
import { Star } from "lucide-react";
import { OrderStatus } from "@/types/order";

interface HeaderProps {
  demoOrderStatus: OrderStatus;
  setDemoOrderStatus: (status: OrderStatus) => void;
  sellerName: string;
  sellerRating: number;
  sellerReviews: number;
}

export function Header({
  sellerName,
  sellerRating,
  sellerReviews,
}: HeaderProps) {
  return (
    <header className="bg-card shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center">
          <button
            onClick={() => window.history.back()}
            className="flex bg-card items-center text-muted-foreground mr-4 hover:text-primary cursor-pointer"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back to Marketplace</span>
          </button>
          <h1 className="text-xl font-semibold text-foreground flex-1">
            Coffee Details
          </h1>

          <div className="flex space-x-2">
            <span className="text-sm text-muted-foreground">Listed by</span>
            <span className="text-sm font-medium text-foreground">
              {sellerName}
            </span>
            <div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm ml-1">
                {sellerRating} ({sellerReviews} review(s))
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
