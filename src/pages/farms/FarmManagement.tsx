import type React from "react"
import { Link } from "react-router-dom"
import { Home, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/layout/header"

// Define TypeScript interfaces
interface Farm {
  id: string
  name: string
  location: string
  status?: string
  verificationMessage?: string
  size?: number
  capacity?: number
}

const FarmManagement: React.FC = () => {
  // Sample data for farms
  const farms: Farm[] = [
    {
      id: "1",
      name: "Adama",
      location: "Sidama",
      status: "verification",
      verificationMessage:
        "Your farm is on verification. Usually it takes few hours. Please check your email for updates",
    },
    {
      id: "2",
      name: "City",
      location: "Oromia",
      size: 25,
      capacity: 25000,
    },
  ]

  return (
    <div className="bg-muted min-h-screen">
      <Header></Header>
      <div className="max-w-6xl mx-auto px-4 py-6">


        <h1 className="text-2xl font-normal text-muted-foreground mb-6">Farms list</h1>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-1">Your farms</h2>
          <p className="text-sm text-muted-foreground">You can add more farms now or later</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Farm Card */}
          <Card className="flex items-center justify-center border border-dashed hover:border-border cursor-pointer">
            <Link to="/onboarding/step-one" className="flex flex-col items-center">

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

          {/* Existing Farms */}
          {farms.map((farm) => (
            <Card key={farm.id}>
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="mr-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {farm.name}, {farm.location}
                    </h3>
                    {farm.status === "verification" ? (
                      <Alert variant="default" className="mt-2 p-3">
                        <AlertDescription className="text-sm text-muted-foreground">
                          {farm.verificationMessage}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mt-1">Farm size: {farm.size} hectares</p>
                        <p className="text-sm text-muted-foreground">Capacity: {farm.capacity?.toLocaleString()} kg</p>
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
  )
}

export default FarmManagement
