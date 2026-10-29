import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="relative w-64 h-64 mb-6">
        <Image
          src="/404.png"
          alt="Page Not Found"
          fill
          priority
          className="object-contain"
        />
      </div>
      <h1 className="text-3xl font-bold text-navy mb-2">Page Not Found</h1>
      <p className="text-gray-500 max-w-md mb-6 text-sm">
        The page you are looking for does not exist or has been moved within the VeloShelf enterprise platform.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-navy text-white rounded-lg font-medium text-sm hover:bg-navy/90 transition-colors shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}