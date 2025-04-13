"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Plus } from "lucide-react";
import Header from "@/components/layout/header";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { saveToLocalStorage } from "@/lib/utils";

export default function FarmersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  interface Farmer {
    about_me: string;
    address: string;
    auth_id: string;
    avatar_url_csv: string;
    blocked_access: string;
    created_by_agent_id: string;
    deals_completed: number;
    email: string;
    first_name: string;
    id: string;
    identity_verified: boolean;
    last_login_at: string;
    last_name: string;
    onboarding_stage: string;
    phone: string;
    rating: number;
    telegram: string;
    total_reviews: number;
    trading_since: string;
    verification_status: string;
  }

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Fetch farmers data from API
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await apiService().get<{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { sellers: any[]; pagination: any };
        }>(
          `/agent/farmers/management`
        );
        setFarmers(response.data.sellers || []);
        setTotalPages(response.data.pagination.totalPages || 1);
      } catch (error) {
        console.error("Error fetching farmers:", error);
      }
    };

    fetchFarmers();
  }, [searchTerm, currentPage]);

  const handleViewFarmer = async (data: Farmer) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await apiService().post(
      "/agent/farmers/agent-login-for-farmer",
      {},
      data.id
    );

    if (response && response.success) {
      const farmerInfo = response.data.farmer;
      saveToLocalStorage("farmer-profile", farmerInfo);

      switch (farmerInfo.onboarding_stage) {
        case "not_started":
          navigate("/home");
          saveToLocalStorage("current-step", "not_started");
          break;
        case "farm_profile":
          navigate("/onboarding/step-one");
          saveToLocalStorage("current-step", "farm_profile");
          break;
        case "crops_to_sell":
          navigate("/onboarding/step-two");
          saveToLocalStorage("current-step", "crops_to_sell");
          break;
        case "bank_information":
          navigate("/onboarding/step-three");
          saveToLocalStorage("current-step", "bank_information");
          break;
        case "avatar_image":
          navigate("/onboarding/step-four");
          saveToLocalStorage("current-step", "avatar_image");
          break;
        case "completed":
          navigate("/seller-dashboard");
          saveToLocalStorage("current-step", "completed");
          break;
        default:
          break;
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className=" min-h-screen bg-primary/5 p-8 w-full">
      <Header></Header>
      <div className="mx-24 bg-white rounded-md shadow-md p-4 my-8">
        <div className="flex justify-between items-center mb-6 mt-8">
          <h1 className="text-2xl font-bold">Farmers Registered By You</h1>
          <Link to={"/farmer-signup-via-agent"}>
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
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
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
              {farmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell>{farmer.id}</TableCell>
                  <TableCell>
                    {farmer.first_name} {farmer.last_name}
                  </TableCell>
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
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => handlePageChange(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
