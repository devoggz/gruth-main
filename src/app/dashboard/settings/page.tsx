// src/app/dashboard/settings/page.tsx
import { auth }            from "@/lib/auth";
import { prisma }          from "@/lib/prisma";
import { redirect }        from "next/navigation";
import AccountSettingsForm from "@/components/shared/AcountSettingsForm";
import ReferralPanel       from "@/components/dashboard/ReferralPanel";

export const revalidate = 3600;

export const metadata = { title: "Settings | GRUTH" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: {
      name: true, email: true, phone: true,
      whatsapp: true, country: true, bio: true,
      createdAt: true, referralCode: true, referredBy: true,
      _count: { select: { referrerCredits: true } },
    },
  });
  if (!user) redirect("/login");

  const unusedCredits = await prisma.referralCredit.count({
    where: { referrerId: session.user.id, used: false },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gruth.ke";

  return (
      <div className="space-y-5 max-w-2xl pb-12">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-950 tracking-tight">Account Settings</h1>
          <p className="text-charcoal-500 text-sm mt-1">Manage your profile, security, and referrals</p>
        </div>

        <AccountSettingsForm user={{
          ...user,
          name:     user.name     ?? "",
          phone:    user.phone    ?? "",
          whatsapp: user.whatsapp ?? "",
          country:  user.country  ?? "",
          bio:      user.bio      ?? "",
        }} />

        <ReferralPanel
            userId={session.user.id}
            userName={user.name}
            referralCode={user.referralCode}
            totalReferred={user._count.referrerCredits}
            unusedCredits={unusedCredits}
            appUrl={appUrl}
        />

        <div className="bg-white border border-charcoal-100 rounded-2xl p-5">
          <p className="text-charcoal-500 text-sm">
            Member since{" "}
            <strong className="text-charcoal-700">
              {new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </strong>
            {user.referredBy && <span className="ml-2 text-emerald-600">· Joined via referral</span>}
          </p>
        </div>
      </div>
  );
}