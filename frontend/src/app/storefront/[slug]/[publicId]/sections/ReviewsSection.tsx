'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Review {
  id: string; customer_name: string; rating_overall: number
  rating_food: number | null; rating_service: number | null
  comment: string | null; created_at: string
}

export function ReviewsSection({ tenantId, allowNew, sessionToken }: {
  tenantId: string; allowNew: boolean; sessionToken: string | null
}) {
  const supabase = createClient()
  const [reviews, setReviews]       = useState<Review[]>([])
  const [showForm, setShowForm]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)

  // Form state
  const [name, setName]       = useState('')
  const [rating, setRating]   = useState(5)
  const [ratingFood, setRatingFood]     = useState(5)
  const [ratingService, setRatingService] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('customer_feedback')
        .select('id, customer_name, rating_overall, rating_food, rating_service, comment, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) setReviews(data)
    }
    fetchReviews()
  }, [tenantId])

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return
    setSubmitting(true)

    const { error } = await supabase
      .from('customer_feedback')
      .insert({
        tenant_id:       tenantId,
        customer_name:   name.trim(),
        rating_overall:  rating,
        rating_food:     ratingFood,
        rating_service:  ratingService,
        comment:         comment.trim() || null,
        would_revisit:   true,
      })

    setSubmitting(false)
    if (!error) {
      setSubmitted(true)
      setShowForm(false)
      // Refresh reviews
      const { data } = await supabase
        .from('customer_feedback')
        .select('id, customer_name, rating_overall, rating_food, rating_service, comment, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setReviews(data)
    }
  }

  return (
    <section id="reviews" className="py-12 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-805">Guest Reviews</h2>
        {allowNew && !submitted && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl text-white text-sm font-bold"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            + Add Review
          </button>
        )}
        {submitted && (
          <span className="text-green-600 text-sm font-medium">✓ Thank you!</span>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h3 className="font-semibold text-gray-805 mb-4">Share your experience</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm"
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Overall</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="flex gap-6">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Food</label>
                <StarRating value={ratingFood} onChange={setRatingFood} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Service</label>
                <StarRating value={ratingService} onChange={setRatingService} />
              </div>
            </div>
            <textarea
              placeholder="Tell us more (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || submitting}
              className="w-full py-3 rounded-xl text-white font-bold disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-805 text-sm">{review.customer_name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= review.rating_overall ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button key={star} onClick={() => onChange(star)}
        className={`text-2xl transition-transform hover:scale-110 ${star <= value ? 'text-yellow-400' : 'text-gray-200'}`}
      >★</button>
    ))}
  </div>
)
