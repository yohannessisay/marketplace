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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-muted-foreground hover:text-primary cursor-pointer"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span className="text-sm sm:text-base">Back to Marketplace</span>
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground flex-1">
            Coffee Details
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm text-muted-foreground">Listed by</span>
            <span className="text-sm font-medium text-foreground">
              {sellerName}
            </span>
            <div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm ml-1">
                {sellerRating} ({sellerReviews} review
                {sellerReviews !== 1 ? "s" : ""})
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
