export interface CoffeeListing {
  id: string;
  title: string;
  score: number;
  price: number;
  isOrganic: boolean;
  farmName: string;
  region: string;
  country: string;
  processing: string;
  beanType: string;
  availableQuantity: number;
  cropYear: string;
  variety: string;
  altitude: number;
  cupProfile: {
    acidity: string;
    body: string;
    sweetness: string;
    aftertaste: string;
    aroma: string;
    balance: string;
  };
  status: string;
  createdAt: string;
  readinessDate: string;
  photos: string[];
  description: string;
  discounts: {
    minimumQuantity: number;
    percentage: number;
  }[];
}

export interface Bid {
  id: string;
  buyerName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  date: string;
}
export interface User {
  id: string;
  userType: "buyer" | "seller";
  name: string;
  company_name: string | null;
  avatar_url_csv: string | null;
}

export interface Message {
  id: string;
  sender: User;
  recipient: User;
  recipientType: string;
  message: string;
  listingId: string | null;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  buyerName: string;
  buyerCompany: string | null;
  buyerAvatar: string | null;
  unread: number;
  lastMessageTime: string;
  messages: Message[];
}

export interface ListingStats {
  views: number;
  inquiries: number;
  totalBids: number;
  totalRevenue: number;
}

export interface MockData {
  listing: CoffeeListing;
  bids: Bid[];
  messageThreads: MessageThread[];
  listingStats: ListingStats;
}
