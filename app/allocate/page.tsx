"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Task {
  id: number;
  name: string;
  duration: number;
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

// Parse availability from max field (e.g., "100%" → 1, "50%" → 0.5)
const parseAvailability = (max: string): number => {
  const match = max.match(/(\d+)%/);
  if (match) {
    return parseInt(match[1]) / 100;
  }
  return 1;
};

// Parse hourly rate from stRate (e.g., "15$/hr" → 15)
const parseHourlyRate = (stRate: string): number => {
  const match = stRate.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
};

// Check if resource type is equipment or material
const isEquipmentOrMaterial = (type: string): boolean => {
  return type === 'Equipment' || type === 'Material';
};

export default function AllocatePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [allocations, setAllocations] = useState<TaskAllocation[]>([]);

  const isLoaded = useRef(false);
  const isLoadingFromStorage = useRef(false);

  // Load all data on mount
  useEffect(() => {
    console.log("Allocate page - Starting load...");

    const savedResources = localStorage.getItem("resources");
    const savedAllocations = localStorage.getItem("allocations");

    // Set resources and allocations
    if (savedResources) {
      try {
        setResources(JSON.parse(savedResources));
      } catch (e) {
        console.error("Error parsing resources:", e);
      }
    } else {
      setResources([]);
    }

    // Set allocations
    if (savedAllocations) {
      try {
        setAllocations(JSON.parse(savedAllocations));
      } catch (e) {
        console.error("Error parsing allocations:", e);
      }
    } else {
      setAllocations([]);
    }

    console.log("Load complete - resources:", savedResources, "allocations:", savedAllocations);

    // Mark as loaded after setting state
    setTimeout(() => {
      isLoaded.current = true;
      console.log("Marked as loaded");
    }, 100);

    // Fetch tasks from API
    fetchTasks();
  }, []);

  // Save allocations to localStorage
  useEffect(() => {
    // Skip save during initial load
    if (!isLoaded.current) {
      console.log("Skipping save - not loaded yet");
      return;
    }

    // Only save if there are allocations
    if (allocations.length === 0) {
      console.log("Skipping save - empty allocations");
      return;
    }

    localStorage.setItem("allocations", JSON.stringify(allocations));
    console.log("Allocations saved, count:", allocations.length);
  }, [allocations]);

  const toggleResource = useCallback((taskId: number, resourceId: number) => {
    console.log("Toggle resource - Task:", taskId, "Resource:", resourceId);
    setAllocations(prev => {
      const existing = prev.find(a => a.taskId === taskId);
      if (existing) {
        if (existing.resourceIds.includes(resourceId)) {
          // Remove resource
          return prev.map(a =>
            a.taskId === taskId
              ? { ...a, resourceIds: a.resourceIds.filter(id => id !== resourceId) }
              : a
          );
        } else {
          // Add resource
          return prev.map(a =>
            a.taskId === taskId
              ? { ...a, resourceIds: [...a.resourceIds, resourceId] }
              : a
          );
        }
      } else {
        // Create new allocation
        return [...prev, { taskId, resourceIds: [resourceId] }];
      }
    });
  }, [allocations]);

  const getResourceNames = (taskId: number) => {
    const allocation = allocations.find(a => a.taskId === taskId);
    if (!allocation) return "None";
    return allocation.resourceIds
      .map(id => resources.find(r => r.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  // Calculate cost for a task
  const calculateTaskCost = (taskId: number): number => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return 0;

    const allocation = allocations.find(a => a.taskId === taskId);
    if (!allocation) return 0;

    let totalCost = 0;

    allocation.resourceIds.forEach(resourceId => {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        // Check if equipment or material
        const isEquipmentOrMaterial = isEquipmentOrMaterial(resource.type);

        if (isEquipmentOrMaterial && resource.costUse) {
          // Use fixed cost if set
          const costUse = parseFloat(resource.costUse.replace(/[^0-9.-]+/g, ""));
          if (!isNaN(costUse)) {
            totalCost += costUse;
          }
        } else if (isEquipmentOrMaterial) {
          // Work type - use hourly rate calculation
          const hourlyRate = parseHourlyRate(resource.stRate);
          const availability = parseAvailability(resource.max);
          // Calculate duration from dates (including start day)
          const duration = calculateDurationFromDates(task.startDate, task.finishDate);

          // Calculate: rate × 8 hours × availability × duration
          const cost = hourlyRate * 8 * availability * duration;
          totalCost += cost;
        }
      }
    });

    return totalCost;
  };

  // Calculate total cost for all tasks
  const calculateTotalCost = (): number => {
    return tasks.reduce((total, task) => total + calculateTaskCost(task.id), 0);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white p-6 shadow-lg">
        <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-bold mt-2">Allocate Resources to Tasks</h1>
      </div>

      <div className="container mx-auto mt-8 p-6">
        {/* Total Cost Summary */}
        {!loadingTasks && tasks.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-green-800">Total Project Cost</h3>
            <p className="text-2xl font-bold text-green-700">${calculateTotalCost().toLocaleString()}</p>
            <p className="text-sm text-gray-600">Based on: Hourly Rate × 8 hours × Availability × Duration</p>
          </div>
        )}

        {loadingTasks ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">No tasks available. Please add tasks first.</p>
            <Link href="/tasks" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">
              Go to Tasks
            </Link>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">No resources available. Please add resources first.</p>
            <Link href="/resources" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">
              Go to Resources
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Select Resources for Each Task</h2>
              <p className="text-sm text-gray-600 mt-1">Check resources you want to assign to each task</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finish Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Resources (Checklist)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Resources</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => {
                    const allocation = allocations.find(a => a.taskId === task.id);
                    const assignedResourceIds = allocation?.resourceIds || [];
                    const taskCost = calculateTaskCost(task.id);

                    return (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{calculateDurationFromDates(task.startDate, task.finishDate)} days</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.startDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.finishDate}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            {resources.map((resource) => {
                              const isAssigned = assignedResourceIds.includes(resource.id);
                              return (
                                <label key={resource.id} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isAssigned}
                                    onChange={() => toggleResource(task.id, resource.id)}
                                    className="w-4 h-4 text-primary focus:ring-primary rounded border-gray-300"
                                  />
                                  <span className={isAssigned ? "font-medium text-primary" : "text-gray-700"}>
                                    {resource.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getResourceNames(task.id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${taskCost.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
