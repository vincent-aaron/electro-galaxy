import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = { title: "Privacy Policy" };

const sections = [
  {
    title: "Portfolio Demo",
    body: "Electro Galaxy is a portfolio demo, not a real store. Please use made-up details when trying checkout, and do not submit sensitive information anywhere on this site.",
  },
  {
    title: "Information We Collect",
    body: "When you create a demo account, place a demo order, or send a message, the details you enter (such as your name, email address, phone number, and shipping address) are saved in the demo database.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is only used to make the demo work, such as signing you in and showing your order history. It is not used for marketing.",
  },
  {
    title: "Payment Details",
    body: "No payments are processed. This site never asks for card numbers, CVV codes, or e-wallet logins, and order requests containing a card number are rejected.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell your personal information. The demo is hosted on Vercel and stores data with Supabase. Messages sent to the AI assistant and the text of product reviews are processed by Google Gemini.",
  },
  {
    title: "Cookies & Local Storage",
    body: "Cookies keep you signed in, and your browser's local storage remembers your cart and wishlist. You can clear both through your browser settings.",
  },
  {
    title: "Your Rights",
    body: "You can ask for your demo account and related data to be deleted by sending a request through the contact page.",
  },
  {
    title: "Contact Us",
    body: "If you have questions about this privacy policy or how your data is handled, please use the contact page.",
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
