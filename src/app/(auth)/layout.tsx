// src/app/(auth)/layout.tsx
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col">
      <div className="flex items-center h-16 px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/logo-w.svg" alt="logo" width={180} height={100} />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        {children}
      </div>
    </div>
  );
}
