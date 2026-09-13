export interface NavLink {
  href: string;
  label: string;
  icon: string;
  mobile?: boolean; // shown in the mobile bottom nav
}

export const STAFF_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Home", icon: "home", mobile: true },
  { href: "/discover", label: "Discover", icon: "compass", mobile: true },
  { href: "/develop", label: "Develop", icon: "target", mobile: true },
  { href: "/achievements", label: "Achievements", icon: "trophy", mobile: true },
  { href: "/profile", label: "Profile", icon: "user", mobile: true },
];

export const STAFF_LINKS_DESKTOP: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/discover", label: "Discover Skills", icon: "compass" },
  { href: "/develop", label: "My Development", icon: "target" },
  { href: "/progress", label: "In Progress", icon: "clock" },
  { href: "/achievements", label: "Achievements", icon: "trophy" },
  { href: "/passport", label: "Capability Passport", icon: "award" },
  { href: "/activity", label: "Activity", icon: "chart" },
  { href: "/profile", label: "Profile", icon: "user" },
];

export const ADMIN_LINK: NavLink = { href: "/admin", label: "Administration", icon: "settings" };
