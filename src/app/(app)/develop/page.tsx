import { redirect } from "next/navigation";

// "My Development" merged into /my-progress — kept as a redirect so bookmarks
// and existing links still land on the right section.
export default function DevelopPage() {
  redirect("/my-progress?view=to-develop");
}
