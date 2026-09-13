import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <OnboardingFlow />;
}
