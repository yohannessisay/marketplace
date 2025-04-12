"use client"

import { useState } from "react"
import { Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ReviewModalProps {
  onClose: () => void
  onSubmit: () => void
}

export function ReviewModal({ onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  
  const handleSubmit = () => {
    console.log('Submitting review with rating:', rating, 'and comment:', reviewComment)
    onSubmit()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label className="block mb-2">
              How would you rate this seller and their coffee?
            </Label>
            <div className="flex space-x-2 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star 
                    size={32} 
                    className={`${rating >= star ? 'text-yellow-400 fill-current' : 'text-muted'}`} 
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {rating} star{rating !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div>
            <Label htmlFor="review">Your Review</Label>
            <Textarea
              id="review"
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="mt-1"
              placeholder="Share your experience with this coffee and seller..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
