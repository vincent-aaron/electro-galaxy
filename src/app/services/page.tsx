import Link from "next/link";
import { Home, Wrench, ShieldCheck, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = { title: "Services" };

const services = [
  {
    id: "consultation",
    icon: Home,
    title: "Smart Home Consultation",
    description: "Our experts assess your space and recommend the perfect smart appliances and devices to transform your home into a connected ecosystem.",
    features: ["Free initial assessment", "Customized recommendations", "Budget-friendly options"],
  },
  {
    id: "installation",
    icon: Wrench,
    title: "Appliance Installation & Setup",
    description: "Professional installation for all major appliances. We handle delivery, setup, and testing so you can enjoy your purchase immediately.",
    features: ["Certified technicians", "Same-week scheduling", "Old appliance removal"],
  },
  {
    id: "warranty",
    icon: ShieldCheck,
    title: "Extended Warranty & Maintenance",
    description: "Protect your investment with extended warranty plans and scheduled maintenance services for long-lasting performance.",
    features: ["Up to 5-year coverage", "Annual maintenance visits", "Priority repair service"],
  },
];

export default function ServicesPage() {
  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Services" }]} />

      <div className="mb-12 text-center">
        <h1 className="section-title mb-4">Our Services</h1>
        <p className="mx-auto max-w-2xl text-gray-400">
          Beyond selling products, we provide end-to-end services to ensure your electronics work perfectly in your home or office.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {services.map(({ id, icon: Icon, title, description, features }) => (
          <div key={id} id={id} className="card-surface flex flex-col p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-galaxy-gold/10">
              <Icon className="h-7 w-7 text-galaxy-gold" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-white">{title}</h2>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-400">{description}</p>
            <ul className="mb-6 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-galaxy-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="inline-flex items-center text-sm font-semibold text-galaxy-gold hover:underline">
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
