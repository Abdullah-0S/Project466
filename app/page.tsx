"use client";

import Link from "next/link";
import {
  ListTodo,
  Users,
  Link2,
  DollarSign,
  ArrowRight,
  CalendarDays,
  BarChart3,
  PlusCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useProjectData } from "@/lib/use-project-data";
import { calculateTotalProjectCost } from "@/lib/cost";
import { CostChart } from "@/components/dashboard/cost-chart";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/dates";

export default function DashboardPage() {
  const { tasks, resources, allocations, loading } = useProjectData();

  const totalCost = calculateTotalProjectCost(tasks, resources, allocations);
  const allocatedTasks = allocations.filter((a) => a.resourceIds.length > 0).length;

  const upcomingTasks = [...tasks]
    .filter((t) => t.startDate)
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Dashboard"
        description="Project overview — tasks, resources, and cost at a glance."
        actions={
          <>
            <Link href="/tasks" className={buttonStyles({ variant: "outline", size: "sm" })}>
              <PlusCircle className="h-4 w-4" /> Add task
            </Link>
            <Link href="/allocate" className={buttonStyles({ size: "sm" })}>
              <Link2 className="h-4 w-4" /> Allocate
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={loading ? "—" : tasks.length}
          icon={ListTodo}
        />
        <StatCard
          label="Resources"
          value={loading ? "—" : resources.length}
          icon={Users}
          accent="warning"
        />
        <StatCard
          label="Allocated Tasks"
          value={loading ? "—" : `${allocatedTasks} / ${tasks.length}`}
          icon={Link2}
        />
        <StatCard
          label="Total Project Cost"
          value={loading ? "—" : formatCurrency(totalCost)}
          icon={DollarSign}
          accent="success"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Cost per Task
              </CardTitle>
              <CardDescription>Per-task cost from current allocations.</CardDescription>
            </div>
            <Link
              href="/report-task-cost"
              className="text-xs font-medium text-primary hover:underline"
            >
              View report →
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                Loading cost data…
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="No tasks yet"
                description="Add tasks and allocate resources to see the cost breakdown."
                action={
                  <Link href="/tasks" className={buttonStyles({ size: "sm" })}>
                    <PlusCircle className="h-4 w-4" /> Create your first task
                  </Link>
                }
              />
            ) : (
              <CostChart tasks={tasks} resources={resources} allocations={allocations} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingTasks.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.startDate)} → {formatDate(t.finishDate)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {t.duration}d
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickLink
          href="/tasks"
          title="Manage Tasks"
          description="Add, edit, and delete project tasks."
          icon={<ListTodo className="h-5 w-5" />}
        />
        <QuickLink
          href="/resources"
          title="Manage Resources"
          description="Define rates, availability, and costs."
          icon={<Users className="h-5 w-5" />}
        />
        <QuickLink
          href="/reports"
          title="View Reports"
          description="Cost-per-task, totals, and more."
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
