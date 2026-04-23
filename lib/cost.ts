export interface Task {
  id: number;
  name: string;
  duration: number;
  startDate: string;
  finishDate: string;
}

export interface Resource {
  id: number;
  name: string;
  type: string;
  max: string;
  stRate: string;
  ovtRate?: string;
  costUse: string;
}

export interface TaskAllocation {
  taskId: number;
  resourceIds: number[];
}

const HOURS_PER_DAY = 8;

export const parseHourlyRate = (stRate: string): number => {
  if (!stRate) return 0;
  const match = stRate.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

export const parseAvailability = (max: string): number => {
  if (!max) return 1;
  const match = max.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) return parseFloat(match[1]) / 100;
  const raw = parseFloat(max);
  return isNaN(raw) ? 1 : raw;
};

export const parseCostUse = (costUse: string): number => {
  if (!costUse) return 0;
  const n = parseFloat(costUse.replace(/[^0-9.-]+/g, ""));
  return isNaN(n) ? 0 : n;
};

export const calculateDaysBetween = (startDate: string, finishDate: string): number => {
  if (!startDate || !finishDate) return 0;
  const start = new Date(startDate);
  const end = new Date(finishDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
};

export const taskDurationDays = (task: Task): number => {
  const fromDates = calculateDaysBetween(task.startDate, task.finishDate);
  return fromDates > 0 ? fromDates : task.duration || 0;
};

export const calculateResourceCost = (resource: Resource, durationDays: number): number => {
  if (resource.type === "Work") {
    return parseHourlyRate(resource.stRate) * HOURS_PER_DAY * parseAvailability(resource.max) * durationDays;
  }
  if (resource.type === "Cost") {
    return parseCostUse(resource.costUse);
  }
  return 0;
};

export const calculateTaskCost = (
  task: Task,
  resources: Resource[],
  allocations: TaskAllocation[],
): number => {
  const allocation = allocations.find(a => a.taskId === task.id);
  if (!allocation) return 0;
  const duration = taskDurationDays(task);
  return allocation.resourceIds.reduce((sum, resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return sum;
    return sum + calculateResourceCost(resource, duration);
  }, 0);
};

export const calculateTotalProjectCost = (
  tasks: Task[],
  resources: Resource[],
  allocations: TaskAllocation[],
): number => tasks.reduce((total, task) => total + calculateTaskCost(task, resources, allocations), 0);

export const getResourceNamesForTask = (
  taskId: number,
  resources: Resource[],
  allocations: TaskAllocation[],
): string => {
  const allocation = allocations.find(a => a.taskId === taskId);
  if (!allocation || allocation.resourceIds.length === 0) return "None";
  return allocation.resourceIds
    .map(id => resources.find(r => r.id === id)?.name)
    .filter(Boolean)
    .join(", ");
};
