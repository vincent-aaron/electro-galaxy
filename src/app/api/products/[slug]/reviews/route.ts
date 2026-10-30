import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { moderateText } from "@/lib/moderation";
import { rateLimit } from "@/lib/rate-limit";

const REVIEW_COLUMNS = "id, rating, title, comment, reviewer_name, is_verified, created_at";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const supabase = await createClient();

  // Reviews are public — serve them even without Supabase configured
  // (empty list keeps the mock/demo mode stable).
  if (!supabase) {
    return NextResponse.json({ reviews: [], aggregate: null });
  }

  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ reviews: [], aggregate: null });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const reviews = data ?? [];
  const count = reviews.length;
  const rating = count
    ? Math.round((reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count) * 10) / 10
    : 0;

  return NextResponse.json({ reviews, aggregate: { rating, count } });
}

export async function POST(request: Request, { params }: Params) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Reviews require Supabase to be configured. Add your Supabase keys to enable reviews." },
      { status: 503 }
    );
  }

  // Reviews are inserted with the service-role key AFTER moderation, so the
  // public API can't be used to skip moderation (see admin-policies.sql).
  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Reviews are not enabled yet. Set SUPABASE_SERVICE_ROLE_KEY on the server to enable them." },
      { status: 503 }
    );
  }

  const { slug } = await params;

  // 1) Must be signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to leave a review." },
      { status: 401 }
    );
  }

  if (!rateLimit(`review:${user.id}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many reviews. Please try again later." }, { status: 429 });
  }

  // 2) Parse & validate body
  let body: { rating?: unknown; title?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rating = Number(body.rating);
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please pick a star rating between 1 and 5." }, { status: 400 });
  }
  if (!comment || comment.length < 3 || comment.length > 2000) {
    return NextResponse.json({ error: "Your comment must be between 3 and 2000 characters." }, { status: 400 });
  }

  // 3) Find the product
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // 4) One review per user per product (also enforced by a DB unique index)
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", product.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "You already reviewed this product. You can only leave one review per product." },
      { status: 409 }
    );
  }

  // 5) AI bad-word / offensive-content moderation (with offline fallback)
  const textToCheck = [title, comment].filter(Boolean).join(". ");
  const moderation = await moderateText(textToCheck);
  if (!moderation.approved) {
    return NextResponse.json(
      {
        error: moderation.reason?.includes("unavailable")
          ? "We couldn't check your review right now, so it wasn't published. Please try again later."
          : "Your review contains inappropriate language and was not published. Please keep reviews respectful.",
        reason: moderation.reason,
      },
      { status: moderation.reason?.includes("unavailable") ? 503 : 400 }
    );
  }

  // 6) Grab the reviewer's display name (their own profile — RLS allows this)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  // 7) Publish
  const { data: review, error: insertError } = await admin
    .from("reviews")
    .insert({
      product_id: product.id,
      user_id: user.id,
      rating,
      title: title || null,
      comment,
      reviewer_name: profile?.full_name || user.email?.split("@")[0] || "Customer",
      reviewer_email: user.email ?? null,
    })
    .select(REVIEW_COLUMNS)
    .single();

  if (insertError || !review) {
    console.error("Failed to save review:", insertError?.message);
    // 23505 = unique (product_id, user_id): a review was posted in parallel.
    return insertError?.code === "23505"
      ? NextResponse.json({ error: "You already reviewed this product." }, { status: 409 })
      : NextResponse.json({ error: "Could not save your review. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ review }, { status: 201 });
}