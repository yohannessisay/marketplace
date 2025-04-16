export type OrderStatus =
  | "none"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "delivered"
  | "completed"
  | "cancelled"

export interface OrderStep {
  name: string
  key: string
  completed: boolean
}

export interface OrderDocument {
  name: string
  date: string
}

export interface OrderStatusData {
  id:string;
  status: OrderStatus
  quantity: number
  totalPrice: number
  orderedDate: string
  estimatedDelivery: string
  steps: OrderStep[]
  documents: OrderDocument[]
  needsReview: boolean
  hasIssue: boolean
  issueDescription: string | null
}
