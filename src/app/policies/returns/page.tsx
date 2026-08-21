import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = { title: "Returns & Refunds" };

const sections = [
  {
    title: "30-Day Return Policy",
    body: "We want you to be completely satisfied with your purchase. If you're not happy with an item, you may return it within 30 days of delivery for a full refund or exchange, provided it's in its original condition with all packaging, accessories, and documentation included.",
  },
  {
    title: "Eligibility",
    body: "To be eligible for a return, the item must be unused, undamaged, and in its original packaging. Custom or special-order items may not be returnable unless defective. Products with hygiene considerations, such as personal care devices that have been opened, may only be returned if defective.",
  },
  {
    title: "How to Start a Return",
    body: "To initiate a return, contact our support team at support@electrogalaxy.ph or call +63 2 8123 4567 with your order number. We'll provide a return authorization and instructions. A return shipping label may be provided depending on the reason for return.",
  },
  {
    title: "Refund Process",
    body: "Once we receive and inspect your returned item, we'll process your refund within 5–7 business days. Refunds are issued to your original payment method — GCash, Maya, credit card, or bank transfer. For Cash on Delivery orders, refunds are issued via bank transfer or GCash.",
  },
  {
    title: "Damaged or Defective Items",
    body: "If your item arrives damaged or defective, contact us within 48 hours of delivery with photos. We'll arrange a free replacement or full refund, including any shipping costs. We'll handle all claims with the manufacturer on your behalf.",
  },
  {
    title: "Warranty Coverage",
    body: "All products come with manufacturer warranties ranging from 1 to 3 years. Extended warranty plans are available for purchase. Warranty claims are handled by our certified technicians and manufacturer partners.",
  },
  {
    title: "Non-Returnable Items",
    body: "Gift cards, downloadable software, and items that have been installed or modified cannot be returned unless defective. Clearance and final-sale items are non-returnable unless otherwise stated at the time of purchase.",
  },
];

export default function ReturnsPolicyPage() {
  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Returns & Refunds" }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="section-title mb-2">Returns &amp; Refunds</h1>
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
