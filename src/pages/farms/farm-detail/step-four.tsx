import type React from "react"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Upload, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Stepper from "@/components/ui/stepper"
import { profileInfoSchema, type ProfileInfoFormData } from "@/types/validation/seller-onboarding"
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils"
import { Link, useNavigate } from "react-router-dom"
import { useNotification } from "@/hooks/useNotification"
import Header from "@/components/layout/header"

export default function StepFour() {
  const navigation = useNavigate()
  const [isClient, setIsClient] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const { successMessage, errorMessage } = useNotification();
  // Initialize form with default values or values from local storage
  const form = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      bio: "",
    },
  })

  // Load saved data from local storage on component mount
  useEffect(() => {
    setIsClient(true)
    const savedData = getFromLocalStorage<ProfileInfoFormData>("step-four", {} as ProfileInfoFormData)
    if (savedData && Object.keys(savedData).length > 0) {
      form.reset(savedData)
    }

    const savedImage = localStorage.getItem("profile-image")
    if (savedImage) {
      setProfileImage(savedImage)
    }
  }, [form])

  // Handle file upload for profile image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setProfileImage(imageUrl)
        localStorage.setItem("profile-image", imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const onSubmit = (data: ProfileInfoFormData) => {
    saveToLocalStorage("step-four", data)

    // Combine all data from all steps
    const stepOne = getFromLocalStorage("step-one", {})
    const stepTwo = getFromLocalStorage("step-two", {})
    const stepThree = getFromLocalStorage("step-three", {})

    // Save complete form data
    saveToLocalStorage("complete-form-data", {
      farmDetails: stepOne,
      cropDetails: stepTwo,
      bankInfo: stepThree,
      profileInfo: data,
      profileImage: profileImage,
    })

          // const response: { success: boolean } = await apiService().post("/onboarding/seller/profile", data);
      // if (response && response.success) {
      //   saveToLocalStorage("step-one", data);
      //   navigate("/onboarding/step-two");
      // }else{
      //   errorMessage("Failed to save farm details");
      // }

    successMessage("Registration completed successfully!");
    navigation("/seller-dashboard")
  }

  // Go back to previous step
  const goBack = () => {
    navigation("/onboarding/step-three")
  }

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <div className="min-h-screen bg-white">
    {/* Header */}
<Header></Header>
    {/* Main Content */}
    <main className="container mx-auto p-6">
      <Stepper currentStep={4} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 shadow-lg px-8  rounded-md py-4">
          <div className="mb-10">
            <div className="mb-6">
              <h2 className="text-green-600 font-medium">Step 4</h2>
              <h3 className="text-xl text-gray-900 font-semibold">Complete your profile</h3>
              <p className="text-sm text-gray-600">Add your personal information and profile photo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 text-center">
                      <h4 className="font-medium mb-2">Profile Photo</h4>
                      <p className="text-sm text-gray-500">Upload a clear photo of yourself</p>
                    </div>

                    <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
                      {profileImage ? (
                        <img
                          src={profileImage || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-20 h-20 text-gray-400" />
                      )}
                    </div>

                    <label htmlFor="profile-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Upload className="w-4 h-4" />
                        <span>Upload photo</span>
                      </div>
                      <Input
                        id="profile-image"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Tell us about yourself and your farm..."
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mb-8">
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
            <Button type="submit" >
              Complete Registration
            </Button>
          </div>
        </form>
      </Form>
    </main>
    </div>
  )
}

