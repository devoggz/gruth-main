// src/app/admin/requests/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RequestsInbox from "@/components/admin/RequestsInbox";

export default async function AdminRequestsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-display text-[26px] font-bold text-charcoal-950 tracking-tight">
          Verification Requests
        </h1>
        <p className="text-charcoal-400 text-sm mt-1">
          All intake form submissions from the website.
        </p>
      </div>
      <RequestsInbox />
    </div>
  );
}
