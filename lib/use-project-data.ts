"use client";

import { useEffect, useState } from "react";
import type { Task, Resource, TaskAllocation } from "@/lib/cost";

export interface ProjectData {
  tasks: Task[];
  resources: Resource[];
  allocations: TaskAllocation[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const readLocal = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function useProjectData(): ProjectData {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<TaskAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setResources(readLocal<Resource[]>("resources", []));
    setAllocations(readLocal<TaskAllocation[]>("allocations", []));
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { tasks, resources, allocations, loading, refetch: fetchAll };
}
