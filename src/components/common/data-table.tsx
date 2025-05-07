"use client"

import { JSX, useState } from "react"
import { MoreHorizontal, ChevronLeft, ChevronRight, Eye, RefreshCw, Filter, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
  onUpdateStatus,
  onFilterChange,
  formatters = {},
  filterOptions = {},
}: {
  data?: any[];
  columns?: Array<{
    key: string;
    header: string;
    className?: string;
    cellClassName?: string;
    render?: (row: any) => React.ReactNode;
  }>;
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  rowsPerPage?: string;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (value: string) => void;
  onViewDetails?: (row: any) => void;
  onUpdateStatus?: (row: any) => void;
  onFilterChange?: (filters: any) => void;
  formatters?: {
    status?: {
      format: (status: string) => string;
      getColor: (status: string) => string;
    };
  };
  filterOptions?: {
    statuses?: Array<{ value: string; label: string }>;
    buyers?: Array<{ value: string; label: string }>;
    sellers?: Array<{ value: string; label: string }>;
  };
}): JSX.Element {
  const [showFilters, setShowFilters] = useState(false)
  const [filterDate, setFilterDate] = useState<any>()
  const [filterStatus, setFilterStatus] = useState("")
  const [filterBuyer, setFilterBuyer] = useState("")
  const [filterSeller, setFilterSeller] = useState("")

  // Handle filter reset
  const handleResetFilters = () => {
    setFilterDate(null)
    setFilterStatus("")
    setFilterBuyer("")
    setFilterSeller("")

    if (onFilterChange) {
      onFilterChange({
        date: null,
        status: "",
        buyer: "",
        seller: "",
      })
    }
  }

  // Handle filter apply
  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        date: filterDate,
        status: filterStatus,
        buyer: filterBuyer,
        seller: filterSeller,
      })
    }
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    // Always show first page
    items.push(
      <Button
        key="page-1"
        variant={currentPage === 1 ? "default" : "outline"}
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange && onPageChange(1)}
        disabled={isLoading}
      >
        1
      </Button>,
    )

    // Calculate range of pages to show
    const startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3)

    // Adjust if we're near the start
    if (startPage > 2) {
      items.push(
        <div key="ellipsis-start" className="px-1">
          ...
        </div>,
      )
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Button
          key={`page-${i}`}
          variant={currentPage === i ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange && onPageChange(i)}
          disabled={isLoading}
        >
          {i}
        </Button>,
      )
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <div key="ellipsis-end" className="px-1">
          ...
        </div>,
      )
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <Button
          key={`page-${totalPages}`}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange && onPageChange(totalPages)}
          disabled={isLoading}
        >
          {totalPages}
        </Button>,
      )
    }

    return items
  }

  // Check if any filters are active
  const hasActiveFilters = filterStatus || filterBuyer || filterSeller || filterDate

  return (
    <div className="space-y-4">
      {/* Filter Button */}
      <div className="flex justify-end">
        <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4" />
          Filters
          <Badge className="ml-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {hasActiveFilters ? "Active" : "0"}
          </Badge>
        </Button>
      </div>

      {/* Filters */}
      <Accordion
        type="single"
        collapsible
        value={showFilters ? "filters" : ""}
        onValueChange={(value) => setShowFilters(value === "filters")}
        className="mb-6"
      >
        <AccordionItem value="filters" className="border rounded-lg bg-white">
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {filterDate ? format(filterDate, "PPP") : "Select date"}
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterDate ?? undefined}
                      onSelect={(date: Date | undefined) => setFilterDate(date ?? null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {filterOptions?.statuses?.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buyer Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Buyer</label>
                <Select value={filterBuyer} onValueChange={setFilterBuyer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buyers</SelectItem>
                    {filterOptions.buyers?.map((buyer) => (
                      <SelectItem key={buyer.value} value={buyer.value}>
                        {buyer.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seller Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Seller</label>
                <Select value={filterSeller} onValueChange={setFilterSeller}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sellers</SelectItem>
                    {filterOptions.sellers?.map((seller) => (
                      <SelectItem key={seller.value} value={seller.value}>
                        {seller.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 px-2">
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filters
              </Button>
              <Button onClick={handleApplyFilters} className="bg-emerald-600 hover:bg-emerald-700">
                Apply Filters
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow key={row.id || rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${row.id || rowIndex}-${column.key}`} className={column.cellClassName}>
                        {column.key === "actions" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(row)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateStatus && onUpdateStatus(row)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : column.key === "status" && formatters.status ? (
                          <Badge className={cn("font-normal", formatters.status.getColor(row.status))}>
                            {formatters.status.format(row.status)}
                          </Badge>
                        ) : column.render ? (
                          column.render(row)
                        ) : (
                          row[column.key]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <Select value={rowsPerPage} onValueChange={(value) => onRowsPerPageChange && onRowsPerPageChange(value)}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {generatePaginationItems()}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
