import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = { title: "About" };

const highlights = [
  { stat: "Solo", label: "Designed and built by one developer" },
  { stat: "Next.js", label: "App Router, React and TypeScript" },
  { stat: "Supabase", label: "Postgres, auth and row level security" },
];

export default function AboutPage() {
  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "About" }]} />

      <section className="mb-16 text-center">
        <h1 className="section-title mb-4">About Electro Galaxy</h1>
        <p className="mx-auto max-w-2xl text-gray-400">
          Electro Galaxy is a portfolio demo of a modern electronics store. It shows a complete shopping experience,
          from browsing and search to checkout, customer accounts and an admin panel. Products are sample data, and no
          real payments, orders or deliveries are processed.
        </p>
      </section>

      <section className="mb-16 grid gap-8 sm:grid-cols-3">
        {highlights.map(({ stat, label }) => (
          <div key={stat} className="card-surface p-8 text-center">
            <p className="text-3xl font-bold text-galaxy-gold">{stat}</p>
            <p className="mt-2 text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <h2 className="section-title mb-8 text-center">What It Demonstrates</h2>
        <div className="card-surface p-8 sm:p-12">
          <p className="text-center leading-relaxed text-gray-400">
            Server-calculated order totals, role-based admin tools, AI-moderated product reviews and a Gemini-powered
            shopping assistant, all in a responsive storefront designed for phones and desktops alike.
          </p>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-8 text-center">The Developer</h2>
        <div className="card-surface mx-auto max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-galaxy-gold to-galaxy-accent text-2xl font-bold text-galaxy-black">
            VA
          </div>
          <h3 className="font-semibold text-white">Vincent Aaron Vicente</h3>
          <p className="mt-1 text-sm text-galaxy-gold">Full Stack Developer</p>
        </div>
      </section>
    </div>
  );
}
