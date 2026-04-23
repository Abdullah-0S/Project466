import {
  LayoutDashboard,
  ListTodo,
  Users,
  Link2,
  FileText,
  ClipboardList,
  UserCog,
  Workflow,
  Wallet,
  PieChart,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const primaryNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, description: "Project overview and stats" },
  { href: "/tasks", label: "Tasks", icon: ListTodo, description: "Manage project tasks" },
  { href: "/resources", label: "Resources", icon: Users, description: "Manage resources and costs" },
  { href: "/allocate", label: "Allocate", icon: Link2, description: "Assign resources to tasks" },
];

export const reportsNav: NavItem[] = [
  { href: "/reports", label: "Reports", icon: FileText, description: "All reports" },
  { href: "/report-tasks", label: "All Tasks", icon: ClipboardList, description: "Read-only task list" },
  { href: "/report-resources", label: "All Resources", icon: UserCog, description: "Read-only resource list" },
  { href: "/report-tasks-resources", label: "Tasks + Resources", icon: Workflow, description: "Tasks with assignments" },
  { href: "/report-task-cost", label: "Cost per Task", icon: Wallet, description: "Per-task cost breakdown" },
  { href: "/report-total-cost", label: "Total Project Cost", icon: PieChart, description: "Grand total" },
];

export const routeLabels: Record<string, string> = Object.fromEntries(
  [...primaryNav, ...reportsNav].map((n) => [n.href, n.label]),
);
