// src/app/inspector/settings/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AccountSettingsForm from "@/components/shared/AcountSettingsForm";

export const metadata = { title: "Account Settings | GRUTH Inspector" };

export default async function InspectorSettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "INSPECTOR" && role !== "ADMIN"))
    redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user!.id! },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      country: true,
      bio: true,
      passwordHash: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-950">
          Account Settings
        </h1>
        <p className="text-charcoal-400 text-sm mt-1">
          Manage your profile and login credentials.
        </p>
      </div>
      <AccountSettingsForm
        user={{
          name: user.name ?? "",
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsapp,
          country: user.country,
          bio: user.bio,
          hasPassword: !!user.passwordHash,
        }}
      />
    </div>
  );
}
