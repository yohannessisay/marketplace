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
  SampleFilterState,
  SampleRequestDeliveryStatus,
} from "@/types/orders";
import { ChevronDown, Filter, X } from "lucide-react"; 

export const FilterMenu = ({
  tab,
  handleFilterChange,
  filters
}: {
  tab: string;
  handleFilterChange: (
    tab: string,
    filter:
      | OrderFilterState
      | SampleFilterState
      | BidFilterState
      | FavoriteFilterState
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
  const isSampleTab = tab === "sample";
  const isBidsTab = tab === "bids";
  const isFavoritesTab = tab === "favorites";

  const filterCount = Object.values(currentFilters).filter(
    (value) => value !== undefined && value !== ""
  ).length;

  const statusOptions = isSampleTab
    ? Object.values(SampleRequestDeliveryStatus)
    : isBidsTab
    ? Object.values(OrderBidStatus)
    : isOrderTab
    ? ["pending", "completed", "cancelled"]
    : [];
  const coffeeVarieties = ["Yirgacheffe", "Sidamo", "Guji", "Harrar", "Jimma"];
  const listingStatusOptions = ["active", "inactive"];
  const booleanOptions = ["true", "false"];

  const getFilterStateWithoutStatus = () => {
    if (isOrderTab) {
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
                  {(isOrderTab &&
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
        {(isOrderTab || isSampleTab || isBidsTab) && (
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
                    "All Varieties"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange(
                      tab,
                      getFilterStateWithoutCoffeeVariety()
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
                    handleFilterChange(tab, {
                      ...(currentFilters as FavoriteFilterState),
                      listingStatus: undefined,
                    })
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
        {isOrderTab && (
          <>
            <div className="mb-2">
              <label className="text-sm font-medium">Contract Signed</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(currentFilters as OrderFilterState).contractSigned ===
                    undefined
                      ? "Any"
                      : (
                          currentFilters as OrderFilterState
                        ).contractSigned?.toString() ?? "Any"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...(currentFilters as OrderFilterState),
                        contractSigned: undefined,
                      })
                    }
                  >
                    Any
                  </DropdownMenuItem>
                  {booleanOptions.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          contractSigned: value === "true",
                        })
                      }
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium">
                Processing Completed
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(currentFilters as OrderFilterState)
                      .coffeeProcessingCompleted === undefined
                      ? "Any"
                      : (
                          currentFilters as OrderFilterState
                        ).coffeeProcessingCompleted?.toString() ?? "Any"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...(currentFilters as OrderFilterState),
                        coffeeProcessingCompleted: undefined,
                      })
                    }
                  >
                    Any
                  </DropdownMenuItem>
                  {booleanOptions.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          coffeeProcessingCompleted: value === "true",
                        })
                      }
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium">Ready for Shipment</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(currentFilters as OrderFilterState)
                      .coffeeReadyForShipment === undefined
                      ? "Any"
                      : (
                          currentFilters as OrderFilterState
                        ).coffeeReadyForShipment?.toString() ?? "Any"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...(currentFilters as OrderFilterState),
                        coffeeReadyForShipment: undefined,
                      })
                    }
                  >
                    Any
                  </DropdownMenuItem>
                  {booleanOptions.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          coffeeReadyForShipment: value === "true",
                        })
                      }
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium">Sample Approved</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(currentFilters as OrderFilterState)
                      .preShipmentSampleApproved === undefined
                      ? "Any"
                      : (
                          currentFilters as OrderFilterState
                        ).preShipmentSampleApproved?.toString() ?? "Any"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...(currentFilters as OrderFilterState),
                        preShipmentSampleApproved: undefined,
                      })
                    }
                  >
                    Any
                  </DropdownMenuItem>
                  {booleanOptions.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          preShipmentSampleApproved: value === "true",
                        })
                      }
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium">Container Loaded</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(currentFilters as OrderFilterState).containerLoaded ===
                    undefined
                      ? "Any"
                      : (
                          currentFilters as OrderFilterState
                        ).containerLoaded?.toString() ?? "Any"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...(currentFilters as OrderFilterState),
                        containerLoaded: undefined,
                      })
                    }
                  >
                    Any
                  </DropdownMenuItem>
                  {booleanOptions.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          containerLoaded: value === "true",
                        })
                      }
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium">Shipped</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(currentFilters as OrderFilterState).containerOnBoard ===
                    undefined
                      ? "Any"
                      : (
                          currentFilters as OrderFilterState
                        ).containerOnBoard?.toString() ?? "Any"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...(currentFilters as OrderFilterState),
                        containerOnBoard: undefined,
                      })
                    }
                  >
                    Any
                  </DropdownMenuItem>
                  {booleanOptions.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          containerOnBoard: value === "true",
                        })
                      }
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium">Delivered</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(currentFilters as OrderFilterState).delivered ===
                    undefined
                      ? "Any"
                      : (
                          currentFilters as OrderFilterState
                        ).delivered?.toString() ?? "Any"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(tab, {
                        ...(currentFilters as OrderFilterState),
                        delivered: undefined,
                      })
                    }
                  >
                    Any
                  </DropdownMenuItem>
                  {booleanOptions.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          delivered: value === "true",
                        })
                      }
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
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
