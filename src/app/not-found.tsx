import Link from "next/link";
import { Home, PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-main flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-galaxy-gold/10">
        <PackageSearch className="h-12 w-12 text-galaxy-gold" />
      </div>
      <p className="mb-2 text-6xl font-black text-galaxy-gold">404</p>
      <h1 className="mb-3 text-2xl font-bold text-white">Page Not Found</h1>
      <p className="mb-8 max-w-md text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary px-8 py-3">
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <Link href="/products" className="btn-secondary px-8 py-3">
          Browse Products
        </Link>
      </div>
    </div>
  );
}

