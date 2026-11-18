import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = { title: "Terms of Service" };

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "Electro Galaxy is a portfolio demo, not a real store. By using this website, you agree to these terms. If you do not agree with any part of them, please do not use the website.",
  },
  {
    title: "2. Accounts",
    body: "You may browse without an account. Demo accounts are provided for trying features such as order history and saved addresses, and may be removed at any time. Please do not reuse a password from another service.",
  },
  {
    title: "3. Orders & Pricing",
    body: "Orders placed on this website are simulated. Prices are sample figures, no goods are sold, and placing a demo order does not create a purchase or any obligation.",
  },
  {
    title: "4. Payment",
    body: "No payment is collected. The payment options at checkout are simulated, and you must not enter card numbers or other payment details anywhere on this website.",
  },
  {
    title: "5. Shipping & Delivery",
    body: "Nothing is shipped. Shipping fees are shown only to demonstrate how checkout works.",
  },
  {
    title: "6. Returns & Refunds",
    body: "Because nothing is sold, no returns or refunds apply. The Returns & Refunds page is sample content.",
  },
  {
    title: "7. Product Information",
    body: "Product details are sample data and may be inaccurate. They are not an offer or endorsement, and no affiliation with any brand is implied.",
  },
  {
    title: "8. Intellectual Property",
    body: "Product names and brand names belong to their respective owners and are used here for demonstration only.",
  },
  {
    title: "9. Limitation of Liability",
    body: "This demo is provided as is, without warranties of any kind. To the maximum extent permitted by law, its creator is not liable for any damages arising from your use of the website.",
  },
  {
    title: "10. Contact",
    body: "Questions about these terms? Please use the contact page.",
  },
];

export default function TermsPage() {
  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Terms of Service" }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="section-title mb-2">Terms of Service</h1>
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