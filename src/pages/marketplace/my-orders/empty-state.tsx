import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";

export const EmptyState = ({ tabType }: { tabType: string }) => {
    const message =
      tabType === "sample"
        ? "No sample requests found. Check back later or browse the marketplace."
        : tabType === "bids"
        ? "No bids found. Check back later or browse the marketplace."
        : tabType === "favorites"
        ? "No favorited listings found. Browse the marketplace to add your favorite coffees."
        : "Head to the marketplace to place your first order of premium Ethiopian coffee.";

    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Info className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">
            No{" "}
            {tabType === "current"
              ? "active orders"
              : tabType === "historical"
              ? "order history"
              : tabType === "sample"
              ? "sample requests"
              : tabType === "bids"
              ? "bids"
              : "favorited listings"}{" "}
            found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {message}
          </p>
          <Link to="/market-place">
            <Button className="mt-6">Browse Marketplace</Button>
          </Link>
        </CardContent>
      </Card>
    );
  };
