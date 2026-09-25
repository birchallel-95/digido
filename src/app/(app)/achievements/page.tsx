import { redirect } from "next/navigation";

// "My Achievements" merged into /my-progress — kept as a redirect so bookmarks
// and existing links still land on the right section.
export default function AchievementsPage() {
  redirect("/my-progress?view=achieved");
}
