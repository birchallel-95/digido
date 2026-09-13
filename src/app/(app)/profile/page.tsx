import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { PlatformPreference } from "@/lib/constants";

export default async function ProfilePage() {
  const user = await requireUser();
  const [record, momentum] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.userMomentum.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Profile</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">Manage your details and development preferences.</p>
      </div>
      <ProfileForm
        name={record?.name ?? ""}
        email={record?.email ?? ""}
        department={record?.department ?? ""}
        jobTitle={record?.jobTitle ?? ""}
        weeklyTarget={momentum?.weeklyTarget ?? 3}
        platformPreference={(record?.platformPreference as PlatformPreference) ?? "BOTH"}
      />
    </div>
  );
}
