import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = { title: "Terms of Service" };

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or shopping at Electro Galaxy, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website or services. We may update these terms from time to time, and the latest version will always be available on this page.",
  },
  {
    title: "2. Accounts",
    body: "You may browse the store without an account, but placing tracked orders, saving addresses, and accessing order history requires registration. You are responsible for keeping your account credentials secure and for all activity that occurs under your account. You must provide accurate and complete information when creating an account.",
  },
  {
    title: "3. Orders & Pricing",
    body: "All prices are listed in Philippine Pesos (PHP) and are subject to change without notice. We reserve the right to cancel or refuse any order at any time, including in the case of pricing errors, suspected fraud, or product unavailability. Placing an order constitutes an offer to purchase; acceptance occurs when we confirm your order.",
  },
  {
    title: "4. Payment",
    body: "We accept Cash on Delivery (COD), GCash, Maya, credit/debit cards, and bank transfer. For card and e-wallet payments, charges are processed securely through our payment partners. For COD orders, payment is due in full upon delivery. Failure to pay COD orders on multiple occasions may result in account restrictions.",
  },
  {
    title: "5. Shipping & Delivery",
    body: "We ship nationwide across the Philippines. Shipping is free for orders over ₱5,000; otherwise a flat fee of ₱199 applies. Estimated delivery times vary by location, typically 2–7 business days for Metro Manila and 5–14 business days for provincial areas. Risk of loss passes to you upon delivery to the carrier.",
  },
  {
    title: "6. Returns & Refunds",
    body: "Our 30-day return policy, eligibility requirements, and refund process are described in full on our Returns & Refunds page. Items must be returned in their original condition with all packaging and accessories unless defective.",
  },
  {
    title: "7. Product Information",
    body: "We work hard to display product details, images, and specifications accurately. However, we do not guarantee that all information is error-free. Colors may vary slightly depending on your display, and manufacturers may update product designs without notice.",
  },
  {
    title: "8. Intellectual Property",
    body: "All content on this website — including the Electro Galaxy name and logo, product photography, graphics, and text — is the property of Electro Galaxy or its licensors and is protected by applicable intellectual property laws. You may not reproduce or reuse this content without written permission.",
  },
  {
    title: "9. Limitation of Liability",
    body: "To the maximum extent permitted by law, Electro Galaxy shall not be liable for any indirect, incidental, or consequential damages arising from your use of the website or purchase of products. Our total liability for any claim is limited to the amount you paid for the product in question.",
  },
  {
    title: "10. Contact",
    body: "Questions about these Terms? Contact us at support@electrogalaxy.ph, call +63 2 8123 4567, or reach out via our contact page. We're located at 123 Galaxy Street, Makati City, Metro Manila, Philippines.",
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