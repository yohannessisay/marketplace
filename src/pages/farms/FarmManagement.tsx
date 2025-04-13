"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Plus,
  MapPin,
  Scale,
  Clock,
  ChevronRight,
  Leaf,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/layout/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiService } from "@/services/apiService";
import { saveToLocalStorage } from "@/lib/utils";

// Farm Type
interface Farm {
  id: string;
  farm_name: string;
  town_location: string;
  total_size_hectares?: string;
  capacity_kg?: string;
  status: "verification" | "active" | "inactive";
  created_at?: string;
}

const FarmManagement: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await apiService().get(
          "/sellers/farms/get-farms"
        );
        if (response && response.data.farms) {
          setFarms(response.data.farms);
        } else {
          console.warn("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch farms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  return (
    <div className="bg-primary/5 min-h-screen py-8 px-8">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800 mb-2">
              Your Farms
            </h1>
            <p className="text-slate-500">
              Manage your coffee farms and track their verification status
            </p>
          </div>
          <div className="flex gap-4">
            <Button className="mt-4 md:mt-0" asChild>
              <Link to="/add-farm">
                <Plus className="mr-2 h-4 w-4" />
                Add New Farm
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Loading State */}
        {loading ? (
          <p className="text-slate-500 text-center">Loading farms...</p>
        ) : farms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              No farms yet
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              You haven't added any farms to your account. Start by adding your
              first coffee farm.
            </p>
            <Button asChild>
              <Link to="/add-farm">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Farm
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Farm Card */}
            <Card className="border-2 border-dashed border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 group">
              <Link to="/add-farm" className="block h-full">
                <CardContent className="flex flex-col items-center justify-center p-8 h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-slate-500 group-hover:text-slate-700 transition-colors" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    Add New Farm
                  </h3>
                  <p className="text-sm text-slate-500">
                    Register a new coffee farm to your portfolio
                  </p>
                </CardContent>
              </Link>
            </Card>

            {/* Farm Cards */}
            {farms.map((farm, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="bg-white pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                        <Leaf className="h-5 w-5 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-800">
                        {farm.farm_name}
                      </CardTitle>
                    </div>
                    <StatusBadge status={farm.status} />
                  </div>
                </CardHeader>

                <CardContent className="pt-4 pb-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-600">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      <span>{farm.town_location}</span>
                    </div>

                    {farm.status !== "verification" && (
                      <>
                        <div className="flex items-center text-slate-600">
                          <Home className="h-4 w-4 mr-2 text-slate-400" />
                          <span>{farm.total_size_hectares} hectares</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Scale className="h-4 w-4 mr-2 text-slate-400" />
                          <span>
                            {Number.parseInt(
                              farm.capacity_kg || "0"
                            ).toLocaleString()}{" "}
                            kg capacity
                          </span>
                        </div>
                      </>
                    )}

                    {farm.created_at && (
                      <div className="flex items-center text-slate-500 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          Added on{" "}
                          {new Date(farm.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {farm.status === "verification" && (
                    <Alert
                      variant="default"
                      className="mt-4 bg-amber-50 border-amber-200 text-amber-800"
                    >
                      <AlertDescription className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        Your farm is being verified. We'll update you when the
                        process is complete.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center group"
                  >
                    <span>Manage Farm</span>
                    <ChevronRight className="ml-2 h-4 w-4  group-hover:translate-x-0.5 transition-transform" />
                  </Button>

                  <Button
                    variant={"secondary"}
                          className="w-full flex items-center justify-center group mt-2"
                    onClick={() => {
                      saveToLocalStorage("current-farm-id", farm.id);
                    }}
                    asChild
                  >
                    <Link to="/add-crop">
                    <span>Add Crop</span>
                    <Plus className="ml-2 h-4 w-4   group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "verification":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Verification Pending
        </Badge>
      );
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-slate-100 text-slate-600 border-slate-200"
        >
          Inactive
        </Badge>
      );
    default:
      return null;
  }
};

export default FarmManagement;
