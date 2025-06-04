import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { StudentRequest } from "../types";
import * as requestService from "../services/requestService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Card } from "../components/common/Card";
import { useNotifications } from "../hooks/useNotifications";
import { formatDate, truncateText } from "../utils/helpers";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const StudentRequestCard: React.FC<{ request: StudentRequest }> = ({
  request,
}) => (
  <Link
    to={`/requests/students/${request.id}`}
    className="block hover:shadow-xl transition-shadow duration-200"
  >
    <Card
      className={`h-full flex flex-col border-l-4 ${
        request.status === "open" ? "border-purple-500" : "border-gray-400"
      }`}
    >
      <div className="flex-grow">
        <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-1">
          {request.fname} {request.lname}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          ID: {request.id}
        </p>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <p className="flex items-center">
            <AcademicCapIcon className="h-4 w-4 mr-1.5" /> Grade:{" "}
            {request.grade}
          </p>
          <p className="flex items-center">
            <UserIcon className="h-4 w-4 mr-1.5" /> Teacher: {request.teacher}
          </p>
          <p>Description: {truncateText(request.description, 50)}</p>
          <p>
            Status:{" "}
            <span
              className={`font-semibold ${
                request.status === "open"
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {request.status}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-right">
        <span className="text-xs text-primary dark:text-primary-light font-medium hover:underline">
          View Details &rarr;
        </span>
      </div>
    </Card>
  </Link>
);

const StudentRequestListPage: React.FC = () => {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "open"
  );
  const { addNotification } = useNotifications();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedRequests = await requestService.getStudentRequests(searchTerm);
      if (statusFilter !== "all") {
        fetchedRequests = fetchedRequests.filter(
          (r) => r.status === statusFilter
        );
      }
      setRequests(fetchedRequests);
    } catch (err: any) {
      setError(err.message || "Failed to fetch student requests");
      addNotification(
        err.message || "Failed to fetch student requests",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, addNotification]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          New Student Requests
        </h1>
        <Link to="/requests/students/new">
          <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />}>
            New Student Request
          </Button>
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
      >
        <div className="flex gap-4 items-end">
          <Input
            label="Search Requests"
            id="search-student-requests"
            type="text"
            placeholder="Search by name, grade, teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            className="flex-grow"
          />
          <div>
            <label
              htmlFor="status-filter"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-full rounded border-gray-300 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <Button type="submit" className="shrink-0">
            Search
          </Button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center mt-8">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {error && (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      )}

      {!loading && !error && requests.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No new student requests found.
        </p>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <StudentRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentRequestListPage;
