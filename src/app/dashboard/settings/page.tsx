import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Settings | GRUTH" };

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      name: true,
      email: true,
      phone: true,
      country: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-950">
          Account Settings
        </h1>
        <p className="text-charcoal-500 text-sm mt-1">
          Manage your profile and account preferences
        </p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-charcoal-900 mb-6">
          Profile Information
        </h2>
        <form className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name ?? ""}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                defaultValue={user?.email ?? ""}
                className="input-field"
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Phone / WhatsApp</label>
              <input
                type="tel"
                defaultValue={user?.phone ?? ""}
                className="input-field"
                placeholder="+44 7700 900123"
              />
            </div>
            <div>
              <label className="label">Country of Residence</label>
              <input
                type="text"
                defaultValue={user?.country ?? ""}
                className="input-field"
                placeholder="United Kingdom"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary text-sm">
            Save Changes
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-charcoal-900 mb-2">
          Account Security
        </h2>
        <p className="text-charcoal-500 text-sm mb-5">
          Update your password to keep your account secure.
        </p>
        <form className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button type="submit" className="btn-secondary text-sm">
            Update Password
          </button>
        </form>
      </div>

      <div className="card p-6 border-red-100">
        <h2 className="font-semibold text-charcoal-900 mb-2">
          Account Information
        </h2>
        <p className="text-charcoal-500 text-sm">
          Member since{" "}
          <strong className="text-charcoal-700">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </strong>
        </p>
      </div>
    </div>
  );
}
