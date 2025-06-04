import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { EquipmentRequest } from "../types";
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
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

const EquipmentRequestCard: React.FC<{ request: EquipmentRequest }> = ({
  request,
}) => (
  <Link
    to={`/requests/equipment/${request.id}`}
    className="block hover:shadow-xl transition-shadow duration-200"
  >
    <Card
      className={`h-full flex flex-col border-l-4 ${
        request.status === "open"
          ? request.approval_status === "approved"
            ? "border-green-500"
            : request.approval_status === "pending"
            ? "border-yellow-500"
            : "border-red-500"
          : "border-gray-400"
      }`}
    >
      <div className="flex-grow">
        <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-1">
          {truncateText(request.name, 40)} for {truncateText(request.event, 30)}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          ID: {request.id}
        </p>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <p className="flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-1.5" /> Date:{" "}
            {formatDate(request.date)} at {request.time}
          </p>
          <p className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1.5" /> Location:{" "}
            {request.location}
          </p>
          <p className="flex items-center">
            <WrenchScrewdriverIcon className="h-4 w-4 mr-1.5" /> Equipment:{" "}
            {truncateText(request.equipment, 30)}
          </p>
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
          <p>
            Approval:{" "}
            <span
              className={`font-semibold ${
                request.approval_status === "approved"
                  ? "text-green-600 dark:text-green-400"
                  : request.approval_status === "pending"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {request.approval_status}
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

const EquipmentRequestListPage: React.FC = () => {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | "pending" | "approved" | "denied"
  >("pending");
  const { addNotification } = useNotifications();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedRequests = await requestService.getEquipmentRequests(
        searchTerm
      );
      if (approvalFilter !== "all") {
        fetchedRequests = fetchedRequests.filter(
          (r) => r.approval_status === approvalFilter
        );
      }
      setRequests(fetchedRequests);
    } catch (err: any) {
      setError(err.message || "Failed to fetch equipment requests");
      addNotification(
        err.message || "Failed to fetch equipment requests",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm, approvalFilter, addNotification]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, approvalFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Equipment Requests
        </h1>
        <Link to="/requests/equipment/new">
          <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />}>
            New Equipment Request
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
            id="search-requests"
            type="text"
            placeholder="Search by name, event, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            className="flex-grow"
          />
          <div>
            <label
              htmlFor="approval-filter"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Approval Status
            </label>
            <select
              id="approval-filter"
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as any)}
              className="block w-full rounded border-gray-300 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
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
          No equipment requests found.
        </p>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <EquipmentRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentRequestListPage;
