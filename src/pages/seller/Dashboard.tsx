
import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Building2, Coffee, CreditCard, UserCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import Logo from "../../components/layout/Logo"

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  const handleAddFarm = () => {
    navigate("/onboarding/step-one")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />

          <div className="flex items-center">
            <nav className="hidden md:flex items-center space-x-6 mr-6">
              <Link to="/dashboard" className="text-sm font-medium text-primary">
                My dashboard
              </Link>
              <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Marketplace
              </Link>
              <Link to="/chats" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Chats
              </Link>
            </nav>

            <Avatar>
              <AvatarImage src="/assets/images/avatar-placeholder.png" alt="Profile" />
              <AvatarFallback>HA</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">👋 Hello, Husen Abadega</h1>
          <Badge variant="outline" className="text-sm">
            Congratulations with registration!
          </Badge>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Let's start to sell your crops</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-primary/5 border">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-3 mt-4">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-medium mb-1">Step 1</h3>
                <p className="text-sm text-center text-muted-foreground mb-2">Add Farms to your profile</p>
                <Button variant="link" className="text-xs text-primary p-0 h-auto font-medium" onClick={handleAddFarm}>
                  Add farms
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3 mt-4">
                  <Coffee className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium mb-1">Step 2</h3>
                <p className="text-sm text-center text-muted-foreground mb-2">Add your coffee crops to sell</p>
                <Button variant="link" className="text-xs text-primary p-0 h-auto font-medium" asChild>
                  <Link to="/coffee-crops">Add crops</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3 mt-4">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium mb-1">Step 3</h3>
                <p className="text-sm text-center text-muted-foreground mb-2">Provide your bank information</p>
                <Button variant="link" className="text-xs text-primary p-0 h-auto font-medium" asChild>
                  <Link to="/bank-information">Add bank details</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3 mt-4">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium mb-1">Step 4</h3>
                <p className="text-sm text-center text-muted-foreground mb-2">Upload your beautiful avatar</p>
                <Button variant="link" className="text-xs text-primary p-0 h-auto font-medium" asChild>
                  <Link to="/profile-photo">Add photo</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Your crops section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your crops</h2>
          <p className="text-sm text-muted-foreground mb-4">You can add more farms now or later</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted/50 flex items-center justify-center border border-dashed h-[200px]">
              <Button
                variant="ghost"
                className="flex flex-col items-center text-muted-foreground hover:text-primary"
                asChild
              >
                <Link to="/coffee-crops">
                  <Plus className="h-8 w-8 mb-2" />
                  <span className="text-sm">Add new crop</span>
                </Link>
              </Button>
            </Card>

            {/* This would be populated with actual crops once they're added */}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

