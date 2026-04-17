"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  id: number;
  name: string;
  duration: string;
  startDate: string;
  finishDate: string;
}

interface Resource {
  id: number;
  name: string;
  type: string;
  max: string;
  stRate: string;
  costUse: string;
}

interface TaskAllocation {
  taskId: number;
  resourceIds: number[];
}

export default function ReportTotalCostPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<TaskAllocation[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    const savedResources = localStorage.getItem("resources");
    const savedAllocations = localStorage.getItem("allocations");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedResources) setResources(JSON.parse(savedResources));
    if (savedAllocations) setAllocations(JSON.parse(savedAllocations));
  }, []);

  const getResourceNames = (taskId: number) => {
    const allocation = allocations.find(a => a.taskId === taskId);
    if (!allocation) return "None";
    return allocation.resourceIds
      .map(id => resources.find(r => r.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const calculateTaskCost = (taskId: number): number => {
    const allocation = allocations.find(a => a.taskId === taskId);
    if (!allocation) return 0;

    let totalCost = 0;

    allocation.resourceIds.forEach(resourceId => {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        const costUse = parseFloat(resource.costUse.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(costUse)) {
          totalCost += costUse;
        }
      }
    });

    return totalCost;
  };

  const calculateTotalProjectCost = (): number => {
    return tasks.reduce((total, task) => total + calculateTaskCost(task.id), 0);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white p-6 shadow-lg">
        <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-bold mt-2">Report: Total Cost for Whole Project</h1>
      </div>

      <div className="container mx-auto mt-8 p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Total Cost for Whole Project (Task Wise)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start (Date)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finish (Date)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No tasks to display.</td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const cost = calculateTaskCost(task.id);
                    return (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.duration}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.startDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.finishDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{getResourceNames(task.id)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${cost.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right text-sm text-gray-900">Total Cost</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${calculateTotalProjectCost().toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
