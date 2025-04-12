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
    cupProfile: {
      acidity: string
      body: string
      sweetness: string
      aftertaste: string
      aroma: string
      balance: string
    }
    status: string
    createdAt: string
    readinessDate: string
    photos: string[]
    description: string
    discounts: {
      minimumQuantity: number
      percentage: number
    }[]
  }
  
  export interface Bid {
    id: string
    buyerName: string
    quantity: number
    totalAmount: number
    status: string
    date: string
  }
  
  export interface Message {
    id: number
    sender: "buyer" | "seller"
    message: string
    timestamp: string
  }
  
  export interface MessageThread {
    id: number
    buyerName: string
    buyerCompany: string
    buyerAvatar: string | null
    unread: number
    lastMessageTime: string
    messages: Message[]
  }
  
  export interface ListingStats {
    views: number
    inquiries: number
    totalBids: number
    totalRevenue: number
  }
  
  export interface MockData {
    listing: CoffeeListing
    bids: Bid[]
    messageThreads: MessageThread[]
    listingStats: ListingStats
  }
  