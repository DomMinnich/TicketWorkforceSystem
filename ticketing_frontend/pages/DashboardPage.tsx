import React, { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { DashboardStatistics } from "../types";
import { Card } from "../components/common/Card";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Button } from "../components/common/Button";
import {
  ArrowTrendingUpIcon,
  TicketIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "../constants";

const TICKET_DEPARTMENTS = [
  { value: "IT", label: "IT" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Management", label: "Management" },
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}> = ({ title, value, icon, colorClass }) => (
  <Card className={`shadow-lg ${colorClass}`}>
    <div className="flex items-center">
      <div className={`p-3 rounded-full mr-4 ${colorClass} bg-opacity-20`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
          {title}
        </p>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    data: stats,
    loading,
    error,
    request: fetchStats,
  } = useApi<DashboardStatistics>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats("/tasks/statistics", { method: "GET" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center p-4">
        Error loading dashboard data: {error.message}
      </div>
    );
  if (!stats)
    return <div className="text-center p-4">No dashboard data available.</div>;

  const chartData = [
    {
      name: "Tickets",
      Open: stats.num_open_tickets,
      Closed: stats.num_closed_tickets,
    },
    { name: "Requests", Total: stats.total_requests },
  ];

const ticketDepartmentData = TICKET_DEPARTMENTS.map((dept) => ({
  name: dept.label,
  count: stats.tickets_by_department?.[dept.value] || 0,
})).filter((dept) => dept.count > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Welcome, {user?.email || "User"}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value={stats.num_total_tickets}
          icon={<TicketIcon className="h-8 w-8 text-blue-500" />}
          colorClass="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
        />
        <StatCard
          title="Open Tickets"
          value={stats.num_open_tickets}
          icon={<ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />}
          colorClass="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700"
        />
        <StatCard
          title="Total Requests"
          value={stats.total_requests}
          icon={
            <ClipboardDocumentListIcon className="h-8 w-8 text-yellow-500" />
          }
          colorClass="bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700"
        />
        <StatCard
          title="Total Users"
          value={stats.total_users}
          icon={<UsersIcon className="h-8 w-8 text-purple-500" />}
          colorClass="bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700"
        />
        {stats.num_shimmer_tickets > 0 && user?.role === "admin" && (
          <StatCard
            title="Admin Only"
            value={stats.num_shimmer_tickets}
            icon={<ExclamationTriangleIcon className="h-8 w-8 text-red-500" />}
            colorClass="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ticket Status Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis
                dataKey="name"
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#1f2937"
                    : "#ffffff" /* gray-800 or white */,
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#374151"
                    : "#e5e7eb" /* gray-700 or gray-200 */,
                }}
                itemStyle={{
                  color: document.documentElement.classList.contains("dark")
                    ? "#d1d5db"
                    : "#111827" /* gray-300 or gray-900 */,
                }}
              />
              <Legend />
              <Bar dataKey="Open" fill="#34D399" /> {/* emerald-400 */}
              <Bar dataKey="Closed" fill="#F87171" /> {/* red-400 */}
              <Bar dataKey="Total" fill="#60A5FA" /> {/* blue-400 */}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Tickets by Department">
          {" "}
          {/* Updated title */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={ticketDepartmentData}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={70}
                className="text-xs text-gray-600 dark:text-gray-400"
              />{" "}
              {/* Adjusted XAxis for better label display */}
              <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#1f2937"
                    : "#ffffff",
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#374151"
                    : "#e5e7eb",
                }}
                itemStyle={{
                  color: document.documentElement.classList.contains("dark")
                    ? "#d1d5db"
                    : "#111827",
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Tickets" fill="#0ea5e9" />{" "}
              {/* sky-500 */}
            </BarChart>
          </ResponsiveContainer>
          {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Note: Department-specific ticket counts are illustrative as backend does not provide this breakdown in statistics.</p> */}
        </Card>
      </div>

      {/* Quick Actions placeholder */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="primary" onClick={() => navigate("/tickets/new")}>
            Create Ticket
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/requests/equipment/new")}
          >
            New Equipment Request
          </Button>
          {user?.role === "admin" && (
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/user-management")}
            >
              Manage Users
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
