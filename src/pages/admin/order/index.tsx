"use client"

import { useState } from "react"
 
 
import {
  BarChart3,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrderDetailsModal } from "./order-detail"
import { UpdateOrderStatusModal } from "./update-status"
import { DataTable } from "@/components/common/data-table"
import { cn } from "@/lib/utils"
import { Order } from "@/types/orders"
import { Link } from "react-router-dom"

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState("10")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order|null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [_, setFilters] = useState<{
    date: Date | null;
    status: string;
    buyer: string;
    seller: string;
  }>({
    date: null,
    status: "",
    buyer: "",
    seller: "",
  });

//   const router = useRouter()
//   const pathname = usePathname()

  // Mock data for orders
  const orders = [
    {
      id: "ORD-1234",
      order_id: "CO-5678",
      buyer_id: 101,
      buyer_name: "Green Bean Imports",
      seller_id: 201,
      seller_name: "Ethiopian Coffee Farms",
      listing_id: "LST-001",
      quantity_kg: 2500,
      unit_price: 4.75,
      total_amount: 11875,
      status: "contract_signed",
      created_at: "2024-04-15T10:30:00Z",
      updated_at: "2024-04-15T10:30:00Z",
      ship_adrs: "123 Harbor St, Rotterdam, Netherlands",
      ship_zipcode: "3072AP",
      ship_instructions: "Handle with care, temperature controlled",
    },
    {
      id: "ORD-1235",
      order_id: "CO-5679",
      buyer_id: 102,
      buyer_name: "Coffee Roasters Co.",
      seller_id: 202,
      seller_name: "Colombian Coffee Collective",
      listing_id: "LST-002",
      quantity_kg: 1800,
      unit_price: 5.25,
      total_amount: 9450,
      status: "coffee_processing_completed",
      created_at: "2024-04-10T14:20:00Z",
      updated_at: "2024-04-12T09:15:00Z",
      ship_adrs: "456 Dock Ave, Hamburg, Germany",
      ship_zipcode: "20457",
      ship_instructions: "Notify 24 hours before delivery",
    },
    {
      id: "ORD-1236",
      order_id: "CO-5680",
      buyer_id: 103,
      buyer_name: "Specialty Brews Inc.",
      seller_id: 203,
      seller_name: "Costa Rican Estates",
      listing_id: "LST-003",
      quantity_kg: 3200,
      unit_price: 6.5,
      total_amount: 20800,
      status: "pre_shipment_sample_ready",
      created_at: "2024-04-05T08:45:00Z",
      updated_at: "2024-04-11T16:30:00Z",
      ship_adrs: "789 Port Blvd, Antwerp, Belgium",
      ship_zipcode: "2000",
      ship_instructions: "Premium handling required",
    },
    {
      id: "ORD-1237",
      order_id: "CO-5681",
      buyer_id: 104,
      buyer_name: "Artisan Coffee House",
      seller_id: 204,
      seller_name: "Kenyan Highlands Growers",
      listing_id: "LST-004",
      quantity_kg: 1500,
      unit_price: 7.25,
      total_amount: 10875,
      status: "container_loaded",
      created_at: "2024-04-01T11:20:00Z",
      updated_at: "2024-04-14T13:45:00Z",
      ship_adrs: "101 Shipping Lane, Barcelona, Spain",
      ship_zipcode: "08039",
      ship_instructions: "Fragile cargo",
    },
    {
      id: "ORD-1238",
      order_id: "CO-5682",
      buyer_id: 105,
      buyer_name: "Premium Bean Buyers",
      seller_id: 205,
      seller_name: "Brazilian Coffee Cooperative",
      listing_id: "LST-005",
      quantity_kg: 4000,
      unit_price: 4.25,
      total_amount: 17000,
      status: "container_on_board",
      created_at: "2024-03-28T09:10:00Z",
      updated_at: "2024-04-13T10:20:00Z",
      ship_adrs: "202 Marina Way, Marseille, France",
      ship_zipcode: "13002",
      ship_instructions: "Keep dry at all times",
    },
  ]

  const totalPages = 5 // Mock total pages

  // Format status for display
  const formatStatus = (status:string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusMap = {
      contract_signed: "bg-blue-100 text-blue-800",
      coffee_processing_completed: "bg-purple-100 text-purple-800",
      coffee_ready_for_shipment: "bg-indigo-100 text-indigo-800",
      pre_shipment_sample_approved: "bg-green-100 text-green-800",
      pre_shipment_sample_ready: "bg-yellow-100 text-yellow-800",
      container_loaded: "bg-orange-100 text-orange-800",
      container_on_board: "bg-emerald-100 text-emerald-800",
    }
    return (statusMap as Record<string, string>)[status] || "bg-gray-100 text-gray-800"
  }

  // Simulate API call for pagination
  const handlePageChange = (page: number) => {
    setIsLoading(true)
    setCurrentPage(page)

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  // Handle view details
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  // Handle update status
  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order)
    setShowUpdateStatusModal(true)
  }

  // Handle rows per page change
  const handleRowsPerPageChange = (value:string) => {
    setRowsPerPage(value)
    setCurrentPage(1)
    setIsLoading(true)

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  // Handle filter change
  const handleFilterChange = (newFilters: {
    date: Date | null;
    status: string;
    buyer: string;
    seller: string;
  }) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setIsLoading(true)

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  // Table columns configuration
  const columns = [
    {
      key: "order_id",
      header: "Order ID",
      cellClassName: "font-medium",
    },
    {
      key: "buyer_name",
      header: "Buyer Name",
    },
    {
      key: "seller_name",
      header: "Seller Name",
    },
    {
      key: "quantity_kg",
      header: "Quantity (kg)",
      render: (row: Order) => row.quantity_kg.toLocaleString(),
    },
    {
      key: "total_amount",
      header: "Total Price",
      render: (row: Order) => `$${row.total_amount.toLocaleString()}`,
    },
    {
      key: "status",
      header: "Order Status",
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
    },
  ]

  // Filter options
  const filterOptions = {
    statuses: [
      { value: "contract_signed", label: "Contract Signed" },
      { value: "coffee_processing_completed", label: "Coffee Processing Completed" },
      { value: "coffee_ready_for_shipment", label: "Coffee Ready for Shipment" },
      { value: "pre_shipment_sample_ready", label: "Pre-shipment Sample Ready" },
      { value: "pre_shipment_sample_approved", label: "Pre-shipment Sample Approved" },
      { value: "container_loaded", label: "Container Loaded" },
      { value: "container_on_board", label: "Container On Board" },
    ],
    buyers: [
      { value: "Green Bean Imports", label: "Green Bean Imports" },
      { value: "Coffee Roasters Co.", label: "Coffee Roasters Co." },
      { value: "Specialty Brews Inc.", label: "Specialty Brews Inc." },
      { value: "Artisan Coffee House", label: "Artisan Coffee House" },
      { value: "Premium Bean Buyers", label: "Premium Bean Buyers" },
    ],
    sellers: [
      { value: "Ethiopian Coffee Farms", label: "Ethiopian Coffee Farms" },
      { value: "Colombian Coffee Collective", label: "Colombian Coffee Collective" },
      { value: "Costa Rican Estates", label: "Costa Rican Estates" },
      { value: "Kenyan Highlands Growers", label: "Kenyan Highlands Growers" },
      { value: "Brazilian Coffee Cooperative", label: "Brazilian Coffee Cooperative" },
    ],
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            <span className="font-semibold text-lg">Coffee Trade</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {/* <Link
              to="#"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link> */}
            <Link
              to="#"
              className="flex items-center gap-3 rounded-md bg-emerald-50 px-3 py-2 text-emerald-600 font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Order Management</span>
            </Link>
            {/* <Link
              to="#"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <Package className="h-5 w-5" />
              <span>Inventory</span>
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link> */}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:pl-64" : "md:pl-0",
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex">
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>

          {/* <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-full bg-white pl-8 focus-visible:ring-emerald-500"
            />
          </div> */}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
          </div>

          {/* Orders table */}
          <DataTable
            data={orders}
            columns={columns}
            isLoading={isLoading}
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateStatus}
            onFilterChange={handleFilterChange}
            formatters={{
              status: {
                format: formatStatus,
                getColor: getStatusColor,
              },
            }}
            filterOptions={filterOptions}
          />
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} open={showDetailsModal} onClose={() => {setShowDetailsModal(false);}} />
      )}

      {/* Update Order Status Modal */}
      {selectedOrder && (
        <UpdateOrderStatusModal
          order={selectedOrder}
          open={showUpdateStatusModal}
          onClose={() => {setShowUpdateStatusModal(false);}}
        />
      )}
    </div>
  )
}
