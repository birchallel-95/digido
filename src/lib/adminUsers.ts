import { prisma } from "@/lib/prisma";
import type { PlatformPreference, Role } from "@/lib/constants";

export interface StaffAccount {
  id: string;
  name: string | null;
  email: string;
  department: string | null;
  jobTitle: string | null;
  role: Role;
  platformPreference: PlatformPreference;
  onboarded: boolean;
  createdAt: string;
  lastLogin: string | null;
  hasPassword: boolean; // credentials account vs OAuth-only
}

/**
 * Account administration data only — name, email, role, join/login dates,
 * onboarding status. Deliberately never joins to UserSkillStatus, Evidence,
 * or any other table holding a staff member's self-assessed capability
 * data — that stays private per the product's privacy principles (see
 * adminAnalytics.ts for the aggregate-only view of capability trends).
 */
export async function getStaffAccounts(): Promise<{
  accounts: StaffAccount[];
  totalStaff: number;
  totalAdmins: number;
  onboardedCount: number;
  newThisWeek: number;
}> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      jobTitle: true,
      role: true,
      platformPreference: true,
      onboarded: true,
      createdAt: true,
      lastLogin: true,
      passwordHash: true,
    },
  });

  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const accounts: StaffAccount[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    department: u.department,
    jobTitle: u.jobTitle,
    role: u.role as Role,
    platformPreference: u.platformPreference as PlatformPreference,
    onboarded: u.onboarded,
    createdAt: u.createdAt.toISOString(),
    lastLogin: u.lastLogin?.toISOString() ?? null,
    hasPassword: Boolean(u.passwordHash),
  }));

  return {
    accounts,
    totalStaff: accounts.length,
    totalAdmins: accounts.filter((a) => a.role === "ADMIN").length,
    onboardedCount: accounts.filter((a) => a.onboarded).length,
    newThisWeek: accounts.filter((a) => new Date(a.createdAt) >= weekAgo).length,
  };
}
