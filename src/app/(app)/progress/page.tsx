import { redirect } from "next/navigation";

// "In Progress" merged into /my-progress — kept as a redirect so bookmarks
// and existing links still land on the right section.
export default function ProgressPage() {
  redirect("/my-progress?view=in-progress");
}
