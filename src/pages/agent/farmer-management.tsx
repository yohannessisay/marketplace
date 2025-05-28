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
import { Skeleton } from "@/components/ui/skeleton";
import { FARMER_PROFILE_KEY } from "@/types/constants";

export default function FarmersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchFarmers = async () => {
      setIsLoading(true);
      try {
        const response: any = await apiService().get(
          `/agent/farmers/management?search=${searchTerm}&page=${currentPage}`,
        );
        setFarmers(response.data.sellers || []);
        setTotalPages(response.data.pagination.totalPages || 1);
      } catch (error) {
        console.error("Error fetching farmers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmers();
  }, [searchTerm, currentPage]);

  const handleViewFarmer = async (data: Farmer) => {
    setSubmitting(true);
    const response: any = await apiService().post(
      "/agent/farmers/agent-login-for-farmer",
      {},
      data.id,
    );

    if (response && response.success) {
      const farmerInfo = response.data.farmer;
      saveToLocalStorage(FARMER_PROFILE_KEY, farmerInfo);

      switch (farmerInfo.onboarding_stage) {
        case "not_started":
          navigate("/home");
          break;
        case "farm_profile":
          navigate("/onboarding/step-one");
          break;
        case "crops_to_sell":
          navigate("/onboarding/step-two");
          break;
        case "bank_information":
          navigate("/onboarding/step-three");
          break;
        case "avatar_image":
          navigate("/onboarding/step-four");
          break;
        case "completed":
          navigate("/seller-dashboard");
          break;
        default:
          break;
      }
    }
    setSubmitting(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-primary/5 px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Header />
      <div className="mx-auto max-w-7xl bg-white rounded-md shadow-md p-4 sm:p-6 lg:p-8 my-8 mt-16 sm:mt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-4 sm:mt-8 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold">
            Farmers Registered By You
          </h1>
          <Link to={"/farmer-signup-via-agent"}>
            <Button className="flex items-center gap-2 text-sm sm:text-base">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Add New Farmer
            </Button>
          </Link>
        </div>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">ID</TableHead>
                <TableHead className="text-xs sm:text-sm">Name</TableHead>
                <TableHead className="text-xs sm:text-sm sm:table-cell">
                  Email
                </TableHead>
                <TableHead className="text-xs sm:text-sm md:table-cell">
                  Phone
                </TableHead>
                <TableHead className="text-xs sm:text-sm text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-20 sm:w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 sm:w-48" />
                      </TableCell>
                      <TableCell className=" sm:table-cell">
                        <Skeleton className="h-4 w-24 sm:w-32" />
                      </TableCell>
                      <TableCell className=" md:table-cell">
                        <Skeleton className="h-4 w-20 sm:w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-14 sm:w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : farmers.map((farmer) => (
                    <TableRow key={farmer.id}>
                      <TableCell className="text-xs sm:text-sm">
                        {farmer.id}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {farmer.first_name} {farmer.last_name}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm sm:table-cell">
                        {farmer.email}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm md:table-cell">
                        {farmer.phone}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFarmer(farmer)}
                          disabled={isSubmitting}
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
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
            <PaginationContent className="flex flex-wrap justify-center sm:justify-between gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50 text-sm"
                      : "cursor-pointer text-sm"
                  }
                />
              </PaginationItem>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                      className="text-xs sm:text-sm"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </div>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50 text-sm"
                      : "cursor-pointer text-sm"
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
