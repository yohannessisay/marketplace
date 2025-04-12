export interface CupProfile {
    acidity: string
    body: string
    sweetness: string
    aftertaste: string
    aroma: string
    balance: string
  }
  
  export interface CoffeeListing {
    id: string
    title: string
    score: number
    price: number
    isOrganic: boolean
    farmName: string
    region: string
    country: string
    processing: string
    beanType: string
    availableQuantity: number
    cropYear: string
    variety: string
    altitude: number
    cupProfile: CupProfile
    sellerRating: number
    sellerReviews: number
    sellerName: string
    farmingPractice: string
    readinessDate: string
    photos: string[]
    description: string
  }
  