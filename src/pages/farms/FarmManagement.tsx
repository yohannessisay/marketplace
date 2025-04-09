import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Header from "@/components/layout/header";
import { Alert, AlertDescription } from "@/components/ui/alert";

// LocalStorage Key
const STORAGE_KEY = "new-farm";

// Farm Type
interface Farm {
  farm_name: string;
  town_location: string;
  total_size_hectares?: string;
  capacity_kg?: string;
  status: "verification";
  // Add more fields as needed
}

const FarmManagement: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);

  useEffect(() => {
    const savedFarms = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setFarms(savedFarms);
  }, []);

  return (
    <div className="bg-muted min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-normal text-muted-foreground mb-6">
          Farms list
        </h1>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-1">Your farms</h2>
          <p className="text-sm text-muted-foreground">
            You can add more farms now or later
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Farm Card */}
          <Card className="flex items-center justify-center border border-dashed hover:border-border cursor-pointer">
            <Link to="/add-farm" className="flex flex-col items-center">
              <CardContent className="flex items-center justify-center p-6 text-center">
                <div>
                  <div className="w-10 h-10 rounded-full border border-muted-foreground mx-auto mb-2 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Add new farm</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Dynamic Farm Cards from localStorage */}
          {farms.map((farm, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="mr-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    {farm.status === "verification" ? (
                      <Alert variant="default" className="mt-2 p-3">
                        <AlertDescription className="text-sm text-muted-foreground">
                          Your farm is on verification, we will update the
                          status as soon as there is a change in status.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                       <p className="text-sm text-muted-foreground mt-1">
                          Farm name: {farm.farm_name} hectares
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Farm size: {farm.total_size_hectares} hectares
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Capacity: {farm.capacity_kg?.toLocaleString()} kg
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button variant="outline" className="w-full">
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmManagement;
