'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Check, X, Trash2, Search, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Review {
  id: string
  productId: string
  customerId: string | null
  customerName: string
  rating: number
  title: string | null
  comment: string
  isVerified: boolean
  isApproved: boolean
  createdAt: string
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: approve })
      })
      if (res.ok) {
        toast({ title: approve ? 'Review approved!' : 'Review rejected!' })
        fetchReviews()
      }
    } catch (error) {
      toast({ title: 'Error updating review', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Review deleted!' })
        fetchReviews()
      }
    } catch (error) {
      toast({ title: 'Error deleting review', variant: 'destructive' })
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && !review.isApproved) ||
                         (filter === 'approved' && review.isApproved)
    return matchesSearch && matchesFilter
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Reviews</h1>
          <p className="text-gray-500 mt-1">Manage customer reviews and ratings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{reviews.filter(r => !r.isApproved).length}</p>
            <p className="text-sm text-gray-500">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0}
            </p>
            <p className="text-sm text-gray-500">Average Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={!review.isApproved ? 'border-amber-200 bg-amber-50/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      {review.isVerified && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Verified Purchase
                        </Badge>
                      )}
                      <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    {review.title && (
                      <h3 className="font-semibold text-gray-900 mb-1">{review.title}</h3>
                    )}
                    <p className="text-gray-600 mb-2">{review.comment}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{review.customerName}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!review.isApproved && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(review.id, true)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleApprove(review.id, false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No reviews found</p>
        </div>
      )}
    </div>
  )
}
