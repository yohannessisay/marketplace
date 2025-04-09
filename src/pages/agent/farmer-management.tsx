"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Eye, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Header from "@/components/layout/header"
import { Link } from "react-router-dom"

// Mock data for farmers
const farmers = [
  {
    id: "F001",
    name: "John Smith",
    phone: "+1 (555) 123-4567",
    address: "123 Farm Road, Countryside, CA",
    crops: ["Corn", "Wheat", "Soybeans"],
    farmSize: "150 acres",
    joinDate: "2020-03-15",
  },
  {
    id: "F002",
    name: "Maria Garcia",
    phone: "+1 (555) 234-5678",
    address: "456 Harvest Lane, Ruralville, TX",
    crops: ["Tomatoes", "Peppers", "Onions"],
    farmSize: "75 acres",
    joinDate: "2019-06-22",
  },
  {
    id: "F003",
    name: "Robert Johnson",
    phone: "+1 (555) 345-6789",
    address: "789 Tractor Drive, Farmington, IA",
    crops: ["Apples", "Peaches", "Cherries"],
    farmSize: "200 acres",
    joinDate: "2021-01-10",
  },
  {
    id: "F004",
    name: "Sarah Williams",
    phone: "+1 (555) 456-7890",
    address: "101 Meadow Path, Agraria, KS",
    crops: ["Cotton", "Peanuts"],
    farmSize: "300 acres",
    joinDate: "2018-09-05",
  },
  {
    id: "F005",
    name: "David Brown",
    phone: "+1 (555) 567-8901",
    address: "202 Silo Street, Cropville, NE",
    crops: ["Rice", "Beans"],
    farmSize: "125 acres",
    joinDate: "2022-04-18",
  },
  {
    id: "F006",
    name: "Jennifer Lee",
    phone: "+1 (555) 678-9012",
    address: "303 Barn Avenue, Fieldtown, IL",
    crops: ["Grapes", "Strawberries", "Blueberries"],
    farmSize: "50 acres",
    joinDate: "2020-07-30",
  },
  {
    id: "F007",
    name: "Michael Wilson",
    phone: "+1 (555) 789-0123",
    address: "404 Pasture Place, Ranchville, MT",
    crops: ["Barley", "Oats"],
    farmSize: "275 acres",
    joinDate: "2019-11-12",
  },
  {
    id: "F008",
    name: "Lisa Martinez",
    phone: "+1 (555) 890-1234",
    address: "505 Harvest Highway, Growington, OR",
    crops: ["Potatoes", "Carrots", "Beets"],
    farmSize: "90 acres",
    joinDate: "2021-08-25",
  },
  {
    id: "F009",
    name: "James Taylor",
    phone: "+1 (555) 901-2345",
    address: "606 Planting Path, Seedville, WA",
    crops: ["Lettuce", "Spinach", "Kale"],
    farmSize: "40 acres",
    joinDate: "2022-02-14",
  },
  {
    id: "F010",
    name: "Patricia Anderson",
    phone: "+1 (555) 012-3456",
    address: "707 Irrigation Road, Watertown, ID",
    crops: ["Sunflowers", "Canola"],
    farmSize: "180 acres",
    joinDate: "2018-05-20",
  },
]

export default function FarmersTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter farmers based on search term
  const filteredFarmers = farmers.filter(
    (farmer) =>
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage)

  // Get current farmers
  const indexOfLastFarmer = currentPage * itemsPerPage
  const indexOfFirstFarmer = indexOfLastFarmer - itemsPerPage
  const currentFarmers = filteredFarmers.slice(indexOfFirstFarmer, indexOfLastFarmer)

  const handleViewFarmer = (farmer) => {
    setSelectedFarmer(farmer)
    setIsModalOpen(true)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (

    <div className="container mx-auto">
      <Header></Header>
      <div className="flex justify-between items-center mb-6 mt-8">
        <h1 className="text-2xl font-bold">Farmers Registered By You</h1>
        <Link to={"/onboarding/step-one"}>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Farmer
        </Button>
        </Link>
      </div>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFarmers.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell>{farmer.id}</TableCell>
                <TableCell>{farmer.name}</TableCell>
                <TableCell>{farmer.phone}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewFarmer(farmer)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink onClick={() => handlePageChange(index + 1)} isActive={currentPage === index + 1}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Farmer Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedFarmer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedFarmer.name}</DialogTitle>
                <DialogDescription>Farmer ID: {selectedFarmer.id}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="grid grid-cols-3 items-center">
                      <Label className="font-medium">Phone:</Label>
                      <span className="col-span-2">{selectedFarmer.phone}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <Label className="font-medium">Address:</Label>
                      <span className="col-span-2">{selectedFarmer.address}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Farm Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="grid grid-cols-3 items-center">
                      <Label className="font-medium">Farm Size:</Label>
                      <span className="col-span-2">{selectedFarmer.farmSize}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <Label className="font-medium">Crops:</Label>
                      <div className="col-span-2 flex flex-wrap gap-1">
                        {selectedFarmer.crops.map((crop) => (
                          <span key={crop} className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <Label className="font-medium">Join Date:</Label>
                      <span className="col-span-2">{new Date(selectedFarmer.joinDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsModalOpen(false)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
