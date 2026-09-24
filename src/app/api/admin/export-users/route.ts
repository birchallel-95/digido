import { auth } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/adminDashboard";

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(cells: (string | number)[]): string {
  return cells.map(csvEscape).join(",") + "\r\n";
}

/**
 * Admin-only CSV export. This is a Route Handler, not a page, so there's no
 * redirect() to lean on — an unauthorised request gets a plain 403.
 * (Proxy also blocks /admin/* at the routing layer; this check is the
 * belt to that braces, per Next's own guidance that a Server Function/route
 * should never rely on proxy alone.)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const data = await getAdminDashboardData();

  const header = toCsvRow([
    "Name",
    "Email",
    "Role",
    "Signed up",
    "Last login",
    "Statements rated",
    "Red",
    "Amber",
    "Green",
    "Reflections written",
  ]);

  const rows = data.users
    .map((u) =>
      toCsvRow([
        u.name ?? "",
        u.email,
        u.role,
        new Date(u.createdAt).toISOString().slice(0, 10),
        u.lastLogin ? new Date(u.lastLogin).toISOString() : "Never",
        u.totalRated,
        u.red,
        u.amber,
        u.green,
        u.reflectionsCount,
      ])
    )
    .join("");

  const csv = header + rows;
  const filename = `digido-admin-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
