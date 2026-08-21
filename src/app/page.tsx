import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Shield, Headphones, Zap } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryCard } from "@/components/products/CategoryCard";
import { Reveal } from "@/components/ui/Reveal";
import { getCategories, getProducts } from "@/lib/data/products";
import smartKitchenImage from "../../img/featured-bg.png";
import waveImage from "../../img/1.png";
import smartCardImage from "../../img/items-smart/smart-card.png";
import officeCardImage from "../../img/items-office/office-card.png";

export default async function HomePage() {
  const [categories, featuredProducts, allProducts] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ limit: 4 }),
  ]);

  const flashDeals = allProducts.filter((p) => p.compare_at_price && p.compare_at_price > p.price).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="home-hero relative isolate overflow-hidden bg-galaxy-black">
        <Image src={waveImage} alt="" fill priority className="home-hero-wave" sizes="100vw" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-galaxy-gold/15 via-transparent to-transparent" />
        <div className="container-main relative grid min-h-[610px] items-center gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.9fr)] lg:py-24">
          <div className="relative z-10 max-w-2xl animate-slide-up">
            <span className="mb-4 inline-block rounded-full border border-galaxy-gold/30 bg-galaxy-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-galaxy-gold">
              New Arrivals 2026
            </span>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Power Your World with{" "}
              <span className="text-galaxy-glow text-glow">Electro Galaxy</span>
            </h1>
            <p className="mb-8 text-lg text-gray-400">
              Discover premium electronics and smart appliances. From kitchen essentials to cutting-edge smart home devices — all at unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary px-8 py-3 text-base">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/products?featured=true" className="btn-secondary px-8 py-3 text-base">
                View Deals
              </Link>
            </div>
          </div>

          <div className="home-hero-showcase relative mx-auto hidden w-full max-w-[560px] lg:block" aria-hidden="true">
            <div className="home-hero-ring home-hero-ring--outer" />
            <div className="home-hero-ring home-hero-ring--inner" />
            <div className="home-hero-main-card">
              <Image src={smartKitchenImage} alt="" fill priority className="object-cover" sizes="560px" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/55 to-transparent p-7 pt-20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-galaxy-gold">Connected living</p>
                <p className="mt-1 text-xl font-bold text-white">A smarter space starts here.</p>
              </div>
            </div>
            <div className="home-hero-mini-card home-hero-mini-card--smart"><Image src={smartCardImage} alt="" fill className="object-cover" sizes="180px" /><span>Smart home</span></div>
            <div className="home-hero-mini-card home-hero-mini-card--office"><Image src={officeCardImage} alt="" fill className="object-cover" sizes="180px" /><span>Work setup</span></div>
            <div className="home-hero-status"><span className="home-hero-status-dot" /> Trending tech <b>24/7</b></div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-galaxy-border bg-galaxy-dark">
        <div className="container-main grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
          {[
            { icon: Truck, label: "Free Shipping", sub: "Orders over ₱5,000" },
            { icon: Shield, label: "Secure Payment", sub: "100% protected" },
            { icon: Headphones, label: "24/7 Support", sub: "Dedicated help" },
            { icon: Zap, label: "Fast Delivery", sub: "1-3 business days" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-galaxy-gold/10">
                <Icon className="h-5 w-5 text-galaxy-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 sm:py-16">
        <div className="container-main">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="mt-2 text-gray-400">Browse our curated collections</p>
            </div>
            <Link href="/products" className="hidden text-sm font-semibold text-galaxy-gold hover:underline sm:block">
              View All →
            </Link>
          </div>
<Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <section className="bg-galaxy-dark py-12 sm:py-16">
          <div className="container-main">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="mb-2 inline-block text-xs font-bold uppercase tracking-wider text-red-500">Limited Time</span>
                <h2 className="section-title">Flash Deals</h2>
              </div>
              <Link href="/products?featured=true" className="text-sm font-semibold text-galaxy-gold hover:underline">
                See All Deals →
              </Link>
            </div>
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {flashDeals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 sm:py-16">
        <div className="container-main">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="mt-2 text-gray-400">Hand-picked bestsellers for you</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-galaxy-gold hover:underline">
              View All →
            </Link>
          </div>
<Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

{/* CTA Banner */}
      <section className="py-12 sm:py-16">
        <div className="container-main">
          <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-galaxy-gold/20 bg-gradient-to-r from-galaxy-dark to-galaxy-card p-8 sm:p-12">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-galaxy-gold/5 blur-3xl" />
            <div className="relative max-w-xl">
              <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                Join the Galaxy Community
              </h2>
              <p className="mb-6 text-gray-400">
                Sign up today and get 10% off your first order. Plus exclusive access to member-only deals and early product launches.
              </p>
              <Link href="/auth/register" className="btn-primary px-8 py-3">
                Create Free Account
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
      </section>

{/* Testimonials */}
      <section className="border-t border-galaxy-border bg-galaxy-dark py-12 sm:py-16">
        <div className="container-main">
          <h2 className="section-title mb-8 text-center">What Our Customers Say</h2>
          <Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { name: "Maria Santos", text: "Amazing selection of smart appliances! Fast delivery and excellent customer service.", rating: 5 },
              { name: "James Reyes", text: "Best prices for electronics in the Philippines. The checkout process was smooth and secure.", rating: 5 },
              { name: "Anna Cruz", text: "Love my new smart fridge! Installation service was professional and hassle-free.", rating: 4 },
            ].map((review) => (
              <div key={review.name} className="card-surface p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-galaxy-gold">★</span>
                  ))}
                </div>
                <p className="mb-4 text-sm text-gray-300">&ldquo;{review.text}&rdquo;</p>
                <p className="text-sm font-semibold text-white">{review.name}</p>
              </div>
))}
          </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
