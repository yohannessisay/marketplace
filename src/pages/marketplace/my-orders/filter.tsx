import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  BidFilterState,
  FavoriteFilterState,
  OrderBidStatus,
  OrderFilterState,
  OrderProgressStatus,
  SampleFilterState,
  SampleRequestDeliveryStatus,
} from "@/types/orders";
import { ChevronDown, Filter, X } from "lucide-react";

export const FilterMenu = ({
  tab,
  handleFilterChange,
  filters,
}: {
  tab: string;
  handleFilterChange: (
    tab: string,
    filter:
      | OrderFilterState
      | SampleFilterState
      | BidFilterState
      | FavoriteFilterState,
  ) => void;
  filters: {
    current: OrderFilterState;
    historical: OrderFilterState;
    sample: SampleFilterState;
    bids: BidFilterState;
    favorites: FavoriteFilterState;
  };
}) => {
  const currentFilters = filters[tab as keyof typeof filters];
  const isOrderTab = tab === "current" || tab === "historical";
  const isCurrentOrderTab = tab === "current";
  const isSampleTab = tab === "sample";
  const isBidsTab = tab === "bids";
  const isFavoritesTab = tab === "favorites";

  const filterCount = Object.entries(currentFilters).filter(([key, value]) => {
    if (
      tab === "historical" &&
      (key === "status" || key === "progressStatus")
    ) {
      return false;
    }
    return value !== undefined && value !== "";
  }).length;

  const statusOptions = isSampleTab
    ? Object.values(SampleRequestDeliveryStatus)
    : isBidsTab
      ? Object.values(OrderBidStatus)
      : isCurrentOrderTab
        ? ["pending", "completed", "cancelled"]
        : [];
  const coffeeVarieties = ["Yirgacheffe", "Sidamo", "Guji", "Harrar", "Jimma"];
  const listingStatusOptions = ["active", "inactive"];
  const progressStatusOptions = Object.values(OrderProgressStatus);

  const getFilterStateWithoutStatus = () => {
    if (isCurrentOrderTab) {
      const { status: _status, ...rest } = currentFilters as OrderFilterState;
      return rest;
    } else if (isSampleTab) {
      const { status: _status, ...rest } = currentFilters as SampleFilterState;
      return rest;
    } else if (isBidsTab) {
      const { status: _status, ...rest } = currentFilters as BidFilterState;
      return rest;
    }
    return currentFilters;
  };

  const getFilterStateWithoutCoffeeVariety = () => {
    if (isOrderTab) {
      const { coffeeVariety: _coffeeVariety, ...rest } =
        currentFilters as OrderFilterState;
      return rest;
    } else if (isSampleTab) {
      const { coffeeVariety: _coffeeVariety, ...rest } =
        currentFilters as SampleFilterState;
      return rest;
    } else if (isBidsTab) {
      const { coffeeVariety: _coffeeVariety, ...rest } =
        currentFilters as BidFilterState;
      return rest;
    } else if (isFavoritesTab) {
      const { coffeeVariety: _coffeeVariety, ...rest } =
        currentFilters as FavoriteFilterState;
      return rest;
    }
    return currentFilters;
  };

  const getFilterStateWithoutListingStatus = () => {
    if (isFavoritesTab) {
      const { listingStatus: _listingStatus, ...rest } =
        currentFilters as FavoriteFilterState;
      return rest;
    }
    return currentFilters;
  };

  const getFilterStateWithoutProgressStatus = () => {
    if (isCurrentOrderTab) {
      const { progressStatus: _progressStatus, ...rest } =
        currentFilters as OrderFilterState;
      return rest;
    }
    return currentFilters;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {filterCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-white"
            >
              {filterCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4">
        <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statusOptions.length > 0 && (
          <div className="mb-2">
            <label className="text-sm font-medium">Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {(isCurrentOrderTab &&
                    (currentFilters as OrderFilterState).status) ||
                    (isSampleTab &&
                      (currentFilters as SampleFilterState).status) ||
                    (isBidsTab && (currentFilters as BidFilterState).status) ||
                    "All Statuses"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange(tab, getFilterStateWithoutStatus())
                  }
                >
                  All Statuses
                </DropdownMenuItem>
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() =>
                      handleFilterChange(tab, { ...currentFilters, status })
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {(isOrderTab || isSampleTab || isBidsTab || isFavoritesTab) && (
          <div className="mb-2">
            <label className="text-sm font-medium">Coffee Variety</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {(isOrderTab &&
                    (currentFilters as OrderFilterState).coffeeVariety) ||
                    (isSampleTab &&
                      (currentFilters as SampleFilterState).coffeeVariety) ||
                    (isBidsTab &&
                      (currentFilters as BidFilterState).coffeeVariety) ||
                    (isFavoritesTab &&
                      (currentFilters as FavoriteFilterState).coffeeVariety) ||
                    "All Varieties"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange(
                      tab,
                      getFilterStateWithoutCoffeeVariety(),
                    )
                  }
                >
                  All Varieties
                </DropdownMenuItem>
                {coffeeVarieties.map((variety) => (
                  <DropdownMenuItem
                    key={variety}
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...currentFilters,
                        coffeeVariety: variety,
                      })
                    }
                  >
                    {variety}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {isCurrentOrderTab && (
          <div className="mb-2">
            <label className="text-sm font-medium">Progress Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {(currentFilters as OrderFilterState).progressStatus ||
                    "All Progress Statuses"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange(
                      tab,
                      getFilterStateWithoutProgressStatus(),
                    )
                  }
                >
                  All Progress Statuses
                </DropdownMenuItem>
                {progressStatusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...currentFilters,
                        progressStatus: status,
                      })
                    }
                  >
                    {status
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {isFavoritesTab && (
          <div className="mb-2">
            <label className="text-sm font-medium">Listing Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {(currentFilters as FavoriteFilterState).listingStatus ||
                    "All Statuses"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange(
                      tab,
                      getFilterStateWithoutListingStatus(),
                    )
                  }
                >
                  All Statuses
                </DropdownMenuItem>
                {listingStatusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...(currentFilters as FavoriteFilterState),
                        listingStatus: status,
                      })
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="mb-2">
          <label className="text-sm font-medium">Date From</label>
          <Input
            type="date"
            value={
              (isOrderTab && (currentFilters as OrderFilterState).dateFrom) ||
              (isSampleTab && (currentFilters as SampleFilterState).dateFrom) ||
              (isBidsTab && (currentFilters as BidFilterState).dateFrom) ||
              (isFavoritesTab &&
                (currentFilters as FavoriteFilterState).dateFrom) ||
              ""
            }
            onChange={(e) =>
              handleFilterChange(tab, {
                ...currentFilters,
                dateFrom: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium">Date To</label>
          <Input
            type="date"
            value={
              (isOrderTab && (currentFilters as OrderFilterState).dateTo) ||
              (isSampleTab && (currentFilters as SampleFilterState).dateTo) ||
              (isBidsTab && (currentFilters as BidFilterState).dateTo) ||
              (isFavoritesTab &&
                (currentFilters as FavoriteFilterState).dateTo) ||
              ""
            }
            onChange={(e) =>
              handleFilterChange(tab, {
                ...currentFilters,
                dateTo: e.target.value,
              })
            }
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => handleFilterChange(tab, {})}
        >
          Clear Filters
          <X className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
