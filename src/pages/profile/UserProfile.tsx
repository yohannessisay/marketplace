"use client"

import type React from "react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PencilIcon, LogOut } from "lucide-react"
import Header from "@/components/layout/header"

interface ProfileItemProps {
  label: string
  value: string
  editable?: boolean
  onEdit?: () => void
}

const ProfileItem: React.FC<ProfileItemProps> = ({ label, value, editable = false, onEdit }) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        {editable && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-2">
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Edit {label}</span>
          </Button>
        )}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  )
}

export default function UserProfile() {
  const [profile, setProfile] = useState({
    name: "John Wick",
    phone: "+66 (081) *** **36",
    email: "Email****@.com",
    verification: 25, // Percentage of verification progress
  })

  const handleEdit = (field: string) => {
    // Implement edit functionality
    console.log(`Editing ${field}`)
    // In a real app, you would show a modal or form for editing
  }

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out")
  }

  return (
    <div>
       <Header></Header>
       <div className="container max-w-3xl   mx-auto py-8 px-4 sm:px-6">
     
     <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

     <div className="space-y-6">
       {/* Profile Header with Photo */}
       <Card>
         <CardContent className="pt-6">
           <div className="flex flex-col sm:flex-row items-center gap-6">
             <div className="relative">
               <Avatar className="h-24 w-24">
                 <AvatarImage src="/placeholder.svg?height=96&width=96" alt={profile.name} />
                 <AvatarFallback>
                   {profile.name
                     .split(" ")
                     .map((n) => n[0])
                     .join("")}
                 </AvatarFallback>
               </Avatar>
               <Button
                 variant="outline"
                 size="sm"
                 className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                 onClick={() => handleEdit("photo")}
               >
                 <PencilIcon className="h-4 w-4" />
                 <span className="sr-only">Edit photo</span>
               </Button>
             </div>
             <div className="text-center sm:text-left">
               <h2 className="text-xl font-semibold">{profile.name}</h2>
               <p className="text-sm text-muted-foreground mt-1">Account holder</p>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Verification Status */}
       <Card>
         <CardContent className="pt-6">
           <h3 className="text-sm text-muted-foreground mb-2">Your profile is on verification</h3>
           <Progress value={profile.verification} className="h-2" />
           <p className="text-xs text-muted-foreground mt-2">
             Usually it takes few hours. Please check your email for updates
           </p>
         </CardContent>
       </Card>

       {/* Profile Information */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">Personal Information</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <ProfileItem label="Phone number" value={profile.phone} editable onEdit={() => handleEdit("phone")} />

           <Separator />

           <ProfileItem label="Email address" value={profile.email} editable onEdit={() => handleEdit("email")} />

           <Separator />

           <ProfileItem label="Legal name" value={profile.name} editable onEdit={() => handleEdit("name")} />

           <Separator />

           <ProfileItem label="Password" value="Change password" editable onEdit={() => handleEdit("password")} />
         </CardContent>
       </Card>

       {/* Logout Button */}
       <Button variant="outline" className="w-full sm:w-auto" onClick={handleLogout}>
         <LogOut className="h-4 w-4 mr-2" />
         Log out
       </Button>
     </div>
   </div>
    </div>
  
  )
}
