"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold">ProManage</h1>
        <p className="text-blue-100">Project Management System</p>
      </div>

      <div className="container mx-auto mt-8 p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Main Menu</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tasks Interface */}
          <Link href="/tasks" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="text-primary text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Tasks</h3>
            <p className="text-gray-600">Manage project tasks, view, add, edit, and delete</p>
          </Link>

          {/* Resources Interface */}
          <Link href="/resources" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="text-primary text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Resources</h3>
            <p className="text-gray-600">Manage resources and their costs</p>
          </Link>

          {/* Allocate Resources */}
          <Link href="/allocate" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="text-primary text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Allocate Resources</h3>
            <p className="text-gray-600">Assign resources to tasks</p>
          </Link>

          {/* Reports */}
          <Link href="/reports" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="text-primary text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Reports</h3>
            <p className="text-gray-600">View all reports: tasks, resources, costs</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
