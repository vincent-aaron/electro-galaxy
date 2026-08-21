import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = { title: "About Us" };

const team = [
  { name: "Shamel", role: "Project Manager / Team Lead", initial: "S" },
  { name: "Vincent Aaron", role: "Full Stack Developer / Lead Dev", initial: "VA" },
  { name: "John Paul", role: "Front-End Developer", initial: "JP" },
];

export default function AboutPage() {
  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "About Us" }]} />

      <section className="mb-16 text-center">
        <h1 className="section-title mb-4">About Electro Galaxy</h1>
        <p className="mx-auto max-w-2xl text-gray-400">
          Electro Galaxy is the Philippines&apos; premier destination for premium electronics and smart appliances.
          We bring cutting-edge technology to Filipino homes with unbeatable prices, reliable service, and a passion for innovation.
        </p>
      </section>

      <section className="mb-16 grid gap-8 sm:grid-cols-3">
        {[
          { stat: "10K+", label: "Happy Customers" },
          { stat: "500+", label: "Products Available" },
          { stat: "4.8★", label: "Average Rating" },
        ].map(({ stat, label }) => (
          <div key={label} className="card-surface p-8 text-center">
            <p className="text-3xl font-bold text-galaxy-gold">{stat}</p>
            <p className="mt-2 text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <h2 className="section-title mb-8 text-center">Our Mission</h2>
        <div className="card-surface p-8 sm:p-12">
          <p className="text-center leading-relaxed text-gray-400">
            We believe everyone deserves access to quality technology. Our mission is to make premium electronics
            and smart appliances accessible to every Filipino household — with transparent pricing, expert guidance,
            and world-class customer support. From smart kitchens to connected offices, Electro Galaxy powers your world.
          </p>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-8 text-center">Meet the Team</h2>
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="card-surface p-6 text-center transition-all hover:border-galaxy-gold/30">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-galaxy-gold to-galaxy-accent text-2xl font-bold text-galaxy-black">
                {member.initial}
              </div>
              <h3 className="font-semibold text-white">{member.name}</h3>
              <p className="mt-1 text-sm text-galaxy-gold">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
