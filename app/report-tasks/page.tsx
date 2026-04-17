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

export default function ReportTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white p-6 shadow-lg">
        <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-bold mt-2">Report: All Tasks</h1>
      </div>

      <div className="container mx-auto mt-8 p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Tasks (View Only)</h2>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No tasks to display.</td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.startDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.finishDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
