import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = { title: "Privacy Policy" };

const sections = [
  {
    title: "Information We Collect",
    body: "When you create an account, place an order, or contact us, we collect information such as your name, email address, phone number, shipping address, and payment details. We also gather usage data to improve your shopping experience.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to process orders, provide customer support, personalize your shopping experience, send order updates, and improve our products and services. We may send promotional emails if you opt in.",
  },
  {
    title: "Payment Security",
    body: "All payment transactions are processed through secure, PCI-compliant payment gateways. We do not store full credit card numbers on our servers. Cash on Delivery, GCash, and Maya transactions follow industry-standard security practices.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell your personal information to third parties. We may share data with service providers (shipping carriers, payment processors) only as necessary to fulfill your orders and provide services.",
  },
  {
    title: "Cookies & Tracking",
    body: "We use cookies and similar technologies to remember your cart, keep you signed in, and analyze site traffic. You can control cookie preferences through your browser settings.",
  },
  {
    title: "Your Rights",
    body: "You may access, update, or delete your personal information at any time through your account settings. You can also contact our support team to request data deletion or opt out of marketing communications.",
  },
  {
    title: "Contact Us",
    body: "If you have questions about this privacy policy or how we handle your data, contact us at support@electrogalaxy.ph or +63 2 8123 4567.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="section-title mb-2">Privacy Policy</h1>
        <p className="mb-8 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-6">
          {sections.map(({ title, body }) => (
            <section key={title} className="card-surface p-6">
              <h2 className="mb-3 text-lg font-bold text-white">{title}</h2>
              <p className="leading-relaxed text-gray-400">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
