"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Send, ShieldCheck } from "lucide-react";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  reviewer_name: string | null;
  is_verified: boolean;
  created_at: string;
}

interface ReviewsProps {
  slug: string;
  fallbackRating: number;
  fallbackCount: number;
}

function Stars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
}) {
  const starClass = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  const interactive = Boolean(onChange);
  return (
    <div className={cn("flex items-center gap-0.5", interactive && "cursor-pointer")}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={cn(
            !interactive && "pointer-events-none",
            interactive && "transition-transform hover:scale-110"
          )}
        >
          <Star
            className={cn(
              starClass,
              n <= value ? "fill-galaxy-gold text-galaxy-gold" : "text-gray-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ slug, fallbackRating, fallbackCount }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(getUser()));
    fetch(`/api/products/${slug}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.reviews) setReviews(data.reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const liveCount = reviews.length;
  const liveRating = liveCount
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / liveCount) * 10) / 10
    : 0;
  const shownCount = liveCount > 0 ? liveCount : fallbackCount;
  const shownRating = liveCount > 0 ? liveRating : fallbackRating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!rating) {
      setError("Please pick a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, comment }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setSignedIn(false);
        setError("Please sign in to leave a review.");
        return;
      }
      if (!res.ok) {
        setError(data?.error || "Could not submit your review.");
        return;
      }
      setSuccess("Thank you! Your review was checked and published.");
      setReviews((prev) => [data.review, ...prev]);
      setRating(0);
      setTitle("");
      setComment("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 border-t border-galaxy-border pt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title mb-3">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-galaxy-gold">{shownRating}</span>
            <div>
              <Stars value={Math.round(shownRating)} size="sm" />
              <p className="text-xs text-gray-500">Based on {shownCount} review{shownCount === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-galaxy-gold" />
          Every review is checked by AI for inappropriate content
        </span>
      </div>

      {/* Write a review */}
      {signedIn ? (
        <form onSubmit={handleSubmit} className="card-surface mb-10 space-y-4 p-5 sm:p-6">
          <h3 className="font-semibold text-white">Write a Review</h3>
          <div>
            <label className="mb-1.5 block text-sm text-gray-400">Your Rating *</label>
            <Stars value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-400">Title (optional)</label>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. Highly recommended!"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-400">Comment *</label>
            <textarea
              className="input-field min-h-[90px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              placeholder="Share your experience with this product..."
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
          )}
          {success && (
            <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">{success}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Checking review..." : "Submit Review"}
          </button>
          <p className="text-xs text-gray-500">
            Reviews are moderated automatically. Inappropriate language will not be accepted.
          </p>
        </form>
      ) : (
        <div className="card-surface mb-10 flex flex-col items-center justify-between gap-3 p-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-semibold text-white">Have you used this product?</p>
            <p className="text-sm text-gray-400">Sign in to leave a review and help other shoppers.</p>
          </div>
          <Link href="/auth/login" className="btn-primary shrink-0 px-6 py-2.5 text-sm">
            Sign In to Review
          </Link>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="card-surface space-y-3 p-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-galaxy-dark" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <Star className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="font-semibold text-white">No written reviews yet</p>
          <p className="mt-1 text-sm text-gray-400">Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="card-surface p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <Stars value={r.rating} size="sm" />
                <span className="text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              {r.title && <p className="mb-1 font-semibold text-white">{r.title}</p>}
              <p className="text-sm leading-relaxed text-gray-400">{r.comment}</p>
              <p className="mt-3 text-xs text-gray-500">
                — {r.reviewer_name ?? "Guest"}
                {r.is_verified && <span className="ml-1 text-galaxy-gold">· Verified</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}