import { useState } from "react"
import { CoffeeListing } from "@/types/coffee"

export function useCoffeeListing() {
  // Mock data - in a real app this would come from an API call
  const [listing] = useState<CoffeeListing>({
    id: "eb7f3456-c9d8-4a12-b456-789012345678",
    title: "Ethiopian Heirloom",
    score: 86.5,
    price: 8.75,
    isOrganic: true,
    farmName: "Abadega Family Farm",
    region: "Yirgacheffe",
    country: "Ethiopia",
    processing: "Washed",
    beanType: "Green beans",
    availableQuantity: 1250,
    cropYear: "2024",
    variety: "Ethiopian Heirloom",
    altitude: 1900,
    cupProfile: {
      acidity: "Bright, citrusy",
      body: "Medium",
      sweetness: "High, honey-like",
      aftertaste: "Long, clean",
      aroma: "Floral, jasmine",
      balance: "Well-balanced"
    },
    sellerRating: 4.8,
    sellerReviews: 24,
    sellerName: "Tadesse Abadega",
    farmingPractice: "Sustainable, traditional",
    readinessDate: "2024-05-10",
    photos: [
      "/placeholder.svg?height=500&width=800",
      "/placeholder.svg?height=500&width=800",
      "/placeholder.svg?height=500&width=800"
    ],
    description: "This exceptional Ethiopian Heirloom coffee is grown at high altitude in the renowned Yirgacheffe region. The careful washed processing brings out bright, citrusy notes with a delicate floral aroma. The Abadega family has been growing coffee for generations using traditional methods that respect the environment."
  })

  return { listing }
}
