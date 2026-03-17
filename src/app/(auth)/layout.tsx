// src/app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col">
      <div className="flex items-center h-16 px-8"></div>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        {children}
      </div>
    </div>
  );
}
