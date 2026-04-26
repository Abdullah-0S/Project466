"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Link2, ListTodo, Users, DollarSign } from "lucide-react";
import {
  Task,
  Resource,
  TaskAllocation,
  calculateTaskCost,
  calculateTotalProjectCost,
  taskDurationDays,
  getResourceNamesForTask,
} from "@/lib/cost";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { formatDate } from "@/lib/dates";

export default function AllocatePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [allocations, setAllocations] = useState<TaskAllocation[]>([]);
  const isLoaded = useRef(false);

  useEffect(() => {
    try {
      const savedResources = localStorage.getItem("resources");
      if (savedResources) setResources(JSON.parse(savedResources));
    } catch (e) {
      console.error("Error parsing resources:", e);
    }
    try {
      const savedAllocations = localStorage.getItem("allocations");
      if (savedAllocations) setAllocations(JSON.parse(savedAllocations));
    } catch (e) {
      console.error("Error parsing allocations:", e);
    }
    setTimeout(() => {
      isLoaded.current = true;
    }, 100);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (!isLoaded.current) return;
    localStorage.setItem("allocations", JSON.stringify(allocations));
  }, [allocations]);

  const toggleResource = useCallback((taskId: number, resourceId: number) => {
    setAllocations((prev) => {
      const existing = prev.find((a) => a.taskId === taskId);
      if (existing) {
        if (existing.resourceIds.includes(resourceId)) {
          return prev.map((a) =>
            a.taskId === taskId
              ? { ...a, resourceIds: a.resourceIds.filter((id) => id !== resourceId) }
              : a,
          );
        }
        return prev.map((a) =>
          a.taskId === taskId ? { ...a, resourceIds: [...a.resourceIds, resourceId] } : a,
        );
      }
      return [...prev, { taskId, resourceIds: [resourceId] }];
    });
  }, []);

  const totalCost = calculateTotalProjectCost(tasks, resources, allocations);
  const allocatedCount = allocations.filter((a) => a.resourceIds.length > 0).length;

  const emptyWrapper = (title: string, description: string, href: string, cta: string) => (
    <Card>
      <CardContent className="py-10">
        <EmptyState
          icon={ListTodo}
          title={title}
          description={description}
          action={
            <Link href={href} className={buttonStyles({ size: "sm" })}>
              {cta}
            </Link>
          }
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Allocate Resources"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Total Project Cost"
          value={loadingTasks ? "—" : formatCurrency(totalCost)}
          icon={DollarSign}
          accent="success"
        />
        <StatCard
          label="Allocated Tasks"
          value={loadingTasks ? "—" : `${allocatedCount} / ${tasks.length}`}
          icon={Link2}
        />
        <StatCard
          label="Resources"
          value={loadingTasks ? "—" : resources.length}
          icon={Users}
          accent="warning"
        />
      </div>

      {loadingTasks ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading tasks…
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        emptyWrapper(
          "No tasks to allocate",
          "Create tasks first, then come back here to assign resources.",
          "/tasks",
          "Go to Tasks",
        )
      ) : resources.length === 0 ? (
        emptyWrapper(
          "No resources to allocate",
          "Add resources first, then you can assign them to tasks.",
          "/resources",
          "Go to Resources",
        )
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const allocation = allocations.find((a) => a.taskId === task.id);
            const assignedResourceIds = allocation?.resourceIds ?? [];
            const taskCost = calculateTaskCost(task, resources, allocations);
            return (
              <Card key={task.id}>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{task.id}</Badge>
                      <CardTitle>{task.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {formatDate(task.startDate)} → {formatDate(task.finishDate)} · {taskDurationDays(task)} days
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 md:items-end">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Task cost
                    </span>
                    <span className="text-xl font-semibold text-foreground">
                      {formatCurrency(taskCost)}
                    </span>
                    {assignedResourceIds.length > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {getResourceNamesForTask(task.id, resources, allocations)}
                      </span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => {
                      const isAssigned = assignedResourceIds.includes(resource.id);
                      return (
                        <label
                          key={resource.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm transition-colors",
                            isAssigned
                              ? "border-primary/40 bg-primary/5 text-foreground"
                              : "hover:bg-muted/60",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => toggleResource(task.id, resource.id)}
                            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn("truncate font-medium", isAssigned && "text-primary")}>
                                {resource.name}
                              </span>
                              {resource.type ? (
                                <Badge variant={resource.type === "Work" ? "default" : resource.type === "Material" ? "secondary" : "outline"}>
                                  {resource.type}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {resource.type === "Cost"
                                ? `Cost/Use: ${resource.costUse || "—"}`
                                : resource.type === "Material"
                                  ? `Rate: ${resource.stRate || "—"}`
                                  : `${resource.stRate || "—"} · Availability: ${resource.max || "—"}`}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
